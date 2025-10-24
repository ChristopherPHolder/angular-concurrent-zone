import {
  Component,
  inject,
  InjectionToken,
  NgZone,
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

export type Task = {
  cancelFn?: (task: Task) => void;
  type: unknown;
  source: string;
  readonly zone: Zone;
};

type Zone = {
  cancelTask: (task: Task) => void;
  runTask: (task: Task) => void;
};

export enum TaskType {
  microTask = 'microTask',
  macroTask = 'macroTask',
  eventTask = 'eventTask',
}

export type ZoneTask = {
  stacktrace: Error;
  _task: Task;
};

export type AllTasks = {
  microTasks: ZoneTask[];
  macroTasks: ZoneTask[];
};

import 'zone.js/plugins/task-tracking';

@Component({
  imports: [NxWelcome, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'angular-stream';
  private sub$ = new Subject<void>();
  private ngZone = inject(NgZone);

  constructor() {
    if (inject(ROUTE_EXPLORATION)) {
      return;
    }

    if (!global['zone_cache']) {
      global['zone_cache'] = [];
      global['app_zone_cache'] = [];
    }


    const currentZone = global['Zone'].current;
    const appZone = (this.ngZone as any)._inner;
    console.log('App zone', appZone._properties['isAngularZone_ID']);
    const previousZone = global['zone_cache'][global['zone_cache'].length - 1];
    const previousAppZone = global['app_zone_cache'][global['app_zone_cache'].length - 1];
    global['zone_cache'].push(currentZone);
    global['app_zone_cache'].push(appZone);
    console.log('Zone cache length', global['zone_cache'].length);
    console.log('App zone cache length', global['app_zone_cache'].length);
    requestRun++;

    console.log('Request ', requestRun);
    const isSameAsPrevious = previousZone === currentZone;
    console.log('WOLOLO same as previous', isSameAsPrevious);
    const isSameAsPreviousAppZone = previousAppZone === appZone;
    console.log('WOLOLO same as previous app zone', isSameAsPreviousAppZone);
    setTimeout(() => {
      const macroTasks = this.getTasksFor(TaskType.macroTask);
      console.log(`${requestRun} Macro tasks after setTimeout`, macroTasks);
    }, 5000);

    console.log('Initializing request', requestRun);
    console.log('setTimeout start', 10_000);
     setTimeout(() => {

        console.log('Zone Cache After timeout ', global['zone_cache'].length);
        console.log('Is current zone the same as in beginning of request', currentZone === global['Zone'].current);

        const isSameAsPrevious = appZone === global['Zone'].current;
        console.log('WOLOLO same as previous in setTimeout', isSameAsPrevious);
        console.log('setTimeout end', 10_000);
      }, 10_000)


  }

  private getTasksFor(taskType: TaskType): ZoneTask[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const innerZone: any = (this.ngZone as any)._inner;
    const tasks: Task[] = innerZone._parent._properties.TaskTrackingZone.getTasksFor(taskType);

    return tasks
        // .filter((task) => task.zone === innerZone)
        .map((task) => {
            // `task.creationLocation` is an `Error` object containing the stacktrace
            // see source code https://github.com/angular/angular/blob/d1ea1f4c7f3358b730b0d94e65b00bc28cae279c/packages/zone.js/lib/zone-spec/task-tracking.ts#L40
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const creationLocation: Error = (task as any).creationLocation;

            return {
                stacktrace: creationLocation,
                _task: task,
            } satisfies ZoneTask;
        });
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





