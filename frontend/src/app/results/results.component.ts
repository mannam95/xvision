import { Component, OnInit } from '@angular/core';
import { BackendAPIService } from '../service/backend-api.service'
import {animate, state, style, transition, trigger} from '@angular/animations';
import { plainToClass, plainToInstance } from 'class-transformer';
import { IServerResults, ServerResults, Similarityarr } from './interface/query_results_interface';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ResultsComponent implements OnInit {

  currentImageResults: IServerResults;
  dataSource = ELEMENT_DATA;
  columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  expandedElement: PeriodicElement | null;
  

  constructor(private backendAPIService: BackendAPIService) { 
    this.currentImageResults = plainToInstance(ServerResults, [JSON.parse(JSON.stringify(this.backendAPIService.slideData))])[0];
    this.expandedElement = null;
    console.log('Initial results:', this.currentImageResults);
    // console.log(this.reOrderData(JSON.parse(JSON.stringify(this.currentImageResults))));
    this.currentImageResults = this.updateServerResults(JSON.parse(JSON.stringify(this.currentImageResults)))
    console.log('Modified results:', this.currentImageResults);
  }

  ngOnInit(): void {
  }

  // A method to re-order the data from the server
  updateServerResults(results: IServerResults): IServerResults {

    results = this.calculateSimilarityScores(JSON.parse(JSON.stringify(results)));

    results = this.sortArrayTotalSimilarity(JSON.parse(JSON.stringify(results)), false);

    // Now there might be some images with averageTotalSimilarity = 0, so we need to sort them based on overallDistScore
    results = this.sortByOverallDistScore(JSON.parse(JSON.stringify(results)));

    return results;
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
}


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}


const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`,
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    symbol: 'He',
    description: `Helium is a chemical element with symbol He and atomic number 2. It is a
        colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas
        group in the periodic table. Its boiling point is the lowest among all the elements.`,
  },
  {
    position: 3,
    name: 'Lithium',
    weight: 6.941,
    symbol: 'Li',
    description: `Lithium is a chemical element with symbol Li and atomic number 3. It is a soft,
        silvery-white alkali metal. Under standard conditions, it is the lightest metal and the
        lightest solid element.`,
  },
  {
    position: 4,
    name: 'Beryllium',
    weight: 9.0122,
    symbol: 'Be',
    description: `Beryllium is a chemical element with symbol Be and atomic number 4. It is a
        relatively rare element in the universe, usually occurring as a product of the spallation of
        larger atomic nuclei that have collided with cosmic rays.`,
  },
  {
    position: 5,
    name: 'Boron',
    weight: 10.811,
    symbol: 'B',
    description: `Boron is a chemical element with symbol B and atomic number 5. Produced entirely
        by cosmic ray spallation and supernovae and not by stellar nucleosynthesis, it is a
        low-abundance element in the Solar system and in the Earth's crust.`,
  },
  {
    position: 6,
    name: 'Carbon',
    weight: 12.0107,
    symbol: 'C',
    description: `Carbon is a chemical element with symbol C and atomic number 6. It is nonmetallic
        and tetravalent—making four electrons available to form covalent chemical bonds. It belongs
        to group 14 of the periodic table.`,
  },
  {
    position: 7,
    name: 'Nitrogen',
    weight: 14.0067,
    symbol: 'N',
    description: `Nitrogen is a chemical element with symbol N and atomic number 7. It was first
        discovered and isolated by Scottish physician Daniel Rutherford in 1772.`,
  },
  {
    position: 8,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    description: `Oxygen is a chemical element with symbol O and atomic number 8. It is a member of
         the chalcogen group on the periodic table, a highly reactive nonmetal, and an oxidizing
         agent that readily forms oxides with most elements as well as with other compounds.`,
  },
  {
    position: 9,
    name: 'Fluorine',
    weight: 18.9984,
    symbol: 'F',
    description: `Fluorine is a chemical element with symbol F and atomic number 9. It is the
        lightest halogen and exists as a highly toxic pale yellow diatomic gas at standard
        conditions.`,
  },
  {
    position: 10,
    name: 'Neon',
    weight: 20.1797,
    symbol: 'Ne',
    description: `Neon is a chemical element with symbol Ne and atomic number 10. It is a noble gas.
        Neon is a colorless, odorless, inert monatomic gas under standard conditions, with about
        two-thirds the density of air.`,
  },
];
