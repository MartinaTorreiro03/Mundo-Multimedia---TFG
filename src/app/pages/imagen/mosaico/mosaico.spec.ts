import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mosaico } from './mosaico';

describe('Mosaico', () => {
  let component: Mosaico;
  let fixture: ComponentFixture<Mosaico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mosaico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mosaico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
