import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Family } from '../family-tree/family-tree.model';

@Component({
  selector: 'app-family-share-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './family-share-modal.component.html',
  styleUrls: ['./family-share-modal.component.css']
})
export class FamilyShareModalComponent {
  @Input() family: Family | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() share = new EventEmitter<string>();

  shareForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.shareForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onShare() {
    if (this.shareForm.valid) {
      this.share.emit(this.shareForm.value.email);
      this.shareForm.reset();
    }
  }
}
