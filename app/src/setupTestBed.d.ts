declare namespace NodeJS {
  export interface Global {
    setupTestBed: any;
    __webpack_public_path__: string;
  }
}

declare var setupTestBed: any;
declare var __webpack_public_path__: string;
