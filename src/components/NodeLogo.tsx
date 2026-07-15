/**
 * Node Network Navigator mark — a hub-and-spoke network node.
 *
 * Recreated as a vector so it stays crisp at any size and inherits its colour
 * from the surrounding text (`currentColor`), rather than shipping the source
 * PNG with its baked-in black background. Drop it anywhere a colour is set via
 * Tailwind `text-*` and the mark follows.
 */

const CENTER = 100;
const SATELLITE_RADIUS = 80; // distance from centre to each outer node
const CORE_R = 30;
const NODE_R = 18;
const LINE_INNER = 37; // line starts just outside the core
const LINE_OUTER = 55; // …and stops just short of the satellite

// Eight satellites, evenly spaced starting at the top and going clockwise.
const ANGLES = [90, 45, 0, -45, -90, -135, 180, 135];

const point = (angleDeg: number, r: number): [number, number] => {
  const a = (angleDeg * Math.PI) / 180;
  return [CENTER + r * Math.cos(a), CENTER - r * Math.sin(a)];
};

export function NodeLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Node Network Navigator"
      fill="currentColor"
    >
      {/* Spokes (drawn first so the nodes sit on top). */}
      {ANGLES.map((angle) => {
        const [x1, y1] = point(angle, LINE_INNER);
        const [x2, y2] = point(angle, LINE_OUTER);
        return (
          <line
            key={`spoke-${angle}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={6}
            strokeLinecap="round"
          />
        );
      })}

      {/* Satellite nodes. */}
      {ANGLES.map((angle) => {
        const [cx, cy] = point(angle, SATELLITE_RADIUS);
        return <circle key={`node-${angle}`} cx={cx} cy={cy} r={NODE_R} />;
      })}

      {/* Core node. */}
      <circle cx={CENTER} cy={CENTER} r={CORE_R} />
    </svg>
  );
}
