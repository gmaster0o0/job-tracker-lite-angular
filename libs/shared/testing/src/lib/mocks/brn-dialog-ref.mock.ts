export const dialogRefMock = {
  close: () => void 0,
};

export function createBrnDialogRefMock() {
  return { ...dialogRefMock };
}
