// TYPES
export interface BagParameters {
  bagType: string;
  size: string;
  thickness: number;
  printColors: number;
  material: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
}

export interface FactoryResult {
  factoryName: string;
  location: string;
  estimatedPriceRange: string;
  estimatedLeadTime: string;
  reviewsSummary: string;
  contact: ContactInfo;
  isFeatured?: boolean;
  keyAdvantage?: string;
  minPrice?: number;
  maxPrice?: number;
  avgLeadTimeDays?: number;
  rating?: number;
  foundMaterial?: string;
  foundPrintColors?: string | number;
  foundThickness?: string | number;
  foundSize?: string;
}

export enum AppState {
  SEARCH,
  RESULTS,
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

export type IconProps = {
    className?: string;
};
