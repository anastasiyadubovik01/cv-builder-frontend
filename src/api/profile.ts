import { gql, type TypedDocumentNode } from '@apollo/client';

type MeData = {
  me: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    avatar: string | null;
    email: string | null;
  };
};

export const ME_QUERY: TypedDocumentNode<MeData> = gql`
  query Me {
    me {
      id
      first_name
      last_name
      full_name
      avatar
      email
    }
  }
`;
