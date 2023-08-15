import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';

//Material Imports
import {MaterialModule} from '../sharedModule/material.module';

import { CarouselModule } from 'ngx-owl-carousel-o';

import { CarouselViewComponent } from './carousel-view/carousel-view.component';
import { ImageSearchComponent } from './image-search/image-search.component';



@NgModule({
  declarations: [
    ImageSearchComponent,
    CarouselViewComponent
  ],
  imports: [
    CommonModule,
    CarouselModule,
    MaterialModule,
    AppRoutingModule
  ],
  exports: [
    ImageSearchComponent,
    CarouselViewComponent
  ]
})
export class BodyModule { }
