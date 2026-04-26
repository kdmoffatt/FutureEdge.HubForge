import { useState, useEffect } from 'react';

const DEFAULT_API_URL = 'http://localhost:4000';

export default function DocsPage() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);

  useEffect(() => {
    const metaApiUrl = (document.querySelector('meta[name=\"api-url\"]') as HTMLMetaElement | null)?.content;
    const envApiUrl = (window as typeof window & { ENV?: { API_URL?: string } }).ENV?.API_URL;
    setApiUrl(metaApiUrl ?? envApiUrl ?? DEFAULT_API_URL);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: "1rem", flexShrink: 0 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem" }}>
          API Reference
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
          Interactive API documentation. Try any endpoint directly from your browser.
        </p>
      </div>
      <div style={{ flex: 1, minHeight: 0, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <iframe
          src={apiUrl + "/docs"}
          title="API Reference"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>
    </div>
  );
}
