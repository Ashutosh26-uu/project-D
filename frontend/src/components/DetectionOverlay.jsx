/**
 * Draws detection boxes as an SVG over an image or video.
 * The viewBox uses source-image pixels, so boxes line up at any display size.
 */
export default function DetectionOverlay({ objects, width, height }) {
  if (!width || !height) return null;
  return (
    <svg className="overlay" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {objects.map((o, i) => {
        const [x1, y1, x2, y2] = o.bbox;
        const label = `${o.className} ${Math.round(o.confidence * 100)}%`;
        const fontSize = Math.max(12, width / 50);
        return (
          <g key={i}>
            <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} className="box" strokeWidth={Math.max(2, width / 300)} />
            <rect x={x1} y={Math.max(0, y1 - fontSize * 1.4)} width={label.length * fontSize * 0.6 + 8}
              height={fontSize * 1.4} className="box-label-bg" />
            <text x={x1 + 4} y={Math.max(fontSize, y1 - fontSize * 0.35)} fontSize={fontSize} className="box-label">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
