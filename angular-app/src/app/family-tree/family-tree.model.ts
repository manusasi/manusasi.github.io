import { Timestamp } from '@angular/fire/firestore';
import { FieldValue } from '@angular/fire/firestore';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type Gender = 'male' | 'female' | 'other';

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth?: Timestamp;
  dateOfDeath?: Timestamp;
  photoUrl?: string;

  // Relationships
  familyId: string;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
  
  // Metadata for approval process
  status: ApprovalStatus;
  createdBy: string; // User ID
  createdAt: Timestamp | FieldValue;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  owner: string; // User ID of the owner
  sharedWith?: string[]; // Array of email addresses

  // Metadata for approval process
  status: ApprovalStatus;
  createdAt: Timestamp | FieldValue;
} 