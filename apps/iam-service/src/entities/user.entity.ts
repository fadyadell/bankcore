import { User as PrismaUser, KycStatus, UserStatus } from '@prisma/client';

export type UserEntity = PrismaUser;
export { KycStatus, UserStatus };
