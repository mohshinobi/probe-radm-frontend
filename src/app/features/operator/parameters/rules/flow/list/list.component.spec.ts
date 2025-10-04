import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleFlowListComponent } from './list.component';

describe('RuleFlowListComponent', () => {
  let component: RuleFlowListComponent;
  let fixture: ComponentFixture<RuleFlowListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleFlowListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleFlowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
