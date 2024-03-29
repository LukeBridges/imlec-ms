import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RulesComponent} from './rules.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('WelcomeComponent', () => {
  let component: RulesComponent;
  let fixture: ComponentFixture<RulesComponent>;

  setupTestBed({
    imports: [ContentBoxComponent],
    declarations: [RulesComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
