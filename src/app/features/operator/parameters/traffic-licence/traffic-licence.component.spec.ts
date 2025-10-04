import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficLicenceComponent } from './traffic-licence.component';

describe('TrafficLicenceComponent', () => {
  let component: TrafficLicenceComponent;
  let fixture: ComponentFixture<TrafficLicenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficLicenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrafficLicenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
