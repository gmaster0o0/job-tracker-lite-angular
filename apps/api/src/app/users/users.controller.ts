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
  userDetailsSchema,
  updateUserProfileSchema,
  UpdateUserRoleDto,
  UserListItemDto,
  UserDetailsDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';
import { Role } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get user by slug (public basic info)' })
  @ApiOkResponse({ schema: zodToApiSchema(userListItemSchema) })
  async getUser(@Param('slug') slug: string): Promise<UserListItemDto> {
    return this.usersService.getUser(slug);
  }

  @Get()
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ schema: zodToApiSchema(userListItemSchema) })
  async listUsers(): Promise<UserListItemDto[]> {
    return this.usersService.listUsers();
  }

  @Get(':idOrSlug/profile')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get user profile by id or slug (Moderator/Admin only)',
  })
  @ApiOkResponse({ schema: zodToApiSchema(userDetailsSchema) })
  async getUserProfile(
    @Param('idOrSlug') idOrSlug: string,
  ): Promise<UserDetailsDto> {
    return this.usersService.getUserProfile(idOrSlug);
  }

  @Patch(':idOrSlug/profile')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update user profile by id or slug (Moderator/Admin only)',
  })
  @ApiBody({
    description: 'Fields to update on the user profile',
    schema: zodToApiSchema(updateUserProfileSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(userDetailsSchema) })
  async updateUserProfile(
    @Param('idOrSlug') idOrSlug: string,
    @ZodBody(updateUserProfileSchema) dto: UpdateUserProfileDto,
  ): Promise<UserDetailsDto> {
    return this.usersService.updateUserProfile(idOrSlug, dto);
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
