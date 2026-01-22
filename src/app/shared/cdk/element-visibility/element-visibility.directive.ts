import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  inject,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { rxActions } from '@rx-angular/state/actions';
import { observeElementVisibility } from './observe-element-visibility';
import { takeUntil } from 'rxjs';

type Actions = { visible: boolean; onDestroy: void };

@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[elementVisibility]',
})
export class ElementVisibilityDirective {
  private readonly platformId = inject(PLATFORM_ID);

  signals = rxActions<Actions>();

  @Output()
  elementVisibility = this.signals.visible$;

  constructor() {
    const elRef = inject(ElementRef);
    if (isPlatformBrowser(this.platformId)) {
      observeElementVisibility(elRef.nativeElement)
        .pipe(takeUntil(this.signals.onDestroy$))
        .subscribe(this.signals.visible);
    }
  }
}
