import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from './custom-input/custom-input.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [CustomInputComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
  ],
  exports: [CustomInputComponent],
})
export class SharedModule {}
