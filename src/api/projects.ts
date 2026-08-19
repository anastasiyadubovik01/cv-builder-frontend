import { gql, type TypedDocumentNode } from '@apollo/client';

export type ApiProject = {
  id: string;
  created_at: string;
  name: string;
  internal_name: string;
  domain: string;
  start_date: string;
  end_date?: string | null;
  description: string;
  environment: string[];
};

type ProjectsData = {
  projects: {
    items: ApiProject[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

type ProjectsVariables = {
  params?: {
    search?: string;
    sort_order?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  };
};

export const PROJECTS_QUERY: TypedDocumentNode<
  ProjectsData,
  ProjectsVariables
> = gql`
  query Projects($params: SearchPaginationInput) {
    projects(params: $params) {
      items {
        id
        created_at
        name
        internal_name
        domain
        start_date
        end_date
        description
        environment
      }
      total
      page
      limit
      total_pages
    }
  }
`;

export type CreateProjectInput = {
  name: string;
  domain: string;
  start_date: string;
  end_date?: string | null;
  description: string;
  environment: string[];
};

type CreateProjectData = {
  createProject: ApiProject;
};

type CreateProjectVariables = {
  project: CreateProjectInput;
};

export const CREATE_PROJECT_MUTATION: TypedDocumentNode<
  CreateProjectData,
  CreateProjectVariables
> = gql`
  mutation CreateProject($project: CreateProjectInput!) {
    createProject(project: $project) {
      id
      created_at
      name
      internal_name
      domain
      start_date
      end_date
      description
      environment
    }
  }
`;

export type UpdateProjectInput = {
  projectId: string;
  name: string;
  domain: string;
  start_date: string;
  end_date?: string | null;
  description: string;
  environment: string[];
};

type UpdateProjectData = {
  updateProject: ApiProject;
};

type UpdateProjectVariables = {
  project: UpdateProjectInput;
};

export const UPDATE_PROJECT_MUTATION: TypedDocumentNode<
  UpdateProjectData,
  UpdateProjectVariables
> = gql`
  mutation UpdateProject($project: UpdateProjectInput!) {
    updateProject(project: $project) {
      id
      created_at
      name
      internal_name
      domain
      start_date
      end_date
      description
      environment
    }
  }
`;
