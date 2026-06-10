import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolucionInterfaces } from './evolucion-interfaces';

describe('EvolucionInterfaces', () => {
  let component: EvolucionInterfaces;
  let fixture: ComponentFixture<EvolucionInterfaces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolucionInterfaces]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolucionInterfaces);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
