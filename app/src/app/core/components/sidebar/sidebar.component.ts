import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Config} from '../../models/config.model';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent {

  @Output() sidenavClose = new EventEmitter();

  @Input() config: Config;

  constructor() {
  }

  public onSidenavClose() {
    this.sidenavClose.emit();
  }
}
