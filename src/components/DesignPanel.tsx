import React, { useState } from 'react';
import { Plus, Minus, Sparkles, RotateCw } from 'lucide-react';
import { RestorationType, DesignParameters, Material } from '../types/dental';
import { use3DViewer } from '../hooks/use3DViewer';

interface DesignPanelProps {
  designParams: DesignParameters;
  onDesignParamsChange: (params: DesignParameters) => void;
}

const materials: Material[] = [
  { id: 'zirconia', name: 'Zirconia', color: '#ffffff', properties: { strength: 95, durability: 90, aesthetics: 85 } },
  { id: 'emax', name: 'Emax', color: '#fff8dc', properties: { strength: 85, durability: 80, aesthetics: 95 } },
  { id: 'pfm', name: 'PFM', color: '#ffeaa7', properties: { strength: 90, durability: 85, aesthetics: 75 } },
  { id: 'gold', name: 'Gold', color: '#ffd700', properties: { strength: 80, durability: 95, aesthetics: 60 } },
  { id: 'composite', name: 'Composite', color: '#f0f8ff', properties: { strength: 70, durability: 65, aesthetics: 90 } },
];

export const DesignPanel: React.FC<DesignPanelProps> = ({
  designParams,
  onDesignParamsChange,
}) => {
  const { addMaterial, removeMaterial, smoothModel, loadedModels } = use3DViewer();
  const [activeTab, setActiveTab] = useState<'design' | 'materials' | 'layers'>('design');
  const [restorationType, setRestorationType] = useState<RestorationType>('Crown');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('zirconia');
  const [marginColor, setMarginColor] = useState<string>('blue');
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);

  const handleParamChange = (key: keyof DesignParameters, value: any) => {
    onDesignParamsChange({
      ...designParams,
      [key]: value,
    });
  };

  const handleAddMaterial = () => {
    if (loadedModels.length > 0) {
      addMaterial(selectedModelIndex, selectedMaterial);
    }
  };

  const handleRemoveMaterial = () => {
    if (loadedModels.length > 0) {
      removeMaterial(selectedModelIndex);
    }
  };

  const handleSmoothModel = () => {
    if (loadedModels.length > 0) {
      smoothModel(selectedModelIndex, 2);
    }
  };

  const tabs = [
    { id: 'design' as const, label: 'Design' },
    { id: 'materials' as const, label: 'Materials' },
    { id: 'layers' as const, label: 'Layers' },
  ];

  const marginColors = [
    { id: 'red', color: 'bg-red-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'yellow', color: 'bg-yellow-500' },
    { id: 'green', color: 'bg-green-500' },
    { id: 'blue', color: 'bg-blue-500' },
  ];

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
      {/* Tab Navigation */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 py-1 rounded text-sm transition-all
                ${activeTab === tab.id 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'design' && (
          <div className="p-4 space-y-6">
            {/* Model Selection */}
            {loadedModels.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-white">Active Model</h3>
                <select
                  value={selectedModelIndex}
                  onChange={(e) => setSelectedModelIndex(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                >
                  {loadedModels.map((model, index) => (
                    <option key={index} value={index}>
                      Model {index + 1} ({model.userData?.fileName || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tooth Information */}
            <div>
              <h3 className="font-medium mb-3 flex items-center justify-between text-white">
                <span>Tooth #14</span>
                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                  {restorationType}
                </span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Restoration Type</label>
                  <select
                    value={restorationType}
                    onChange={(e) => setRestorationType(e.target.value as RestorationType)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Crown">Crown</option>
                    <option value="Bridge">Bridge</option>
                    <option value="Veneer">Veneer</option>
                    <option value="Inlay">Inlay</option>
                    <option value="Onlay">Onlay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Margin Line</label>
                  <div className="flex space-x-2">
                    {marginColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setMarginColor(color.id)}
                        className={`
                          w-6 h-6 rounded-full border-2 transition-all
                          ${color.color}
                          ${marginColor === color.id 
                            ? 'border-white scale-110' 
                            : 'border-transparent hover:border-gray-400'
                          }
                        `}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <h3 className="font-medium mb-3 text-white">Dimensions</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Occlusal Thickness (mm)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={designParams.occlusialThickness}
                      onChange={(e) => handleParamChange('occlusialThickness', parseFloat(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-xs w-8 text-center text-white">
                      {designParams.occlusialThickness}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Marginal Width (mm)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0.3"
                      max="1.5"
                      step="0.1"
                      value={designParams.marginalWidth}
                      onChange={(e) => handleParamChange('marginalWidth', parseFloat(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-xs w-8 text-center text-white">
                      {designParams.marginalWidth}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Contact Points</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Mesial', 'Distal', 'Both'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleParamChange('contactPoints', option)}
                        className={`
                          py-1 rounded text-xs transition-all
                          ${designParams.contactPoints === option 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          }
                        `}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Material Selection */}
            <div>
              <h3 className="font-medium mb-3 text-white">Material</h3>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterial(material.id)}
                    className={`
                      p-2 rounded cursor-pointer text-center transition-all
                      ${selectedMaterial === material.id 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }
                    `}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: material.color }}
                    />
                    <div className="text-xs">{material.name}</div>
                  </button>
                ))}
              </div>

              {/* Material Actions */}
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={handleAddMaterial}
                  disabled={loadedModels.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-xs flex items-center justify-center space-x-1 transition-colors"
                >
                  <Plus size={12} />
                  <span>Add</span>
                </button>
                <button
                  onClick={handleRemoveMaterial}
                  disabled={loadedModels.length === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-xs flex items-center justify-center space-x-1 transition-colors"
                >
                  <Minus size={12} />
                  <span>Remove</span>
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Material Thickness (mm)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={designParams.materialThickness}
                    onChange={(e) => handleParamChange('materialThickness', parseFloat(e.target.value))}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="text-xs w-8 text-center text-white">
                    {designParams.materialThickness}
                  </span>
                </div>
              </div>
            </div>

            {/* Model Operations */}
            <div>
              <h3 className="font-medium mb-3 text-white">Model Operations</h3>
              <div className="space-y-2">
                <button
                  onClick={handleSmoothModel}
                  disabled={loadedModels.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm flex items-center justify-center space-x-2 transition-colors"
                >
                  <Sparkles size={16} />
                  <span>Smooth Surface</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-white">Material Library</h3>
              
              {materials.map((material) => (
                <div key={material.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: material.color }}
                    />
                    <span className="font-medium text-white">{material.name}</span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strength:</span>
                      <span className="text-white">{material.properties.strength}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Durability:</span>
                      <span className="text-white">{material.properties.durability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Aesthetics:</span>
                      <span className="text-white">{material.properties.aesthetics}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="p-4">
            <div className="text-center text-gray-400 py-8">
              <RotateCw className="mx-auto mb-2" size={32} />
              <div>Layer Management</div>
              <div className="text-xs mt-2">Layer control and organization tools coming soon</div>
            </div>
          </div>
        )}
      </div>

      {/* Apply Changes Button */}
      <div className="p-4 border-t border-gray-800">
        <button 
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
          disabled={loadedModels.length === 0}
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};