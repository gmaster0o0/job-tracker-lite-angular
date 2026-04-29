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
  },
  {
    position: 'Backend Engineer',
    link: 'https://example.com/jobs/backend-engineer',
    description: 'Own Node and Nest services that power recruiting automation.',
    company: 'Globex',
  },
  {
    position: 'Full Stack Engineer',
    link: 'https://example.com/jobs/full-stack-engineer',
    description: 'Ship product features across Angular, Nest, and PostgreSQL.',
    company: 'Initech',
  },
  {
    position: 'Product Designer',
    link: 'https://example.com/jobs/product-designer',
    description: 'Design application flows for a job tracking workspace.',
    company: 'Northwind',
  },
  {
    position: 'Engineering Manager',
    link: 'https://example.com/jobs/engineering-manager',
    description:
      'Lead a platform team focused on developer tooling and velocity.',
    company: 'Umbrella Tech',
  },
  {
    position: 'DevOps Engineer',
    link: 'https://example.com/jobs/devops-engineer',
    description:
      'Improve CI/CD and containerized local development for the team.',
    company: 'Stark Systems',
  },
  {
    position: 'QA Automation Engineer',
    link: 'https://example.com/jobs/qa-automation-engineer',
    description:
      'Expand Jest and Playwright coverage across the hiring workflow.',
    company: 'Wayne Enterprises',
  },
  {
    position: 'Data Analyst',
    link: 'https://example.com/jobs/data-analyst',
    description: 'Turn recruiting funnel metrics into actionable insights.',
    company: 'Soylent Analytics',
  },
  {
    position: 'Technical Recruiter',
    link: 'https://example.com/jobs/technical-recruiter',
    description:
      'Partner with engineering leaders to source senior candidates.',
    company: 'Hooli Talent',
  },
  {
    position: 'Platform Engineer',
    link: 'https://example.com/jobs/platform-engineer',
    description: 'Standardize shared tooling and libraries in an Nx monorepo.',
    company: 'Massive Dynamic',
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
