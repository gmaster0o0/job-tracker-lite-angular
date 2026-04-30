import { JobStatus } from '@prisma/client';
import { PrismaService } from './lib/prisma.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

const seedJobs = [
  {
    position: 'Frontend Engineer',
    link: 'https://example.com/jobs/frontend-engineer',
    description:
      'Build polished Angular workflows for an internal hiring platform.',
    company: 'Acme Labs',
    status: JobStatus.SAVED,
  },
  {
    position: 'Backend Engineer',
    link: 'https://example.com/jobs/backend-engineer',
    description: 'Own Node and Nest services that power recruiting automation.',
    company: 'Globex',
    status: JobStatus.APPLIED,
  },
  {
    position: 'Full Stack Engineer',
    link: 'https://example.com/jobs/full-stack-engineer',
    description: 'Ship product features across Angular, Nest, and PostgreSQL.',
    company: 'Initech',
    status: JobStatus.INTERVIEW,
  },
  {
    position: 'Product Designer',
    link: 'https://example.com/jobs/product-designer',
    description: 'Design application flows for a job tracking workspace.',
    company: 'Northwind',
    status: JobStatus.JOB_OFFERED,
  },
  {
    position: 'Engineering Manager',
    link: 'https://example.com/jobs/engineering-manager',
    description:
      'Lead a platform team focused on developer tooling and velocity.',
    company: 'Umbrella Tech',
    status: JobStatus.APPLIED,
  },
  {
    position: 'DevOps Engineer',
    link: 'https://example.com/jobs/devops-engineer',
    description:
      'Improve CI/CD and containerized local development for the team.',
    company: 'Stark Systems',
    status: JobStatus.SAVED,
  },
  {
    position: 'QA Automation Engineer',
    link: 'https://example.com/jobs/qa-automation-engineer',
    description:
      'Expand Jest and Playwright coverage across the hiring workflow.',
    company: 'Wayne Enterprises',
    status: JobStatus.INTERVIEW,
  },
  {
    position: 'Data Analyst',
    link: 'https://example.com/jobs/data-analyst',
    description: 'Turn recruiting funnel metrics into actionable insights.',
    company: 'Soylent Analytics',
    status: JobStatus.SAVED,
  },
  {
    position: 'Technical Recruiter',
    link: 'https://example.com/jobs/technical-recruiter',
    description:
      'Partner with engineering leaders to source senior candidates.',
    company: 'Hooli Talent',
    status: JobStatus.APPLIED,
  },
  {
    position: 'Platform Engineer',
    link: 'https://example.com/jobs/platform-engineer',
    description: 'Standardize shared tooling and libraries in an Nx monorepo.',
    company: 'Massive Dynamic',
    status: JobStatus.JOB_OFFERED,
  },
  {
    position: 'Junior React Developer',
    link: 'https://example.com/jobs/junior-react-developer',
    description: 'Help build internal dashboards.',
    company: 'Initrode',
    status: JobStatus.REJECTED,
  },
];

async function main() {
  const prisma = new PrismaService();

  await prisma.$connect();

  for (const job of seedJobs) {
    await prisma.job.upsert({
      where: { link: job.link },
      update: {
        position: job.position,
        description: job.description,
        company: job.company,
        status: job.status,
      },
      create: job,
    });
  }

  await prisma.$disconnect();

  console.log(`Seeded ${seedJobs.length} jobs.`);
}

main().catch(async (error) => {
  console.error('Failed to seed jobs.', error);
  process.exitCode = 1;
});
