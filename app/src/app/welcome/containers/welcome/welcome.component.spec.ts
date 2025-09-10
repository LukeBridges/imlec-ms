import {WelcomeComponent} from './welcome.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
import {WelcomeRoutingModule} from '../../welcome-routing.module';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {CoreModule} from '../../../core/core.module';
import {AppModule} from '../../../app.module';
import {take} from 'rxjs/operators';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        CoreModule,
        WelcomeRoutingModule,
        MatButtonModule,
        MatDialogModule,
        ContentBoxComponent,
      ],
      declarations: [
        WelcomeComponent,
      ],
      providers: [
        WINDOW_PROVIDERS,
      ],
    });
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.debugElement.componentInstance;
  });

  test('should create', () => {
    expect(WelcomeComponent).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should sub to content and config', () => {

      component.ngOnInit();
    });
  });

  describe('ngOnDestroy', () => {
    test('should unsubscribe', (done) => {
      component['ngUnsubscribe$'].pipe(take(1)).subscribe(() => {
        done();
      });

      component.ngOnDestroy();
    });
  });

  describe('openGMap', () => {
    test('should call dialog open', () => {
      jest.spyOn(component.dialog, 'open').mockImplementation();

      component.openGMap();

      expect(component.dialog.open).toHaveBeenCalled();
    });
  });

  describe('openMap', () => {
    test('should call dialog open', () => {
      jest.spyOn(component.dialog, 'open').mockImplementation();

      component.openMap();

      expect(component.dialog.open).toHaveBeenCalled();
    });
  });
});
