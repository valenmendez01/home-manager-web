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

alter table recordatorios_pago add column fecha_vencimiento date;
alter table recordatorios_pago add column notificado boolean not null default false;

-- Desmarca todo el 1° de cada mes a las 3am UTC (reemplaza el cron.schedule existente)
select cron.unschedule('resetear-recordatorios-pago');

select cron.schedule(
  'resetear-recordatorios-pago',
  '0 3 1 * *',
  $$ update recordatorios_pago set marcado = false, notificado = false where marcado = true; $$
);

-- Cada 6 horas, le pega a la edge function que revisa vencimientos próximos
select cron.schedule(
  'notificar-vencimientos-recordatorios',
  '0 */6 * * *',
  $$
  select net.http_post(
    url := 'https://<TU_PROJECT_REF>.supabase.co/functions/v1/notificar-vencimientos',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <TU_SERVICE_ROLE_KEY_O_ANON_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- SALDAR DEUDA NETA (liquidar todo el balance entre los 2 usuarios de una sola vez)
-- ============================================

alter table pagos add column saldo_id uuid;
alter table pagos add column saldo_iniciado_por uuid;

create index idx_pagos_saldo on pagos(saldo_id);

create or replace function saldar_deudas(p_deudor uuid, p_acreedor uuid)
returns void as $$
declare
  v_saldo_id uuid := gen_random_uuid();
  v_deuda record;
begin
  for v_deuda in
    select id, debe
    from deudas
    where estado = 'pendiente'
      and (
        (pagado_por = p_deudor and debe = p_acreedor)
        or (pagado_por = p_acreedor and debe = p_deudor)
      )
  loop
    update deudas set estado = 'pagada' where id = v_deuda.id;

    insert into pagos (deuda_id, pagado_por, saldo_id, saldo_iniciado_por)
    values (v_deuda.id, v_deuda.debe, v_saldo_id, p_deudor);
  end loop;
end;
$$ language plpgsql security definer;

grant execute on function saldar_deudas(uuid, uuid) to authenticated;

-- Deshacer un saldo completo: revierte todos los pagos que se generaron
-- juntos en un mismo "Saldar deuda", en una sola transacción.
create or replace function deshacer_saldo(p_saldo_id uuid)
returns void as $$
begin
  update deudas set estado = 'pendiente'
  where id in (select deuda_id from pagos where saldo_id = p_saldo_id);

  delete from pagos where saldo_id = p_saldo_id;
end;
$$ language plpgsql security definer;

grant execute on function deshacer_saldo(uuid) to authenticated;


-- ============================================
-- HISTORIAL DE LIMPIEZA: conservar solo las 2 últimas activas
-- por ambiente, con "undo" automático al borrar por error.
-- ============================================

-- 1) Columna que marca si la limpieza cuenta como "vigente"
alter table limpiezas add column activa boolean not null default true;

-- 2) Migración de datos existentes: de lo que ya hay, dejamos
--    activas solo las 2 últimas por ambiente...
with ranked as (
  select id, ambiente_id,
         row_number() over (partition by ambiente_id order by realizado_at desc) as rn
  from limpiezas
)
update limpiezas l
set activa = false
from ranked r
where l.id = r.id and r.rn > 2;

-- ...y de las que quedaron archivadas, nos quedamos solo con la
--    candidata más reciente por ambiente (el resto se borra definitivo,
--    para no arrancar con basura acumulada).
with archivadas as (
  select id, ambiente_id,
         row_number() over (partition by ambiente_id order by realizado_at desc) as rn
  from limpiezas
  where activa = false
)
delete from limpiezas
where id in (select id from archivadas where rn > 1);

-- 3) Índice para las consultas por ambiente + activa (la app va a filtrar por esto)
create index idx_limpiezas_ambiente_activa
  on limpiezas(ambiente_id, realizado_at desc)
  where activa = true;

-- ============================================
-- TRIGGER 1: al insertar, si quedan más de 2 activas, archiva la(s) más vieja(s)
-- ============================================
create or replace function fn_limpieza_archivar_excedentes()
returns trigger as $$
declare
  v_activas int;
  v_excedente int;
begin
  select count(*) into v_activas
  from limpiezas
  where ambiente_id = new.ambiente_id and activa = true;

  v_excedente := v_activas - 2;

  if v_excedente > 0 then
    -- Solo guardamos 1 candidata a volver: borramos definitivo cualquier
    -- archivada anterior de este ambiente antes de archivar la nueva.
    delete from limpiezas
    where ambiente_id = new.ambiente_id
      and activa = false;

    -- Archiva la(s) más vieja(s) activa(s) que sobran (normalmente 1)
    update limpiezas
    set activa = false
    where id in (
      select id from limpiezas
      where ambiente_id = new.ambiente_id
        and activa = true
      order by realizado_at asc
      limit v_excedente
    );
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_limpieza_archivar_excedentes
after insert on limpiezas
for each row
execute function fn_limpieza_archivar_excedentes();

-- ============================================
-- TRIGGER 2: al borrar una activa, si quedan menos de 2 activas,
-- reactiva automáticamente la última archivada de ese ambiente
-- ============================================
create or replace function fn_limpieza_reactivar_archivada()
returns trigger as $$
declare
  v_activas int;
begin
  select count(*) into v_activas
  from limpiezas
  where ambiente_id = old.ambiente_id and activa = true;

  if v_activas < 2 then
    update limpiezas
    set activa = true
    where id = (
      select id from limpiezas
      where ambiente_id = old.ambiente_id
        and activa = false
      order by realizado_at desc
      limit 1
    );
  end if;

  return old;
end;
$$ language plpgsql;

-- El "when (old.activa = true)" es clave: evita que este trigger se dispare
-- cuando el propio trigger 1 borra una candidata archivada vieja (activa = false),
-- lo que rompería la lógica por recursión cruzada entre ambos triggers.
create trigger trg_limpieza_reactivar_archivada
after delete on limpiezas
for each row
when (old.activa = true)
execute function fn_limpieza_reactivar_archivada();

-- ============================================
-- RECORDATORIOS DE PAGO: vencimiento recurrente por día del mes
-- (en vez de una fecha con mes/año, que no tiene sentido para algo
-- que se repite todos los meses, ej "todos los 8")
-- ============================================

alter table recordatorios_pago rename column fecha_vencimiento to dia_vencimiento;

alter table recordatorios_pago
  alter column dia_vencimiento type integer
  using extract(day from dia_vencimiento)::integer;

alter table recordatorios_pago
  add constraint dia_vencimiento_valido
  check (dia_vencimiento is null or dia_vencimiento between 1 and 31);