import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_USER_PREFERENCES,
  UpdateUserPreferencesDto,
  UserPreferencesDto,
  userPreferencesSchema,
} from '@job-tracker-lite-angular/schemas';

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string): Promise<UserPreferencesDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    if (!user?.preferences) {
      return DEFAULT_USER_PREFERENCES;
    }

    const result = userPreferencesSchema.safeParse(user.preferences);
    if (!result.success) {
      this.logger.warn(
        `Stored preferences for user ${userId} failed schema validation, falling back to defaults: ${result.error.message}`,
      );
      return DEFAULT_USER_PREFERENCES;
    }

    return result.data;
  }

  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesDto> {
    const current = await this.getPreferences(userId);
    const merged: UserPreferencesDto = { ...current, ...updatePreferencesDto };

    await this.prisma.user.update({
      where: { id: userId },
      data: { preferences: merged },
    });

    return merged;
  }
}
