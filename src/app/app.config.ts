import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideFastSVG } from '@push-based/ngx-fast-svg';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tmdbContentTypeInterceptor } from './data-access/api/tmdbContentTypeInterceptor';
import { tmdbReadAccessInterceptor } from './auth/tmdb-http-interceptor.feature';
import { provideTmdbImageLoader } from './data-access/images/image-loader';
import { provideRouter } from '@angular/router';
import { ROUTES } from './routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(
      withInterceptors([tmdbContentTypeInterceptor, tmdbReadAccessInterceptor])
    ),
    provideTmdbImageLoader(),
    provideFastSVG({
      url: (name: string) => `assets/svg-icons/${name}.svg`,
    }),
    provideRouter(ROUTES),
    provideClientHydration(withEventReplay()),
  ],
};
