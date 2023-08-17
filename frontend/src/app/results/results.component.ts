import { Component, OnInit, ViewChild } from '@angular/core';
import { BackendAPIService } from '../service/backend-api.service'
import {animate, state, style, transition, trigger} from '@angular/animations';
import { plainToInstance } from 'class-transformer';
import { IServerResults, ServerResults, Similarityarr, TopScore } from './interface/query_results_interface';
import { MaterialModule } from '../sharedModule/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({height: '*'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ResultsComponent implements OnInit {

  currentImageResults: IServerResults;
  displayedColumns = ['id', 'result_image', 'local_exp', 'visual_exp'];
  dataSource: MatTableDataSource<Similarityarr>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  expandedRows: any[] = [];
  queryImagePath: string = '';
  

  constructor(private backendAPIService: BackendAPIService) {
    this.queryImagePath = this.backendAPIService.queryImagePath;
    this.currentImageResults = plainToInstance(ServerResults, [JSON.parse(JSON.stringify(this.backendAPIService.slideData))])[0];
    console.log('Initial results:', this.currentImageResults);
    // console.log(this.reOrderData(JSON.parse(JSON.stringify(this.currentImageResults))));
    this.currentImageResults = this.updateServerResults(JSON.parse(JSON.stringify(this.currentImageResults)))
    console.log('Modified results:', this.currentImageResults);

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.currentImageResults.SemanticData.similarity_arr);
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
  }

  getImageUrl(filename: string): string {
    // Return the URL or path to the image based on the filename
    return '/assets/images/resultImages/' + filename;
  }

  // Triggered when the user clicks on the Visual Explanation button
  onVisualExpBtnClick(row: any): void {
  }



  // A method to re-order the data from the server
  updateServerResults(results: IServerResults): IServerResults {

    results = this.applyFileNameExtraction(JSON.parse(JSON.stringify(results)));

    results = this.calculateSimilarityScores(JSON.parse(JSON.stringify(results)));

    results = this.sortArrayTotalSimilarity(JSON.parse(JSON.stringify(results)), false);

    // Now there might be some images with averageTotalSimilarity = 0, so we need to sort them based on overallDistScore
    results = this.sortByOverallDistScore(JSON.parse(JSON.stringify(results)));

    // Also sort the overallDistScore in  data topScores
    results.Data.topScores = this.sortArrayOverallDistScoreForTopScore(JSON.parse(JSON.stringify(results.Data.topScores)), false);

    return results;
  }

  // A method which applies wherever filenames are needed
  applyFileNameExtraction(results: IServerResults): IServerResults {

    // apply to SemanticData.similarity_arr
    for (let i = 0; i < results.SemanticData.similarity_arr.length; i++) {
      results.SemanticData.similarity_arr[i].base_img_file_name = this.getFilenameFromPath(results.SemanticData.similarity_arr[i].base_img);
      results.SemanticData.similarity_arr[i].base_name_original_file_name = this.getFilenameFromPath(results.SemanticData.similarity_arr[i].base_name_original);
      results.SemanticData.similarity_arr[i].query_img_file_name = this.getFilenameFromPath(results.SemanticData.similarity_arr[i].query_img);
    }

    return results;
  }

  // A method to extract the filename from the path
  getFilenameFromPath(filePath: string): string {
    let filename: string;
  
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // For URLs
      const segments = filePath.split('/');
      filename = segments[segments.length - 1];
    } else {
      // For local file paths (not recommended for browser environment)
      filename = filePath.split('\\').pop()!;
    }
  
    return filename;
  }

  // A method to calculate the similarity scores
  calculateSimilarityScores(results: IServerResults): IServerResults  {
    // loop over through SemanticData.similarity_arr
    for (let i = 0; i < results.SemanticData.similarity_arr.length; i++) {
      // check similarity_for_obj != 0 and sim_per_facet.length > 0
      if (results.SemanticData.similarity_arr[i].similarity_for_obj != 0 && results.SemanticData.similarity_arr[i].sim_per_facet.length > 0) {
        let currentImgTotalColorSimilarity = 0;
        let currentImgTotalShapeSimilarity = 0;

        // loop over through sim_per_facet
        for (let j = 0; j < results.SemanticData.similarity_arr[i].sim_per_facet.length; j++) {
          // add sim_for_color to currentImgTotalColorSimilarity
          currentImgTotalColorSimilarity += results.SemanticData.similarity_arr[i].sim_per_facet[j].sim_for_color;
          
          // add sim_for_shape to currentImgTotalShapeSimilarity
          currentImgTotalShapeSimilarity += results.SemanticData.similarity_arr[i].sim_per_facet[j].sim_for_shape;
        }

        // calculate averageColorSimilarity
        let currentImgAverageColorSimilarity = currentImgTotalColorSimilarity / results.SemanticData.similarity_arr[i].sim_per_facet.length;
        
        // calculate averageShapeSimilarity
        let currentImgAverageShapeSimilarity = currentImgTotalShapeSimilarity / results.SemanticData.similarity_arr[i].sim_per_facet.length;

        // add averageColorSimilarity to SemanticData.similarity_arr[i].averageColorSimilarity
        results.SemanticData.similarity_arr[i].averageColorSimilarity = currentImgAverageColorSimilarity;
        
        // add averageShapeSimilarity to SemanticData.similarity_arr[i].averageShapeSimilarity
        results.SemanticData.similarity_arr[i].averageShapeSimilarity = currentImgAverageShapeSimilarity;

        // calculate averageTotalSimilarity, we calculate by assigning the following weights.
        // color: 15%, shape: 15%, overall: 70%
        results.SemanticData.similarity_arr[i].averageTotalSimilarity = (currentImgAverageColorSimilarity * 0.15) + (currentImgAverageShapeSimilarity * 0.15) + (results.SemanticData.similarity_arr[i].similarity_for_obj * 0.70);
        

      } else {
        results.SemanticData.similarity_arr[i].averageColorSimilarity = 0;
        results.SemanticData.similarity_arr[i].averageShapeSimilarity = 0;
        results.SemanticData.similarity_arr[i].averageTotalSimilarity = 0;
      }
    }

    return results;
  }

  // A method to sort the array based on averageTotalSimilarity
  sortArrayTotalSimilarity(results: IServerResults, ascdsc: boolean): IServerResults {
    let similarity_arr = results.SemanticData.similarity_arr.sort((a, b) => {
  
      if (a.averageTotalSimilarity === b.averageTotalSimilarity) {
        return 0;
      }
  
      return (ascdsc ? 1 : -1) * (a.averageTotalSimilarity > b.averageTotalSimilarity ? 1 : -1);
    });

    results.SemanticData.similarity_arr = similarity_arr;

    return results;
  }

  // A method to sort by overallDistScore
  sortByOverallDistScore(results: IServerResults): IServerResults {

    const filteredIndex = results.SemanticData.similarity_arr.findIndex(item => item.averageTotalSimilarity == 0);

    if (filteredIndex !== -1) {
      let filteredResults: Similarityarr[] = results.SemanticData.similarity_arr.splice(filteredIndex);
      
      for (const item of filteredResults) {
        // Change to single forward slash
        const tempResImgName = item.base_name_original.split('\\').pop()!.split('#')[0].split('?')[0];

        const matchingTopScore = results.Data.topScores.find(topScore =>
          tempResImgName === topScore.name.split('/').pop()!.split('#')[0].split('?')[0]
        );

        if (matchingTopScore) {
          item.overallDistScore = matchingTopScore.overallDistScore;
        }
      }

      filteredResults = this.sortArrayOverallDistScore(JSON.parse(JSON.stringify(filteredResults)), false);

      results.SemanticData.similarity_arr = results.SemanticData.similarity_arr.concat(filteredResults);
    }

    return results;
  }

  // A method to sort the array based on overallDistScore
  sortArrayOverallDistScore(results: Similarityarr[], ascdsc: boolean): Similarityarr[] {
    let similarity_arr = results.sort((a, b) => {
  
      if (a.overallDistScore === b.overallDistScore) {
        return 0;
      }
  
      return (ascdsc ? 1 : -1) * (a.overallDistScore > b.overallDistScore ? 1 : -1);
    });

    results = similarity_arr;

    return results;
  }

  // A method to sort the array based on overallDistScore
  sortArrayOverallDistScoreForTopScore(results: TopScore[], ascdsc: boolean): TopScore[] {
    let similarity_arr = results.sort((a, b) => {
  
      if (a.overallDistScore === b.overallDistScore) {
        return 0;
      }
  
      return (ascdsc ? 1 : -1) * (a.overallDistScore > b.overallDistScore ? 1 : -1);
    });

    results = similarity_arr;

    return results;
  }
}
