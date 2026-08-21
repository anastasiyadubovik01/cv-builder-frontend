import { gql, type TypedDocumentNode } from '@apollo/client';

export type CvPreviewData = {
  cv: {
    id: string;
    name: string;
    description: string;
    education: string;
    skills: Array<{
      name: string;
      categoryId: string | null;
      mastery: string;
    }>;
    projects: Array<{
      id: string;
      name: string;
      description: string;
      start_date: string;
      end_date: string | null;
      roles: string[];
      responsibilities: string[];
      environment: string[];
      domain: string;
    }>;
    user: {
      id: string;
      email: string;
      profile: {
        id: string;
        full_name: string | null;
        first_name: string | null;
        last_name: string | null;
        languages?: Array<{
          name: string;
          proficiency: string;
        }>;
      };
      position: {
        id: string;
        name: string;
      } | null;
    };
  };
};

export type CvPreviewVariables = {
  cvId: string;
};

export const CV_PREVIEW_QUERY: TypedDocumentNode<
  CvPreviewData,
  CvPreviewVariables
> = gql`
  query CvPreview($cvId: ID!) {
    cv(cvId: $cvId) {
      id
      name
      description
      education
      skills {
        name
        categoryId
        mastery
      }
      projects {
        id
        name
        description
        start_date
        end_date
        roles
        responsibilities
        environment
        domain
      }
      user {
        id
        email
        profile {
          id
          full_name
          first_name
          last_name
          languages {
            name
            proficiency
          }
        }
        position {
          id
          name
        }
      }
    }
  }
`;

export type ExportPdfInput = {
  html: string;
  margin?: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
};

export type ExportPdfData = {
  exportPdf: string;
};

export type ExportPdfVariables = {
  pdf: ExportPdfInput;
};

export const EXPORT_PDF_MUTATION: TypedDocumentNode<
  ExportPdfData,
  ExportPdfVariables
> = gql`
  mutation ExportPdf($pdf: ExportPdfInput!) {
    exportPdf(pdf: $pdf)
  }
`;
