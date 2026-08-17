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

export type ApiUserDetails = {
  id: string;
  created_at: number;
  email: string;
  is_verified: boolean;
  role: string;
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    avatar: string | null;
  };
  department: {
    id: string;
    name: string;
  } | null;
  position: {
    id: string;
    name: string;
  } | null;
};

type UserData = {
  user: ApiUserDetails;
};

type UserVariables = {
  userId: string;
};

type CatalogItem = {
  id: string;
  name: string;
};

type CatalogVariables = {
  params?: {
    search?: string;
    sort_order?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  };
};

type DepartmentsData = {
  departments: {
    items: CatalogItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

export const DEPARTMENTS_QUERY: TypedDocumentNode<
  DepartmentsData,
  CatalogVariables
> = gql`
  query Departments($params: SearchPaginationInput) {
    departments(params: $params) {
      items {
        id
        name
      }
      total
      page
      limit
      total_pages
    }
  }
`;

type PositionsData = {
  positions: {
    items: CatalogItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

export const POSITIONS_QUERY: TypedDocumentNode<
  PositionsData,
  CatalogVariables
> = gql`
  query Positions($params: SearchPaginationInput) {
    positions(params: $params) {
      items {
        id
        name
      }
      total
      page
      limit
      total_pages
    }
  }
`;

export const USER_QUERY: TypedDocumentNode<UserData, UserVariables> = gql`
  query User($userId: ID!) {
    user(userId: $userId) {
      id
      created_at
      email
      is_verified
      role
      profile {
        id
        first_name
        last_name
        full_name
        avatar
      }
      department {
        id
        name
      }
      position {
        id
        name
      }
    }
  }
`;

type UpdateProfileData = {
  updateProfile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
  };
};

type UpdateProfileVariables = {
  profile: {
    userId: string;
    first_name?: string;
    last_name?: string;
  };
};

export const UPDATE_PROFILE_MUTATION: TypedDocumentNode<
  UpdateProfileData,
  UpdateProfileVariables
> = gql`
  mutation UpdateProfile($profile: UpdateProfileInput!) {
    updateProfile(profile: $profile) {
      id
      first_name
      last_name
      full_name
    }
  }
`;

type UpdateUserData = {
  updateUser: {
    id: string;
    role: string;
    department: {
      id: string;
      name: string;
    } | null;
    position: {
      id: string;
      name: string;
    } | null;
  };
};

type UpdateUserVariables = {
  user: {
    userId: string;
    departmentId: string;
    positionId: string;
    role: string;
  };
};

export const UPDATE_USER_MUTATION: TypedDocumentNode<
  UpdateUserData,
  UpdateUserVariables
> = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      id
      role
      department {
        id
        name
      }
      position {
        id
        name
      }
    }
  }
`;

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
