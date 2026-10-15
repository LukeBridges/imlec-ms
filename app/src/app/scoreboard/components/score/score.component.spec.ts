import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScoresService} from '../../services/scores.service';
import {ScoresServiceMock} from '../../../../test/mock/services/scores.service.mock';
import {ScoreComponent} from './score.component';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
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
        ScoreComponent,
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
    test('should subscribe to completeScores', () => {
      const newScores = [
        new ScoreModel({runNo: 1})
      ];
      component.completeScores = of(newScores);
      vi.spyOn(component.completeScores, 'subscribe');
      component.scores = [];

      component.ngOnInit();

      expect(component.completeScores.subscribe).toHaveBeenCalled();
      expect(component.scores).toEqual(newScores);
    });
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

  describe('captureRowRects', () => {
    test('should return empty map when no rows rendered', () => {
      component.rowEls = undefined as any;

      expect(component.captureRowRects().size).toEqual(0);
    });

    test('should key rects and record places by run number', () => {
      component.scores = [new ScoreModel({runNo: 7})];
      component.rowEls = {
        forEach: (cb: any) => [{nativeElement: {
          style: {},
          classList: {remove: vi.fn()},
          getBoundingClientRect: () => ({top: 42} as DOMRect),
        }}].forEach(cb),
      } as any;

      const rects = component.captureRowRects();

      expect(rects.get(7)?.top).toEqual(42);
      expect(component.trend(7, 1)).toEqual('same');
    });

    test('should record a numeric score signature', () => {
      component.scores = [new ScoreModel({runNo: 1, workDone: 10000, coalUsed: 1.5})];
      component.rowEls = {
        forEach: (cb: any) => [{nativeElement: {
          style: {},
          classList: {remove: vi.fn()},
          getBoundingClientRect: () => ({top: 10} as DOMRect),
        }}].forEach(cb),
      } as any;

      component.captureRowRects();

      expect(component['previousScores'].get(1)).toEqual(component.scores[0].score);
    });

    test('should record a dnf score signature', () => {
      component.scores = [new ScoreModel({runNo: 1, workDone: 0, coalUsed: 0})];
      component.rowEls = {
        forEach: (cb: any) => [{nativeElement: {
          style: {},
          classList: {remove: vi.fn()},
          getBoundingClientRect: () => ({top: 10} as DOMRect),
        }}].forEach(cb),
      } as any;

      component.captureRowRects();

      expect(component['previousScores'].get(1)).toEqual('dnf');
    });

    test('should skip rows with no matching score', () => {
      component.scores = [];
      component.rowEls = {
        forEach: (cb: any) => [{nativeElement: {
          style: {},
          classList: {remove: vi.fn()},
          getBoundingClientRect: () => ({top: 1} as DOMRect),
        }}].forEach(cb),
      } as any;

      expect(component.captureRowRects().size).toEqual(0);
    });
  });

  describe('hasScored', () => {
    test('should return true for a numeric score', () => {
      expect(component.hasScored(new ScoreModel({runNo: 1, workDone: 10000, coalUsed: 1.5}))).toBeTruthy();
    });

    test('should return false for a dnf row', () => {
      expect(component.hasScored(new ScoreModel({runNo: 1, workDone: 0, coalUsed: 0}))).toBeFalsy();
    });

    test('should return false for a row that has not run yet', () => {
      expect(component.hasScored(new ScoreModel({runNo: 1}))).toBeFalsy();
    });
  });

  describe('trend', () => {
    test('should return same when no previous place recorded', () => {
      expect(component.trend(1, 1)).toEqual('same');
    });

    test('should return same when place unchanged', () => {
      component['previousPlaces'].set(1, 2);

      expect(component.trend(1, 2)).toEqual('same');
    });

    test('should return up when place improved to a lower number', () => {
      component['previousPlaces'].set(1, 5);

      expect(component.trend(1, 2)).toEqual('up');
    });

    test('should return down when place worsened to a higher number', () => {
      component['previousPlaces'].set(1, 2);

      expect(component.trend(1, 5)).toEqual('down');
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
