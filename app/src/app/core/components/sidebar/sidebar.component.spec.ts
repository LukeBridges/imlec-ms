import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SidebarComponent} from './sidebar.component';
import {initialState} from '../../reducers/config.reducer';
import {AppRoutingModule} from '../../app-routing.module';
import {AppModule} from '../../../app.module';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        AppRoutingModule,
        SidebarComponent,
      ],
    });
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    component.config = {...initialState};
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should emit sidenavClose', () => {
    const spy = vitest.fn();
    component.sidenavClose.subscribe(spy);

    component.onSidenavClose();

    expect(spy).toHaveBeenCalled();
  });
});
