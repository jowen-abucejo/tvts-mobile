import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectCreatePage } from './select-create.page';

const routes: Routes = [
  {
    path: '',
    component: SelectCreatePage
  },
  {
    path: 'create-ticket',
    loadChildren: () => import('./create-ticket/create-ticket.module').then( m => m.CreateTicketPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectCreatePageRoutingModule {}
