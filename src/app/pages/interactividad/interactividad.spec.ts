import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Interactividad } from './interactividad';

describe('Interactividad', () => {
  let component: Interactividad;
  let fixture: ComponentFixture<Interactividad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Interactividad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Interactividad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
