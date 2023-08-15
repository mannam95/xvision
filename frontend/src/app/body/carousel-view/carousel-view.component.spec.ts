import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselViewComponent } from './carousel-view.component';

describe('CarouselViewComponent', () => {
  let component: CarouselViewComponent;
  let fixture: ComponentFixture<CarouselViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
