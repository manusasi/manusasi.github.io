export interface Todo {
  id?: string;
  title: string;
  completed: boolean;
  position: number;
  listId: string; // reference to the TodoList
  createdBy: string; // userId of who created the todo
  createdAt: Date;
  updatedAt: Date;
} 