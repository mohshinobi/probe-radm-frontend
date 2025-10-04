import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiderComponent } from './spider.component';

describe('SpiderComponent', () => {
  let component: SpiderComponent;
  let fixture: ComponentFixture<SpiderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpiderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpiderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
