import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyTreeService } from './family-tree.service';
import { Family } from './family-tree.model';
import { Observable } from 'rxjs';
import { FamilyShareModalComponent } from '../family-share-modal/family-share-modal.component';
import { CreateFamilyModalComponent } from '../create-family-modal/create-family-modal.component';
import { RouterLink, Router } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb.component';

@Component({
  selector: 'app-family-tree',
  standalone: true,
  imports: [CommonModule, FamilyShareModalComponent, CreateFamilyModalComponent, RouterLink, BreadcrumbComponent],
  templateUrl: './family-tree.component.html',
  styleUrl: './family-tree.component.css'
})
export class FamilyTreeComponent {
  families$: Observable<Family[]>;
  
  isShareModalOpen = false;
  selectedFamily: Family | null = null;
  
  isCreateModalOpen = false;
  breadcrumbItems = [
    { label: 'Home', route: '/' },
    { label: 'Family Trees', route: undefined }
  ];

  constructor(
    private familyTreeService: FamilyTreeService,
    private router: Router
  ) {
    this.families$ = this.familyTreeService.getFamilies();
  }

  // Navigation
  openFamily(family: Family) {
    this.router.navigate(['/family-tree', family.id]);
  }

  // Create Modal
  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  async handleCreateFamily(familyData: {name: string, description: string}) {
    await this.familyTreeService.addFamily(familyData);
    this.closeCreateModal();
  }

  // Share Modal
  openShareModal(family: Family) {
    this.selectedFamily = family;
    this.isShareModalOpen = true;
  }

  closeShareModal() {
    this.isShareModalOpen = false;
    this.selectedFamily = null;
  }

  handleShare(email: string) {
    if (this.selectedFamily) {
      this.familyTreeService.shareFamily(this.selectedFamily.id, email);
    }
    this.closeShareModal();
  }
}
