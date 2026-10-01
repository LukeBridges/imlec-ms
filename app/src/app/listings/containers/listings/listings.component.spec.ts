import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {of} from 'rxjs';
import {Store, StoreModule} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';
import {ListingsComponent} from './listings.component';
import {EntryComponent} from '../../components/entry/entry.component';
import {CountComponent} from '../../components/count/count.component';
import * as EntriesActions from '../../actions/entries.actions';
import * as fromEntries from '../../reducers/entries.reducer';
import {LocoModel} from '../../../core/models/loco.model';
import {initialState} from '../../../core/reducers/config.reducer';
import {SpinnerComponent} from '../../../components/components/spinner/spinner.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('ListingsComponent', () => {
  let component: ListingsComponent;
  let fixture: ComponentFixture<ListingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({scores: fromEntries.reducer}),
        ContentBoxComponent,
        SpinnerComponent,
      ],
      declarations: [
        ListingsComponent,
        EntryComponent,
        CountComponent,
      ],
    });
    fixture = TestBed.createComponent(ListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    test('should dispatch getEntries when entries empty', fakeAsync(() => {
      const store = TestBed.inject(Store);
      vitest.spyOn(store, 'dispatch').mockImplementation(() => undefined);
      component.entries$ = of([]);

      component.ngOnInit();
      tick(1000);

      expect(store.dispatch).toHaveBeenCalledWith(EntriesActions.getEntries());
      expect(component.hasEntries).toBe(false);
    }));

    test('should dispatch getEntries when entries missing', fakeAsync(() => {
      const store = TestBed.inject(Store);
      vitest.spyOn(store, 'dispatch').mockImplementation(() => undefined);
      component.entries$ = of(null as any);

      component.ngOnInit();
      tick(1000);

      expect(store.dispatch).toHaveBeenCalledWith(EntriesActions.getEntries());
    }));

    test('should store entries when present', fakeAsync(() => {
      const entries = [new LocoModel({runNo: 1})];
      component.entries$ = of(entries);

      component.ngOnInit();
      tick(1000);

      expect(component.entries).toEqual(entries);
      expect(component.hasEntries).toBe(true);
    }));

    test('should store config', () => {
      const config = {...initialState};
      (component as any).config$ = of(config);

      component.ngOnInit();

      expect(component.config).toEqual(config);
    });

    test('should ignore falsy config', () => {
      (component as any).config$ = of(null);
      component.config = undefined as any;

      component.ngOnInit();

      expect(component.config).toBeUndefined();
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
