import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {Store, StoreModule} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';
import {ListingsComponent} from './listings.component';
import * as EntriesActions from '../../actions/entries.actions';
import * as fromEntries from '../../reducers/entries.reducer';
import * as fromConfig from '../../../core/reducers/config.reducer';
import * as ConfigActions from '../../../core/actions/config.actions';
import {LocoModel} from '../../../core/models/loco.model';
import {initialState} from '../../../core/reducers/config.reducer';

describe('ListingsComponent', () => {
  let component: ListingsComponent;
  let fixture: ComponentFixture<ListingsComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({entries: fromEntries.reducer, config: fromConfig.reducer}),
        ListingsComponent,
      ],
    });
    fixture = TestBed.createComponent(ListingsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('entries signal', () => {
    test('reflects entries dispatched to the store', () => {
      const entries = [new LocoModel({runNo: 1})];
      store.dispatch(EntriesActions.updateEntries({payload: entries}));

      expect(component.entries()).toEqual(entries);
      expect(component.hasEntries).toBe(true);
    });

    test('is empty when no entries have been dispatched', () => {
      expect(component.hasEntries).toBe(false);
    });
  });

  describe('config signal', () => {
    test('reflects config dispatched to the store', () => {
      const config = {...initialState};
      store.dispatch(ConfigActions.updateConfig({payload: config}));

      expect(component.config()).toEqual(config);
    });
  });

  describe('ngOnInit', () => {
    test('should dispatch getEntries when entries empty', () => {
      vitest.useFakeTimers();
      vitest.spyOn(store, 'dispatch').mockImplementation(() => undefined);
      (component as any).entries$ = of([]);

      component.ngOnInit();
      vitest.advanceTimersByTime(1000);

      expect(store.dispatch).toHaveBeenCalledWith(EntriesActions.getEntries());
      vitest.useRealTimers();
    });

    test('should dispatch getEntries when entries missing', () => {
      vitest.useFakeTimers();
      vitest.spyOn(store, 'dispatch').mockImplementation(() => undefined);
      (component as any).entries$ = of(null as any);

      component.ngOnInit();
      vitest.advanceTimersByTime(1000);

      expect(store.dispatch).toHaveBeenCalledWith(EntriesActions.getEntries());
      vitest.useRealTimers();
    });

    test('should not dispatch getEntries when entries present', () => {
      vitest.useFakeTimers();
      vitest.spyOn(store, 'dispatch').mockImplementation(() => undefined);
      (component as any).entries$ = of([new LocoModel({runNo: 1})]);

      component.ngOnInit();
      vitest.advanceTimersByTime(1000);

      expect(store.dispatch).not.toHaveBeenCalledWith(EntriesActions.getEntries());
      vitest.useRealTimers();
    });
  });

  describe('ngOnDestroy', () => {
    test('should complete unsubscribe subject', () => {
      const spy = vitest.fn();
      component['ngUnsubscribe$'].subscribe({complete: spy});

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });
  });
});
