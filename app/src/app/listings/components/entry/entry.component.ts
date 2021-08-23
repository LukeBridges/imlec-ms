import {Component, Input, OnChanges} from '@angular/core';
import {LocoModel} from '../../../core/models/loco.model';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class EntryComponent implements OnChanges {

  @Input() entries: LocoModel[];

  public fridayEntries: LocoModel[];
  public saturdayEntries: LocoModel[];
  public sundayEntries: LocoModel[];
  public reserveEntries: LocoModel[];

  constructor() {
  }

  ngOnChanges() {
    this.fridayEntries = this.entries.slice(0, 8);
    this.saturdayEntries = this.entries.slice(8, 19);
    this.sundayEntries = this.entries.slice(19, 27);
    this.reserveEntries = this.entries.slice(27);
  }

  parseTime(time): string {
    let timeStr = time + '';
    if (timeStr.length < 4) {
      timeStr = '0' + time;
    }
    return timeStr.substring(0, 2) + ':' + timeStr.substring(2, 4);
  }

  get url() {
    return environment.url;
  }

  get hasReserves(): boolean {
    return this.reserveEntries.length > 0;
  }
}
