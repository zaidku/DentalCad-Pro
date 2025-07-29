export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  lastVisit: string;
  nextVisit: string;
}

export interface TreatmentPlan {
  toothNumber: number;
  treatment: string;
  material: string;
}

export interface DesignParameters {
  occlusialThickness: number;
  marginalWidth: number;
  contactPoints: 'Mesial' | 'Distal' | 'Both';
  materialThickness: number;
}

export interface Material {
  id: string;
  name: string;
  color: string;
  properties: {
    strength: number;
    durability: number;
    aesthetics: number;
  };
}

export interface STLFile {
  id: string;
  name: string;
  file: File;
  isVisible: boolean;
  isActive: boolean;
}

export type Tool = 'design' | 'measure' | 'cut' | 'layer' | 'tooth' | 'teeth' | 'crown';
export type ViewMode = 'wireframe' | 'solid' | 'shaded' | 'xray';
export type RestorationType = 'Crown' | 'Bridge' | 'Veneer' | 'Inlay' | 'Onlay';