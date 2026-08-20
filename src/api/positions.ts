import { gql } from '@apollo/client';

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

export const POSITIONS_QUERY = gql`
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
