import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PatientPanel } from './components/PatientPanel';
import { MainViewport } from './components/MainViewport';
import { ScanCleanupPanel } from './components/ScanCleanupPanel';
import { Tool, Patient, TreatmentPlan, STLFile, DesignParameters } from './types/dental';
import { useScanCleanup } from './hooks/useScanCleanup';
import { use3DViewer } from './hooks/use3DViewer';

function App() {
  const [activeTool, setActiveTool] = useState<Tool>('design');
  const [stlFiles, setStlFiles] = useState<STLFile[]>([
    { id: '1', name: 'upper_jaw.stl', file: new File([], 'upper_jaw.stl'), isVisible: true, isActive: false },
    { id: '2', name: 'lower_jaw.stl', file: new File([], 'lower_jaw.stl'), isVisible: true, isActive: false },
    { id: '3', name: 'prep_14.stl', file: new File([], 'prep_14.stl'), isVisible: true, isActive: true },
  ]);

  const [designParams, setDesignParams] = useState<DesignParameters>({
    occlusialThickness: 1.2,
    marginalWidth: 0.8,
    contactPoints: 'Distal',
    materialThickness: 1.0,
  });

  const {
    cleanupState,
    startMarginDrawing,
    completeMarginLine,
    applyAutoDetectedMargin,
    deleteMarginLine,
    clearAllMarginLines,
    exportFiles,
    setCurrentStage,
  } = useScanCleanup();

  const { loadedModels } = use3DViewer();

  const patient: Patient = {
    id: '1',
    name: 'John Smith',
    age: 42,
    gender: 'Male',
    lastVisit: '2023-06-15',
    nextVisit: '2023-07-20',
  };

  const treatmentPlan: TreatmentPlan[] = [
    { toothNumber: 14, treatment: 'Crown', material: 'Zirconia' },
    { toothNumber: 19, treatment: 'Implant', material: 'Crown' },
    { toothNumber: 30, treatment: 'Onlay', material: 'Emax' },
  ];

  const handleFileUpload = (files: FileList) => {
    const newFiles: STLFile[] = Array.from(files)
      .filter(file => file.name.endsWith('.stl'))
      .map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        file,
        isVisible: true,
        isActive: false,
      }));

    setStlFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileToggle = (fileId: string) => {
    setStlFiles(prev =>
      prev.map(file =>
        file.id === fileId ? { ...file, isVisible: !file.isVisible } : file
      )
    );
  };

  const handleFileLoad = (file: File) => {
    // This would be called from the 3D viewer when a file is loaded
    console.log('Loading file:', file.name);
  };

  const handleExportFiles = () => {
    if (loadedModels.length > 0) {
      const primaryModel = loadedModels[0];
      const filename = stlFiles[0]?.name.replace('.stl', '') || 'model';
      exportFiles(primaryModel, filename);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 overflow-hidden">
      <Sidebar activeTool={activeTool} onToolChange={setActiveTool} />
      
      <PatientPanel
        patient={patient}
        treatmentPlan={treatmentPlan}
        stlFiles={stlFiles}
        onFileUpload={handleFileUpload}
        onFileToggle={handleFileToggle}
      />
      
      <MainViewport 
        onFileLoad={handleFileLoad} 
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />
      
      <ScanCleanupPanel
        cleanupState={cleanupState}
        onStartMarginDrawing={startMarginDrawing}
        onCompleteMarginLine={completeMarginLine}
        onApplyAutoDetectedMargin={applyAutoDetectedMargin}
        onDeleteMarginLine={deleteMarginLine}
        onClearAllMarginLines={clearAllMarginLines}
        onExportFiles={handleExportFiles}
        onStageChange={setCurrentStage}
        hasModels={stlFiles.length > 0}
      />
    </div>
  );
}

export default App;