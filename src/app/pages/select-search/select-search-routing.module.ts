import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectSearchPage } from './select-search.page';

const routes: Routes = [
  {
    path: '',
    component: SelectSearchPage,
  },
  {
    path: 'read-ticket',
    loadChildren: () =>
      import('./read-ticket/read-ticket.module').then(
        (m) => m.ReadTicketPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectSearchPageRoutingModule {}
