import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {Action} from '@ngrx/store';
import {RouterEffects} from './router.effects';
import {Go} from '../actions/router.actions';

describe('RouterEffects', () => {
  let actions$: Observable<Action>;
  let effects: RouterEffects;
  let router: { navigate: ReturnType<typeof vitest.fn> };

  const setup = (action: Action, navigated: boolean) => {
    actions$ = of(action);
    router = {navigate: vitest.fn().mockResolvedValue(navigated)};
    TestBed.configureTestingModule({
      providers: [
        RouterEffects,
        provideMockActions(() => actions$),
        {provide: Router, useValue: router},
      ],
    });
    effects = TestBed.inject(RouterEffects);
  };

  test('should navigate and emit completion actions', async () => {
    const done = {type: 'done'};
    setup(Go({path: ['/x'], extras: {replaceUrl: true}, onCompletion: [done]}), true);

    const result = await new Promise<Action[]>(resolve => effects.go$.pipe(toArray()).subscribe(resolve));

    expect(router.navigate).toHaveBeenCalledWith(['/x'], {skipLocationChange: true, replaceUrl: true});
    expect(result).toEqual([done]);
  });

  test('should emit nothing when navigation fails', async () => {
    setup(Go({path: ['/x'], onCompletion: [{type: 'done'}]}), false);

    const result = await new Promise<Action[]>(resolve => effects.go$.pipe(toArray()).subscribe(resolve));

    expect(result).toEqual([]);
  });

  test('should emit nothing when no completion actions', async () => {
    setup(Go({path: ['/x']}), true);

    const result = await new Promise<Action[]>(resolve => effects.go$.pipe(toArray()).subscribe(resolve));

    expect(result).toEqual([]);
  });
});
