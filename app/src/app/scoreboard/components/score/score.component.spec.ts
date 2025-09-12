import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ScoresService} from '../../services/scores.service';
import {ScoresServiceMock} from '../../../../test/mock/services/scores.service.mock';
import {ScoreComponent} from './score.component';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
import {MatTableModule} from '@angular/material/table';
import {DetailRowDirective} from '../../directives/detail-row.directive';
import {of} from 'rxjs';
import {ScoreModel} from '../../../core/models/score.model';
import {ContextService} from "../../../core/services/context.service";
import {ContextServiceMock} from "../../../../test/mock/services/context.service.mock";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";

describe('ScoreComponent', () => {
  let component: ScoreComponent;
  let fixture: ComponentFixture<ScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
      ],
      declarations: [
        ScoreComponent,
        DetailRowDirective,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ScoresService, useClass: ScoresServiceMock},
        {provide: ContextService, useClass: ContextServiceMock},
        WINDOW_PROVIDERS,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreComponent);
    component = fixture.debugElement.componentInstance;
    component.tableTop = {nativeElement: {offsetTop: 0}};
    component.tableEnd = {nativeElement: {offsetTop: 1000}};
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    test('should subscribe to completeScores', fakeAsync(() => {
      const newScores = [
        new ScoreModel({runNo: 1})
      ];
      component.completeScores = of(newScores);
      vi.spyOn(component.completeScores, 'subscribe');
      component.scores = [];

      component.ngOnInit();

      tick(100);

      expect(component.completeScores.subscribe).toHaveBeenCalled();
      expect(component.scores).toEqual(newScores);
    }));
  });

  describe('toggleToolbar', () => {
    test('should invert showToolbar', () => {
      component.showToolbar = true;

      component.toggleToolbar();

      expect(component.showToolbar).toBeFalsy();

      component.toggleToolbar();

      expect(component.showToolbar).toBeTruthy();
    });
  });

  describe('scroll', () => {
    test('should call scrollTo from scrollTop', () => {
      vi.spyOn(component, 'scrollTo').mockImplementation();

      component.scrollTop();

      expect(component.scrollTo).toHaveBeenCalledWith(0, ScoreComponent.SCROLL_TIME);
    });

    test('should call scrollTo from scrollBottom', () => {
      vi.spyOn(component, 'scrollTo').mockImplementation();

      component.scrollBottom();

      expect(component.scrollTo).toHaveBeenCalledWith(1000, ScoreComponent.SCROLL_TIME * 2);
    });
  });

  describe('setScrolling', () => {
    test('should subscribe to scrolling subjects', () => {
      vi.spyOn(component['scrollUpEvent'], 'pipe');
      vi.spyOn(component['scrollDownEvent'], 'pipe');

      component.setScrolling();

      expect(component['scrollUpEvent'].pipe).toHaveBeenCalled();
      expect(component['scrollDownEvent'].pipe).toHaveBeenCalled();
    });
  });
});
