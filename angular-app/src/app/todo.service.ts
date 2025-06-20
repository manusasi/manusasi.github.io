import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Todo } from './todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.todosCollection = collection(this.firestore, 'todos');
  }

  getTodos(): Observable<Todo[]> {
    return collectionData(this.todosCollection, { idField: 'id' }) as Observable<Todo[]>;
  }

  addTodo(title: string): Promise<any> {
    const newTodo: Omit<Todo, 'id'> = {
      title,
      completed: false
    };
    return addDoc(this.todosCollection, newTodo);
  }

  updateTodo(todo: Todo): Promise<void> {
    if (!todo.id) {
      return Promise.reject('Todo ID is missing');
    }
    const todoRef = doc(this.firestore, `todos/${todo.id}`);
    // Create a new object without the 'id' field for the update
    const { id, ...dataToUpdate } = todo;
    return updateDoc(todoRef, dataToUpdate);
  }

  deleteTodo(id: string): Promise<void> {
    const todoRef = doc(this.firestore, `todos/${id}`);
    return deleteDoc(todoRef);
  }
} 