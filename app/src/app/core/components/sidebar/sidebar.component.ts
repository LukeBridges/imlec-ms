import {Component, EventEmitter, Output} from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {

  @Output() sidenavClose = new EventEmitter();

  public features = environment.features;

  constructor() {
  }

  public onSidenavClose() {
    this.sidenavClose.emit();
  }
}
