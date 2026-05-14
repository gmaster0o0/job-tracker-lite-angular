import {
  IsNotEmpty,
  IsString,
  IsOptional,
  ValidateIf,
  IsEmail,
} from 'class-validator';
import {
  UpdateContactDto,
  CreateContactDto,
} from '@job-tracker-lite-angular/api-interfaces';

export class CreateContactDtoRequest implements CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateIf((o) => o.email || o.phoneNumber)
  @IsEmail()
  @IsNotEmpty({ message: 'Email or phone number must be provided' })
  email?: string;

  @ValidateIf((o) => o.email || o.phoneNumber)
  @IsString()
  @IsNotEmpty({ message: 'Email or phone number must be provided' })
  phoneNumber?: string;
}

export class UpdateContactDtoRequest implements UpdateContactDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
