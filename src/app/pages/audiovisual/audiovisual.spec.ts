import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Audiovisual } from './audiovisual';

describe('Audiovisual', () => {
  let component: Audiovisual;
  let fixture: ComponentFixture<Audiovisual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Audiovisual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Audiovisual);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
