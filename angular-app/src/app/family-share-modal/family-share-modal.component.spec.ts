import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyShareModal } from './family-share-modal';

describe('FamilyShareModal', () => {
  let component: FamilyShareModal;
  let fixture: ComponentFixture<FamilyShareModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyShareModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyShareModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
