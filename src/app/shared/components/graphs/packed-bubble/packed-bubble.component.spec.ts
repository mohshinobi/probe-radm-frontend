import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackedBubbleComponent } from './packed-bubble.component';

describe('PackedBubbleComponent', () => {
  let component: PackedBubbleComponent;
  let fixture: ComponentFixture<PackedBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackedBubbleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackedBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
