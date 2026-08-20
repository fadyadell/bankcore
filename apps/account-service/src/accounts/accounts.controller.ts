import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountStatusDto } from './dto/account.dto';
import {
  PaginationDto,
  buildPaginatedResponse,
  CurrentUser,
  type JwtPayload,
} from '@bankcore/common';
import { JwtAuthGuard, RolesGuard } from '@bankcore/auth';

@Controller('accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    const { accounts, total } = await this.accountsService.findAll(
      pagination.page,
      pagination.limit,
      userId,
      status,
    );
    return buildPaginatedResponse(accounts, total, pagination.page, pagination.limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findById(id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.getBalance(id);
  }

  @Post()
  async create(@Body() dto: CreateAccountDto, @CurrentUser() user: JwtPayload) {
    const isAdmin =
      user.realm_access?.roles?.includes('admin') ||
      user.realm_access?.roles?.includes('bank_officer');

    // Look up internal userId if missing or if customer
    if (!isAdmin || !dto.userId) {
      const internalUser = await this.accountsService.findUserByKeycloakId(user.sub);
      if (!internalUser) {
        throw new ForbiddenException('User record not found in system');
      }

      // If customer is trying to create account for someone else
      if (!isAdmin && dto.userId && dto.userId !== internalUser.id) {
        throw new ForbiddenException('You can only create accounts for yourself');
      }

      dto.userId = internalUser.id;
    }

    return this.accountsService.create(dto);
  }

  @Put(':id/status')
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAccountStatusDto) {
    return this.accountsService.updateStatus(id, dto);
  }
}
