import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { KeycloakService } from './keycloak.service';
import { CreateUserDto } from '../dto/user.dto';

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

    const role = dto.role || 'CUSTOMER';
    const keycloakId = await this.keycloakService.createUser(
      dto.email,
      dto.firstName,
      dto.lastName,
      dto.password,
    );

    const userData: any = {
      email: dto.email,
      role: role,
      keycloakId,
    };

    if (role === 'CUSTOMER') {
      userData.customer = {
        create: {
          phone: dto.phone,
        },
      };
    } else if (role === 'EMPLOYEE') {
      userData.employee = {
        create: {
          department: 'GENERAL',
          employeeNumber: `EMP-${Date.now()}`,
        }
      };
    }

    return this.userRepository.create(userData);
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
