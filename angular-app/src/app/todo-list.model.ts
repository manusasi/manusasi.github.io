export interface TodoList {
  id?: string;
  title: string;
  description?: string;
  owner: string; // userId of the creator
  sharedWith: string[]; // userIds of users with whom the list is shared
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean; // whether the list is publicly accessible
} 