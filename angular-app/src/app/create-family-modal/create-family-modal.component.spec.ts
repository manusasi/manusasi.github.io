import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFamilyModal } from './create-family-modal';

describe('CreateFamilyModal', () => {
  let component: CreateFamilyModal;
  let fixture: ComponentFixture<CreateFamilyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFamilyModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFamilyModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
