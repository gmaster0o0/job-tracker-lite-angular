import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

import {
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobDto,
  UpdateJobStatusDto,
} from '@job-tracker-lite-angular/api-interfaces';

export class CreateJobsDtoRequest implements CreateJobDto {
  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  link?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
/**
 * position and company should be not empty strings if provided, but they are optional for partial updates
 */
export class UpdateJobsDtoRequest implements UpdateJobDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  company?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  status?: JobStatusDto;
}

export class UpdateJobsStatusDtoRequest implements UpdateJobStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: JobStatusDto;
}
