import { useEffect, useState } from 'react';
import { Link } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type AssetsItem = { id: string; name: string; status: string; createdAt: string };

export default function AssetsListPage() {
  const [items, setItems] = useState<AssetsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    fetch(API + '/v1/assets', { headers: { 'x-tenant-id': tenantId, authorization: 'Bearer ' + token } })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: AssetsItem[] }) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Assets</h2>
        <Link to="/assets/new" style={{ background: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none', padding: '8px 12px' }}>+ New</Link>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ textAlign: 'left', padding: 12 }}>Name</th><th style={{ textAlign: 'left', padding: 12 }}>Status</th><th style={{ textAlign: 'left', padding: 12 }}>Created</th><th style={{ padding: 12 }} /></tr></thead>
          <tbody>
            {!loading && items.length === 0 && <tr><td colSpan={4} style={{ padding: 18, color: '#94a3b8' }}>No records</td></tr>}
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12 }}>{item.name}</td>
                <td style={{ padding: 12 }}>{item.status}</td>
                <td style={{ padding: 12 }}>{new Date(item.createdAt).toLocaleString()}</td>
                <td style={{ padding: 12 }}><Link to="/assets/${item.id}">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
