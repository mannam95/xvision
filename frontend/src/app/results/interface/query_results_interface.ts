export class ServerResults {
    Data: Data;
    SemanticData: SemanticData;

    constructor(Data: Data, SemanticData: SemanticData) {
        this.Data = Data;
        this.SemanticData = SemanticData;
    }
}

export interface IServerResults {
    Data: Data;
    SemanticData: SemanticData;
}

interface SemanticData {
    similarity_arr: Similarityarr[];
}

export interface Similarityarr {
    base_img: string;
    base_name_original: string;
    query_img: string;
    sim_per_facet: Simperfacet[];
    similarity_for_obj: number;
    averageColorSimilarity: number;
    averageShapeSimilarity: number;
    averageTotalSimilarity: number;
    overallDistScore: number;
}

interface Simperfacet {
    sim_for_color: number;
    sim_for_shape: number;
    similarity_of_obj_type: Similarityofobjtype[];
}

interface Similarityofobjtype {
    b_box: number[];
    b_obj: string;
    base_mask_name: string;
    cat: string;
    color_code: number[];
    color_distance: number;
    color_name: string;
    q_box: number[];
    q_obj: string;
    query_mask_name: string;
    size_distance: number;
}

interface Data {
    topScores: TopScore[];
    QueryImgDetails: QueryImgDetails;
    classification_result: number[];
    classification_names: string[];
}

interface QueryImgDetails {
    overallDistScore: number;
    backforegrounddistance: number;
    colordistance: number;
    semanticcolordistance: number;
    shapedistance: number;
    HighLevelSemanticFeatureDistance: number;
    mainFeatures: MainFeatures;
}

interface TopScore {
    name: string;
    overallDistScore: number;
    backforegrounddistance: number;
    colordistance: number;
    semanticcolordistance: number;
    shapedistance: number;
    HighLevelSemanticFeatureDistance: number;
    mainFeatures: MainFeatures;
}

interface MainFeatures {
    shapesemantic: string[];
    Shape: number[];
    Color: number[];
    BackgroundForeground: number[][];
    HighLevelSemanticFeature: number[];
    colorSemanticData: number[];
}