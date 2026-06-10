import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Escuchar } from './escuchar';

describe('Escuchar', () => {
  let component: Escuchar;
  let fixture: ComponentFixture<Escuchar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Escuchar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Escuchar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
