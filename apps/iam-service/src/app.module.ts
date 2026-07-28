import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@bankcore/prisma-client';
import { CommonModule } from '@bankcore/common';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { UsersController } from './users/users.controller.js';
import { UsersService } from './users/users.service.js';
import { AuditService } from './audit/audit.service.js';
import { KeycloakAdminService } from './keycloak/keycloak-admin.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot(),
    CommonModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, AuditService, KeycloakAdminService],
})
export class AppModule {}
