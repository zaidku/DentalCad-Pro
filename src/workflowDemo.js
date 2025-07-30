// Demo script to showcase the dental workflow system
// This demonstrates the complete workflow from order to final export

class DentalWorkflowDemo {
    constructor() {
        this.demoData = {
            patient: 'Sarah Johnson',
            tooth: '14',
            material: 'zirconia',
            shade: 'A2'
        };
        
        this.init();
    }
    
    init() {
        console.log('🦷 DentalCAD Pro - Workflow Demo Started');
        this.createDemoButtons();
        // Highlight Stage 2 as the current active stage
        setTimeout(() => {
            this.highlightDemoButton(2);
        }, 1000);
    }
    
    createDemoButtons() {
        // Create demo control panel
        const demoPanel = document.createElement('div');
        demoPanel.id = 'demo-panel';
        demoPanel.className = 'fixed top-20 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50 border border-gray-700';
        demoPanel.innerHTML = `
            <div class="text-white mb-3">
                <h3 class="font-bold text-lg mb-2">🦷 Workflow Demo</h3>
                <div class="text-sm text-gray-300 mb-3">Professional Dental Lab Workflow</div>
            </div>
            
            <div class="space-y-2">
                <button id="demoStage1" class="demo-btn w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm">
                    📋 Stage 1: Order Form
                </button>
                <button id="demoStage2" class="demo-btn w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm">
                    📁 Stage 2: Scan Cleanup ← Current
                </button>
                <button id="demoStage3" class="demo-btn w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm">
                    ✏️ Stage 3: Margin
                </button>
                <button id="demoStage4" class="demo-btn w-full bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded text-sm">
                    🦷 Stage 4: Design
                </button>
                <button id="demoStage5" class="demo-btn w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">
                    ✅ Stage 5: Export
                </button>
                
                <div class="border-t border-gray-600 pt-2 mt-3">
                    <button id="autoDemo" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
                        🚀 Auto Demo (All Stages)
                    </button>
                    <button id="resetDemo" class="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm mt-2">
                        🔄 Reset Workflow
                    </button>
                </div>
            </div>
            
            <div class="mt-3 text-xs text-gray-400">
                <div>Demo Case: ${this.demoData.patient}</div>
                <div>Tooth #${this.demoData.tooth} - ${this.demoData.material}</div>
            </div>
        `;
        
        document.body.appendChild(demoPanel);
        
        // Add event listeners
        document.getElementById('demoStage1').addEventListener('click', () => this.showStage(1));
        document.getElementById('demoStage2').addEventListener('click', () => this.showStage(2));
        document.getElementById('demoStage3').addEventListener('click', () => this.showStage(3));
        document.getElementById('demoStage4').addEventListener('click', () => this.showStage(4));
        document.getElementById('demoStage5').addEventListener('click', () => this.showStage(5));
        document.getElementById('autoDemo').addEventListener('click', () => this.runAutoDemo());
        document.getElementById('resetDemo').addEventListener('click', () => this.resetWorkflow());
    }
    
    showStage(stageNumber) {
        if (window.workflowManager || window.dentalWorkflowManager) {
            const manager = window.workflowManager || window.dentalWorkflowManager;
            manager.showStage(stageNumber);
            this.highlightDemoButton(stageNumber);
        } else {
            console.log('⚠️ Workflow manager not initialized');
        }
    }
    
    highlightDemoButton(stageNumber) {
        // Reset all buttons
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-yellow-400');
        });
        
        // Highlight current stage button
        const activeBtn = document.getElementById(`demoStage${stageNumber}`);
        if (activeBtn) {
            activeBtn.classList.add('ring-2', 'ring-yellow-400');
        }
    }
    
    async runAutoDemo() {
        console.log('🚀 Starting Auto Demo...');
        
        const stages = [
            { num: 1, name: 'Order Form', delay: 3000 },
            { num: 2, name: 'Scan Upload', delay: 4000 },
            { num: 3, name: 'Margin Placement', delay: 3500 },
            { num: 4, name: 'Crown Design', delay: 4500 },
            { num: 5, name: 'Final Export', delay: 3000 }
        ];
        
        for (const stage of stages) {
            console.log(`▶️ Demo Stage ${stage.num}: ${stage.name}`);
            this.showStage(stage.num);
            
            // Show stage-specific demo actions
            this.showStageDemo(stage.num);
            
            await new Promise(resolve => setTimeout(resolve, stage.delay));
        }
        
        console.log('✅ Auto Demo Complete!');
        this.showCompletionMessage();
    }
    
    showStageDemo(stageNumber) {
        const messages = {
            1: '📋 Filling out patient information and case details...',
            2: '📁 Uploading STL files and cleaning scan data...',
            3: '✏️ Placing margin points around preparation...',
            4: '🦷 Designing and fitting crown restoration...',
            5: '✅ Final review and exporting files...'
        };
        
        this.showToast(messages[stageNumber], 'info');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
        }`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                }"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    showCompletionMessage() {
        const completion = document.createElement('div');
        completion.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        completion.innerHTML = `
            <div class="bg-gray-800 p-8 rounded-lg shadow-2xl text-center border border-gray-700">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-2xl font-bold text-white mb-4">Demo Complete!</h2>
                <p class="text-gray-300 mb-6">
                    The dental CAD workflow demonstration has finished.<br>
                    Case ${this.generateCaseNumber()} is ready for production.
                </p>
                <div class="space-y-2 text-sm text-gray-400 mb-6">
                    <div>Patient: ${this.demoData.patient}</div>
                    <div>Tooth: #${this.demoData.tooth}</div>
                    <div>Material: ${this.demoData.material}</div>
                    <div>Shade: ${this.demoData.shade}</div>
                </div>
                <button id="closeCompletion" class="bg-dental-primary hover:bg-dental-secondary text-white px-6 py-2 rounded-lg">
                    Close Demo
                </button>
            </div>
        `;
        
        document.body.appendChild(completion);
        
        document.getElementById('closeCompletion').addEventListener('click', () => {
            document.body.removeChild(completion);
        });
    }
    
    resetWorkflow() {
        if (window.workflowManager) {
            window.workflowManager.showStage(1);
            this.highlightDemoButton(1);
            this.showToast('🔄 Workflow reset to Stage 1', 'info');
        }
    }
    
    generateCaseNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `DC-${year}${month}${day}-${random}`;
    }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.DentalWorkflowManager) {
            window.workflowDemo = new DentalWorkflowDemo();
            
            // Store reference to workflow manager
            setTimeout(() => {
                const manager = document.querySelector('#workflow-progress');
                if (manager) {
                    console.log('🦷 Dental Workflow System Ready');
                }
            }, 1000);
        }
    }, 2000);
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DentalWorkflowDemo };
} else {
    window.DentalWorkflowDemo = DentalWorkflowDemo;
}
