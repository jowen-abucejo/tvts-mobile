import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectCreatePageRoutingModule } from './select-create-routing.module';

import { SelectCreatePage } from './select-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectCreatePageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [SelectCreatePage],
})
export class SelectCreatePageModule {}
