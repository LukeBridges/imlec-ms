import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScoresService} from '../../services/scores.service';
import {ScoresServiceMock} from '../../../../test/mock/services/scores.service.mock';
import {ScoreMobileComponent} from './score-mobile.component';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';

describe('ScoreMobileComponent', () => {
  let component: ScoreMobileComponent;
  let fixture: ComponentFixture<ScoreMobileComponent>;

  TestBed.configureTestingModule({
    imports: [
      ScoreMobileComponent,
    ],
    providers: [
      {provide: ScoresService, useClass: ScoresServiceMock},
      WINDOW_PROVIDERS,
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreMobileComponent);
    component = fixture.debugElement.componentInstance;
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
