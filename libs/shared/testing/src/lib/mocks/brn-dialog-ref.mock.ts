import { BrnDialogRef } from '@spartan-ng/brain/dialog';

export const dialogRefMock: Partial<BrnDialogRef> = {
  close: () => void 0,
};

export function createBrnDialogRefMock(): Partial<BrnDialogRef> {
  return { ...dialogRefMock };
}
