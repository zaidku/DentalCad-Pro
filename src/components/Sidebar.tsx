import React from 'react';
import { 
  PenTool, 
  Ruler, 
  Scissors, 
  Layers, 
  Crown,
  Settings 
} from 'lucide-react';
import { Tool } from '../types/dental';

interface SidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools = [
  { id: 'design' as Tool, icon: PenTool, label: 'Design' },
  { id: 'measure' as Tool, icon: Ruler, label: 'Measure' },
  { id: 'cut' as Tool, icon: Scissors, label: 'Cut' },
  { id: 'layer' as Tool, icon: Layers, label: 'Layers' },
];

const dentalTools = [
  { id: 'tooth' as Tool, icon: Crown, label: 'Tooth' },
  { id: 'teeth' as Tool, icon: Crown, label: 'Teeth' },
  { id: 'crown' as Tool, icon: Crown, label: 'Crown' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 space-y-6">
      {/* Logo */}
      <div className="w-10 h-10 rounded-md bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
        DC
      </div>

      {/* General Tools */}
      <div className="flex flex-col items-center space-y-4 w-full">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
                ${activeTool === tool.id 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-orange-500'
                }
              `}
              title={tool.label}
            >
              <Icon size={18} />
            </button>
          );
        })}

        <div className="border-t border-gray-800 w-8 mx-auto"></div>

        {/* Dental Tools */}
        {dentalTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
                ${activeTool === tool.id 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-orange-500'
                }
              `}
              title={tool.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div className="mt-auto">
        <button className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-orange-500 transition-all duration-200">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};