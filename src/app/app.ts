import {
  Component,
  inject,
  InjectionToken,
  PLATFORM_ID,
  REQUEST_CONTEXT,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { Subject } from 'rxjs';
import { isPlatformServer } from '@angular/common';

export const ROUTE_EXPLORATION = new InjectionToken<boolean>('REQUEST_EXPLORATION', {
  providedIn: 'root',
  factory: () => isPlatformServer(inject(PLATFORM_ID)) && Object.is(inject(REQUEST_CONTEXT), null),
});

let requestRun = 0;

@Component({
  imports: [NxWelcome, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'angular-stream';
  private sub$ = new Subject<void>();

  constructor() {
    if (inject(ROUTE_EXPLORATION)) {
      return;
    }

    if (!global['zone_cache']) {
      global['zone_cache'] = []
    }


    const currentZone = global['Zone'].current;
    const previousZone = global['zone_cache'][global['zone_cache'].length - 1];
    global['zone_cache'].push(currentZone);
    console.log('Zone cache length', global['zone_cache'].length);

    requestRun++;

    console.log('Request ', requestRun);
      const isSameAsPrevious = previousZone === currentZone;
      console.log('WOLOLO same as previous', isSameAsPrevious);


    console.log('Initializing request', requestRun);
      console.log('setTimeout start', 10_000);
      setTimeout(() => {

        console.log('Zone Cache After timeout ', global['zone_cache'].length);
        console.log('Is current zone the same as inn beginning of request', currentZone === global['Zone'].current);

          const isSameAsPrevious = previousZone === currentZone;
          console.log('WOLOLO same as previous', isSameAsPrevious);
        console.log('setTimeout end', 10_000);
      }, 10_000)


  }

  private isSameZoneAsPrevious(currentZone: any, zoneCache: any[]): boolean {
    // Check if current zone is the same as any previous zone (excluding itself)
    for (let i = 0; i < zoneCache.length - 1; i++) {
      if (Object.is(currentZone, zoneCache[i])) {
        return true;
      }
    }
    return false;
  }
}





