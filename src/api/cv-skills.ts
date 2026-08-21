import { gql, type TypedDocumentNode } from '@apollo/client';
import type { ProfileSkill } from '@/api/skills';

export type CvSkillsData = {
  cv: {
    id: string;
    skills: ProfileSkill[];
    user?: {
      id: string;
    } | null;
  };
};

export type CvSkillsVariables = {
  cvId: string;
};

export const CV_SKILLS_QUERY: TypedDocumentNode<
  CvSkillsData,
  CvSkillsVariables
> = gql`
  query CvSkills($cvId: ID!) {
    cv(cvId: $cvId) {
      id
      skills {
        name
        categoryId
        mastery
      }
      user {
        id
      }
    }
  }
`;

export type AddCvSkillInput = {
  cvId: string;
  name: string;
  categoryId?: string | null;
  mastery: string;
};

export const ADD_CV_SKILL_MUTATION = gql`
  mutation AddCvSkill($skill: AddCvSkillInput!) {
    addCvSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export type UpdateCvSkillInput = {
  cvId: string;
  name: string;
  categoryId?: string | null;
  mastery: string;
};

export const UPDATE_CV_SKILL_MUTATION = gql`
  mutation UpdateCvSkill($skill: UpdateCvSkillInput!) {
    updateCvSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export type DeleteCvSkillInput = {
  cvId: string;
  name: string[];
};

export const DELETE_CV_SKILL_MUTATION = gql`
  mutation DeleteCvSkill($skill: DeleteCvSkillInput!) {
    deleteCvSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;
