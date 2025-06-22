import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremierLeague } from './premier-league';

describe('PremierLeague', () => {
  let component: PremierLeague;
  let fixture: ComponentFixture<PremierLeague>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremierLeague]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremierLeague);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
