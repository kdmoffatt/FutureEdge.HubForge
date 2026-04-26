import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type Assets2Item = { id: string; name: string; status: string; createdAt: string; updatedAt: string };

export default function Assets2DetailPage() {
  const params = useParams();
  const [item, setItem] = useState<Assets2Item | null>(null);

  useEffect(() => {
    if (!params.id) return;
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    fetch(API + '/v1/assets2/' + params.id, { headers: { 'x-tenant-id': tenantId, authorization: 'Bearer ' + token } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setItem(data));
  }, [params.id]);

  if (!item) {
    return <p style={{ color: '#94a3b8' }}>Loading Assets2...</p>;
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 0 }}>{item.name}</h2>
      <p>Status: {item.status}</p>
      <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
    </div>
  );
}
