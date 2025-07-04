import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, CollectionReference, query, where, orderBy, writeBatch, getDocs } from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { switchMap, take, catchError, map } from 'rxjs/operators';
import { Todo } from './todo.model';
import { AuthService } from './auth.service';
import { TodoListService } from './todo-list.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private firestore: Firestore = inject(Firestore);
  private todosCollection: CollectionReference;

  constructor(
    private authService: AuthService,
    private todoListService: TodoListService
  ) {
    this.todosCollection = collection(this.firestore, 'todos');
  }

  // Get todos for a specific list
  getTodosForList(listId: string): Observable<Todo[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        console.log('TodoService: Current user:', user);
        if (!user) {
          console.log('TodoService: No authenticated user');
          return of([]);
        }
        
        console.log('TodoService: Creating query for todos in list:', listId);
        // Simple query - just filter by listId
        const todosQuery = query(
          this.todosCollection, 
          where('listId', '==', listId)
        );
        
        console.log('TodoService: Executing todos query');
        return collectionData(todosQuery, { idField: 'id' }).pipe(
          map(docs => docs as Todo[]),
          catchError(error => {
            console.error('TodoService: Error loading todos:', error);
            return of([]);
          })
        );
      })
    );
  }

  // Add a todo to a specific list
  addTodo(listId: string, title: string): Observable<any> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          console.error('User not logged in');
          return of(Promise.reject('User not logged in'));
        }
        
        console.log('Adding todo for user:', user.uid, 'to list:', listId);
        
        // Get current todos to determine position
        return from(getDocs(query(this.todosCollection, where('listId', '==', listId)))).pipe(
          switchMap(snapshot => {
            const newPosition = snapshot.size;
            const now = new Date();
            const newTodo: Omit<Todo, 'id'> = {
              title,
              completed: false,
              listId,
              position: newPosition,
              createdBy: user.uid,
              createdAt: now,
              updatedAt: now
            };
            
            console.log('Creating todo with data:', newTodo);
            return from(addDoc(this.todosCollection, newTodo));
          })
        );
      })
    );
  }

  // Update a todo
  updateTodo(todo: Todo): Promise<void> {
    if (!todo.id) {
      return Promise.reject('Todo ID is missing');
    }
    
    const todoRef = doc(this.firestore, `todos/${todo.id}`);
    const { id, ...dataToUpdate } = todo;
    dataToUpdate.updatedAt = new Date();
    
    return updateDoc(todoRef, dataToUpdate);
  }

  // Delete a todo
  deleteTodo(id: string): Promise<void> {
    const todoRef = doc(this.firestore, `todos/${id}`);
    return deleteDoc(todoRef);
  }

  // Update todo positions (for drag and drop)
  updateTodoPosition(todos: Todo[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    todos.forEach((todo, index) => {
      if(todo.id) {
        const todoRef = doc(this.firestore, `todos/${todo.id}`);
        batch.update(todoRef, { 
          position: index,
          updatedAt: new Date()
        });
      }
    });
    return batch.commit();
  }

  // Delete all todos in a list (when deleting a list)
  deleteTodosInList(listId: string): Promise<void> {
    return from(getDocs(query(this.todosCollection, where('listId', '==', listId)))).pipe(
      switchMap(snapshot => {
        const batch = writeBatch(this.firestore);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        return from(batch.commit());
      })
    ).toPromise();
  }
} 