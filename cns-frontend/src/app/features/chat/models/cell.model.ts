export type CellType = 'code' | 'markdown';

export interface Cell {
  id: string;
  notebook_id: number;
  language: string;
  code: string;
  text_output?: string;
  error?: string;
  plot_urls?: string[];
  order: number;
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  cells: Cell[];
  createdAt: string;
  updatedAt: string;
}

export interface NotebookList {
  id: string;
  title: string;
  description: string;
  updated_at?: string;
  created_at: string;
}