import {Inject, Injectable} from '@angular/core';
import {ContextService} from "../../../app/core/services/context.service";
import {WINDOW} from "../../../app/core/services/window.service";

@Injectable({providedIn: 'root'})
export class ContextServiceMock extends ContextService {

  constructor(@Inject(WINDOW) window: Window,) {
    super(window);
    this.context = {
      hash: 'testHash'
    };
  }
}
