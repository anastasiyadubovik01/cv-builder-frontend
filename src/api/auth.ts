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

export interface VerifyMailInput {
  otp: string;
}

export interface VerifyMailData {
  verifyMail?: boolean | null;
}

export interface VerifyMailVariables {
  mail: VerifyMailInput;
}

export interface ResetPasswordInput {
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  resetPassword?: boolean | null;
}

export interface ResetPasswordVariables {
  auth: ResetPasswordInput;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordData {
  forgotPassword?: boolean | null;
}

export interface ForgotPasswordVariables {
  auth: ForgotPasswordInput;
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

export const VERIFY_MAIL_MUTATION: TypedDocumentNode<
  VerifyMailData,
  VerifyMailVariables
> = gql`
  mutation VerifyMail($mail: VerifyMailInput!) {
    verifyMail(mail: $mail)
  }
`;

export const RESET_PASSWORD_MUTATION: TypedDocumentNode<
  ResetPasswordData,
  ResetPasswordVariables
> = gql`
  mutation ResetPassword($auth: ResetPasswordInput!) {
    resetPassword(auth: $auth)
  }
`;

export const FORGOT_PASSWORD_MUTATION: TypedDocumentNode<
  ForgotPasswordData,
  ForgotPasswordVariables
> = gql`
  mutation ForgotPassword($auth: ForgotPasswordInput!) {
    forgotPassword(auth: $auth)
  }
`;

export const UPDATE_TOKEN_MUTATION = gql`
  mutation UpdateToken {
    updateToken {
      access_token
      refresh_token
    }
  }
`;
