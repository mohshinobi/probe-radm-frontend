import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasplineComponent } from './areaspline.component';

describe('AreasplineComponent', () => {
  let component: AreasplineComponent;
  let fixture: ComponentFixture<AreasplineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreasplineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreasplineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
