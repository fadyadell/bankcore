import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakService } from './keycloak.service';
import { keycloakConfig } from '../config/keycloak.config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('KeycloakService', () => {
  let service: KeycloakService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakService,
        {
          provide: keycloakConfig.KEY,
          useValue: {
            authServerUrl: 'http://localhost:8080',
            realm: 'test-realm',
            adminUsername: 'admin',
            adminPassword: 'password',
          },
        },
      ],
    }).compile();

    service = module.get<KeycloakService>(KeycloakService);

    // Mock getAdminToken for simplicity
    jest.spyOn(service, 'getAdminToken').mockResolvedValue('test-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if Keycloak ID cannot be determined (no location, empty get)', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      headers: {},
      data: {},
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: [],
    });

    await expect(
      service.createUser('test@example.com', 'Test', 'User')
    ).rejects.toThrow('Could not determine Keycloak ID for user test@example.com');
  });

  it('should throw an error if Keycloak ID cannot be determined after 409 conflict', async () => {
    const error = new Error('Conflict');
    (error as any).response = { status: 409 };
    mockedAxios.post.mockRejectedValueOnce(error);

    mockedAxios.get.mockResolvedValueOnce({
      data: [],
    });

    await expect(
      service.createUser('test@example.com', 'Test', 'User')
    ).rejects.toThrow('Could not determine Keycloak ID for user test@example.com after 409 conflict');
  });
});
