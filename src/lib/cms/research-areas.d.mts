export declare const ECOHYDROLOGY: 'Ecohydrology';
export declare const SENSORS: 'Sensors';
export declare const CNH: 'Coupled Natural-Human Systems';
export declare const MISC: 'Misc';
export declare const CANONICAL_AREAS: string[];
export declare const AREA_ALIASES: Record<string, string>;
export declare const AREA_LABELS: Record<string, string>;
export declare function areaLabel(area: string): string;
export declare function mapAreas(raw?: string | null): { areas: string[]; unknown: string[] };
export declare function orderAreas(areas: string[]): string[];
export declare function inferResearchAreas(pub: {
  title?: string;
  abstract?: string;
  venue?: string;
  keywords?: string[];
}): {
  areas: string[];
  confidence: 'high' | 'low' | 'none';
  scores: Record<string, number>;
  nonResearch: boolean;
  matched: Record<string, string[]>;
};
