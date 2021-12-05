import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ContentBoxComponent} from './contentBox.component';

describe('ContentBoxComponent', () => {
  let component: ContentBoxComponent;
  let fixture: ComponentFixture<ContentBoxComponent>;

  setupTestBed({
    declarations: [ContentBoxComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
