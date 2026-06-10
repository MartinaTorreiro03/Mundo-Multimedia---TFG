import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollageInteractivo } from './collage-interactivo';

describe('CollageInteractivo', () => {
  let component: CollageInteractivo;
  let fixture: ComponentFixture<CollageInteractivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollageInteractivo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollageInteractivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
