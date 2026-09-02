import { describe, expect, it } from 'vitest';

import { createCvProjectSchema } from './cv-project';

describe('createCvProjectSchema', () => {
  const validData = {
    projectId: 'project-1',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    roles: 'Frontend Developer',
    responsibilities: 'Development',
    domain: 'Healthcare',
    description: 'Project description',
    environment: 'React, TypeScript',
    projectStartDate: '2024-01-01',
    projectEndDate: '2024-12-31',
  };

  const hasIssue = (
    result: ReturnType<typeof createCvProjectSchema.safeParse>,
    path: string,
    message: string,
  ) => {
    if (result.success) return false;

    return result.error.issues.some(
      (issue) => issue.path.includes(path) && issue.message === message,
    );
  };

  it('accepts valid CV project data', () => {
    const result = createCvProjectSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('trims string values', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      projectId: '  project-1  ',
      startDate: '  2024-02-01  ',
      roles: '  Frontend Developer  ',
      description: '  Description  ',
    });

    expect(result.success).toBe(true);

    if (!result.success) return;

    expect(result.data.projectId).toBe('project-1');
    expect(result.data.startDate).toBe('2024-02-01');
    expect(result.data.roles).toBe('Frontend Developer');
    expect(result.data.description).toBe('Description');
  });

  it('requires project id', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      projectId: '   ',
    });

    expect(
      hasIssue(result, 'projectId', 'projects.validation.projectRequired'),
    ).toBe(true);
  });

  it('requires start date', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      startDate: '   ',
    });

    expect(
      hasIssue(result, 'startDate', 'projects.validation.startDateRequired'),
    ).toBe(true);
  });

  it('requires roles', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      roles: '   ',
    });

    expect(hasIssue(result, 'roles', 'projects.validation.rolesRequired')).toBe(
      true,
    );
  });

  it('allows optional fields to be omitted', () => {
    const result = createCvProjectSchema.safeParse({
      projectId: 'project-1',
      startDate: '2024-02-01',
      roles: 'Developer',
    });

    expect(result.success).toBe(true);
  });

  it('allows empty end date for active project', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      endDate: '',
      projectEndDate: '',
    });

    expect(result.success).toBe(true);
  });

  it('requires end date when project is finished', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      endDate: '',
      projectEndDate: '2024-12-31',
    });

    expect(
      hasIssue(
        result,
        'endDate',
        'projects.validation.endDateRequiredForFinishedProject',
      ),
    ).toBe(true);
  });

  it('does not allow end date before start date', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      startDate: '2024-10-01',
      endDate: '2024-05-01',
    });

    expect(
      hasIssue(result, 'endDate', 'projects.validation.endDateMustBeLater'),
    ).toBe(true);
  });

  it('allows end date equal to start date', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      startDate: '2024-05-01',
      endDate: '2024-05-01',
    });

    expect(result.success).toBe(true);
  });

  it('does not allow start date before project start date', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      startDate: '2023-12-31',
      projectStartDate: '2024-01-01',
    });

    expect(
      hasIssue(
        result,
        'startDate',
        'projects.validation.startDateWithinProject',
      ),
    ).toBe(true);
  });

  it('does not allow start date after project end date', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      projectEndDate: '2024-12-31',
    });

    expect(
      hasIssue(
        result,
        'startDate',
        'projects.validation.startDateWithinProject',
      ),
    ).toBe(true);
  });

  it('does not allow end date after project end date', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      endDate: '2025-01-01',
      projectEndDate: '2024-12-31',
    });

    expect(
      hasIssue(result, 'endDate', 'projects.validation.endDateWithinProject'),
    ).toBe(true);
  });

  it('does not allow end date before project start date', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      startDate: '2023-11-01',
      endDate: '2023-12-01',
      projectStartDate: '2024-01-01',
    });

    expect(
      hasIssue(result, 'endDate', 'projects.validation.endDateWithinProject'),
    ).toBe(true);
  });

  it('allows dates equal to project boundaries', () => {
    const result = createCvProjectSchema.safeParse({
      ...validData,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      projectStartDate: '2024-01-01',
      projectEndDate: '2024-12-31',
    });

    expect(result.success).toBe(true);
  });
});
