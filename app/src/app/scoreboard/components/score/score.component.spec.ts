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
    component.tableTop = {nativeElement: {offsetTop: 0}};
    component.tableEnd = {nativeElement: {offsetTop: 1000}};
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

  describe('scroll', () => {
    it('should call scrollTo from scrollTop', () => {
      spyOn(component, 'scrollTo').and.stub();

      component.scrollTop();

      expect(component.scrollTo).toHaveBeenCalledWith(0, ScoreComponent.SCROLL_TIME);
    });

    it('should call scrollTo from scrollBottom', () => {
      spyOn(component, 'scrollTo').and.stub();

      component.scrollBottom();

      expect(component.scrollTo).toHaveBeenCalledWith(1000, ScoreComponent.SCROLL_TIME * 2);
    });
  });

  describe('setScrolling', () => {
    it('should subscribe to scrolling subjects', () => {
      spyOn(component['scrollUpEvent'], 'pipe').and.callThrough();
      spyOn(component['scrollDownEvent'], 'pipe').and.callThrough();

      component.setScrolling();

      expect(component['scrollUpEvent'].pipe).toHaveBeenCalled();
      expect(component['scrollDownEvent'].pipe).toHaveBeenCalled();
    });
  });
});
