export interface Fasting {
  id: number;
  category_id: number;
  type_id: number;
  date: string;
  year: number;
  month: number;
  day: number;
  human_date: string;
  category: Category;
  type: Type;
}

export interface Category {
  id: number;
  name: string;
}

export interface Type {
  id: number;
  name: string;
  description: string;
  background_color?: string;
  text_color?: string;
}

export type ExportScope =
  | 'current-month'
  | 'specific-month'
  | 'current-year';

export interface ExportRequest {
  scope: ExportScope;
  month: number;
  year: number;
  typeIds: number[];
  reminder: 'none' | 'one-day-before';
}
