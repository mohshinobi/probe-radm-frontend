import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleSetGeneratorComponent } from './rule-set-generator.component';

describe('RuleSetGeneratorComponent', () => {
  let component: RuleSetGeneratorComponent;
  let fixture: ComponentFixture<RuleSetGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleSetGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleSetGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
