import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoInmersivo } from './video-inmersivo';

describe('VideoInmersivo', () => {
  let component: VideoInmersivo;
  let fixture: ComponentFixture<VideoInmersivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoInmersivo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoInmersivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
