export function createJobsServiceMock(mockFactory?: () => any) {
  const mockFn = mockFactory || (() => ({}));

  return {
    findAll: mockFn(),
    create: mockFn(),
    findOne: mockFn(),
    updateStatus: mockFn(),
    update: mockFn(),
    delete: mockFn(),
    findContacts: mockFn(),
    createContact: mockFn(),
    updateContact: mockFn(),
    deleteContact: mockFn(),
    findNotes: mockFn(),
    createNote: mockFn(),
    updateNote: mockFn(),
    deleteNote: mockFn(),
  };
}
