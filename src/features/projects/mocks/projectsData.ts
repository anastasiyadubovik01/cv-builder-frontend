import type { Project } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Blog',
    domain: 'Content Management & Publishing',
    startDate: '12/31/2025',
    endDate: '05/31/2026',
    description:
      'A dynamic blogging website that provides users with a platform to create, publish and share written content. The application has a modern interface that allows users to easily write and organize their articles by categories or tags. Readers can participate in discussions through comments and share articles on social media. The site is responsive, making it easy to read on all devices, and offers customizable themes for personalization.',
    environmentSkills: [
      'HTML5',
      'CSS3',
      'TypeScript',
      'React',
      'Zustand',
      'Firebase',
    ],
  },
  {
    id: '2',
    name: 'Cloud Sales Management',
    domain: 'CRM & Sales Management',
    startDate: '4/15/2025',
    endDate: '12/31/2025',
    description:
      "This system offer numerous benefits for businesses looking to streamline operations and improve customer interactions. System can centralize customer data, providing a comprehensive view of each client's journey, preferences, and history with the company.",
    environmentSkills: ['TypeScript', 'React', 'MobX'],
  },
];
