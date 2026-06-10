import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaDispositivos } from './linea-dispositivos';

describe('LineaDispositivos', () => {
  let component: LineaDispositivos;
  let fixture: ComponentFixture<LineaDispositivos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineaDispositivos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineaDispositivos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
