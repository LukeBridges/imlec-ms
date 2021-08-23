import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WinnersComponent} from './winners.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('WelcomeComponent', () => {
  let component: WinnersComponent;
  let fixture: ComponentFixture<WinnersComponent>;

  setupTestBed({
    declarations: [WinnersComponent, ContentBoxComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WinnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
