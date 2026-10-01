import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {Config} from "../../../../../../common/models/config.model";

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SidebarComponent {

  @Output() sidenavClose = new EventEmitter();

  // @ts-ignore
  @Input() config: Config;

  constructor() {
  }

  public onSidenavClose() {
    this.sidenavClose.emit();
  }
}
