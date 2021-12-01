import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReadTicketPageRoutingModule } from './read-ticket-routing.module';

import { ReadTicketPage } from './read-ticket.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReadTicketPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ReadTicketPage],
})
export class ReadTicketPageModule {}
