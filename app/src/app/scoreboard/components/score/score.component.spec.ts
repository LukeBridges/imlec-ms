import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScoresService} from '../../services/scores.service';
import {ScoresServiceMock} from '../../../../test/mock/services/scores.service.mock';
import {ScoreComponent} from './score.component';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
import {MatTableModule} from '@angular/material/table';
import {DetailRowDirective} from '../../directives/detail-row.directive';

describe('ScoreComponent', () => {
  let component: ScoreComponent;
  let fixture: ComponentFixture<ScoreComponent>;

  setupTestBed({
    imports: [
      MatTableModule,
    ],
    declarations: [
      ScoreComponent,
      DetailRowDirective,
    ],
    providers: [
      {provide: ScoresService, useClass: ScoresServiceMock},
      WINDOW_PROVIDERS,
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreComponent);
    component = fixture.debugElement.componentInstance;
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleToolbar', () => {
    it('should invert showToolbar', () => {
      component.showToolbar = true;

      component.toggleToolbar();

      expect(component.showToolbar).toBeFalsy();

      component.toggleToolbar();

      expect(component.showToolbar).toBeTruthy();
    });
  });
});
