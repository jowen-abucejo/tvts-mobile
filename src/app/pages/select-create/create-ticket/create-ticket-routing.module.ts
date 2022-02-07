import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateTicketPage } from './create-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: CreateTicketPage
  },
  {
    path: 'generate-qrcode',
    loadChildren: () => import('./generate-qrcode/generate-qrcode.module').then( m => m.GenerateQrcodePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateTicketPageRoutingModule {}
