import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScoresService} from '../../services/scores.service';
import {ScoresServiceMock} from '../../../../test/mock/services/scores.service.mock';
import {ScoreMobileComponent} from './score-mobile.component';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
import {MatTableModule} from '@angular/material/table';
import {DetailRowDirective} from '../../directives/detail-row.directive';

describe('ScoreMobileComponent', () => {
  let component: ScoreMobileComponent;
  let fixture: ComponentFixture<ScoreMobileComponent>;

  setupTestBed({
    imports: [
      MatTableModule,
    ],
    declarations: [
      ScoreMobileComponent,
      DetailRowDirective,
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
