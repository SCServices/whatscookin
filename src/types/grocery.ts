
export interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
  quantity: number;
  unit: string;
}

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  isShared: boolean;
  shareId?: string;
  createdAt: number;
}

export type ListOperation = 'create' | 'rename' | 'delete' | 'share';

export type UnitType = 
  | 'piece' 
  | 'kg' 
  | 'g' 
  | 'lb' 
  | 'oz' 
  | 'l' 
  | 'ml' 
  | 'cup' 
  | 'tbsp' 
  | 'tsp'
  | 'dozen';

