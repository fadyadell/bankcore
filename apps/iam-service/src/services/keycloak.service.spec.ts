import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakService } from './keycloak.service.js';
import { keycloakConfig } from '../config/keycloak.config.js';

describe('KeycloakService', () => {
  let service: KeycloakService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakService,
        {
          provide: keycloakConfig.KEY,
          useValue: {
            authServerUrl: 'http://localhost:8080/auth',
            realm: 'bankcore',
            clientId: 'iam-service',
            secret: 'secret',
          },
        },
      ],
    }).compile();

    service = module.get<KeycloakService>(KeycloakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get admin token', async () => {
    const token = await service.getAdminToken();
    expect(token).toEqual('mock-admin-token');
  });
});
