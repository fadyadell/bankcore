import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IamController } from './iam.controller';
import { IamService } from './iam.service';
import { KeycloakAuthGuard } from './guards/keycloak-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from '../controllers/auth.controller';
import { UsersController } from '../controllers/users.controller';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { AuditRepository } from '../repositories/audit.repository';
import { UserRepository } from '../repositories/user.repository';
import { KeycloakService } from '../services/keycloak.service';
import { keycloakConfig } from '../config/keycloak.config';
import { jwtConfig } from '../config/jwt.config';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
  imports: [
    HttpModule, 
    ConfigModule.forFeature(keycloakConfig),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({})
  ],
  controllers: [IamController, AuthController, UsersController],
  providers: [
    IamService, 
    KeycloakAuthGuard, 
    RolesGuard, 
    AuthService, 
    UsersService, 
    AuditRepository,
    UserRepository,
    KeycloakService,
    JwtAuthGuard
  ],
  exports: [IamService, KeycloakAuthGuard, RolesGuard, JwtAuthGuard],
})
export class IamModule {}
