import { gql, type TypedDocumentNode } from '@apollo/client';

export type ApiCv = {
  id: string;
  created_at: string;
  name: string;
  education?: string | null;
  description: string;
  user?: {
    id: string;
    email: string;
  } | null;
};

export type SearchPaginationInput = {
  search?: string;
  sort_order?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
};

export type CvsData = {
  cvs: {
    items: ApiCv[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

type CvsVariables = {
  params?: SearchPaginationInput;
};

export const CVS_QUERY: TypedDocumentNode<CvsData, CvsVariables> = gql`
  query Cvs($params: SearchPaginationInput) {
    cvs(params: $params) {
      items {
        id
        created_at
        name
        education
        description
        user {
          id
          email
        }
      }
      total
      page
      limit
      total_pages
    }
  }
`;

type CvData = {
  cv: ApiCv;
};

type CvVariables = {
  cvId: string;
};

export const CV_QUERY: TypedDocumentNode<CvData, CvVariables> = gql`
  query Cv($cvId: ID!) {
    cv(cvId: $cvId) {
      id
      created_at
      name
      education
      description
      user {
        id
        email
      }
    }
  }
`;

export type CvsByUserIdData = {
  cvsByUserId: {
    items: ApiCv[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

type CvsByUserIdVariables = {
  userId: string;
  params?: SearchPaginationInput;
};

export const CVS_BY_USER_ID_QUERY: TypedDocumentNode<
  CvsByUserIdData,
  CvsByUserIdVariables
> = gql`
  query CvsByUserId($userId: ID!, $params: SearchPaginationInput) {
    cvsByUserId(userId: $userId, params: $params) {
      items {
        id
        created_at
        name
        education
        description
        user {
          id
          email
        }
      }
      total
      page
      limit
      total_pages
    }
  }
`;

export type CreateCvInput = {
  name: string;
  education?: string;
  description: string;
  userId?: string;
};

type CreateCvData = {
  createCv: ApiCv;
};

type CreateCvVariables = {
  cv: CreateCvInput;
};

export const CREATE_CV_MUTATION: TypedDocumentNode<
  CreateCvData,
  CreateCvVariables
> = gql`
  mutation CreateCv($cv: CreateCvInput!) {
    createCv(cv: $cv) {
      id
      created_at
      name
      education
      description
      user {
        id
        email
      }
    }
  }
`;

export const UPDATE_CV_MUTATION = gql`
  mutation UpdateCv($cv: UpdateCvInput!) {
    updateCv(cv: $cv) {
      id
      name
      education
      description
    }
  }
`;

export const DELETE_CV_MUTATION = gql`
  mutation DeleteCv($cv: DeleteCvInput!) {
    deleteCv(cv: $cv) {
      affected
    }
  }
`;
