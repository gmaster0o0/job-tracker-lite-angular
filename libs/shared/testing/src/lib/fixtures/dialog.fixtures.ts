export interface DeleteConfirmationDialogContext {
  title: string;
  description?: string;
  confirmLabel: string;
  busyLabel: string;
  cancelLabel: string;
  isBusy: boolean;
}

export const deleteConfirmationDialogFixtures = {
  default: {
    title: 'Remove item?',
    description: 'Delete this item permanently.',
    confirmLabel: 'Delete item',
    busyLabel: 'Deleting item...',
    cancelLabel: 'Keep item',
    isBusy: false,
  } as DeleteConfirmationDialogContext,
  busy: {
    title: 'Remove item?',
    description: 'Delete this item permanently.',
    confirmLabel: 'Delete item',
    busyLabel: 'Deleting item...',
    cancelLabel: 'Keep item',
    isBusy: true,
  } as DeleteConfirmationDialogContext,
};
