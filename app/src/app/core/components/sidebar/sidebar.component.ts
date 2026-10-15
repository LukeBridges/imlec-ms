import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {Config} from "../../../../../../common/models/config.model";

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule]
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
