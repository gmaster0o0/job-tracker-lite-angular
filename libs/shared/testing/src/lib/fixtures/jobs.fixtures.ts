import { CreateJobDto, JobDto } from '@job-tracker-lite-angular/api-interfaces';

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
    id: 1,
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
    id: 2,
    position: 'Backend Engineer',
    link: 'https://example.com/jobs/backend-engineer',
    description: 'Own Node and Nest services that power recruiting automation.',
    company: 'Globex',
    status: 'applied',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  fullStackEngineer: {
    id: 3,
    position: 'Full Stack Engineer',
    link: 'https://example.com/jobs/full-stack-engineer',
    description: 'Ship product features across Angular, Nest, and PostgreSQL.',
    company: 'Initech',
    status: 'interview',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  productDesigner: {
    id: 4,
    position: 'Product Designer',
    link: 'https://example.com/jobs/product-designer',
    description: 'Design application flows for a job tracking workspace.',
    company: 'Northwind',
    status: 'job offered',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  engineeringManager: {
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
    position: 'Data Analyst',
    link: 'https://example.com/jobs/data-analyst',
    description: 'Turn recruiting funnel metrics into actionable insights.',
    company: 'Soylent Analytics',
    status: 'saved',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  technicalRecruiter: {
    id: 9,
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
    id: 10,
    position: 'Platform Engineer',
    link: 'https://example.com/jobs/platform-engineer',
    description: 'Standardize shared tooling and libraries in an Nx monorepo.',
    company: 'Massive Dynamic',
    status: 'job offered',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  juniorReactDeveloper: {
    id: 11,
    position: 'Junior React Developer',
    link: 'https://example.com/jobs/junior-react-developer',
    description: 'Help build internal dashboards.',
    company: 'Initrode',
    status: 'rejected',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
};

export interface CreateJobFixturesMap {
  designer: CreateJobDto;
  productDesigner: CreateJobDto;
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
};

export interface JobResultFixturesMap {
  createdProductDesigner: JobDto;
  updatedBackendEngineerInterview: JobDto;
}

export const jobResultFixtures: JobResultFixturesMap = {
  createdProductDesigner: {
    id: 7,
    position: 'Product Designer',
    link: 'https://example.com/jobs/product-designer',
    description: 'Design the experience',
    company: 'Northwind',
    status: 'saved',
    createdAt: jobFixtureTimestamp,
    updatedAt: jobFixtureTimestamp,
  },
  updatedBackendEngineerInterview: {
    id: 9,
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
