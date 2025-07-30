import React from 'react';
import { 
  Upload, 
  Search, 
  PenTool, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Hand,
  Target
} from 'lucide-react';
import { ScanCleanupState, MarginLine } from '../types/dental';

interface ScanCleanupPanelProps {
  cleanupState: ScanCleanupState;
  onStartMarginDrawing: (mode: 'manual' | 'auto-detect' | 'assisted') => void;
  onCompleteMarginLine: () => void;
  onApplyAutoDetectedMargin: () => void;
  onDeleteMarginLine: (lineId: string) => void;
  onClearAllMarginLines: () => void;
  onExportFiles: () => void;
  onStageChange: (stage: ScanCleanupState['currentStage']) => void;
  hasModels: boolean;
}

export const ScanCleanupPanel: React.FC<ScanCleanupPanelProps> = ({
  cleanupState,
  onStartMarginDrawing,
  onCompleteMarginLine,
  onApplyAutoDetectedMargin,
  onDeleteMarginLine,
  onClearAllMarginLines,
  onExportFiles,
  onStageChange,
  hasModels,
}) => {
  const { currentStage, marginLines, prepDetection, isDrawingMargin, marginDrawingMode } = cleanupState;

  const stages = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'detection', label: 'Detection', icon: Search },
    { id: 'margin-drawing', label: 'Margin', icon: PenTool },
    { id: 'review', label: 'Review', icon: Eye },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const getStageStatus = (stageId: string) => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-lg text-white mb-2">Scan Cleanup</h2>
        
        {/* Stage Progress */}
        <div className="flex items-center space-x-2 mb-3">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage.id);
            const Icon = stage.icon;
            
            return (
              <div key={stage.id} className="flex items-center">
                <button
                  onClick={() => onStageChange(stage.id as any)}
                  disabled={!hasModels && stage.id !== 'upload'}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all
                    ${status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : status === 'active'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                    }
                    ${!hasModels && stage.id !== 'upload' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
                  `}
                  title={stage.label}
                >
                  <Icon size={14} />
                </button>
                {index < stages.length - 1 && (
                  <div className={`w-4 h-0.5 ${status === 'completed' ? 'bg-green-500' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-gray-400">
          Stage: <span className="text-orange-500 capitalize">{currentStage.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Upload Stage */}
        {currentStage === 'upload' && (
          <div className="p-4">
            <div className="text-center text-gray-400 py-8">
              <Upload className="mx-auto mb-4" size={48} />
              <h3 className="font-medium text-white mb-2">Upload STL Files</h3>
              <p className="text-sm mb-4">
                Upload your scanned models to begin the cleanup process
              </p>
              <div className="text-xs bg-gray-800 rounded p-3">
                <div className="font-medium text-white mb-1">Supported Files:</div>
                <div>• STL files with prep areas</div>
                <div>• Multiple models supported</div>
                <div>• Automatic prep detection</div>
              </div>
            </div>
          </div>
        )}

        {/* Detection Stage */}
        {currentStage === 'detection' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="text-orange-500" size={20} />
              <h3 className="font-medium text-white">Prep Detection</h3>
            </div>

            {prepDetection ? (
              <div className="space-y-4">
                <div className={`p-3 rounded-lg border ${
                  prepDetection.detected 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-yellow-900/20 border-yellow-500/30'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {prepDetection.detected ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <AlertCircle className="text-yellow-500" size={16} />
                    )}
                    <span className="font-medium text-white">
                      {prepDetection.detected ? 'Prep Detected' : 'No Prep Detected'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-2">
                    Confidence: {Math.round(prepDetection.confidence * 100)}%
                  </div>
                  
                  {prepDetection.suggestedMargin && (
                    <div className="text-sm text-gray-300">
                      Suggested margin points: {prepDetection.suggestedMargin.length}
                    </div>
                  )}
                </div>

                {prepDetection.detected && prepDetection.suggestedMargin && (
                  <button
                    onClick={onApplyAutoDetectedMargin}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Zap size={16} />
                    <span>Apply Auto-Detected Margin</span>
                  </button>
                )}

                <button
                  onClick={() => onStageChange('margin-drawing')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <PenTool size={16} />
                  <span>Draw Margin Manually</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div>Analyzing uploaded models...</div>
              </div>
            )}
          </div>
        )}

        {/* Margin Drawing Stage */}
        {currentStage === 'margin-drawing' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <PenTool className="text-orange-500" size={20} />
              <h3 className="font-medium text-white">Draw Margin Line</h3>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-200 mb-2">How to draw margins:</div>
              <div className="text-xs text-blue-300 space-y-1">
                <div>1. Select the Tooth tool from the left sidebar</div>
                <div>2. Choose a drawing mode below</div>
                <div>3. Click directly on the 3D model to add points</div>
                <div>4. Complete when finished drawing</div>
              </div>
            </div>
            {!isDrawingMargin ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-300 mb-4">
                  Choose how you want to define the margin line:
                </div>

                <button
                  onClick={() => onStartMarginDrawing('manual')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <Hand size={18} />
                  <div className="text-left">
                    <div className="font-medium">Manual Drawing</div>
                    <div className="text-xs opacity-80">Click points to draw margin line</div>
                  </div>
                </button>

                <button
                  onClick={() => onStartMarginDrawing('assisted')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <Target size={18} />
                  <div className="text-left">
                    <div className="font-medium">Assisted Drawing</div>
                    <div className="text-xs opacity-80">AI-assisted margin detection</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <PenTool className="text-orange-500" size={16} />
                    <span className="font-medium text-white">Drawing Mode Active</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Mode: <span className="text-orange-500 capitalize">{marginDrawingMode}</span>
                  </div>
                  <div className="text-xs text-orange-300 mt-2 font-medium">
                    ✓ Tooth tool selected - Click on the 3D model to add margin points
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Red spheres = margin points, Green lines = normal vectors
                  </div>
                </div>

                <button
                  onClick={onCompleteMarginLine}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <CheckCircle size={16} />
                  <span>Complete Margin Line</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Review Stage */}
        {currentStage === 'review' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="text-orange-500" size={20} />
              <h3 className="font-medium text-white">Review Margin Lines</h3>
            </div>

            <div className="space-y-3">
              {marginLines.map((line, index) => (
                <div key={line.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: line.color }}
                      />
                      <span className="font-medium text-white">
                        Margin Line {index + 1}
                      </span>
                      {line.isComplete && (
                        <CheckCircle className="text-green-500" size={14} />
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteMarginLine(line.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    Points: {line.points.length}
                  </div>
                  <div className="text-sm text-gray-300">
                    Status: {line.isComplete ? 'Complete' : 'In Progress'}
                  </div>
                </div>
              ))}

              {marginLines.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <PenTool className="mx-auto mb-2" size={32} />
                  <div>No margin lines defined</div>
                  <div className="text-xs mt-2">Go back to draw margin lines</div>
                </div>
              )}
            </div>

            {marginLines.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => onStageChange('export')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Proceed to Export
                </button>
                
                <button
                  onClick={onClearAllMarginLines}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Clear All Margins</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Export Stage */}
        {currentStage === 'export' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Download className="text-orange-500" size={20} />
              <h3 className="font-medium text-white">Export Files</h3>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-white">Export Summary</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Margin Lines:</span>
                  <span className="text-white">{marginLines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Points:</span>
                  <span className="text-white">
                    {marginLines.reduce((sum, line) => sum + line.points.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Files to Export:</span>
                  <span className="text-white">STL + PTS</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-sm text-blue-200 mb-2">Export will include:</div>
              <div className="text-xs text-blue-300 space-y-1">
                <div>• Cleaned STL file with original geometry</div>
                <div>• PTS file with margin point coordinates</div>
                <div>• Normal vectors for each margin point</div>
                <div>• Metadata and timestamps</div>
              </div>
            </div>

            <button
              onClick={onExportFiles}
              disabled={marginLines.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Download size={18} />
              <span>Export STL + PTS Files</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};