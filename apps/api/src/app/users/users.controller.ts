import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import {
  Roles,
  RolesGuard,
  ZodBody,
  zodToApiSchema,
} from '@job-tracker-lite-angular/core-utils';
import { UsersService } from './users.service';
import {
  updateUserRoleSchema,
  userListItemSchema,
  UpdateUserRoleDto,
  UserListItemDto,
} from '@job-tracker-lite-angular/schemas';
import { Role } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ schema: zodToApiSchema(userListItemSchema) })
  async listUsers(): Promise<UserListItemDto[]> {
    return this.usersService.listUsers();
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiBody({ schema: zodToApiSchema(updateUserRoleSchema) })
  @ApiOkResponse({ schema: zodToApiSchema(userListItemSchema) })
  async updateUserRole(
    @Param('id') id: string,
    @ZodBody(updateUserRoleSchema) dto: UpdateUserRoleDto,
  ): Promise<UserListItemDto> {
    return this.usersService.updateUserRole(id, dto);
  }
}
