import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectSearchPageRoutingModule } from './select-search-routing.module';

import { SelectSearchPage } from './select-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectSearchPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [SelectSearchPage],
})
export class SelectSearchPageModule {}
