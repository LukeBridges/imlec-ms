import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FlipNumberComponent} from './flip-number.component';

describe('FlipNumberComponent', () => {
  let component: FlipNumberComponent;
  let fixture: ComponentFixture<FlipNumberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlipNumberComponent],
    });
    fixture = TestBed.createComponent(FlipNumberComponent);
    component = fixture.debugElement.componentInstance;
  });

  afterEach(() => {
    vitest.useRealTimers();
    delete (window as any).matchMedia;
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    test('should set display value directly on first change, no ticking', () => {
      component.ngOnChanges({
        value: {firstChange: true, previousValue: undefined, currentValue: 5, isFirstChange: () => true},
      });

      expect(component.displayValue()).toEqual(5);
    });

    test('should ignore changes to other inputs', () => {
      component.ngOnChanges({});

      expect(component.displayValue()).toEqual(0);
    });

    test('should do nothing when value unchanged', () => {
      component.ngOnChanges({
        value: {firstChange: false, previousValue: 3, currentValue: 3, isFirstChange: () => false},
      });

      expect(component.displayValue()).toEqual(0);
    });

    test('should tick upward from previous to current value', () => {
      vitest.useFakeTimers();

      component.ngOnChanges({
        value: {firstChange: false, previousValue: 1, currentValue: 3, isFirstChange: () => false},
      });

      vitest.advanceTimersByTime(90);
      expect(component.displayValue()).toEqual(2);
      expect(component.flip()).toBeTruthy();

      vitest.advanceTimersByTime(90);
      expect(component.displayValue()).toEqual(3);
    });

    test('should tick downward from previous to current value', () => {
      vitest.useFakeTimers();

      component.ngOnChanges({
        value: {firstChange: false, previousValue: 3, currentValue: 1, isFirstChange: () => false},
      });

      vitest.advanceTimersByTime(180);

      expect(component.displayValue()).toEqual(1);
    });

    test('should turn flip off again after the flip duration', () => {
      vitest.useFakeTimers();

      component.ngOnChanges({
        value: {firstChange: false, previousValue: 1, currentValue: 2, isFirstChange: () => false},
      });
      vitest.advanceTimersByTime(90);
      expect(component.flip()).toBeTruthy();

      vitest.advanceTimersByTime(150);
      expect(component.flip()).toBeFalsy();
    });

    test('should jump straight to target when reduced motion is preferred', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: vitest.fn().mockReturnValue({matches: true}),
        configurable: true,
      });

      component.ngOnChanges({
        value: {firstChange: false, previousValue: 1, currentValue: 5, isFirstChange: () => false},
      });

      expect(component.displayValue()).toEqual(5);
    });

    test('should restart ticking when a new value arrives mid-tick', () => {
      vitest.useFakeTimers();

      component.ngOnChanges({
        value: {firstChange: false, previousValue: 1, currentValue: 5, isFirstChange: () => false},
      });
      vitest.advanceTimersByTime(90);
      expect(component.displayValue()).toEqual(2);

      component.ngOnChanges({
        value: {firstChange: false, previousValue: 5, currentValue: 8, isFirstChange: () => false},
      });
      vitest.advanceTimersByTime(90 * 3);

      expect(component.displayValue()).toEqual(8);
    });
  });

  describe('ngOnDestroy', () => {
    test('should clear pending timers', () => {
      vitest.useFakeTimers();
      const clearIntervalSpy = vitest.spyOn(globalThis, 'clearInterval');
      const clearTimeoutSpy = vitest.spyOn(globalThis, 'clearTimeout');

      component.ngOnChanges({
        value: {firstChange: false, previousValue: 1, currentValue: 3, isFirstChange: () => false},
      });
      component.ngOnDestroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
