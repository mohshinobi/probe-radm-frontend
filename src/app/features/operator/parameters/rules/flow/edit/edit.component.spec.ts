import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleFlowEditComponent } from './edit.component';

describe('EditComponent', () => {
  let component: RuleFlowEditComponent;
  let fixture: ComponentFixture<RuleFlowEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleFlowEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleFlowEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
