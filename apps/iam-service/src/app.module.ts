import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '@bankcore/common';
import { bankcoreConfiguration, validateEnvironment } from '@bankcore/config';
import { PrismaModule } from '@bankcore/database';
import { AuthController } from './controllers/auth.controller.js';
import { UsersController } from './controllers/users.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { AuthService } from './services/auth.service.js';
import { UsersService } from './services/users.service.js';
import { KeycloakService } from './services/keycloak.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { AuditRepository } from './repositories/audit.repository.js';
import { keycloakConfig } from './config/keycloak.config.js';
import { jwtConfig } from './config/jwt.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bankcoreConfiguration, keycloakConfig, jwtConfig],
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),
    JwtModule.register({}),
    PrismaModule.forRoot(),
    CommonModule,
  ],
  controllers: [AuthController, UsersController, HealthController],
  providers: [AuthService, UsersService, KeycloakService, UserRepository, AuditRepository],
})
export class AppModule {}
