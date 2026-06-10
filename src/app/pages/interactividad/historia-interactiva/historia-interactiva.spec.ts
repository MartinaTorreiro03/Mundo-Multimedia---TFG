import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriaInteractiva } from './historia-interactiva';

describe('HistoriaInteractiva', () => {
  let component: HistoriaInteractiva;
  let fixture: ComponentFixture<HistoriaInteractiva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriaInteractiva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriaInteractiva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
