import {Component, EventEmitter, HostListener, Output} from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  @Output() public sidenavToggle = new EventEmitter();

  public features = environment.features;

  showToolbar = true;

  constructor() {
  }

  @HostListener('document:keydown.shift.m') onToggleSidenav() {
    this.sidenavToggle.emit();
  }

  @HostListener('document:keydown.shift.f') toggleToolbar() {
    this.showToolbar = !this.showToolbar;
  }
}
