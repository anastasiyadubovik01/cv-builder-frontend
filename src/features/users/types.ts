export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
};

export type SortField = 'firstName' | 'lastName' | 'department' | 'position';

export type SortDirection = 'asc' | 'desc';
