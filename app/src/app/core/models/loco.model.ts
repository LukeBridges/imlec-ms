export class LocoModel {
  runNo: number;
  name: string;
  model?: string;
  builder?: string;
  gauge?: string;
  arrangement?: string;
  driver: {
    name: string;
    club?: string;
  };
  img: string;
  time?: string;

  constructor(config?: any) {
    // noinspection DuplicatedCode
    if (config) {
      this.runNo = config && config.runNo || 99;
      this.name = config && config.name || "";
      this.model = config && config.model || "";
      this.builder = config && config.builder || "";
      this.gauge = config && config.gauge || "";
      this.arrangement = config && config.arrangement || "";
      this.driver = config && config.driver || {name: ""};
      this.img = config && config.img || "";
      this.time = config && config.time || "";
    }
  }
}
