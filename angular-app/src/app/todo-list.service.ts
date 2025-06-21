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
          where('sharedWith', 'array-contains', user.email),
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
        const newListData: any = {
          title,
          owner: user.uid,
          sharedWith: [],
          createdAt: now,
          updatedAt: now,
          isPublic: false
        };
        
        // Only add description if it's not empty or undefined
        if (description && description.trim()) {
          newListData.description = description.trim();
        }
        
        console.log('Creating list with data:', newListData);
        return from(addDoc(this.listsCollection, newListData));
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
    
    // Remove undefined values
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
        delete dataToUpdate[key as keyof typeof dataToUpdate];
      }
    });
    
    console.log('Updating list with data:', dataToUpdate);
    return updateDoc(listRef, dataToUpdate);
  }

  // Delete a todo list
  deleteList(listId: string): Promise<void> {
    const listRef = doc(this.firestore, `todoLists/${listId}`);
    return deleteDoc(listRef);
  }

  // Share a list with a user by email
  async shareList(listId: string, userEmail: string): Promise<void> {
    console.log('TodoListService: Sharing list', listId, 'with email:', userEmail);
    
    const listRef = doc(this.firestore, `todoLists/${listId}`);
    
    try {
      // Get the current list data
      const listDoc = await getDoc(listRef);
      if (!listDoc.exists()) {
        throw new Error('List not found');
      }
      
      const list = listDoc.data() as TodoList;
      console.log('TodoListService: Current list data:', list);
      
      // Check if email is already shared
      if (list.sharedWith && list.sharedWith.includes(userEmail)) {
        console.log('TodoListService: Email already shared');
        throw new Error('List is already shared with this email');
      }
      
      // For now, we'll store emails in sharedWith array
      // In a production app, you'd want to look up the user by email and store their UID
      const updatedSharedWith = [...(list.sharedWith || []), userEmail];
      console.log('TodoListService: Updated sharedWith array:', updatedSharedWith);
      
      const updateData = {
        sharedWith: updatedSharedWith,
        updatedAt: new Date()
      };
      console.log('TodoListService: Updating list with data:', updateData);
      
      await updateDoc(listRef, updateData);
      console.log('TodoListService: List shared successfully');
    } catch (error) {
      console.error('TodoListService: Error sharing list:', error);
      throw error;
    }
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