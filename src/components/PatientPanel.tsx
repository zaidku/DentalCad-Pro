import React from 'react';
import { User, Upload, Eye, EyeOff, Trash2, Download } from 'lucide-react';
import { Patient, TreatmentPlan, STLFile } from '../types/dental';
import { use3DViewer } from '../hooks/use3DViewer';

interface PatientPanelProps {
  patient: Patient;
  treatmentPlan: TreatmentPlan[];
  stlFiles: STLFile[];
  onFileUpload: (files: FileList) => void;
  onFileToggle: (fileId: string) => void;
}

export const PatientPanel: React.FC<PatientPanelProps> = ({
  patient,
  treatmentPlan,
  stlFiles,
  onFileUpload,
  onFileToggle,
}) => {
  const { loadSTLFile, clearModels } = use3DViewer();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      const stlFiles = Array.from(files).filter(file => 
        file.name.toLowerCase().endsWith('.stl')
      );
      
      for (const file of stlFiles) {
        await loadSTLFile(file);
      }
      
      onFileUpload(files);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearAll = () => {
    clearModels();
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Case Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-lg text-white">Patient Case</h2>
        <div className="text-sm text-gray-400">Case #DC-2023-4872</div>
      </div>

      {/* Patient Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <div className="font-medium text-white">{patient.name}</div>
            <div className="text-xs text-gray-400">{patient.gender}, {patient.age} years</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Last Visit</div>
            <div className="text-white">{patient.lastVisit}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Next Visit</div>
            <div className="text-white">{patient.nextVisit}</div>
          </div>
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-medium mb-2 flex items-center justify-between text-white">
          <span>Treatment Plan</span>
          <button className="text-xs text-orange-500 hover:text-orange-400 transition-colors">
            Edit
          </button>
        </h3>

        <div className="space-y-2">
          {treatmentPlan.map((plan, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800 rounded">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
                {plan.toothNumber}
              </div>
              <div className="text-sm text-white">{plan.treatment} - {plan.material}</div>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="p-4 border-b border-gray-800 flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-white">Scan Files</h3>
          <button
            onClick={handleClearAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
            title="Clear all models"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-4 mb-3 text-center cursor-pointer transition-colors ${
            isUploading 
              ? 'border-orange-500 bg-orange-500/10' 
              : 'border-gray-600 hover:border-orange-500'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          {isUploading ? (
            <>
              <div className="animate-spin mx-auto text-orange-500 mb-2" style={{ width: 24, height: 24 }}>
                ⟳
              </div>
              <div className="text-sm text-white">Uploading...</div>
            </>
          ) : (
            <>
              <Upload className="mx-auto text-orange-500 mb-2" size={24} />
              <div className="text-sm text-white">Drag & drop STL files here</div>
              <div className="text-xs text-gray-500 mt-1">or click to browse</div>
            </>
          )}
          <input
            type="file"
            id="fileInput"
            accept=".stl"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Uploaded Files ({stlFiles.length}):</span>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {stlFiles.map((file) => (
            <div key={file.id} className="flex items-center space-x-2 p-2 bg-gray-800 hover:bg-gray-750 rounded text-sm transition-colors">
              <div className={`w-2 h-2 rounded-full ${file.isVisible ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="truncate flex-1 text-white">{file.name}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => onFileToggle(file.id)}
                  className={`transition-colors ${
                    file.isVisible ? 'text-green-500 hover:text-green-400' : 'text-gray-400 hover:text-green-500'
                  }`}
                  title={file.isVisible ? 'Hide model' : 'Show model'}
                >
                  {file.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>
          ))}
          {stlFiles.length === 0 && (
            <div className="text-center text-gray-500 text-xs py-4">
              No STL files uploaded yet
            </div>
          )}
        </div>
      </div>

      {/* Send to Production */}
      <div className="p-4">
        <button 
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          disabled={stlFiles.length === 0}
        >
          <Download size={16} />
          <span>Send to Production</span>
        </button>
      </div>
    </div>
  );
};