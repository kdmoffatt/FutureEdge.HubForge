export type AuthProviderProfile = {
  mode: string;
  provider: string;
  issuer: string;
};

export async function getAuthProfile(baseUrl: string): Promise<AuthProviderProfile> {
  const res = await fetch(baseUrl + '/v1/auth/provider');
  if (!res.ok) {
    throw new Error('Failed to resolve auth provider profile');
  }
  return res.json() as Promise<AuthProviderProfile>;
}
