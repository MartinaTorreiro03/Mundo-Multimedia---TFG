import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselTexto } from './carrusel-texto';

describe('CarruselTexto', () => {
  let component: CarruselTexto;
  let fixture: ComponentFixture<CarruselTexto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselTexto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselTexto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
