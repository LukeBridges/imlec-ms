import {MainComponent} from './main.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppModule} from '../../../app.module';
import {AppRoutingModule} from '../../app-routing.module';
import {CUSTOM_ELEMENTS_SCHEMA, DOCUMENT} from '@angular/core';
import {Store} from '@ngrx/store';
import * as ConfigActions from '../../actions/config.actions';
import * as ContentActions from '../../actions/content.actions';
import {initialState} from '../../reducers/config.reducer';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let store: Store;
  let document: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppModule,
        AppRoutingModule,
      ],
      declarations: [MainComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    document = TestBed.inject(DOCUMENT);
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(MainComponent).toBeTruthy();
  });

  describe('ngOnInit', () => {
    test('should dispatch config, content and router actions', () => {
      vitest.spyOn(store, 'dispatch');

      component.ngOnInit();

      expect(store.dispatch).toHaveBeenCalledWith(ConfigActions.getConfig());
      expect(store.dispatch).toHaveBeenCalledWith(ContentActions.getContent());
    });
  });

  describe('primary colour effect', () => {
    test('sets the CSS custom property when config has a primary colour', () => {
      store.dispatch(ConfigActions.updateConfig({payload: {...initialState, primaryColour: '#ab1234'}}));
      fixture.detectChanges();

      expect(document.documentElement.style.getPropertyValue('--primary-colour')).toBe('#ab1234');
    });

    test('does nothing when config has no primary colour', () => {
      document.documentElement.style.removeProperty('--primary-colour');

      store.dispatch(ConfigActions.updateConfig({payload: {...initialState, primaryColour: ''}}));
      fixture.detectChanges();

      expect(document.documentElement.style.getPropertyValue('--primary-colour')).toBe('');
    });
  });
});
