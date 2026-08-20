import { gql, type TypedDocumentNode } from '@apollo/client';

export interface ApiProject {
  id: string;
  created_at: string;
  name: string;
  internal_name: string;
  domain: string;
  start_date: string;
  end_date: string | null;
  description: string;
  environment: string[];
}

export interface ApiCvProject {
  id: string;
  name: string;
  internal_name: string;
  description: string;
  domain: string;
  start_date: string;
  end_date: string | null;
  environment: string[];
  roles: string[];
  responsibilities: string[];
  project: ApiProject;
}

export interface CvProjectsData {
  cv: {
    id: string;
    name: string;
    projects: ApiCvProject[];
  };
}

export interface CvProjectsVars {
  cvId: string;
}

export const CV_PROJECTS_QUERY: TypedDocumentNode<
  CvProjectsData,
  CvProjectsVars
> = gql`
  query CvProjects($cvId: ID!) {
    cv(cvId: $cvId) {
      id
      name
      projects {
        id
        name
        internal_name
        description
        domain
        start_date
        end_date
        environment
        roles
        responsibilities
        project {
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
    }
  }
`;

export const ADD_CV_PROJECT_MUTATION = gql`
  mutation AddCvProject($project: AddCvProjectInput!) {
    addCvProject(project: $project) {
      id
      created_at
      name
      education
      description
      projects {
        id
        name
        domain
        start_date
        end_date
        description
        environment
        roles
        responsibilities
      }
    }
  }
`;

export const UPDATE_CV_PROJECT_MUTATION = gql`
  mutation UpdateCvProject($project: UpdateCvProjectInput!) {
    updateCvProject(project: $project) {
      id
      created_at
      name
      education
      description
      projects {
        id
        name
        domain
        start_date
        end_date
        description
        environment
        roles
        responsibilities
      }
    }
  }
`;

export const REMOVE_CV_PROJECT_MUTATION = gql`
  mutation RemoveCvProject($project: RemoveCvProjectInput!) {
    removeCvProject(project: $project) {
      id
      created_at
      name
      education
      description
      projects {
        id
        name
        domain
        start_date
        end_date
        description
        environment
        roles
        responsibilities
      }
    }
  }
`;
