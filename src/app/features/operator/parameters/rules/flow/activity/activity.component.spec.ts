import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleFlowActivityComponent } from './activity.component';

describe('ActivityComponent', () => {
  let component: RuleFlowActivityComponent;
  let fixture: ComponentFixture<RuleFlowActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleFlowActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleFlowActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
