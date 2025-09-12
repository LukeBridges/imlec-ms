import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SidebarComponent} from './sidebar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MainComponent} from '../../containers/main/main.component';
import {HeaderComponent} from '../header/header.component';
import {initialState} from '../../reducers/config.reducer';
import {AppRoutingModule} from '../../app-routing.module';
import {AppModule} from '../../../app.module';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  TestBed.configureTestingModule({
    imports: [
      AppModule,
      AppRoutingModule,
      MatListModule,
      MatToolbarModule,
      MatSidenavModule,
      MatIconModule,
      MatButtonModule,
    ],
    declarations: [SidebarComponent, MainComponent, HeaderComponent],
    providers: [],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    component.config = {...initialState};
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
