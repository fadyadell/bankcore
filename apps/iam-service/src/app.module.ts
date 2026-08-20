import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule, bankcoreConfiguration, validateEnvironment } from '@bankcore/common';
import { PrismaModule } from '@bankcore/prisma-client';
import { AUDIT_WRITER, IDENTITY_PROVIDER, USER_REPOSITORY } from './application/tokens';
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { LogoutUseCase } from './application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case';
import { CreateUserUseCase } from './application/use-cases/users/create-user.use-case';
import { GetUserByKeycloakIdUseCase } from './application/use-cases/users/get-user-by-keycloak-id.use-case';
import { GetUserUseCase } from './application/use-cases/users/get-user.use-case';
import { ListUsersUseCase } from './application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/users/update-user.use-case';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuditService } from './audit/audit.service';
import { HealthController } from './health/health.controller';
import { KeycloakAdminService } from './keycloak/keycloak-admin.service';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bankcoreConfiguration],
      validate: validateEnvironment,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule.forRoot(),
    CommonModule,
  ],
  controllers: [HealthController, AuthController, UsersController],
  providers: [
    AuthService,
    UsersService,
    AuditService,
    KeycloakAdminService,
    PrismaUserRepository,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,
    GetUserByKeycloakIdUseCase,
    UpdateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useExisting: PrismaUserRepository,
    },
    {
      provide: IDENTITY_PROVIDER,
      useExisting: KeycloakAdminService,
    },
    {
      provide: AUDIT_WRITER,
      useExisting: AuditService,
    },
  ],
})
export class AppModule {}
