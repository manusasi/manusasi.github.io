import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { FamilyMember } from '../family-tree/family-tree.model';

@Component({
  selector: 'app-edit-member-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-member-modal.component.html',
  styleUrl: './edit-member-modal.component.css'
})
export class EditMemberModalComponent implements OnInit {
  @Input() member: FamilyMember | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() updateMember = new EventEmitter<any>();

  editMemberForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editMemberForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['male', Validators.required],
      dateOfBirth: [''],
    });
  }

  ngOnInit(): void {
    if (this.member) {
      this.editMemberForm.patchValue({
        firstName: this.member.firstName,
        lastName: this.member.lastName,
        gender: this.member.gender,
        dateOfBirth: this.member.dateOfBirth ? this.formatDateForInput(this.member.dateOfBirth) : ''
      });
    }
  }

  private formatDateForInput(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    // Fix timezone issue by using local date components
    const year = date.getFullYear();
    const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
    const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.editMemberForm.valid && this.member) {
      const memberData = this.editMemberForm.value;
      
      // Only convert dateOfBirth to Timestamp if it's provided
      if (memberData.dateOfBirth) {
        // Fix timezone issue by creating date in local timezone
        const dateParts = memberData.dateOfBirth.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2]);
        const date = new Date(year, month, day);
        memberData.dateOfBirth = Timestamp.fromDate(date);
      } else {
        delete memberData.dateOfBirth; // Remove the field if not provided
      }

      this.updateMember.emit({ memberId: this.member.id, ...memberData });
    }
  }

  onClose(): void {
    this.close.emit();
  }
} 