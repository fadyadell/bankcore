import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@bankcore/database';
import { WorkflowModule } from './workflow/workflow.module';
import { AuthModule } from '@bankcore/auth';
import { HttpModule } from '@nestjs/axios';

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
    DatabaseModule,
    HttpModule,
    WorkflowModule,
  ],
})
export class AppModule {}
