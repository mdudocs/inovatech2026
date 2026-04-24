export function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="info-pill">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  )
}
