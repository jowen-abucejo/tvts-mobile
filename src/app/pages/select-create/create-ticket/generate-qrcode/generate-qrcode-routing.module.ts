import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenerateQrcodePage } from './generate-qrcode.page';

const routes: Routes = [
  {
    path: '',
    component: GenerateQrcodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerateQrcodePageRoutingModule {}
