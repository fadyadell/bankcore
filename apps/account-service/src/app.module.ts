import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/database';
import { AccountModule } from './account/account.module';
import { AuthModule } from '@bankcore/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        keycloakBaseUrl: config.get('KEYCLOAK_URL') || 'http://localhost:8080',
        keycloakRealm: config.get('KEYCLOAK_REALM') || 'bankcore',
        keycloakClientId: config.get('KEYCLOAK_CLIENT_ID') || 'api-gateway',
      }),
    }),
    PrismaModule,
    AccountModule,
  ],

})
export class AppModule {}
