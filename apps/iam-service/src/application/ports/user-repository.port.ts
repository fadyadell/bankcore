import type { User, KycStatus, UserStatus } from '@prisma/client';

export interface CreateUserInput {
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  nationalId?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  nationalId?: string | null;
  kycStatus?: KycStatus;
  status?: UserStatus;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByKeycloakId(keycloakId: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  list(page: number, limit: number): Promise<{ users: User[]; total: number }>;
}
