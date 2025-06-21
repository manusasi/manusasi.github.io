import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, CollectionReference, query, where, orderBy, getDocs, writeBatch, getDoc } from '@angular/fire/firestore';
import { Observable, of, from, firstValueFrom } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { TodoList } from './todo-list.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TodoListService {
  private listsCollection: CollectionReference;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.listsCollection = collection(this.firestore, 'todoLists');
  }

  // Get all lists that the user owns or has access to
  getLists(): Observable<TodoList[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }
        
        // Query for lists where user is owner or in sharedWith array
        const userListsQuery = query(
          this.listsCollection,
          where('owner', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );
        
        const sharedListsQuery = query(
          this.listsCollection,
          where('sharedWith', 'array-contains', user.uid),
          orderBy('updatedAt', 'desc')
        );

        return from(Promise.all([
          getDocs(userListsQuery),
          getDocs(sharedListsQuery)
        ])).pipe(
          map(([ownedDocs, sharedDocs]) => {
            const ownedLists = ownedDocs.docs.map(doc => ({ ...doc.data(), id: doc.id } as TodoList));
            const sharedLists = sharedDocs.docs.map(doc => ({ ...doc.data(), id: doc.id } as TodoList));
            
            // Combine and remove duplicates
            const allLists = [...ownedLists, ...sharedLists];
            const uniqueLists = allLists.filter((list, index, self) => 
              index === self.findIndex(l => l.id === list.id)
            );
            
            return uniqueLists.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          })
        );
      })
    );
  }

  // Create a new todo list
  createList(title: string, description?: string): Observable<any> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          return of(Promise.reject('User not logged in'));
        }
        
        const now = new Date();
        const newList: Omit<TodoList, 'id'> = {
          title,
          description,
          owner: user.uid,
          sharedWith: [],
          createdAt: now,
          updatedAt: now,
          isPublic: false
        };
        
        return from(addDoc(this.listsCollection, newList));
      })
    );
  }

  // Update a todo list
  updateList(list: TodoList): Promise<void> {
    if (!list.id) {
      return Promise.reject('List ID is missing');
    }
    
    const listRef = doc(this.firestore, `todoLists/${list.id}`);
    const { id, ...dataToUpdate } = list;
    dataToUpdate.updatedAt = new Date();
    
    return updateDoc(listRef, dataToUpdate);
  }

  // Delete a todo list
  deleteList(listId: string): Promise<void> {
    const listRef = doc(this.firestore, `todoLists/${listId}`);
    return deleteDoc(listRef);
  }

  // Share a list with a user by email
  async shareList(listId: string, userEmail: string): Promise<void> {
    const listRef = doc(this.firestore, `todoLists/${listId}`);
    
    // Get the current list data
    const listDoc = await getDoc(listRef);
    if (!listDoc.exists()) {
      throw new Error('List not found');
    }
    
    const list = listDoc.data() as TodoList;
    
    // Add email to sharedWith (we'll store emails for now)
    const updatedSharedWith = [...(list.sharedWith || []), userEmail];
    
    await updateDoc(listRef, {
      sharedWith: updatedSharedWith,
      updatedAt: new Date()
    });
  }

  // Remove sharing from a list
  async unshareList(listId: string, userEmail: string): Promise<void> {
    const listRef = doc(this.firestore, `todoLists/${listId}`);
    
    // Get the current list data
    const listDoc = await getDoc(listRef);
    if (!listDoc.exists()) {
      throw new Error('List not found');
    }
    
    const list = listDoc.data() as TodoList;
    const updatedSharedWith = (list.sharedWith || []).filter(email => email !== userEmail);
    
    await updateDoc(listRef, {
      sharedWith: updatedSharedWith,
      updatedAt: new Date()
    });
  }

  // Check if user has access to a list
  async hasAccess(listId: string): Promise<boolean> {
    return firstValueFrom(
      this.authService.user$.pipe(
        take(1),
        switchMap(user => {
          if (!user) {
            return of(false);
          }
          
          return from(getDoc(doc(this.firestore, `todoLists/${listId}`))).pipe(
            map(snapshot => {
              if (!snapshot.exists()) {
                return false;
              }
              
              const list = snapshot.data() as TodoList;
              return list.owner === user.uid || 
                     (list.sharedWith || []).includes(user.email || '') ||
                     (list.isPublic || false);
            })
          );
        })
      )
    );
  }
} 