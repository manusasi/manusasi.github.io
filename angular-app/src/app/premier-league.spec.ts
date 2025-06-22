import { TestBed } from '@angular/core/testing';

import { PremierLeague } from './premier-league';

describe('PremierLeague', () => {
  let service: PremierLeague;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PremierLeague);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
