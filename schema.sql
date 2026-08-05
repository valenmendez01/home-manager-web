-- ============================================
-- MÓDULO LIMPIEZA
-- ============================================

create table ambientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

create table limpiezas (
  id uuid primary key default gen_random_uuid(),
  ambiente_id uuid not null references ambientes(id) on delete cascade,
  usuario_id uuid not null references auth.users(id),
  realizado_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_limpiezas_ambiente on limpiezas(ambiente_id, realizado_at desc);

-- ============================================
-- MÓDULO DEUDAS
-- ============================================

create table deudas (
  id uuid primary key default gen_random_uuid(),
  descripcion text not null,
  monto_total numeric(10,2) not null,
  pagado_por uuid not null references auth.users(id),
  debe uuid not null references auth.users(id),
  monto_debe numeric(10,2) not null,
  fecha date not null default current_date,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagada')),
  created_at timestamptz not null default now()
);

create table pagos (
  id uuid primary key default gen_random_uuid(),
  deuda_id uuid not null references deudas(id) on delete cascade,
  pagado_por uuid not null references auth.users(id),
  pagado_at timestamptz not null default now()
);

create index idx_deudas_estado on deudas(estado);

-- Deshacer un pago: borra el registro y vuelve la deuda a "pendiente" en
-- una sola transacción (evita que quede en un estado intermedio si algo falla).
create or replace function deshacer_pago(p_pago_id uuid)
returns void as $$
declare
  v_deuda_id uuid;
begin
  select deuda_id into v_deuda_id from pagos where id = p_pago_id;

  if v_deuda_id is null then
    raise exception 'Pago % no encontrado', p_pago_id;
  end if;

  delete from pagos where id = p_pago_id;
  update deudas set estado = 'pendiente' where id = v_deuda_id;
end;
$$ language plpgsql security definer;

grant execute on function deshacer_pago(uuid) to authenticated;

-- ============================================
-- MÓDULO COMPRAS
-- ============================================

create table compras (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  agregado_por uuid not null references auth.users(id),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'comprado')),
  created_at timestamptz not null default now(),
  comprado_at timestamptz
);

create index idx_compras_estado on compras(estado);

-- ============================================
-- SEED: los ambientes fijos del plano
-- ============================================

insert into ambientes (nombre, orden) values
  ('Living', 1),
  ('Dormitorio grande', 2),
  ('Dormitorio chico', 3),
  ('Baño', 4),
  ('Cocina', 5),
  ('Balcón', 6)

-- Habilitar RLS en todas las tablas
alter table ambientes enable row level security;
alter table limpiezas enable row level security;
alter table deudas enable row level security;
alter table pagos enable row level security;
alter table compras enable row level security;

-- Políticas: cualquier usuario autenticado puede hacer todo
create policy "authenticated_full_access" on ambientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on limpiezas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on deudas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on pagos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on compras
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');


-- Habilitar Realtime
alter publication supabase_realtime add table limpiezas;
alter publication supabase_realtime add table deudas;
alter publication supabase_realtime add table pagos;
alter publication supabase_realtime add table compras;

-- Habilitar cron y luego correr para eliminar compras viejas automáticamente
select cron.schedule(
  'eliminar-compras-viejas',        -- nombre del job
  '0 3 * * *',                       -- todos los días a las 3am UTC
  $$
    delete from compras
    where estado = 'comprado'
      and comprado_at < now() - interval '24 hours';
  $$
);

-- Elimina pagos viejos automáticamente
select cron.schedule(
  'eliminar-pagos-viejos',
  '0 3 * * *',
  $$
    delete from pagos
    where pagado_at < now() - interval '2 months';
  $$
);

-- ============================================
-- MÓDULO PUSH NOTIFICATIONS
-- ============================================

create table push_tokens (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  token text not null,
  updated_at timestamptz not null default now()
);

alter table push_tokens enable row level security;

create policy "authenticated_full_access" on push_tokens
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-----------------------------------------

create extension if not exists pg_net;

-- En el Dashboard de Supabase → Database → Webhooks (misma sección que usaste en marguelli), creá uno nuevo:
--   Table: deudas
--   Events: Insert
--   Type: Supabase Edge Functions
--   Edge Function: notificar-nueva-deuda
--   HTTP Method: POST (default)
--   HTTP Headers: Content-Type: application/json (default)

-- Deployá la función:
-- npx supabase functions deploy notificar-nueva-deuda --no-verify-jwt

-- Secrets del servidor
-- npx supabase secrets set VAPID_SUBJECT=mailto:tu@email.com VAPID_PUBLIC_KEY=xxxx VAPID_PRIVATE_KEY=xxxx


-- ============================================
-- MÓDULO RECORDATORIOS DE PAGO
-- ============================================
create table recordatorios_pago (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  nombre text not null,
  orden int not null default 0,
  marcado boolean not null default false
);

alter table recordatorios_pago enable row level security;

create policy "authenticated_full_access" on recordatorios_pago
  for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table recordatorios_pago;

insert into recordatorios_pago (usuario_id, nombre, orden) values
  ('e0f6fad5-c137-4d34-81d0-fd2630a97cf5', 'Facultad', 1),
  ('e0f6fad5-c137-4d34-81d0-fd2630a97cf5', 'Expensas', 2),
  ('e0f6fad5-c137-4d34-81d0-fd2630a97cf5', 'Alquiler', 3),
  ('e0f6fad5-c137-4d34-81d0-fd2630a97cf5', 'ABL', 4),
  ('e0f6fad5-c137-4d34-81d0-fd2630a97cf5', 'AySa', 5),
  ('16a7b308-a718-49f8-9845-20354176169f', 'Facultad', 1),
  ('16a7b308-a718-49f8-9845-20354176169f', 'Alquiler', 2),
  ('16a7b308-a718-49f8-9845-20354176169f', 'Metrogas', 3),
  ('16a7b308-a718-49f8-9845-20354176169f', 'Edesur', 4);

-- Desmarca todo el 1° de cada mes a las 3am UTC
select cron.schedule(
  'resetear-recordatorios-pago',
  '0 3 1 * *',
  $$ update recordatorios_pago set marcado = false where marcado = true; $$
);