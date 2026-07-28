import { Module, type DynamicModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakJwtStrategy } from './keycloak-jwt.strategy.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

export interface AuthModuleOptions {
  keycloakBaseUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
}

@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [PassportModule.register({ defaultStrategy: 'keycloak-jwt' })],
      providers: [
        {
          provide: 'AUTH_MODULE_OPTIONS',
          useValue: options,
        },
        KeycloakJwtStrategy,
        JwtAuthGuard,
        RolesGuard,
      ],
      exports: [JwtAuthGuard, RolesGuard, PassportModule],
    };
  }

  static forRootAsync(optionsFactory: {
    useFactory: (...args: unknown[]) => AuthModuleOptions | Promise<AuthModuleOptions>;
    inject?: unknown[];
  }): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [PassportModule.register({ defaultStrategy: 'keycloak-jwt' })],
      providers: [
        {
          provide: 'AUTH_MODULE_OPTIONS',
          useFactory: optionsFactory.useFactory,
          inject: optionsFactory.inject || [],
        },
        KeycloakJwtStrategy,
        JwtAuthGuard,
        RolesGuard,
      ],
      exports: [JwtAuthGuard, RolesGuard, PassportModule],
    };
  }
}
