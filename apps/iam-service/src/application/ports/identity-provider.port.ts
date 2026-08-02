export interface IdentityProviderTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export interface IdentityProviderCreateUserInput {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  credentials: Array<{ type: string; value: string; temporary: boolean }>;
}

export interface IdentityProviderPort {
  login(username: string, password: string): Promise<IdentityProviderTokenResponse>;
  refreshToken(refreshToken: string): Promise<IdentityProviderTokenResponse>;
  logout(refreshToken: string): Promise<void>;
  createUser(input: IdentityProviderCreateUserInput): Promise<string>;
  updateUser(
    keycloakId: string,
    updates: Partial<{ username: string; email: string; firstName: string; lastName: string; enabled: boolean }>,
  ): Promise<void>;
  assignRealmRole(keycloakId: string, roleName: string): Promise<void>;
}
