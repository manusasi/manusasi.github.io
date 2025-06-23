import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FamilyTreeService } from '../family-tree/family-tree.service';
import { Family, FamilyMember } from '../family-tree/family-tree.model';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb.component';
import { AddMemberModalComponent } from '../add-member-modal/add-member-modal.component';
import { EditMemberModalComponent } from '../edit-member-modal/edit-member-modal.component';
import { ShareFamilyModalComponent } from '../share-family-modal/share-family-modal.component';

@Component({
  selector: 'app-family-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BreadcrumbComponent, AddMemberModalComponent, EditMemberModalComponent, ShareFamilyModalComponent],
  templateUrl: './family-detail.component.html',
  styleUrl: './family-detail.component.css'
})
export class FamilyDetailComponent implements OnInit {
  family$: Observable<Family | undefined> | undefined;
  members$: Observable<FamilyMember[]> | undefined;
  familyId: string | null = null;
  
  isEditing = false;
  isAddMemberModalOpen = false;
  isEditMemberModalOpen = false;
  isShareModalOpen = false;
  selectedMember: FamilyMember | null = null;
  editForm: FormGroup;
  
  breadcrumbItems: BreadcrumbItem[] = [];

  private currentFamily: Family | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private familyTreeService: FamilyTreeService,
    private fb: FormBuilder,
    public auth: AuthService,
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
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
          this.updateBreadcrumbs(family);
        }
      })
    );
  }

  updateBreadcrumbs(family: Family): void {
    this.breadcrumbItems = [
      {
        label: 'Home',
        route: '/',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
      },
      {
        label: 'Family Trees',
        route: '/family-tree',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1.5a2.5 2.5 0 00-5 0V21'
      },
      {
        label: family.name,
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1.5a2.5 2.5 0 00-5 0V21'
      }
    ];
  }

  goBack(): void {
    this.router.navigate(['/family-tree']);
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

  openAddMemberModal(): void {
    this.isAddMemberModalOpen = true;
  }

  closeAddMemberModal(): void {
    this.isAddMemberModalOpen = false;
  }

  openEditMemberModal(member: FamilyMember): void {
    this.selectedMember = member;
    this.isEditMemberModalOpen = true;
  }

  closeEditMemberModal(): void {
    this.isEditMemberModalOpen = false;
    this.selectedMember = null;
  }

  async handleAddMember(memberData: any): Promise<void> {
    if (this.familyId) {
      try {
        await this.familyTreeService.addFamilyMember(this.familyId, memberData);
        this.closeAddMemberModal();
      } catch (error) {
        console.error('Error adding family member:', error);
      }
    }
  }

  async handleUpdateMember(updateData: any): Promise<void> {
    if (this.familyId && updateData.memberId) {
      try {
        const { memberId, ...memberData } = updateData;
        await this.familyTreeService.updateFamilyMember(this.familyId, memberId, memberData);
        this.closeEditMemberModal();
      } catch (error) {
        console.error('Error updating family member:', error);
      }
    }
  }

  openShareModal(): void {
    this.isShareModalOpen = true;
  }

  closeShareModal(): void {
    this.isShareModalOpen = false;
  }

  handleUserAdded(email: string): void {
    // The family observable will automatically update due to Firestore real-time updates
    console.log('User added:', email);
  }

  formatDateForDisplay(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  }
}
