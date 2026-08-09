import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import coverageLib from 'istanbul-lib-coverage';
import reportLib from 'istanbul-lib-report';
import reports from 'istanbul-reports';

const { createCoverageMap } = coverageLib;
const { createContext } = reportLib;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, '..', '..');
const coverageRoot = path.join(workspaceRoot, 'coverage');
const rawCoverageRoot = path.join(coverageRoot, 'raw');

const projectFiles = await findProjectFiles([
  path.join(workspaceRoot, 'apps'),
  path.join(workspaceRoot, 'libs'),
]);

const projects = [];
const mergedCoverage = createCoverageMap({});

for (const projectFile of projectFiles) {
  const project = await readProject(projectFile);

  if (!project) {
    continue;
  }

  const projectCoverage = await loadProjectCoverage(project);

  if (!projectCoverage) {
    continue;
  }

  mergedCoverage.merge(projectCoverage.rawCoverage);
  projects.push(projectCoverage);
}

const mergedSummary = mergedCoverage.getCoverageSummary().toJSON();

// Write the merged report straight into coverage/ so coverage/index.html
// *is* the native istanbul drill-down report (colored bars, filter, sort,
// per-directory pages) spanning every app and lib in one page tree -
// rather than a hand-rolled summary that just links out to it.
writeMergedReport(mergedCoverage);
await writeSummaryFiles(mergedSummary, projects);

console.log(`Unified coverage report written to ${path.relative(workspaceRoot, coverageRoot)}`);

async function findProjectFiles(directories) {
  const files = [];

  for (const directory of directories) {
    files.push(...(await walk(directory)));
  }

  return files.filter((file) => path.basename(file) === 'project.json');
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function readProject(projectFile) {
  const project = JSON.parse(await fs.readFile(projectFile, 'utf8'));
  const root = path
    .relative(workspaceRoot, path.dirname(projectFile))
    .replace(/\\/g, '/');

  if (!root || root === '.' || root.endsWith('-e2e')) {
    return null;
  }

  if (project.projectType !== 'application' && project.projectType !== 'library') {
    return null;
  }

  return {
    name: project.name ?? path.basename(root),
    root,
    projectType: project.projectType,
    coverageDirAbsolute: await resolveCoverageDir(project.name ?? path.basename(root), root),
  };
}

async function resolveCoverageDir(projectName, projectRoot) {
  const candidates = [
    path.join(rawCoverageRoot, projectRoot),
    path.join(rawCoverageRoot, projectName),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(path.join(candidate, 'coverage-final.json'));
      return candidate;
    } catch {
      // Try the next known coverage layout.
    }
  }

  return null;
}

async function loadProjectCoverage(project) {
  if (!project.coverageDirAbsolute) {
    return null;
  }

  const finalCoveragePath = path.join(
    project.coverageDirAbsolute,
    'coverage-final.json',
  );
  const rawCoverage = JSON.parse(await fs.readFile(finalCoveragePath, 'utf8'));
  const coverageMap = createCoverageMap(rawCoverage);
  const summary = coverageMap.getCoverageSummary().toJSON();

  return {
    ...project,
    coverageDir: toPosixPath(
      path.relative(workspaceRoot, project.coverageDirAbsolute),
    ),
    summary,
    rawCoverage,
  };
}

function writeMergedReport(coverageMap) {
  const context = createContext({
    dir: coverageRoot,
    coverageMap,
  });

  reports.create('html').execute(context);
  reports.create('text-summary').execute(context);
}

async function writeSummaryFiles(mergedSummary, projectSummaries) {
  const sortedProjects = [...projectSummaries].sort((a, b) =>
    a.root.localeCompare(b.root),
  );
  const apps = sortedProjects.filter((project) =>
    project.root.startsWith('apps/'),
  );
  const libs = sortedProjects.filter((project) =>
    project.root.startsWith('libs/'),
  );

  const summaryJson = {
    generatedAt: new Date().toISOString(),
    mergedSummary,
    projects: sortedProjects.map(({ rawCoverage, coverageDirAbsolute, ...project }) => project),
  };

  await fs.writeFile(
    path.join(coverageRoot, 'summary.json'),
    JSON.stringify(summaryJson, null, 2),
  );

  await fs.writeFile(
    path.join(coverageRoot, 'summary.md'),
    renderMarkdownSummary(mergedSummary, apps, libs),
  );
}

function renderMarkdownSummary(mergedSummary, apps, libs) {
  return `# Unified coverage report

Full drill-down report: [coverage/index.html](./index.html)

| scope | statements | branches | functions | lines |
| --- | ---: | ---: | ---: | ---: |
| repo | ${pct(mergedSummary.statements)} | ${pct(mergedSummary.branches)} | ${pct(mergedSummary.functions)} | ${pct(mergedSummary.lines)} |

## Apps

${renderMarkdownProjectList(apps)}

## Libs

${renderMarkdownProjectList(libs)}
`;
}

function renderMarkdownProjectList(projects) {
  if (projects.length === 0) {
    return '_No coverage reports found._\n';
  }

  return [
    '| project | statements | branches | functions | lines |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...projects.map(
      (project) =>
        `| ${project.root} | ${pct(project.summary.statements)} | ${pct(project.summary.branches)} | ${pct(project.summary.functions)} | ${pct(project.summary.lines)} |`,
    ),
    '',
  ].join('\n');
}

function pct(summary) {
  return typeof summary.pct === 'number'
    ? `${summary.pct.toFixed(2)}%`
    : 'n/a';
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
