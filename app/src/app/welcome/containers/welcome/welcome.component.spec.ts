import {WelcomeComponent} from './welcome.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
import {AppModule} from '../../../app.module';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
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

  describe('config and content signals', () => {
    it('are exposed as signals', () => {
      expect(typeof component.config).toBe('function');
      expect(typeof component.content).toBe('function');
    });
  });

  describe('openGMap', () => {
    test('should call dialog open', () => {
      vitest.spyOn(component.dialog, 'open').mockImplementation();

      component.openGMap();

      expect(component.dialog.open).toHaveBeenCalled();
    });
  });

  describe('openMap', () => {
    test('should call dialog open', () => {
      vitest.spyOn(component.dialog, 'open').mockImplementation();

      component.openMap();

      expect(component.dialog.open).toHaveBeenCalled();
    });
  });
});
