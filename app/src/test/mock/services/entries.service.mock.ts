import {Injectable} from '@angular/core';
import {EntriesService} from '../../../app/listings/services/entries.service';
import {LocoModel} from '../../../app/core/models/loco.model';

@Injectable()
export class EntriesServiceMock extends EntriesService {

  private mockEntries = [
    new LocoModel({
      runNo: 1,
      name: 'test1',
      model: 'model1',
      builder: 'builder1',
      gauge: '5',
      arrangement: '0-4-0',
      driver: {
        name: 'driver1',
        club: 'club1',
      },
      img: '',
      time: '',
    }),
    new LocoModel({
      runNo: 2,
      name: 'test2',
      model: 'model2',
      builder: 'builder2',
      gauge: '5',
      arrangement: '0-4-0',
      driver: {
        name: 'driver2',
        club: 'club2',
      },
      img: '',
      time: '',
    }),
  ];

  public async fetchFromJson() {
    super.list = <any[]>this.mockEntries;
    return Promise.resolve();
  }
}
