import { Directive } from '@angular/core';
import { BrnDialogClose } from '@spartan-ng/brain/dialog';

@Directive({
  standalone: true,
  selector: 'button[hlmDialogClose]',
  hostDirectives: [{ directive: BrnDialogClose, inputs: ['delay'] }],
  host: {
    'data-slot': 'dialog-close',
  },
})
export class HlmDialogClose {}
