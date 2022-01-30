import {MainComponent} from './main.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppModule} from '../../../app.module';
import {CommonModule} from '@angular/common';
import {AppRoutingModule} from '../../app-routing.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  setupTestBed({
    imports: [
      AppModule,
      CommonModule,
      AppRoutingModule,
    ],
    declarations: [MainComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(MainComponent).toBeTruthy();
  });

  describe('ngOnInit', () => {
    test('should subscribe and dispatch events', () => {
      jest.spyOn(component['config$'], 'pipe');

      component.ngOnInit();

      expect(component['config$'].pipe).toHaveBeenCalled();
    });
  });
});
