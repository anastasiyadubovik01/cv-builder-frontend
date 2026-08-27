import { gql, type TypedDocumentNode } from '@apollo/client';

export type ApiDepartment = {
  id: string;
  created_at: string;
  name: string;
};

export type DepartmentsQueryData = {
  departments: {
    items: ApiDepartment[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

type DepartmentsQueryVariables = {
  params?: {
    search?: string;
    sort_order?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  };
};

export const DEPARTMENTS_QUERY: TypedDocumentNode<
  DepartmentsQueryData,
  DepartmentsQueryVariables
> = gql`
  query Departments($params: SearchPaginationInput) {
    departments(params: $params) {
      items {
        id
        created_at
        name
      }
      total
      page
      limit
      total_pages
    }
  }
`;

type CreateDepartmentMutationData = {
  createDepartment: ApiDepartment;
};

type CreateDepartmentMutationVariables = {
  department: {
    name: string;
  };
};

export const CREATE_DEPARTMENT_MUTATION: TypedDocumentNode<
  CreateDepartmentMutationData,
  CreateDepartmentMutationVariables
> = gql`
  mutation CreateDepartment($department: CreateDepartmentInput!) {
    createDepartment(department: $department) {
      id
      created_at
      name
    }
  }
`;

type UpdateDepartmentMutationData = {
  updateDepartment: ApiDepartment;
};

type UpdateDepartmentMutationVariables = {
  department: {
    departmentId: string;
    name: string;
  };
};

export const UPDATE_DEPARTMENT_MUTATION: TypedDocumentNode<
  UpdateDepartmentMutationData,
  UpdateDepartmentMutationVariables
> = gql`
  mutation UpdateDepartment($department: UpdateDepartmentInput!) {
    updateDepartment(department: $department) {
      id
      created_at
      name
    }
  }
`;

type DeleteDepartmentMutationData = {
  deleteDepartment: {
    affected: number;
  };
};

type DeleteDepartmentMutationVariables = {
  department: {
    departmentId: string;
  };
};

export const DELETE_DEPARTMENT_MUTATION: TypedDocumentNode<
  DeleteDepartmentMutationData,
  DeleteDepartmentMutationVariables
> = gql`
  mutation DeleteDepartment($department: DeleteDepartmentInput!) {
    deleteDepartment(department: $department) {
      affected
    }
  }
`;
