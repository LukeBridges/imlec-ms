import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HotelsComponent} from './hotels.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('WelcomeComponent', () => {
  let component: HotelsComponent;
  let fixture: ComponentFixture<HotelsComponent>;

  setupTestBed({
    declarations: [HotelsComponent, ContentBoxComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
