export type ProjectSortField = 'name' | 'startDate' | 'endDate';
export type SortDirection = 'asc' | 'desc';

export interface Project {
  id: string;
  name: string;
  domain: string;
  startDate: string;
  endDate: string;
  description?: string;
  environmentSkills?: string[];
}
