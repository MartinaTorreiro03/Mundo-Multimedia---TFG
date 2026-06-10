import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntercMult } from './interc-mult';

describe('IntercMult', () => {
  let component: IntercMult;
  let fixture: ComponentFixture<IntercMult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntercMult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntercMult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
