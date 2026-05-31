export const homeLandingFixtures = {
  hero: {
    title: 'Track every job application in one place',
    subtitle:
      'A free, bilingual workspace for job seekers. Track status, notes, and recruiter contacts in one place.',
    registerCtaHref: '/auth/register',
    loginCtaHref: '/auth/login',
    featureCardCount: 4,
  },
  publicProfiles: {
    title: 'Public profiles',
    subtitle:
      'Create a shareable profile with your LinkedIn, GitHub, and downloadable CV.',
    profiles: [
      {
        name: 'Kovacs Janos',
        linkedInUrl: 'https://linkedin.com/in/kovacsj',
        githubUrl: 'https://github.com/kovacsj',
      },
      {
        name: 'Szabo Anna',
        linkedInUrl: 'https://linkedin.com/in/szaboanna',
        githubUrl: 'https://github.com/szaboanna',
      },
      {
        name: 'Nagy Peter',
        linkedInUrl: 'https://linkedin.com/in/nagypeter',
        githubUrl: 'https://github.com/nagypeter',
      },
    ],
  },
};
