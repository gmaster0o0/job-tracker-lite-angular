import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe to validate that a string is a valid CUID (Collision-resistant Unique Identifier).
 * This pipe can be used in NestJS controllers to ensure that incoming parameters conform to the CUID format.
 */
@Injectable()
export class ParseCuidPipe implements PipeTransform<string, string> {
  private readonly cuidRegex = /^[a-z][a-z0-9]{20,32}$/i;

  transform(value: string): string {
    if (!this.cuidRegex.test(value)) {
      throw new BadRequestException(
        `Invalid identifier: '${value}'. CUID format required.`,
      );
    }
    return value;
  }
}
