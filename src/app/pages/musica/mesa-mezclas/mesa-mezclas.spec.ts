import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicaInteractiva } from './musica-interactiva';

describe('MusicaInteractiva', () => {
  let component: MusicaInteractiva;
  let fixture: ComponentFixture<MusicaInteractiva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicaInteractiva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicaInteractiva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
