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

type UploadAvatarData = {
  uploadAvatar: string;
};

type UploadAvatarVariables = {
  avatar: {
    userId: string;
    base64: string;
    size: number;
    type: string;
  };
};

export const UPLOAD_AVATAR_MUTATION: TypedDocumentNode<
  UploadAvatarData,
  UploadAvatarVariables
> = gql`
  mutation UploadAvatar($avatar: UploadAvatarInput!) {
    uploadAvatar(avatar: $avatar)
  }
`;
