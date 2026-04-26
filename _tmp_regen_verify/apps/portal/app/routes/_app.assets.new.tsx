import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

export default function AssetsCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const res = await fetch(API + '/v1/assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId, authorization: 'Bearer ' + token },
      body: JSON.stringify({ name, status }),
    });
    if (res.ok) {
      navigate('/assets');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 560, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', display: 'grid', gap: '0.75rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create Assets</h2>
      <input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Name" style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px' }} />
      <select value={status} onChange={(e) => setStatus(e.currentTarget.value === 'inactive' ? 'inactive' : 'active')} style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px' }}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button type="submit" style={{ border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', padding: '8px 12px' }}>Create</button>
    </form>
  );
}
