import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyDetail } from './family-detail';

describe('FamilyDetail', () => {
  let component: FamilyDetail;
  let fixture: ComponentFixture<FamilyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
