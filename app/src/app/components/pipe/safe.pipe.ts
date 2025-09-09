/* istanbul ignore file */
import {Inject, Injectable, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable()
@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {

  constructor(@Inject(DomSanitizer) private sanitizer: DomSanitizer) {
  }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
