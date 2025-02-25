
export interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  isShared?: boolean;
  createdAt: number;
}

export type ListOperation = 'create' | 'rename' | 'delete';
