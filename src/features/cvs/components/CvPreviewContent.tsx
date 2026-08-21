'use client';

import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { CV_PREVIEW_QUERY } from '@/api/cv-preview';
import { SKILLS_QUERY } from '@/api/skills';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useExportCvPdf } from '@/features/cvs/hooks/useExportCvPdf';
import {
  calculateSkillsCategoryMetrics,
  CategoryMetric,
} from '@/features/cvs/utils/calculateSkillsCategoryMetrics';
import { formatPeriodDate } from '@/lib/helpers/date';

type CvPreviewContentProps = {
  cvId: string;
};

const NO_DATA_CHAR = '-';
const DEFAULT_FILENAME = 'cv-preview';

export function CvPreviewContent({ cvId }: CvPreviewContentProps) {
  const { t } = useTranslation();

  const {
    data: cvData,
    loading: cvLoading,
    error: cvError,
    refetch,
  } = useQuery(CV_PREVIEW_QUERY, {
    variables: { cvId },
    fetchPolicy: 'cache-and-network',
  });

  const { data: skillsData } = useQuery(SKILLS_QUERY, {
    variables: { params: { page: 1, limit: 100 } },
  });

  const cv = cvData?.cv;
  const user = cv?.user;
  const profile = user?.profile;

  const {
    containerRef,
    handleExport,
    loading: exportLoading,
  } = useExportCvPdf(cv?.name ?? DEFAULT_FILENAME);

  if (cvLoading) return <LoadingOverlay />;

  if (cvError || !cv) {
    return (
      <div className="flex flex-col items-center gap-4 pt-10">
        <p className="text-sm text-destructive">
          {t('cvs.preview.loadError', 'Failed to load CV preview')}
        </p>
        <Button variant="secondary" onClick={() => void refetch()}>
          {t('retry', 'RETRY')}
        </Button>
      </div>
    );
  }

  const fullName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    NO_DATA_CHAR;

  const positionName = user?.position?.name ?? NO_DATA_CHAR;

  const uniqueDomains = Array.from(
    new Set(cv.projects.map((p) => p.domain).filter(Boolean)),
  );

  const availableSkills = skillsData?.skills.items ?? [];

  const skillsByCategory = cv.skills.reduce<Record<string, string[]>>(
    (acc, cvSkill) => {
      const foundSkill = availableSkills.find((s) => s.name === cvSkill.name);
      const categoryName =
        foundSkill?.category.name ?? t('skills.uncategorized', 'Other');

      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(cvSkill.name);
      return acc;
    },
    {},
  );

  const categoryMetrics: CategoryMetric[] = Object.entries(skillsByCategory)
    .map(([categoryName, skills]) =>
      calculateSkillsCategoryMetrics(categoryName, skills, cv.projects),
    )
    .filter((metric): metric is CategoryMetric => metric !== null);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-[900px] px-6 pt-8 pb-3 text-foreground"
    >
      <header className="mb-8 flex justify-between items-baseline">
        <div>
          <h1 className="text-[34px] tracking-tight">{fullName}</h1>
          <p className="text-[16px] uppercase leading-[1.5] tracking-[0.01em]">
            {positionName}
          </p>
        </div>

        <Button
          variant="primaryV2"
          onClick={handleExport}
          disabled={exportLoading}
          className="no-print w-[160px] h-[40px]"
        >
          {t('cvs.preview.exportPdf', 'Export PDF')}
        </Button>
      </header>

      <div>
        <div className="grid grid-cols-12 gap-8 text-[16px] mb-[51px]">
          <div className="space-y-4 col-span-4 py-4">
            {cv.education && (
              <div>
                <h3 className="font-bold">
                  {t('cvs.preview.education', 'Education')}
                </h3>
                <p className="mt-2">{cv.education}</p>
              </div>
            )}

            {profile?.languages && profile.languages.length > 0 && (
              <div>
                <h3 className="font-bold">
                  {t('cvs.preview.languageProficiency', 'Language proficiency')}
                </h3>
                {profile.languages.map((lang) => (
                  <p key={lang.name} className="mt-2">
                    {lang.name} — {lang.proficiency}
                  </p>
                ))}
              </div>
            )}

            {uniqueDomains.length > 0 && (
              <div>
                <h3 className="font-bold">
                  {t('cvs.preview.domains', 'Domains')}
                </h3>
                <p className="mt-2">{uniqueDomains.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="border-l border-primary pl-[25px] space-y-4.5 col-span-8 pt-4">
            <div>
              <h2 className="font-bold">{cv.name}</h2>
              <p className="mt-[10px] leading-relaxed whitespace-pre-line">
                {cv.description}
              </p>
            </div>

            {categoryMetrics.map((cat) => (
              <div key={cat.categoryName}>
                <h3 className="font-bold">{cat.categoryName}</h3>
                <p className="mt-[10px]">{cat.skills.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        {cv.projects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[34px] tracking-tight mb-[33px]">
              {t('cvs.preview.projects', 'Projects')}
            </h2>
            {cv.projects.map((project) => {
              const startFormatted = formatPeriodDate(project.start_date);
              const endFormatted = project.end_date
                ? formatPeriodDate(project.end_date)
                : t('projects.present', 'Present');

              return (
                <div
                  key={project.id}
                  className="grid grid-cols-12 gap-8 text-[16px] mb-[51px]"
                >
                  <div className="space-y-4 col-span-4 py-4">
                    <div>
                      <h3 className="font-bold uppercase text-primary">
                        {project.name}
                      </h3>
                      <p className="mt-[10px]">{project.description}</p>
                    </div>
                  </div>

                  <div className="border-l border-primary pl-[25px] space-y-4.5 col-span-8 pt-4">
                    {project.roles.length > 0 && (
                      <div>
                        <h2 className="font-bold">
                          {t('cvs.preview.projectRoles', 'Project roles')}
                        </h2>
                        <p className="mt-[10px] leading-relaxed">
                          {project.roles.join(', ')}
                        </p>
                      </div>
                    )}

                    <div>
                      <h2 className="font-bold">
                        {t('cvs.preview.period', 'Period')}
                      </h2>
                      <p className="mt-[10px] leading-relaxed">
                        {startFormatted} - {endFormatted}
                      </p>
                    </div>

                    {project.responsibilities &&
                      project.responsibilities.length > 0 && (
                        <div>
                          <h2 className="font-bold">
                            {t(
                              'cvs.preview.responsibilities',
                              'Responsibilities',
                            )}
                          </h2>
                          <ul className="mt-[10px] list-disc pl-5 leading-relaxed marker:text-[12px]">
                            {project.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {project.environment && project.environment.length > 0 && (
                      <div>
                        <h2 className="font-bold">
                          {t('cvs.preview.environment', 'Environment')}
                        </h2>
                        <p className="mt-[10px] leading-relaxed">
                          {project.environment.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {categoryMetrics.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[34px] tracking-tight mb-[33px]">
              {t('cvs.preview.professionalSkills', 'Professional skills')}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-primary uppercase align-sub">
                    <th className="pt-2.5 pb-8 pl-4 w-1/3 font-medium">
                      {t('cvs.preview.table.skills', 'Skills')}
                    </th>
                    <th className="pt-2.5 pb-8 w-1/3 font-medium"></th>
                    <th className="pt-2.5 text-center w-[114px] font-medium">
                      {t(
                        'cvs.preview.table.experienceInYears',
                        'Experience in years',
                      )}
                    </th>
                    <th className="pt-2.5 pb-8 text-center font-medium">
                      {t('cvs.preview.table.lastUsed', 'Last used')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {categoryMetrics.map((cat) => (
                    <tr key={cat.categoryName} className="align-sub">
                      <td className="pt-2.5 pb-7 pl-4 text-primary">
                        {cat.categoryName}
                      </td>
                      <td className="pt-2.5 pb-7">
                        <div className="flex flex-col items-start gap-5">
                          {cat.skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </td>
                      <td className="pt-2.5 pb-7 text-center font-normal">
                        <span>{cat.experienceYears}</span>
                      </td>
                      <td className="pt-2.5 pb-7 text-center font-normal">
                        <span>{cat.lastUsed}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
