import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasstypeComponent } from './classtype.component';

describe('ClasstypeComponent', () => {
  let component: ClasstypeComponent;
  let fixture: ComponentFixture<ClasstypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasstypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClasstypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
