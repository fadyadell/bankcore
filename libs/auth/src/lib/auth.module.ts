import { Module, type DynamicModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakJwtStrategy } from './keycloak-jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

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
    useFactory: (...args: any[]) => AuthModuleOptions | Promise<AuthModuleOptions>;
    inject?: any[];
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
