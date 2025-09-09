import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Config} from "../../../../../../common/models/config.model";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent {

  @Output() public sidenavToggle = new EventEmitter();

  @Input() config: Config;

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
