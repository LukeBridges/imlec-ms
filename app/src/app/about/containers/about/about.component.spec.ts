import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AboutComponent} from './about.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContentBoxComponent],
      declarations: [AboutComponent],
    });
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
