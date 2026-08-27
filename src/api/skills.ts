import { gql, type TypedDocumentNode } from '@apollo/client';

import type { Mastery } from '@/features/skills/types';

export type SkillCategory = {
  id: string;
  name: string;
  order: number;
  parent: {
    id: string;
    name: string;
  } | null;
};

export type ApiSkill = {
  id: string;
  name: string;
  category: SkillCategory;
  category_name: string | null;
  category_parent_name: string | null;
};

export type ProfileSkill = {
  name: string;
  categoryId: string | null;
  mastery: Mastery;
};

export type SkillsData = {
  skills: {
    items: ApiSkill[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

type SkillsVariables = {
  params?: {
    search?: string;
    sort_order?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  };
};

export const SKILLS_QUERY: TypedDocumentNode<SkillsData, SkillsVariables> = gql`
  query Skills($params: SearchPaginationInput) {
    skills(params: $params) {
      items {
        id
        name
        category {
          id
          name
          order
          parent {
            id
            name
          }
        }
        category_name
        category_parent_name
      }
      total
      page
      limit
      total_pages
    }
  }
`;

type UserSkillsData = {
  user: {
    id: string;
    profile: {
      id: string;
      skills: ProfileSkill[];
    };
  };
};

type UserSkillsVariables = {
  userId: string;
};

export const USER_SKILLS_QUERY: TypedDocumentNode<
  UserSkillsData,
  UserSkillsVariables
> = gql`
  query UserSkills($userId: ID!) {
    user(userId: $userId) {
      id
      profile {
        id
        skills {
          name
          categoryId
          mastery
        }
      }
    }
  }
`;

type AddProfileSkillData = {
  addProfileSkill: {
    id: string;
    skills: ProfileSkill[];
  };
};

type AddProfileSkillVariables = {
  skill: {
    userId: string;
    name: string;
    categoryId?: string;
    mastery: Mastery;
  };
};

export const ADD_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  AddProfileSkillData,
  AddProfileSkillVariables
> = gql`
  mutation AddProfileSkill($skill: AddProfileSkillInput!) {
    addProfileSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

type UpdateProfileSkillData = {
  updateProfileSkill: {
    id: string;
    skills: ProfileSkill[];
  };
};

type UpdateProfileSkillVariables = {
  skill: {
    userId: string;
    name: string;
    categoryId?: string;
    mastery: Mastery;
  };
};

export const UPDATE_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  UpdateProfileSkillData,
  UpdateProfileSkillVariables
> = gql`
  mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {
    updateProfileSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

type DeleteProfileSkillData = {
  deleteProfileSkill: {
    id: string;
    skills: ProfileSkill[];
  };
};

type DeleteProfileSkillVariables = {
  skill: {
    userId: string;
    name: string[];
  };
};

export const DELETE_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  DeleteProfileSkillData,
  DeleteProfileSkillVariables
> = gql`
  mutation DeleteProfileSkill($skill: DeleteProfileSkillInput!) {
    deleteProfileSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export type AdminSkillCategory = {
  id: string;
  name: string;
  order: number;
  parent: {
    id: string;
    name: string;
  } | null;
  children: {
    id: string;
    name: string;
    order: number;
  }[];
};

type SkillCategoriesQueryData = {
  skillCategories: AdminSkillCategory[];
};

export const SKILL_CATEGORIES_QUERY: TypedDocumentNode<SkillCategoriesQueryData> = gql`
  query SkillCategories {
    skillCategories {
      id
      name
      order
      parent {
        id
        name
      }
      children {
        id
        name
        order
      }
    }
  }
`;

type CreateSkillMutationData = {
  createSkill: ApiSkill;
};

type CreateSkillMutationVariables = {
  skill: {
    name: string;
    categoryId: string;
  };
};

export const CREATE_SKILL_MUTATION: TypedDocumentNode<
  CreateSkillMutationData,
  CreateSkillMutationVariables
> = gql`
  mutation CreateSkill($skill: CreateSkillInput!) {
    createSkill(skill: $skill) {
      id
      name
      category_name
      category_parent_name
      category {
        id
        name
        order
        parent {
          id
          name
        }
      }
    }
  }
`;

type UpdateSkillMutationData = {
  updateSkill: ApiSkill;
};

type UpdateSkillMutationVariables = {
  skill: {
    skillId: string;
    name: string;
    categoryId: string;
  };
};

export const UPDATE_SKILL_MUTATION: TypedDocumentNode<
  UpdateSkillMutationData,
  UpdateSkillMutationVariables
> = gql`
  mutation UpdateSkill($skill: UpdateSkillInput!) {
    updateSkill(skill: $skill) {
      id
      name
      category_name
      category_parent_name
      category {
        id
        name
        order
        parent {
          id
          name
        }
      }
    }
  }
`;

type DeleteSkillMutationData = {
  deleteSkill: {
    affected: number;
  };
};

type DeleteSkillMutationVariables = {
  skill: {
    skillId: string;
  };
};

export const DELETE_SKILL_MUTATION: TypedDocumentNode<
  DeleteSkillMutationData,
  DeleteSkillMutationVariables
> = gql`
  mutation DeleteSkill($skill: DeleteSkillInput!) {
    deleteSkill(skill: $skill) {
      affected
    }
  }
`;
