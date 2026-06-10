import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Arpa } from './arpa';

describe('Arpa', () => {
  let component: Arpa;
  let fixture: ComponentFixture<Arpa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Arpa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Arpa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
