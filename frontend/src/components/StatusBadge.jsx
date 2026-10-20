export default function StatusBadge({ value }) {
  return <span className={`badge s-${value}`}>{value}</span>;
}
