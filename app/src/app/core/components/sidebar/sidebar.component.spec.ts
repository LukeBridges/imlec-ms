import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SidebarComponent} from './sidebar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MainComponent} from '../../containers/main/main.component';
import {HeaderComponent} from '../header/header.component';
import {RouterModule} from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  setupTestBed({
    imports: [
      CommonModule,
      RouterModule,
      MatListModule,
      MatToolbarModule,
      MatSidenavModule,
      MatIconModule,
      MatButtonModule,
    ],
    declarations: [SidebarComponent, MainComponent, HeaderComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
