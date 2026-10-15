import {HeaderComponent} from './header.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppRoutingModule} from '../../app-routing.module';
import {AppModule} from '../../../app.module';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppModule,
        AppRoutingModule,
        HeaderComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(HeaderComponent).toBeTruthy();
  });

  describe('onToggleSidenav', () => {
    test('should emit sidenavToggle', () => {
      vi.spyOn(component.sidenavToggle, 'emit').mockImplementation();

      component.onToggleSidenav();

      expect(component.sidenavToggle.emit).toHaveBeenCalled();
    });
  });

  describe('toggleToolbar', () => {
    test('should toggle the value of showToolbar', () => {
      component.showToolbar = true;

      component.toggleToolbar();

      expect(component.showToolbar).toBeFalsy();

      component.toggleToolbar();

      expect(component.showToolbar).toBeTruthy();
    });
  });
});
