import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-family-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-family-modal.component.html',
  styleUrls: ['./create-family-modal.component.css']
})
export class CreateFamilyModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{name: string, description: string}>();

  createForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  onCreate() {
    if (this.createForm.valid) {
      this.create.emit(this.createForm.value);
    }
  }
}
