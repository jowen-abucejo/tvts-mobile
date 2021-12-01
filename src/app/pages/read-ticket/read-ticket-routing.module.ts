import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReadTicketPage } from './read-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: ReadTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReadTicketPageRoutingModule {}
