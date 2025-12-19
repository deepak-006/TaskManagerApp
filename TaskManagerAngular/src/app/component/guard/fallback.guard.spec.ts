import { TestBed } from '@angular/core/testing';

import { FallbackGuard } from './fallback.guard';

describe('FallbackGuard', () => {
  let guard: FallbackGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FallbackGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
