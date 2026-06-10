import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocNotas } from './bloc-notas';

describe('BlocNotas', () => {
  let component: BlocNotas;
  let fixture: ComponentFixture<BlocNotas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlocNotas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlocNotas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
