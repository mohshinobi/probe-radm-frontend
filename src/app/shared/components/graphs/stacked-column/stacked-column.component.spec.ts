import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedColumnComponent } from './stacked-column.component';

describe('StackedColumnComponent', () => {
  let component: StackedColumnComponent;
  let fixture: ComponentFixture<StackedColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackedColumnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StackedColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
