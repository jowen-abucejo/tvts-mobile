import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenerateQrcodePageRoutingModule } from './generate-qrcode-routing.module';

import { GenerateQrcodePage } from './generate-qrcode.page';
import { SharedModule } from '../../../../modules/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenerateQrcodePageRoutingModule,
    SharedModule,
  ],
  declarations: [GenerateQrcodePage],
})
export class GenerateQrcodePageModule {}
