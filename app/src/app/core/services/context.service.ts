import {Inject, Injectable} from '@angular/core';
import {WINDOW} from "./window.service";

@Injectable({providedIn: 'root'})
export class ContextService {
  protected context: {
    hash: string
  };

  constructor(
    @Inject(WINDOW) window: Window,
  ) {
    // @ts-ignore
    this.context = window.IMLEC;
  }

  public get rawContext() {
    return this.context;
  }

  public get hash(): string {
    return this.context.hash
  }
}
