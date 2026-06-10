import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SintonizadorTransmedia } from './sintonizador-transmedia';

describe('SintonizadorTransmedia', () => {
  let component: SintonizadorTransmedia;
  let fixture: ComponentFixture<SintonizadorTransmedia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SintonizadorTransmedia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SintonizadorTransmedia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
