import {
  ApplicationConfig,
  Injectable,
  mergeApplicationConfig,
} from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { provideFastSVG, SvgLoadStrategy } from '@push-based/ngx-fast-svg';
import { join, resolve } from 'node:path';
import {cwd} from 'node:process';
import { map, Observable, of } from 'rxjs';
import { readFileSync } from 'node:fs';

@Injectable()
export class IconLoadStrategySsr implements SvgLoadStrategy {
  config(url: string): Observable<string> {
    return of(url)
  }
  load(url$: Observable<string>): Observable<string> {
    return url$.pipe(
      map((url) => readFileSync(resolve(url), { encoding: 'utf8' }))
    );
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // TODO fix this shit
    provideFastSVG({
      url: (name: string) =>
        join(
          cwd(),
          'src',
          'assets',
          'svg-icons',
          `${name}.svg`,
        ),
      svgLoadStrategy: IconLoadStrategySsr,
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
