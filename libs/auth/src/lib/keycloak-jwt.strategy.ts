import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { AuthModuleOptions } from './auth.module';

interface KeycloakJwksKey {
  kty: string;
  kid: string;
  use: string;
  n: string;
  e: string;
}

interface KeycloakJwksResponse {
  keys: KeycloakJwksKey[];
}

@Injectable()
export class KeycloakJwtStrategy extends PassportStrategy(Strategy, 'keycloak-jwt') {
  private readonly logger = new Logger(KeycloakJwtStrategy.name);

  constructor(@Inject('AUTH_MODULE_OPTIONS') options: AuthModuleOptions) {
    const jwksUri = `${options.keycloakBaseUrl}/realms/${options.keycloakRealm}/protocol/openid-connect/certs`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: `${options.keycloakBaseUrl}/realms/${options.keycloakRealm}`,
      algorithms: ['RS256'],
      secretOrKeyProvider: async (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, key?: string) => void,
      ) => {
        try {
          const header = JSON.parse(
            Buffer.from(rawJwtToken.split('.')[0] ?? '', 'base64url').toString(),
          ) as { kid: string };

          const response = await fetch(jwksUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
          }

          const jwks = (await response.json()) as KeycloakJwksResponse;
          const key = jwks.keys.find((k) => k.kid === header.kid);

          if (!key) {
            throw new Error(`Key with kid ${header.kid} not found`);
          }

          const publicKey = this.jwkToPem(key);
          done(null, publicKey);
        } catch (error) {
          this.logger.error(`JWT validation error: ${(error as Error).message}`);
          done(error as Error);
        }
      },
    });
  }

  validate(payload: Record<string, unknown>): Record<string, unknown> {
    if (!payload['sub']) {
      throw new UnauthorizedException('Invalid token: missing subject');
    }
    return {
      sub: payload['sub'],
      email: payload['email'],
      preferred_username: payload['preferred_username'],
      given_name: payload['given_name'],
      family_name: payload['family_name'],
      roles: payload['roles'],
      realm_access: payload['realm_access'],
      resource_access: payload['resource_access'],
    };
  }

  private jwkToPem(jwk: KeycloakJwksKey): string {
    const n = Buffer.from(jwk.n, 'base64url');
    const e = Buffer.from(jwk.e, 'base64url');

    const nBytes = this.encodeDerLength(n.length);
    const eBytes = this.encodeDerLength(e.length);

    const nEncoded = Buffer.concat([
      Buffer.from([0x02]),
      nBytes,
      (n[0] || 0) >= 0x80 ? Buffer.concat([Buffer.from([0x00]), n]) : n,
    ]);

    if ((n[0] || 0) >= 0x80) {
      const newNBytes = this.encodeDerLength(n.length + 1);
      const nEncodedPadded = Buffer.concat([
        Buffer.from([0x02]),
        newNBytes,
        Buffer.from([0x00]),
        n,
      ]);
      const eEncoded = Buffer.concat([Buffer.from([0x02]), eBytes, e]);
      const sequenceContent = Buffer.concat([nEncodedPadded, eEncoded]);
      const sequence = Buffer.concat([
        Buffer.from([0x30]),
        this.encodeDerLength(sequenceContent.length),
        sequenceContent,
      ]);

      const bitString = Buffer.concat([
        Buffer.from([0x03]),
        this.encodeDerLength(sequence.length + 1),
        Buffer.from([0x00]),
        sequence,
      ]);

      const algorithmIdentifier = Buffer.from([
        0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
      ]);

      const outerSequence = Buffer.concat([algorithmIdentifier, bitString]);
      const der = Buffer.concat([
        Buffer.from([0x30]),
        this.encodeDerLength(outerSequence.length),
        outerSequence,
      ]);

      const base64 = der.toString('base64');
      const lines = base64.match(/.{1,64}/g) || [];
      return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
    }

    const eEncoded = Buffer.concat([Buffer.from([0x02]), eBytes, e]);
    const sequenceContent = Buffer.concat([nEncoded, eEncoded]);
    const sequence = Buffer.concat([
      Buffer.from([0x30]),
      this.encodeDerLength(sequenceContent.length),
      sequenceContent,
    ]);

    const bitString = Buffer.concat([
      Buffer.from([0x03]),
      this.encodeDerLength(sequence.length + 1),
      Buffer.from([0x00]),
      sequence,
    ]);

    const algorithmIdentifier = Buffer.from([
      0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
    ]);

    const outerSequence = Buffer.concat([algorithmIdentifier, bitString]);
    const der = Buffer.concat([
      Buffer.from([0x30]),
      this.encodeDerLength(outerSequence.length),
      outerSequence,
    ]);

    const base64 = der.toString('base64');
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
  }

  private encodeDerLength(length: number): Buffer {
    if (length < 0x80) {
      return Buffer.from([length]);
    }
    const bytes: number[] = [];
    let temp = length;
    while (temp > 0) {
      bytes.unshift(temp & 0xff);
      temp >>= 8;
    }
    return Buffer.from([0x80 | bytes.length, ...bytes]);
  }
}
