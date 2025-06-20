import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, CollectionReference, query, where } from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Todo } from './todo.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosCollection: CollectionReference;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.todosCollection = collection(this.firestore, 'todos');
  }

  getTodos(): Observable<Todo[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          const userTodosQuery = query(this.todosCollection, where('userId', '==', user.uid));
          return collectionData(userTodosQuery, { idField: 'id' }) as Observable<Todo[]>;
        } else {
          // Return an empty array if the user is not logged in
          return of([]);
        }
      })
    );
  }

  addTodo(title: string): Observable<any> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          return of(Promise.reject('User not logged in'));
        }
        const newTodo: Omit<Todo, 'id'> = {
          title,
          completed: false,
          userId: user.uid
        };
        return from(addDoc(this.todosCollection, newTodo));
      })
    );
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