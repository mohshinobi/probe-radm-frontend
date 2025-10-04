import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundProgressComponent } from './round-progress.component';

describe('RoundProgressComponent', () => {
  let component: RoundProgressComponent;
  let fixture: ComponentFixture<RoundProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundProgressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoundProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
