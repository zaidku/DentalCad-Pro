import React from 'react';
import { 
  RotateCcw, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  Box,
  History,
  Save,
  Share,
  RotateCw,
  Home
} from 'lucide-react';
import { use3DViewer } from '../hooks/use3DViewer';
import { ViewMode } from '../types/dental';

interface MainViewportProps {
  onFileLoad: (file: File) => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
}

export const MainViewport: React.FC<MainViewportProps> = ({ 
  onFileLoad, 
  activeTool, 
  onToolChange 
}) => {
  const { 
    mountRef, 
    viewMode, 
    updateViewMode, 
    setTool, 
    resetCamera,
    loadedModels,
    cleanupState
  } = use3DViewer();

  React.useEffect(() => {
    setTool(activeTool as any);
  }, [activeTool, setTool]);

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: 'wireframe', label: 'Wireframe' },
    { id: 'solid', label: 'Solid' },
    { id: 'shaded', label: 'Shaded' },
    { id: 'xray', label: 'X-ray' },
  ];

  const handleViewportAction = (action: string) => {
    switch (action) {
      case 'reset':
        resetCamera();
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Top Bar */}
      <div className="h-12 border-b border-gray-800 flex items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm bg-gray-800 rounded-full px-3 py-1 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-white">Online</span>
          </div>
          
          <div className="text-sm text-gray-400">
            Models loaded: <span className="text-orange-500">{loadedModels.length}</span>
          </div>
          {cleanupState && (
            <div className="text-sm text-gray-400">
              Stage: <span className="text-orange-500 capitalize">{cleanupState.currentStage.replace('-', ' ')}</span>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-3">
          <button className="text-gray-400 hover:text-orange-500 transition-colors">
            <History size={18} />
          </button>
          <button className="text-gray-400 hover:text-orange-500 transition-colors">
            <Save size={18} />
          </button>
          <button className="text-gray-400 hover:text-orange-500 transition-colors">
            <Share size={18} />
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />

        {/* Viewport Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm rounded-full px-2 py-1 flex space-x-2">
          <button 
            onClick={() => handleViewportAction('reset')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white transition-all"
            title="Reset Camera"
          >
            <Home size={16} />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white transition-all" title="Rotate Left">
            <RotateCcw size={16} />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white transition-all" title="Rotate Right">
            <RotateCw size={16} />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white transition-all" title="Pan">
            <Move size={16} />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white transition-all" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white transition-all" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500 text-white" title="3D View">
            <Box size={16} />
          </button>
        </div>

        {/* Viewport Options */}
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => updateViewMode(mode.id)}
                className={`
                  px-3 py-1 rounded text-xs transition-all
                  ${viewMode === mode.id 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }
                `}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tool Status */}
        <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Active Tool</div>
          <div className="text-sm text-orange-500 font-medium capitalize">{activeTool}</div>
          {activeTool === 'tooth' && cleanupState?.isDrawingMargin && (
            <div className="text-xs text-green-400 mt-1 font-medium">
              ✓ Ready to draw - Click on model to add margin points
            </div>
          )}
          {activeTool === 'tooth' && !cleanupState?.isDrawingMargin && (
            <div className="text-xs text-yellow-400 mt-1">
              Select drawing mode in Scan Cleanup panel
            </div>
          )}
          {activeTool === 'measure' && (
            <div className="text-xs text-gray-500 mt-1">Click on model to measure</div>
          )}
          {activeTool === 'cut' && (
            <div className="text-xs text-gray-500 mt-1">Click and drag to cut</div>
          )}
          {cleanupState && cleanupState.marginLines.length > 0 && (
            <div className="text-xs text-green-400 mt-1">
              Margin lines: {cleanupState.marginLines.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};