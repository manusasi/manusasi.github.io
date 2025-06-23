import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FamilyTreeService } from '../family-tree/family-tree.service';

@Component({
  selector: 'app-share-family-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './share-family-modal.component.html',
  styleUrl: './share-family-modal.component.css'
})
export class ShareFamilyModalComponent {
  @Input() familyId: string = '';
  @Input() familyName: string = '';
  @Input() currentSharedUsers: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() userAdded = new EventEmitter<string>();

  shareForm: FormGroup;
  isSharing = false;
  shareError = '';
  shareSuccess = '';

  constructor(
    private fb: FormBuilder,
    private familyTreeService: FamilyTreeService
  ) {
    this.shareForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.shareForm.valid && this.familyId) {
      this.isSharing = true;
      this.shareError = '';
      this.shareSuccess = '';

      try {
        const { email } = this.shareForm.value;
        
        // Check if user is already shared
        if (this.currentSharedUsers.includes(email)) {
          this.shareError = 'This user is already shared with this family.';
          return;
        }

        await this.familyTreeService.shareFamily(this.familyId, email);
        this.shareSuccess = `Successfully shared "${this.familyName}" with ${email}`;
        this.userAdded.emit(email);
        this.shareForm.reset();
      } catch (error) {
        console.error('Error sharing family:', error);
        this.shareError = 'Failed to share family. Please try again.';
      } finally {
        this.isSharing = false;
      }
    }
  }

  onClose(): void {
    this.close.emit();
  }

  removeUser(email: string): void {
    if (this.familyId) {
      this.familyTreeService.removeSharedUser(this.familyId, email).then(() => {
        // The parent component will handle the UI update
      }).catch(error => {
        console.error('Error removing shared user:', error);
      });
    }
  }
} 