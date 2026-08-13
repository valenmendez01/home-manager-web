import { AmbienteConEstado } from "@/types/limpieza";
import { ESTADO_COLORS } from "@/utils/limpiezaStatus";

interface Props {
  ambientes: AmbienteConEstado[];
  onSelect: (ambiente: AmbienteConEstado) => void;
}

const WALL = "#525252"; // color de las líneas divisorias (neutral-600)
const WALL_W = 2;

// Paths reales del plano del departamento (idénticos a la app original)
const ROOM_PATHS: Record<string, string> = {
  Balcón: "M 133 498 L 133 457 L 438 457 L 438 498 Z",
  Living:
    "M 133 457 L 133 172 L 144 172 L 182 172 L 302 172 L 302 189 L 343 189 L 343 250 L 302 250 L 302 457 L 291 457 L 148 457 Z",
  Cocina: "M 302 172 L 302 9 L 232 9 L 204 9 L 197 9 L 197 172 L 230 172 L 266 172 Z",
  "Dormitorio chico": "M 302 9 L 437 9 L 437 158 L 343 158 L 343 189 L 302 189 Z",
  Baño: "M 437 158 L 437 298 L 343 298 L 343 272 L 343 240 L 343 158 Z",
  "Dormitorio grande": "M 437 298 L 438 457 L 302 457 L 302 250 L 343 250 L 343 298 Z",
};

// Bounding box de todos los paths de arriba, con un pequeño margen
const VIEWBOX = { minX: 123, minY: 0, width: 325, height: 508 };

function parsePoints(d: string): [number, number][] {
  const matches = d.match(/[ML]\s*-?[\d.]+\s+-?[\d.]+/g) ?? [];
  return matches.map((seg) => {
    const [x, y] = seg.replace(/[ML]/, "").trim().split(/\s+/).map(Number);
    return [x, y];
  });
}

function centroid(points: [number, number][]): { x: number; y: number } {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area *= 0.5;
  if (area === 0) {
    const n = points.length;
    return {
      x: points.reduce((s, p) => s + p[0], 0) / n,
      y: points.reduce((s, p) => s + p[1], 0) / n,
    };
  }
  return { x: cx / (6 * area), y: cy / (6 * area) };
}

export default function PlanoAmbientes({ ambientes, onSelect }: Props) {
  const byNombre = (nombre: string) => ambientes.find((a) => a.nombre === nombre);

  return (
    <div style={{ width: "100%", aspectRatio: `${VIEWBOX.width} / ${VIEWBOX.height}` }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${VIEWBOX.minX} ${VIEWBOX.minY} ${VIEWBOX.width} ${VIEWBOX.height}`}
      >
        {Object.entries(ROOM_PATHS).map(([nombre, d]) => {
          const ambiente = byNombre(nombre);
          const colors = ambiente ? ESTADO_COLORS[ambiente.estado] : { bg: "#171717", text: "" };
          const points = parsePoints(d);
          const { x: cx, y: cy } = centroid(points);
          const estadoLabel = !ambiente
            ? ""
            : !ambiente.ultimaLimpieza
            ? "Sin limpiar"
            : new Date(ambiente.ultimaLimpieza.realizado_at).toLocaleDateString();

          return (
            <g key={nombre}>
              <path
                d={d}
                fill={colors.bg}
                stroke={WALL}
                strokeWidth={WALL_W}
                strokeLinejoin="round"
                onClick={ambiente ? () => onSelect(ambiente) : undefined}
                style={{ cursor: ambiente ? "pointer" : "default" }}
              />
              {ambiente && (
                <>
                  <text x={cx} y={cy - 4} fill="#fafafa" fontSize={13} fontWeight={600} textAnchor="middle">
                    {nombre}
                  </text>
                  <text
                    x={cx}
                    y={cy + 13}
                    fill={ESTADO_COLORS[ambiente.estado].text}
                    fontSize={11}
                    fontWeight={500}
                    textAnchor="middle"
                  >
                    {estadoLabel}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
