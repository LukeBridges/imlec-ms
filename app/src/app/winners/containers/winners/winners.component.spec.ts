import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WinnersComponent} from './winners.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('WelcomeComponent', () => {
  let component: WinnersComponent;
  let fixture: ComponentFixture<WinnersComponent>;

  TestBed.configureTestingModule({
    imports: [ContentBoxComponent],
    declarations: [WinnersComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WinnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
