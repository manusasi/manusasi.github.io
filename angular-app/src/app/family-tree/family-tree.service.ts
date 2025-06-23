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
    console.log('Current user:', user); // Debug log
    
    if (!user) {
      throw new Error('User not logged in');
    }

    console.log('User UID:', user.uid); // Debug log
    console.log('User email:', user.email); // Debug log

    const newFamily = {
      name: familyData.name,
      description: familyData.description || '',
      owner: user.uid,
      sharedWith: [],
      status: 'approved' as const,
      createdAt: serverTimestamp()
    };
    
    console.log('Creating family with data:', newFamily); // Debug log
    
    try {
      await addDoc(this.familyCollection, newFamily);
      console.log('Family created successfully'); // Debug log
    } catch (error) {
      console.error('Error creating family:', error); // Debug log
      throw error;
    }
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
        console.log('getFamilies - Current user:', user); // Debug log
        
        if (!user || !user.email) {
          console.log('getFamilies - No user or email, returning empty array'); // Debug log
          return of([]);
        }

        console.log('getFamilies - User UID:', user.uid); // Debug log
        console.log('getFamilies - User email:', user.email); // Debug log

        const ownedQuery = query(this.familyCollection, where('owner', '==', user.uid));
        const sharedWithQuery = query(this.familyCollection, where('sharedWith', 'array-contains', user.email));

        const owned$ = collectionData(ownedQuery, { idField: 'id' }) as Observable<Family[]>;
        const shared$ = collectionData(sharedWithQuery, { idField: 'id' }) as Observable<Family[]>;

        return combineLatest([owned$, shared$]).pipe(
          map(([owned, shared]) => {
            console.log('getFamilies - Owned families:', owned); // Debug log
            console.log('getFamilies - Shared families:', shared); // Debug log
            
            const all = [...owned, ...shared];
            const unique = all.filter((family, index, self) =>
              index === self.findIndex((f) => (f.id === family.id))
            );
            const result = unique.sort((a, b) => a.name.localeCompare(b.name));
            console.log('getFamilies - Final result:', result); // Debug log
            return result;
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
    
    const newMember = {
      ...memberData,
      familyId: familyId,
      status: 'approved' as const,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    };

    await addDoc(memberCollectionRef, newMember);
  }

  async updateFamilyMember(familyId: string, memberId: string, memberData: Partial<FamilyMember>): Promise<void> {
    const memberDocRef = doc(this.firestore, 'families', familyId, 'members', memberId);
    await updateDoc(memberDocRef, memberData);
  }
}
