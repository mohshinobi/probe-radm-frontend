import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldMapMarkerComponent } from './world-map-marker.component';

describe('WorldMapMarkerComponent', () => {
  let component: WorldMapMarkerComponent;
  let fixture: ComponentFixture<WorldMapMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldMapMarkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldMapMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
