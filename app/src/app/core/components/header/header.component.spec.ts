import {HeaderComponent} from './header.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppRoutingModule} from '../../app-routing.module';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MainComponent} from '../../containers/main/main.component';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {AppModule} from '../../../app.module';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  setupTestBed({
    imports: [
      AppModule,
      AppRoutingModule,
      MatListModule,
      MatToolbarModule,
      MatSidenavModule,
      MatIconModule,
      MatButtonModule,
    ],
    declarations: [HeaderComponent, MainComponent, SidebarComponent],
    providers: [],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(HeaderComponent).toBeTruthy();
  });

  describe('onToggleSidenav', () => {
    test('should emit sidenavToggle', () => {
      jest.spyOn(component.sidenavToggle, 'emit').mockImplementation();

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
