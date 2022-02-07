import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReadTicketPageRoutingModule } from './read-ticket-routing.module';

import { ReadTicketPage } from './read-ticket.page';
import { SharedModule } from '../../../modules/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReadTicketPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [ReadTicketPage],
})
export class ReadTicketPageModule {}
