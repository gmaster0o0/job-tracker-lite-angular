import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import {
  CreateNoteDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/api-interfaces';

export class CreateNoteDtoRequest implements CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;
}

export class UpdateNoteDtoRequest implements UpdateNoteDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  body?: string;
}
