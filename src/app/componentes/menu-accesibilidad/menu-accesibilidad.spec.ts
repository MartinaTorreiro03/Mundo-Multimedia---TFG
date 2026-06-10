import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAccesibilidad } from './menu-accesibilidad';

describe('MenuAccesibilidad', () => {
  let component: MenuAccesibilidad;
  let fixture: ComponentFixture<MenuAccesibilidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuAccesibilidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuAccesibilidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
