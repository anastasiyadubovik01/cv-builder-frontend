import { describe, expect, it } from 'vitest';

import { createProjectSchema } from './project';

describe('createProjectSchema', () => {
  const validData = {
    name: 'CV Builder',
    domain: 'HR',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: 'CV management platform',
    environment: 'React, TypeScript',
  };

  const hasIssue = (
    result: ReturnType<typeof createProjectSchema.safeParse>,
    path: string,
    message: string,
  ) => {
    if (result.success) return false;

    return result.error.issues.some(
      (issue) => issue.path.includes(path) && issue.message === message,
    );
  };

  it('accepts valid project data', () => {
    const result = createProjectSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('trims string values', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      name: '  CV Builder  ',
      domain: '  HR  ',
      startDate: '  2024-01-01  ',
      endDate: '  2024-12-31  ',
      description: '  Project description  ',
    });

    expect(result.success).toBe(true);

    if (!result.success) return;

    expect(result.data.name).toBe('CV Builder');
    expect(result.data.domain).toBe('HR');
    expect(result.data.startDate).toBe('2024-01-01');
    expect(result.data.endDate).toBe('2024-12-31');
    expect(result.data.description).toBe('Project description');
  });

  it('requires project name', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      name: '   ',
    });

    expect(hasIssue(result, 'name', 'projects.errors.nameRequired')).toBe(true);
  });

  it('does not allow name longer than 100 characters', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      name: 'a'.repeat(101),
    });

    expect(hasIssue(result, 'name', 'projects.errors.nameMaxLength')).toBe(
      true,
    );
  });

  it('requires domain', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      domain: '   ',
    });

    expect(hasIssue(result, 'domain', 'projects.errors.domainRequired')).toBe(
      true,
    );
  });

  it('does not allow domain longer than 100 characters', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      domain: 'a'.repeat(101),
    });

    expect(hasIssue(result, 'domain', 'projects.errors.domainMaxLength')).toBe(
      true,
    );
  });

  it('requires start date', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      startDate: '   ',
    });

    expect(
      hasIssue(result, 'startDate', 'projects.errors.startDateRequired'),
    ).toBe(true);
  });

  it('requires description', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      description: '   ',
    });

    expect(
      hasIssue(result, 'description', 'projects.errors.descriptionRequired'),
    ).toBe(true);
  });

  it('does not allow description longer than 2000 characters', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      description: 'a'.repeat(2001),
    });

    expect(
      hasIssue(result, 'description', 'projects.errors.descriptionMaxLength'),
    ).toBe(true);
  });

  it('allows empty end date', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      endDate: '',
    });

    expect(result.success).toBe(true);
  });

  it('does not allow end date before start date', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      startDate: '2024-06-01',
      endDate: '2024-05-01',
    });

    expect(
      hasIssue(result, 'endDate', 'projects.errors.endDateMustBeLater'),
    ).toBe(true);
  });

  it('allows end date equal to start date', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      startDate: '2024-06-01',
      endDate: '2024-06-01',
    });

    expect(result.success).toBe(true);
  });

  it('allows empty environment', () => {
    const result = createProjectSchema.safeParse({
      ...validData,
      environment: '',
    });

    expect(result.success).toBe(true);
  });
});
