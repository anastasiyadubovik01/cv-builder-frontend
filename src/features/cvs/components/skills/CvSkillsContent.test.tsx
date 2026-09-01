import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiSkill, ProfileSkill } from '@/api/skills';
import type { Mastery } from '@/features/skills/types';
import { ContentLayout } from '@/components/common/ContentLayout';
import { useCvSkills } from '@/features/cvs/components/skills/hooks/useCvSkills';
import { AddCvSkillModal } from '@/features/cvs/components/skills/modals/AddCvSkillModal';
import { UpdateCvSkillModal } from '@/features/cvs/components/skills/modals/UpdateCvSkillModal';
import { RemoveCvSkillsModal } from '@/features/cvs/components/skills/modals/RemoveCvSkillsModal';

import { CvSkillsContent } from './CvSkillsContent';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/features/cvs/components/skills/hooks/useCvSkills', () => ({
  useCvSkills: vi.fn(),
}));

vi.mock('@/components/common/ContentLayout', () => ({
  ContentLayout: vi.fn(({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  )),
}));

vi.mock('@/features/skills/components/SkillMasteryProgress', () => ({
  SkillMasteryProgress: vi.fn(
    ({ mastery, selected }: { mastery: Mastery; selected: boolean }) => (
      <span data-testid={`mastery-${mastery}`}>
        {selected ? 'selected' : 'not-selected'}
      </span>
    ),
  ),
}));

vi.mock('@/features/cvs/components/skills/modals/AddCvSkillModal', () => ({
  AddCvSkillModal: vi.fn(({ trigger }: { trigger: ReactNode }) => (
    <div>{trigger}</div>
  )),
}));

vi.mock('@/features/cvs/components/skills/modals/UpdateCvSkillModal', () => ({
  UpdateCvSkillModal: vi.fn(
    ({
      skill,
      onOpenChange,
      onSuccess,
    }: {
      skill: ProfileSkill;
      onOpenChange: (open: boolean) => void;
      onSuccess: () => void | Promise<void>;
    }) => (
      <div>
        <span>Update skill: {skill.name}</span>

        <button type="button" onClick={() => onOpenChange(false)}>
          Close update
        </button>

        <button type="button" onClick={() => void onSuccess()}>
          Update success
        </button>
      </div>
    ),
  ),
}));

vi.mock('@/features/cvs/components/skills/modals/RemoveCvSkillsModal', () => ({
  RemoveCvSkillsModal: vi.fn(
    ({
      open,
      selectedSkills,
      onOpenChange,
      onSuccess,
    }: {
      open: boolean;
      selectedSkills: string[];
      onOpenChange: (open: boolean) => void;
      onSuccess: () => void | Promise<void>;
    }) =>
      open ? (
        <div>
          <span>Remove skills: {selectedSkills.join(', ')}</span>

          <button type="button" onClick={() => onOpenChange(false)}>
            Close remove
          </button>

          <button type="button" onClick={() => void onSuccess()}>
            Remove success
          </button>
        </div>
      ) : null,
  ),
}));

describe('CvSkillsContent', () => {
  const t = vi.fn();
  const handleRefresh = vi.fn();

  const reactSkill: ProfileSkill = {
    name: 'React',
    mastery: 'Advanced',
    categoryId: 'frontend',
  };

  const typeScriptSkill: ProfileSkill = {
    name: 'TypeScript',
    mastery: 'Proficient',
    categoryId: 'frontend',
  };

  const availableSkills: ApiSkill[] = [
    {
      id: 'skill-react',
      name: 'React',
      category: {
        id: 'frontend',
        name: 'Frontend',
        order: 1,
        parent: null,
      },
      category_name: 'Frontend',
      category_parent_name: null,
    },
    {
      id: 'skill-typescript',
      name: 'TypeScript',
      category: {
        id: 'frontend',
        name: 'Frontend',
        order: 1,
        parent: null,
      },
      category_name: 'Frontend',
      category_parent_name: null,
    },
    {
      id: 'skill-node',
      name: 'Node.js',
      category: {
        id: 'backend',
        name: 'Backend',
        order: 2,
        parent: null,
      },
      category_name: 'Backend',
      category_parent_name: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    handleRefresh.mockResolvedValue(undefined);

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation((key: string, value?: string | { count?: number }) => {
      if (key === 'skills.removeSelected') {
        return `Remove selected ${typeof value === 'object' ? value.count : 0}`;
      }

      return typeof value === 'string' ? value : key;
    });

    vi.mocked(useCvSkills).mockReturnValue({
      cvSkills: [reactSkill, typeScriptSkill],
      availableSkills,
      loading: false,
      error: false,
      handleRefresh,
    } as never);
  });

  it('loads skills for provided CV', () => {
    render(<CvSkillsContent cvId="cv-123" />);

    expect(useCvSkills).toHaveBeenCalledWith('cv-123');
  });

  it('passes loading and error state to content layout', () => {
    render(<CvSkillsContent cvId="cv-123" />);

    const props = vi.mocked(ContentLayout).mock.calls[0][0];

    expect(props.isLoading).toBe(false);
    expect(props.hasError).toBe(false);
    expect(props.errorMessage).toBe('Failed to load skills');
    expect(props.onRetry).toBe(handleRefresh);
  });

  it('groups CV skills by category', () => {
    render(<CvSkillsContent cvId="cv-123" />);

    expect(screen.getByText('Frontend')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /React/ })).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /TypeScript/ }),
    ).toBeInTheDocument();
  });

  it('renders empty state when CV has no skills', () => {
    vi.mocked(useCvSkills).mockReturnValue({
      cvSkills: [],
      availableSkills,
      loading: false,
      error: false,
      handleRefresh,
    } as never);

    render(<CvSkillsContent cvId="cv-123" />);

    expect(screen.getByText('No skills added yet')).toBeInTheDocument();
  });

  it('passes only skills not already added to add modal', () => {
    render(<CvSkillsContent cvId="cv-123" />);

    const props = vi.mocked(AddCvSkillModal).mock.calls[0][0];

    expect(props.cvId).toBe('cv-123');

    expect(props.skills).toEqual([availableSkills[2]]);

    expect(props.onSuccess).toBe(handleRefresh);
  });

  it('opens update modal after clicking skill in normal mode', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    expect(screen.getByText('Update skill: React')).toBeInTheDocument();

    const props = vi.mocked(UpdateCvSkillModal).mock.calls[0][0];

    expect(props.cvId).toBe('cv-123');
    expect(props.skill).toBe(reactSkill);
    expect(props.skills).toBe(availableSkills);
  });

  it('closes update modal when it is closed', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    expect(screen.getByText('Update skill: React')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Close update',
      }),
    );

    expect(screen.queryByText('Update skill: React')).not.toBeInTheDocument();
  });

  it('refreshes and closes update modal after successful update', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update success',
      }),
    );

    await waitFor(() => {
      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('Update skill: React')).not.toBeInTheDocument();
  });

  it('enters remove mode and selects skill', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Remove selected 0',
      }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Remove selected 1',
      }),
    ).toBeEnabled();

    expect(screen.getByTestId('mastery-Advanced')).toHaveTextContent(
      'selected',
    );
  });

  it('deselects skill when it is clicked twice in remove mode', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    );

    const reactButton = screen.getByRole('button', {
      name: /React/,
    });

    await user.click(reactButton);
    await user.click(reactButton);

    expect(
      screen.getByRole('button', {
        name: 'Remove selected 0',
      }),
    ).toBeDisabled();

    expect(screen.getByTestId('mastery-Advanced')).toHaveTextContent(
      'not-selected',
    );
  });

  it('cancels remove mode and clears selected skills', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('mastery-Advanced')).toHaveTextContent(
      'not-selected',
    );
  });

  it('opens remove modal with selected skills', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Remove selected 1',
      }),
    );

    expect(screen.getByText('Remove skills: React')).toBeInTheDocument();

    const props = vi.mocked(RemoveCvSkillsModal).mock.calls.at(-1)?.[0];

    expect(props?.cvId).toBe('cv-123');
    expect(props?.selectedSkills).toEqual(['React']);
    expect(props?.open).toBe(true);
  });

  it('closes remove modal when it is closed', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Remove selected 1',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Close remove',
      }),
    );

    expect(screen.queryByText('Remove skills: React')).not.toBeInTheDocument();
  });

  it('refreshes and exits remove mode after successful removal', async () => {
    const user = userEvent.setup();

    render(<CvSkillsContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: /React/,
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Remove selected 1',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Remove success',
      }),
    );

    await waitFor(() => {
      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole('button', {
        name: 'Remove Skill',
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('mastery-Advanced')).toHaveTextContent(
      'not-selected',
    );
  });
});
