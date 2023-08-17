import { Injectable } from '@angular/core';
import SlideData from '../../assets/slideData.json';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendAPIService {

  // Holds thee current searched image results
  slideData:any;

  constructor() {
    this.slideData = SlideData;
    this.slideData = this.slideData['slideData'][0];
  }

  // A method that will get the current selected image from the slide show and stores in a variable
  public getCurrentImageResults(index: number, imageName: string): void {
    this.slideData = SlideData;
    this.slideData = this.slideData['slideData'][index];
  }
}