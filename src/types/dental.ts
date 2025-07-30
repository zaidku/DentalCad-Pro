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

export interface MarginPoint {
  id: string;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  timestamp: number;
}

export interface MarginLine {
  id: string;
  points: MarginPoint[];
  isComplete: boolean;
  color: string;
  thickness: number;
}

export interface PrepDetection {
  detected: boolean;
  confidence: number;
  boundingBox?: THREE.Box3;
  suggestedMargin?: MarginPoint[];
}

export interface ScanCleanupState {
  currentStage: 'upload' | 'detection' | 'margin-drawing' | 'review' | 'export';
  marginLines: MarginLine[];
  activeMarginLine: string | null;
  prepDetection: PrepDetection | null;
  isDrawingMargin: boolean;
  marginDrawingMode: 'manual' | 'auto-detect' | 'assisted';
}