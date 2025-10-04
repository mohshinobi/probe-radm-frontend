import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviancesComponent } from './deviances.component';

describe('DeviancesComponent', () => {
  let component: DeviancesComponent;
  let fixture: ComponentFixture<DeviancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeviancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
