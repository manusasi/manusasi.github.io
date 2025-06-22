import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FamilyTreeService } from '../family-tree/family-tree.service';
import { Family, FamilyMember } from '../family-tree/family-tree.model';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-family-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './family-detail.component.html',
  styleUrl: './family-detail.component.css'
})
export class FamilyDetailComponent implements OnInit {
  family$: Observable<Family | undefined> | undefined;
  members$: Observable<FamilyMember[]> | undefined;
  familyId: string | null = null;
  
  isEditing = false;
  editForm: FormGroup;
  addShareUserForm: FormGroup;
  addMemberForm: FormGroup;

  private currentFamily: Family | undefined;

  constructor(
    private route: ActivatedRoute,
    private familyTreeService: FamilyTreeService,
    private fb: FormBuilder,
    public auth: AuthService,
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.addShareUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.addMemberForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.family$ = this.route.paramMap.pipe(
      switchMap(params => {
        const familyId = params.get('familyId');
        this.familyId = familyId;
        if (familyId) {
          this.members$ = this.familyTreeService.getFamilyMembers(familyId);
          return this.familyTreeService.getFamilyById(familyId);
        }
        return of(undefined);
      }),
      tap(family => {
        this.currentFamily = family;
        if (family) {
          this.editForm.patchValue({
            name: family.name,
            description: family.description
          });
        }
      })
    );
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.currentFamily) {
      this.editForm.patchValue({
        name: this.currentFamily.name,
        description: this.currentFamily.description
      });
    }
  }

  async saveChanges(): Promise<void> {
    if (this.editForm.valid && this.familyId) {
      await this.familyTreeService.updateFamily(this.familyId, this.editForm.value);
      this.isEditing = false;
    }
  }

  async addFamilyMember(): Promise<void> {
    if (this.addMemberForm.valid && this.familyId) {
      try {
        const memberData = this.addMemberForm.value;
        const date = new Date(memberData.dateOfBirth);
        memberData.dateOfBirth = Timestamp.fromDate(date);
        await this.familyTreeService.addFamilyMember(this.familyId, memberData);
        this.addMemberForm.reset({ gender: 'male' });
      } catch (error) {
        console.error('Error adding family member:', error);
      }
    }
  }

  async addSharedUser(): Promise<void> {
    if (this.addShareUserForm.valid && this.familyId) {
      const { email } = this.addShareUserForm.value;
      await this.familyTreeService.shareFamily(this.familyId, email);
      this.addShareUserForm.reset();
    }
  }

  async removeSharedUser(email: string): Promise<void> {
    if (this.familyId) {
      await this.familyTreeService.removeSharedUser(this.familyId, email);
    }
  }
}
