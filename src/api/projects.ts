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
