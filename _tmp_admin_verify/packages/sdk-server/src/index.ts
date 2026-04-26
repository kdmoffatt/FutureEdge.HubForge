export type RequestMetadata = {
  requestId: string;
  tenantId: string;
};

export function buildRequestMetadata(requestId: string, tenantId: string): RequestMetadata {
  return { requestId, tenantId };
}
