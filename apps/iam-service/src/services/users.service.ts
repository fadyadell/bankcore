import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository.js';
import { KeycloakService } from './keycloak.service.js';
import { CreateUserDto } from '../dto/user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly keycloakService: KeycloakService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const keycloakId = await this.keycloakService.createUser(
      dto.email,
      dto.firstName,
      dto.lastName,
    );

    return this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      keycloakId,
      status: 'ACTIVE',
      kycStatus: 'PENDING',
    });
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
