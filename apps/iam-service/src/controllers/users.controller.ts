import { Controller, Get, Post, Body, UseGuards, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/user.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import type { CurrentUser as ICurrentUser } from '../common/current-user.interface.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@CurrentUser() user: ICurrentUser) {
    return this.usersService.findById(user.id);
  }

  @Get(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify user identity (used by workflow-service)' })
  @ApiResponse({ status: 200, description: 'User verified' })
  async verifyIdentity(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return {
      verified: user.kycStatus === 'VERIFIED',
      user: {
        id: user.id,
        status: user.status,
      },
    };
  }
}
