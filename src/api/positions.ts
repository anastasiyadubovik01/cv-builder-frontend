import { gql, type TypedDocumentNode } from '@apollo/client';

export interface Position {
  id: string;
  created_at: string;
  name: string;
}

export interface PaginatedPositions {
  items: Position[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PositionsQueryResponse {
  positions: PaginatedPositions;
}

export const POSITIONS_QUERY: TypedDocumentNode<
  PositionsQueryResponse,
  {
    params?: {
      search?: string;
      sort_order?: string;
      sort_by?: string;
      page?: number;
      limit?: number;
    };
  }
> = gql`
  query Positions($params: SearchPaginationInput) {
    positions(params: $params) {
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

type CreatePositionMutationData = {
  createPosition: Position;
};

type CreatePositionMutationVariables = {
  position: {
    name: string;
  };
};

export const CREATE_POSITION_MUTATION: TypedDocumentNode<
  CreatePositionMutationData,
  CreatePositionMutationVariables
> = gql`
  mutation CreatePosition($position: CreatePositionInput!) {
    createPosition(position: $position) {
      id
      created_at
      name
    }
  }
`;

type UpdatePositionMutationData = {
  updatePosition: Position;
};

type UpdatePositionMutationVariables = {
  position: {
    positionId: string;
    name: string;
  };
};

export const UPDATE_POSITION_MUTATION: TypedDocumentNode<
  UpdatePositionMutationData,
  UpdatePositionMutationVariables
> = gql`
  mutation UpdatePosition($position: UpdatePositionInput!) {
    updatePosition(position: $position) {
      id
      created_at
      name
    }
  }
`;

type DeletePositionMutationData = {
  deletePosition: {
    affected: number;
  };
};

type DeletePositionMutationVariables = {
  position: {
    positionId: string;
  };
};

export const DELETE_POSITION_MUTATION: TypedDocumentNode<
  DeletePositionMutationData,
  DeletePositionMutationVariables
> = gql`
  mutation DeletePosition($position: DeletePositionInput!) {
    deletePosition(position: $position) {
      affected
    }
  }
`;
