import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaDeck } from './media-deck';

describe('MediaDeck', () => {
  let component: MediaDeck;
  let fixture: ComponentFixture<MediaDeck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaDeck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaDeck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
