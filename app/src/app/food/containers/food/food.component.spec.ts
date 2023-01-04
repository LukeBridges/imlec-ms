import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FoodComponent} from './food.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('WelcomeComponent', () => {
  let component: FoodComponent;
  let fixture: ComponentFixture<FoodComponent>;

  setupTestBed({
    imports: [ContentBoxComponent],
    declarations: [FoodComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
