import { parseDate } from '@/lib/helpers/date';

type Project = {
  start_date: string;
  end_date?: string | null;
  environment: string[];
};

export type CategoryMetric = {
  categoryName: string;
  skills: string[];
  experienceYears: number;
  lastUsed: string;
};

export function calculateSkillsCategoryMetrics(
  categoryName: string,
  categorySkills: string[],
  cvProjects: Project[],
): CategoryMetric | null {
  const currentYear = new Date().getFullYear();

  const normalizedCategorySkills = categorySkills.map((s) =>
    s.trim().toLowerCase(),
  );

  const matchingProjects = cvProjects.filter((project) =>
    project.environment.some((envItem) =>
      normalizedCategorySkills.includes(envItem.trim().toLowerCase()),
    ),
  );

  if (matchingProjects.length === 0) {
    return null;
  }

  let earliestDate: Date | null = null;

  matchingProjects.forEach((proj) => {
    const parsedStart = parseDate(proj.start_date);
    if (parsedStart) {
      if (!earliestDate || parsedStart < earliestDate) {
        earliestDate = parsedStart;
      }
    }
  });

  let experienceYears = 0;
  if (earliestDate) {
    const now = new Date();
    let years = now.getFullYear() - (earliestDate as Date).getFullYear();
    const monthDiff = now.getMonth() - (earliestDate as Date).getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < (earliestDate as Date).getDate())
    ) {
      years--;
    }
    experienceYears = Math.max(0, years);
  }

  const hasActiveProject = matchingProjects.some(
    (proj) =>
      !proj.end_date || proj.end_date.trim().toLowerCase() === 'present',
  );

  if (hasActiveProject) {
    return {
      categoryName,
      skills: categorySkills,
      experienceYears,
      lastUsed: String(currentYear),
    };
  }

  let maxEndYear = 0;
  matchingProjects.forEach((proj) => {
    if (proj.end_date) {
      const parsedEnd = parseDate(proj.end_date);
      if (parsedEnd) {
        const year = parsedEnd.getFullYear();
        if (year > maxEndYear) {
          maxEndYear = year;
        }
      }
    }
  });

  return {
    categoryName,
    skills: categorySkills,
    experienceYears,
    lastUsed: maxEndYear > 0 ? String(maxEndYear) : String(currentYear),
  };
}
