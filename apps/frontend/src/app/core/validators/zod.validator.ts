import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ZodType } from 'zod';

export function createZodValidator(schema: ZodType<any>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(control.value);

    if (result.success) return null;

    // Kinyerjük az első hiba adatait
    const issue = result.error.issues[0];

    return {
      zodError: {
        // Ez lehet egy konkrét üzenet VAGY egy fordítási kulcs
        message: issue.message,
        // Átadjuk a Zod "kódját" is (pl. 'too_small'), ha ez alapján akarsz fordítani
        code: issue.code,
        // Átadjuk a paramétereket (pl. min length értéke), ha a fordításhoz kell
        params: issue,
      },
    };
  };
}
