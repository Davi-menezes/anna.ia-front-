import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyEmailComponent } from './verify-email.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    VerifyEmailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: VerifyEmailComponent }
    ]),
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  exports: [
    VerifyEmailComponent
  ]
})
export class VerifyEmailModule { }
