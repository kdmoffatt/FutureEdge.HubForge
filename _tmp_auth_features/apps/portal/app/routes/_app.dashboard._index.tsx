export default function DashboardPage() {
  const stats = ['Active tenants', 'Requests today', 'AI completions'];

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {stats.map((label) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 600, margin: '0.25rem 0 0' }}>&#8212;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
