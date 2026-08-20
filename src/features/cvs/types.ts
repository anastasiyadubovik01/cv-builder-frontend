export type SortDirection = 'asc' | 'desc';

export type CvProjectSortField = 'name' | 'startDate' | 'endDate';
export type SortField = 'name';

export type Cv = {
  id: string;
  name: string;
  education: string;
  employee: string;
  description: string;
};

export type CvProject = {
  id: string;
  name: string;
  domain: string;
  responsibilities: string[];
  startDate: string;
  endDate: string | null;
  description: string;
  environment: string[];
  roles: string[];
};
