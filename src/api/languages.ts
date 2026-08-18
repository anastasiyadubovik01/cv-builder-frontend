import { gql, type TypedDocumentNode } from '@apollo/client';

import type { Proficiency } from '@/features/languages/types';

export type ApiLanguage = {
  id: string;
  created_at: string;
  iso2: string;
  name: string;
  native_name: string | null;
};

export type ProfileLanguage = {
  name: string;
  proficiency: Proficiency;
};

type LanguagesQueryData = {
  languages: {
    items: ApiLanguage[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

type LanguagesQueryVariables = {
  params?: {
    search?: string;
    sort_order?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  };
};

export const LANGUAGES_QUERY: TypedDocumentNode<
  LanguagesQueryData,
  LanguagesQueryVariables
> = gql`
  query Languages($params: SearchPaginationInput) {
    languages(params: $params) {
      items {
        id
        created_at
        iso2
        name
        native_name
      }
      total
      page
      limit
      total_pages
    }
  }
`;

type UserLanguagesQueryData = {
  user: {
    profile: {
      languages: ProfileLanguage[];
    };
  };
};

type UserLanguagesQueryVariables = {
  userId: string;
};

export const USER_LANGUAGES_QUERY: TypedDocumentNode<
  UserLanguagesQueryData,
  UserLanguagesQueryVariables
> = gql`
  query UserLanguages($userId: ID!) {
    user(userId: $userId) {
      profile {
        languages {
          name
          proficiency
        }
      }
    }
  }
`;

type AddProfileLanguageMutationData = {
  addProfileLanguage: {
    languages: ProfileLanguage[];
  };
};

type AddProfileLanguageMutationVariables = {
  language: {
    userId: string;
    name: string;
    proficiency: Proficiency;
  };
};

export const ADD_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  AddProfileLanguageMutationData,
  AddProfileLanguageMutationVariables
> = gql`
  mutation AddProfileLanguage($language: AddProfileLanguageInput!) {
    addProfileLanguage(language: $language) {
      languages {
        name
        proficiency
      }
    }
  }
`;

type UpdateProfileLanguageMutationData = {
  updateProfileLanguage: {
    languages: ProfileLanguage[];
  };
};

type UpdateProfileLanguageMutationVariables = {
  language: {
    userId: string;
    name: string;
    proficiency: Proficiency;
  };
};

export const UPDATE_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  UpdateProfileLanguageMutationData,
  UpdateProfileLanguageMutationVariables
> = gql`
  mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {
    updateProfileLanguage(language: $language) {
      languages {
        name
        proficiency
      }
    }
  }
`;

type DeleteProfileLanguageMutationData = {
  deleteProfileLanguage: {
    languages: ProfileLanguage[];
  };
};

type DeleteProfileLanguageMutationVariables = {
  language: {
    userId: string;
    name: string[];
  };
};

export const DELETE_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  DeleteProfileLanguageMutationData,
  DeleteProfileLanguageMutationVariables
> = gql`
  mutation DeleteProfileLanguage($language: DeleteProfileLanguageInput!) {
    deleteProfileLanguage(language: $language) {
      languages {
        name
        proficiency
      }
    }
  }
`;
