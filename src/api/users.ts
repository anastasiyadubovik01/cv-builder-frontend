import { gql, type TypedDocumentNode } from '@apollo/client';

export type ApiUser = {
  id: string;
  email: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  };
  department: {
    name: string;
  } | null;
  position: {
    name: string;
  } | null;
};

type UsersData = {
  users: {
    items: ApiUser[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

type UsersVariables = {
  params?: {
    search?: string;
    sort_order?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  };
};

export const USERS_QUERY: TypedDocumentNode<UsersData, UsersVariables> = gql`
  query Users($params: SearchPaginationInput) {
    users(params: $params) {
      items {
        id
        email
        profile {
          first_name
          last_name
          avatar
        }
        department {
          name
        }
        position {
          name
        }
      }
      total
      page
      limit
      total_pages
    }
  }
`;
