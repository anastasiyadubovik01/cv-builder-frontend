import { gql, TypedDocumentNode } from '@apollo/client';

export interface User {
  id: string;
  email: string;
}

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginData {
  login: AuthResult;
}

export interface SignUpData {
  signup: AuthResult;
}

export interface LoginVariables {
  auth: AuthInput;
}

export interface SignUpVariables {
  auth: SignupInput;
}

export const LOGIN_MUTATION: TypedDocumentNode<LoginData, LoginVariables> = gql`
  mutation Login($auth: AuthInput!) {
    login(auth: $auth) {
      access_token
      refresh_token
      user {
        id
        email
      }
    }
  }
`;

export const SIGN_UP_MUTATION: TypedDocumentNode<SignUpData, SignUpVariables> =
  gql`
    mutation SignUp($auth: SignupInput!) {
      signup(auth: $auth) {
        access_token
        refresh_token
        user {
          id
          email
        }
      }
    }
  `;
