import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselAudio } from './carrusel-audio';

describe('CarruselAudio', () => {
  let component: CarruselAudio;
  let fixture: ComponentFixture<CarruselAudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselAudio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselAudio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
