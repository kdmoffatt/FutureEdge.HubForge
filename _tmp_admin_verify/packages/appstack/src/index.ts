export type AppCapability = {
  id: string;
  description: string;
};

export const coreCapabilities: AppCapability[] = [
  { id: 'api-routing', description: 'API routing and middleware baseline' },
  { id: 'tenant-awareness', description: 'Tenant context resolution baseline' },
  { id: 'observability', description: 'Request logging, tracing headers, and health checks' },
];
