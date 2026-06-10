import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reproductores } from './reproductores';

describe('Reproductores', () => {
  let component: Reproductores;
  let fixture: ComponentFixture<Reproductores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reproductores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reproductores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
