import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AboutComponent} from './about.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  setupTestBed({
    declarations: [AboutComponent, ContentBoxComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
