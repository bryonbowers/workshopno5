import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'

import {NavigationComponent} from './navigation.component'
import {RouterModule} from '@angular/router';
import { PageBComponent } from './pageB.component';

@NgModule({
  declarations: [    
    NavigationComponent,
    PageBComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
        {path : 'newPage', component : NavigationComponent},
        {path : 'pageB', component : PageBComponent}
    ])   
  ]
})
export class NavModule { }
