import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env['JWT_SECRET'] || 'super-secret',
  expiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
  refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'super-refresh-secret',
  refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
}));
