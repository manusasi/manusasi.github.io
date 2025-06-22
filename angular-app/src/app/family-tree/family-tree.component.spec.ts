import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyTreeComponent } from './family-tree.component';

describe('FamilyTreeComponent', () => {
  let component: FamilyTreeComponent;
  let fixture: ComponentFixture<FamilyTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
