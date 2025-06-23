import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-member-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-member-modal.component.html',
  styleUrl: './add-member-modal.component.css'
})
export class AddMemberModalComponent {
  @Input() familyId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() addMember = new EventEmitter<any>();

  addMemberForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addMemberForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['male', Validators.required],
      dateOfBirth: [''],
    });
  }

  onSubmit(): void {
    if (this.addMemberForm.valid) {
      const memberData = this.addMemberForm.value;
      
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

      this.addMember.emit(memberData);
      this.addMemberForm.reset({ gender: 'male' });
    }
  }

  onClose(): void {
    this.close.emit();
  }
} 