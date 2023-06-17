import 'jest-preset-angular/setup-jest';
import {TestBed, TestModuleMetadata, waitForAsync} from '@angular/core/testing';

// @ts-ignore
global.__webpack_public_path__ = '';

// @ts-ignore
global.setupTestBed = (
  moduleDef: TestModuleMetadata, override = null, overrideWith = null) => {
  beforeEach(waitForAsync(async () => {
    if (override) {
      TestBed.configureTestingModule(moduleDef).
        overrideModule(override, overrideWith);
    } else {
      TestBed.configureTestingModule(moduleDef);
    }
    await TestBed.compileComponents();
  }));
};
