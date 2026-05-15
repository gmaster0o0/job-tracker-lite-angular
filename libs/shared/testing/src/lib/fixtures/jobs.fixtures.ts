import {
  CreateJobDto,
  JobDto,
  UpdateJobDto,
} from '@job-tracker-lite-angular/schemas';

export const jobFixtureTimestamp = '2026-04-29T09:00:00.000Z';

export interface JobFixturesMap {
  frontendEngineer: JobDto;
  backendEngineer: JobDto;
  fullStackEngineer: JobDto;
  productDesigner: JobDto;
  engineeringManager: JobDto;
  devopsEngineer: JobDto;
  qaAutomationEngineer: JobDto;
  dataAnalyst: JobDto;
  technicalRecruiter: JobDto;
  platformEngineer: JobDto;
  juniorReactDeveloper: JobDto;
}

export const jobFixtures: JobFixturesMap = {
  frontendEngineer: {
    id: 'ck1234567890',
    position: 'Frontend Engineer',
    link: 'https://example.com/jobs/frontend-engineer',
    description:
      'Build polished Angular workflows for an internal hiring platform.',
    company: 'Acme Labs',
    status: 'saved',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  backendEngineer: {
    id: 'ck1234567891',
    position: 'Backend Engineer',
    link: 'https://example.com/jobs/backend-engineer',
    description: 'Own Node and Nest services that power recruiting automation.',
    company: 'Globex',
    status: 'applied',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  fullStackEngineer: {
    id: 'ck1234567892',
    position: 'Full Stack Engineer',
    link: 'https://example.com/jobs/full-stack-engineer',
    description: 'Ship product features across Angular, Nest, and PostgreSQL.',
    company: 'Initech',
    status: 'interview',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  productDesigner: {
    id: 'ck1234567893',
    position: 'Product Designer',
    link: 'https://example.com/jobs/product-designer',
    description: 'Design application flows for a job tracking workspace.',
    company: 'Northwind',
    status: 'job offered',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  engineeringManager: {
    id: 'ck1234567894',
    position: 'Engineering Manager',
    link: 'https://example.com/jobs/engineering-manager',
    description:
      'Lead a platform team focused on developer tooling and velocity.',
    company: 'Umbrella Tech',
    status: 'applied',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  devopsEngineer: {
    id: 'ck1234567895',
    position: 'DevOps Engineer',
    link: 'https://example.com/jobs/devops-engineer',
    description:
      'Improve CI/CD and containerized local development for the team.',
    company: 'Stark Systems',
    status: 'saved',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  qaAutomationEngineer: {
    id: 'ck1234567896',
    position: 'QA Automation Engineer',
    link: 'https://example.com/jobs/qa-automation-engineer',
    description:
      'Expand Jest and Playwright coverage across the hiring workflow.',
    company: 'Wayne Enterprises',
    status: 'interview',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  dataAnalyst: {
    id: 'ck1234567897',
    position: 'Data Analyst',
    link: 'https://example.com/jobs/data-analyst',
    description: 'Turn recruiting funnel metrics into actionable insights.',
    company: 'Soylent Analytics',
    status: 'saved',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  technicalRecruiter: {
    id: 'ck1234567898',
    position: 'Technical Recruiter',
    link: 'https://example.com/jobs/technical-recruiter',
    description:
      'Partner with engineering leaders to source senior candidates.',
    company: 'Hooli Talent',
    status: 'applied',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  platformEngineer: {
    id: 'ck1234567899',
    position: 'Platform Engineer',
    link: 'https://example.com/jobs/platform-engineer',
    description: 'Standardize shared tooling and libraries in an Nx monorepo.',
    company: 'Massive Dynamic',
    status: 'job offered',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  juniorReactDeveloper: {
    id: 'ck1234567900',
    position: 'Junior React Developer',
    link: 'https://example.com/jobs/junior-react-developer',
    description: 'Help build internal dashboards.',
    company: 'Initrode',
    status: 'rejected',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
};

export const updateJobFixtures: Record<string, UpdateJobDto> = {
  updatedFrontendEngineer: {
    position: 'Senior Frontend Engineer',
    company: 'Updated Company',
    link: 'https://updated.com',
    description: 'Updated description',
  },
};

export interface CreateJobFixturesMap {
  designer: CreateJobDto;
  productDesigner: CreateJobDto;
  empty: CreateJobDto;
}

export const createJobFixtures: CreateJobFixturesMap = {
  designer: {
    position: 'Designer',
    link: 'https://example.com/jobs/designer',
    description: 'Shape product UI',
    company: 'Initech',
  },
  productDesigner: {
    position: 'Product Designer',
    link: 'https://example.com/jobs/product-designer',
    description: 'Design the experience',
    company: 'Northwind',
  },
  empty: {
    company: '',
    position: '',
    link: '',
    description: '',
  },
};

export interface JobResultFixturesMap {
  createdProductDesigner: JobDto;
  updatedBackendEngineerInterview: JobDto;
}

export const jobResultFixtures: JobResultFixturesMap = {
  createdProductDesigner: {
    id: 'ck1234567896',
    position: 'Product Designer',
    link: 'https://example.com/jobs/product-designer',
    description: 'Design the experience',
    company: 'Northwind',
    status: 'saved',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  updatedBackendEngineerInterview: {
    id: 'ck1234567891',
    position: 'Backend Engineer',
    link: 'https://example.com/jobs/backend-engineer',
    description: 'Own Node and Nest services that power recruiting automation.',
    company: 'Globex',
    status: 'interview',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
};

export const allJobDtoFixtures: JobDto[] = [
  jobFixtures.frontendEngineer,
  jobFixtures.backendEngineer,
  jobFixtures.fullStackEngineer,
  jobFixtures.productDesigner,
  jobFixtures.engineeringManager,
  jobFixtures.devopsEngineer,
  jobFixtures.qaAutomationEngineer,
  jobFixtures.dataAnalyst,
  jobFixtures.technicalRecruiter,
  jobFixtures.platformEngineer,
  jobFixtures.juniorReactDeveloper,
];
