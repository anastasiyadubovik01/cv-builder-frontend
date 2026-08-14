export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'education' | 'employee';

export type Cv = {
  id: string;
  name: string;
  education: string;
  employee: string;
  description: string;
};
