import { Pipe, PipeTransform } from '@angular/core';
import {
  transformZodIssue,
  transformZodIssues,
} from '../utils/error-transformer';

@Pipe({
  name: 'zodTransform1',
  standalone: true,
})
/**
 * Angular pipe to transform Zod validation errors into a format suitable for i18n translation.
 */
export class ZodTransformPipFirst implements PipeTransform {
  transform(errors: any[] | null | undefined, namespace: string): any {
    if (!errors || errors.length === 0) return null;

    // Take the first issue from the array and transform it
    const firstIssue = errors[0].issue;
    return transformZodIssue(firstIssue, namespace);
  }
}
/**
 * Angular pipe to transform all Zod validation errors into a format suitable for i18n translation.
 */
@Pipe({
  name: 'zodTransformAll',
  standalone: true,
})
export class ZodTransformPipeAll implements PipeTransform {
  transform(errors: any[] | null | undefined, namespace: string): any {
    if (!errors || errors.length === 0) return null;

    const issues = errors.map((e) => e.issue);

    return transformZodIssues(issues, namespace);
  }
}
