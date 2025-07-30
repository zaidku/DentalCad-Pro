import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PatientPanel } from './components/PatientPanel';
import { MainViewport } from './components/MainViewport';
import { DesignPanel } from './components/DesignPanel';
import { Tool, Patient, TreatmentPlan, STLFile, DesignParameters } from './types/dental';

// Import workflow manager
declare global {
  interface Window {
    DentalWorkflowManager: any;
  }
}

function App() {
  const [activeTool, setActiveTool] = useState<Tool>('design');
  const [stlFiles, setStlFiles] = useState<STLFile[]>([]);

  const [designParams, setDesignParams] = useState<DesignParameters>({
    occlusialThickness: 1.2,
    marginalWidth: 0.8,
    contactPoints: 'Distal',
    materialThickness: 1.0,
  });

  // Initialize workflow manager
  useEffect(() => {
    // Load the workflow manager script
    const script = document.createElement('script');
    script.src = '/src/dentalWorkflow.js';
    script.onload = () => {
      if (window.DentalWorkflowManager) {
        new window.DentalWorkflowManager();
        // Don't hide the default interface - it represents Stage 2 (Scan Clean)
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector('script[src="/src/dentalWorkflow.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

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

  const handleToolChange = (tool: string) => {
    setActiveTool(tool as Tool);
  };

  return (
    <div className="app h-screen bg-gray-900 text-white overflow-hidden">
      {/* Workflow Progress Bar will be inserted at the top by the workflow manager */}
      
      {/* Default interface - will be hidden when workflow is active */}
      <div className="default-interface flex h-full">
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
          onToolChange={handleToolChange}
        />
        
        <DesignPanel
          designParams={designParams}
          onDesignParamsChange={setDesignParams}
        />
      </div>
    </div>
  );
}

export default App;