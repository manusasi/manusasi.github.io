import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, serverTimestamp, collectionData, Query, doc, updateDoc, arrayUnion, docData, arrayRemove } from '@angular/fire/firestore';
import { Family, FamilyMember } from './family-tree.model';
import { AuthService } from '../auth.service';
import { firstValueFrom, Observable, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FamilyTreeService {
  private familyCollection;
  private memberCollection;
  private familiesCollection;

  constructor(
    private firestore: Firestore,
    private auth: AuthService,
  ) {
    this.familyCollection = collection(this.firestore, 'families');
    this.memberCollection = collection(this.firestore, 'members');
    this.familiesCollection = collection(this.firestore, 'families');
  }

  // Methods for families
  // Adds a new family to the database
  async addFamily(familyData: { name: string, description?: string }): Promise<void> {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) {
      throw new Error('User not logged in');
    }

    const newFamily = {
      name: familyData.name,
      description: familyData.description || '',
      owner: user.uid,
      sharedWith: [],
      createdAt: serverTimestamp(),
      status: 'approved'
    };
    await addDoc(this.familyCollection, newFamily);
  }

  async updateFamily(familyId: string, data: Partial<Family>): Promise<void> {
    const familyDocRef = doc(this.firestore, 'families', familyId);
    await updateDoc(familyDocRef, data);
  }

  async removeSharedUser(familyId: string, email: string): Promise<void> {
    const familyDocRef = doc(this.firestore, 'families', familyId);
    await updateDoc(familyDocRef, {
      sharedWith: arrayRemove(email)
    });
  }

  getFamilies(): Observable<Family[]> {
    return this.auth.user$.pipe(
      switchMap(user => {
        if (!user || !user.email) {
          return of([]);
        }
        const ownedQuery = query(this.familyCollection, where('owner', '==', user.uid));
        const sharedWithQuery = query(this.familyCollection, where('sharedWith', 'array-contains', user.email));

        const owned$ = collectionData(ownedQuery, { idField: 'id' }) as Observable<Family[]>;
        const shared$ = collectionData(sharedWithQuery, { idField: 'id' }) as Observable<Family[]>;

        return combineLatest([owned$, shared$]).pipe(
          map(([owned, shared]) => {
            const all = [...owned, ...shared];
            const unique = all.filter((family, index, self) =>
              index === self.findIndex((f) => (f.id === family.id))
            );
            return unique.sort((a, b) => a.name.localeCompare(b.name));
          })
        );
      })
    );
  }

  async shareFamily(familyId: string, email: string): Promise<void> {
    const familyDocRef = doc(this.firestore, 'families', familyId);
    await updateDoc(familyDocRef, {
      sharedWith: arrayUnion(email)
    });
  }

  getFamilyById(familyId: string): Observable<Family | undefined> {
    const familyDocRef = doc(this.firestore, 'families', familyId);
    return docData(familyDocRef, { idField: 'id' }) as Observable<Family | undefined>;
  }

  getFamilyMembers(familyId: string): Observable<FamilyMember[]> {
    const memberCollectionRef = collection(this.firestore, 'families', familyId, 'members');
    const q = query(memberCollectionRef); // Add ordering later if needed, e.g., orderBy('dateOfBirth')
    return collectionData(q, { idField: 'id' }) as Observable<FamilyMember[]>;
  }

  // Methods for family members
  async addFamilyMember(familyId: string, memberData: Partial<FamilyMember>): Promise<void> {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) {
      throw new Error('User not logged in');
    }

    const memberCollectionRef = collection(this.firestore, 'families', familyId, 'members');
    
    const newMember: Omit<FamilyMember, 'id'> = {
      ...memberData,
      familyId: familyId,
      status: 'approved',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    } as Omit<FamilyMember, 'id'>;

    await addDoc(memberCollectionRef, newMember);
  }
}
