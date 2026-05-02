export type JobTabFixture = {
  label: string;
  value: string;
};

export const jobTabsFixture: readonly JobTabFixture[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Contacts', value: 'contacts' },
  { label: 'Notes', value: 'notes' },
];

export const jobStepperLabels = [
  'Save',
  'Applied',
  'Interview',
  'Offer',
] as const;

export const jobOverviewMarkdown =
  '# Job Description\n\nThis is **important** for the role.';
