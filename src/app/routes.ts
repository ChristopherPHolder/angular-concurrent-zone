import {Routes} from '@angular/router';

export const ROUTES: Routes = [
  {
    path: 'list/:type/:identifier',
    loadComponent: () =>
      import('./pages/movie-list-page/movie-list-page.component'),
  },
  {
    path: 'detail/movie/:identifier',
    loadComponent: () =>
      import('./pages/movie-detail-page/movie-detail-page.component'),
  },
  {
    path: 'detail/list/:identifier',
    loadChildren: () =>
      import(
        './pages/account-feature/list-detail-page/list-detail-page.routes'
        ),
  },
  {
    path: 'detail/person/:identifier',
    loadComponent: () =>
      import('./pages/person-detail-page/person-detail-page.component'),
  },
  {
    path: 'account',
    loadChildren: () =>
      import('./pages/account-feature/account-feature-page.routes'),
  },
  {
    path: 'page-not-found',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page.component'),
  },
  {
    path: '**',
    redirectTo: 'page-not-found',
  },
];
