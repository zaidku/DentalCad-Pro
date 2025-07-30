// UI Components for Advanced Modeling Tools with Backend Integration
// This module handles the user interface for model orientation and solidification using Python backend

class ModelingToolsUI {
    constructor() {
        this.modelingTools = null;
        this.isProcessing = false;
        this.init();
    }

    async init() {
        // Initialize the backend service
        this.modelingTools = new ModelingToolsWithBackend();
        await this.checkBackendStatus();
    }

    async checkBackendStatus() {
        const statusElement = document.getElementById('backendStatus');
        const statusTextElement = document.getElementById('backendStatusText');
        
        if (!statusElement || !statusTextElement) return;

        if (this.modelingTools.isBackendAvailable()) {
            statusElement.className = 'mb-4 p-3 rounded text-sm bg-green-800 text-green-200 border border-green-600';
            statusTextElement.innerHTML = '✅ Python Backend Online - Advanced modeling available';
            this.enableControls(true);
        } else {
            statusElement.className = 'mb-4 p-3 rounded text-sm bg-yellow-800 text-yellow-200 border border-yellow-600';
            statusTextElement.innerHTML = '⚠️ Python Backend Offline - Start the modeling service to enable advanced features';
            this.enableControls(false);
            
            // Retry connection every 10 seconds
            setTimeout(() => this.checkBackendStatus(), 10000);
        }
    }

    enableControls(enabled) {
        const controls = [
            'orientOcclusalUp', 'orientOcclusalDown', 'orientBuccalFront', 'orientLingualView',
            'applyCustomOrientation', 'applySolidification'
        ];

        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = !enabled;
            }
        });
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('modelingStatusText');
        if (statusElement) {
            statusElement.textContent = message;
        }

        const statusContainer = document.getElementById('modelingStatus');
        if (statusContainer) {
            statusContainer.className = `bg-gray-700 p-3 rounded text-sm ${
                type === 'error' ? 'text-red-300' : 
                type === 'success' ? 'text-green-300' : 
                type === 'processing' ? 'text-yellow-300' : 'text-gray-300'
            }`;
        }
    }

    async applyOrientation(presetName) {
        if (this.isProcessing) return;

        const selectedModel = window.selectedModel;
        if (!selectedModel) {
            this.updateStatus('Please select a model first', 'error');
            return;
        }

        this.isProcessing = true;
        this.updateStatus(`Applying ${presetName} orientation...`, 'processing');

        try {
            const success = await this.modelingTools.applyOrientation(selectedModel, presetName);
            
            if (success) {
                this.updateStatus(`✅ ${presetName} orientation applied successfully`, 'success');
                
                // Trigger render update if available
                if (typeof render === 'function') {
                    render();
                }
            } else {
                this.updateStatus('Failed to apply orientation', 'error');
            }

        } catch (error) {
            console.error('Orientation error:', error);
            this.updateStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async applyCustomOrientation() {
        if (this.isProcessing) return;

        const selectedModel = window.selectedModel;
        if (!selectedModel) {
            this.updateStatus('Please select a model first', 'error');
            return;
        }

        const x = parseFloat(document.getElementById('rotationX').value) || 0;
        const y = parseFloat(document.getElementById('rotationY').value) || 0;
        const z = parseFloat(document.getElementById('rotationZ').value) || 0;

        this.isProcessing = true;
        this.updateStatus(`Applying custom orientation (${x}°, ${y}°, ${z}°)...`, 'processing');

        try {
            const success = await this.modelingTools.setCustomOrientation(selectedModel, x, y, z);
            
            if (success) {
                this.updateStatus(`✅ Custom orientation applied: X:${x}°, Y:${y}°, Z:${z}°`, 'success');
                
                // Trigger render update if available
                if (typeof render === 'function') {
                    render();
                }
            } else {
                this.updateStatus('Failed to apply custom orientation', 'error');
            }

        } catch (error) {
            console.error('Custom orientation error:', error);
            this.updateStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async applySolidification() {
        if (this.isProcessing) return;

        const selectedModel = window.selectedModel;
        if (!selectedModel) {
            this.updateStatus('Please select a model first', 'error');
            return;
        }

        const thickness = parseFloat(document.getElementById('extrusionDepthValue').value) || 2.0;

        this.isProcessing = true;
        this.updateStatus(`Solidifying model with ${thickness}mm wall thickness...`, 'processing');

        try {
            const success = await this.modelingTools.applySolidification(selectedModel, thickness);
            
            if (success) {
                this.updateStatus(`✅ Model solidified with ${thickness}mm walls`, 'success');
                
                // Update file list if available
                if (typeof updateFileList === 'function') {
                    updateFileList();
                }
                
                // Trigger render update if available
                if (typeof render === 'function') {
                    render();
                }
            } else {
                this.updateStatus('Failed to solidify model', 'error');
            }

        } catch (error) {
            console.error('Solidification error:', error);
            this.updateStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }
}

// Create and setup modeling tools UI with backend integration
function createModelingToolsUI() {
    // Create tools section
    const toolsSection = document.createElement('div');
    toolsSection.className = 'bg-gray-800 p-4 rounded-lg border border-gray-600';
    toolsSection.innerHTML = `
        <h3 class="text-lg font-bold text-white mb-4">
            <i class="fas fa-cogs mr-2"></i>
            Advanced Modeling Tools
        </h3>
        
        <!-- Backend Status -->
        <div id="backendStatus" class="mb-4 p-3 rounded text-sm bg-gray-700 text-gray-300">
            <i class="fas fa-server mr-2"></i>
            <span id="backendStatusText">Checking backend service...</span>
        </div>
        
        <!-- Model Orientation Controls -->
        <div class="mb-6">
            <div class="flex items-center mb-3">
                <i class="fas fa-compass text-blue-400 mr-2"></i>
                <label class="text-sm font-semibold text-gray-300">Model Orientation</label>
            </div>
            
            <!-- Preset Orientations -->
            <div class="grid grid-cols-2 gap-2 mb-3">
                <button id="orientOcclusalUp" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <i class="fas fa-arrow-up mr-1"></i>Occlusal Up
                </button>
                <button id="orientOcclusalDown" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <i class="fas fa-arrow-down mr-1"></i>Occlusal Down
                </button>
                <button id="orientBuccalFront" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <i class="fas fa-eye mr-1"></i>Buccal View
                </button>
                <button id="orientLingualView" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <i class="fas fa-eye-slash mr-1"></i>Lingual View
                </button>
            </div>
            
            <!-- Custom Orientation -->
            <div class="bg-gray-700 p-3 rounded mt-3">
                <label class="text-xs text-gray-400 mb-2 block">Custom Rotation (degrees)</label>
                <div class="grid grid-cols-3 gap-2 mb-2">
                    <input type="number" id="rotationX" class="bg-gray-600 text-white px-2 py-1 rounded text-sm" placeholder="X" value="0" min="-180" max="180">
                    <input type="number" id="rotationY" class="bg-gray-600 text-white px-2 py-1 rounded text-sm" placeholder="Y" value="0" min="-180" max="180">
                    <input type="number" id="rotationZ" class="bg-gray-600 text-white px-2 py-1 rounded text-sm" placeholder="Z" value="0" min="-180" max="180">
                </div>
                <button id="applyCustomOrientation" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <i class="fas fa-sync-alt mr-1"></i>Apply Custom
                </button>
            </div>
        </div>
        
        <!-- Model Solidification -->
        <div class="mb-4">
            <div class="flex items-center mb-3">
                <i class="fas fa-cube text-green-400 mr-2"></i>
                <label class="text-sm font-semibold text-gray-300">Model Solidification</label>
            </div>
            
            <div class="bg-gray-700 p-3 rounded">
                <label class="text-xs text-gray-400 mb-2 block">Wall Thickness (mm)</label>
                <div class="flex items-center gap-2 mb-3">
                    <input type="range" id="extrusionDepth" class="flex-1" min="0.5" max="5.0" step="0.1" value="2.0">
                    <input type="number" id="extrusionDepthValue" class="bg-gray-600 text-white px-2 py-1 rounded text-sm w-16" value="2.0" min="0.5" max="5.0" step="0.1">
                </div>
                <button id="applySolidification" class="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <i class="fas fa-magic mr-1 -rocessingIcon" style="display:none;"></i>
                    <i class="fas fa-magic mr-1"></i>Solidify Model
                </button>
                <p class="text-xs text-gray-400 mt-2">Creates solid model by adding internal walls</p>
            </div>
        </div>

        <!-- Processing Status -->
        <div id="modelingStatus" class="bg-gray-700 p-3 rounded text-sm text-gray-300">
            <i class="fas fa-info-circle mr-2"></i>
            <span id="modelingStatusText">Waiting for backend service...</span>
        </div>
    `;

    return toolsSection;
}

// Setup event listeners for modeling tools UI
function setupModelingToolsEventListeners() {
    const modelingUI = new ModelingToolsUI();

    // Orientation preset buttons
    document.getElementById('orientOcclusalUp')?.addEventListener('click', () => {
        modelingUI.applyOrientation('occlusalUp');
    });

    document.getElementById('orientOcclusalDown')?.addEventListener('click', () => {
        modelingUI.applyOrientation('occlusalDown');
    });

    document.getElementById('orientBuccalFront')?.addEventListener('click', () => {
        modelingUI.applyOrientation('buccalFront');
    });

    document.getElementById('orientLingualView')?.addEventListener('click', () => {
        modelingUI.applyOrientation('lingualView');
    });

    // Custom orientation
    document.getElementById('applyCustomOrientation')?.addEventListener('click', () => {
        modelingUI.applyCustomOrientation();
    });

    // Solidification
    document.getElementById('applySolidification')?.addEventListener('click', () => {
        modelingUI.applySolidification();
    });

    // Sync range and number inputs for wall thickness
    const thicknessRange = document.getElementById('extrusionDepth');
    const thicknessValue = document.getElementById('extrusionDepthValue');

    if (thicknessRange && thicknessValue) {
        thicknessRange.addEventListener('input', (e) => {
            thicknessValue.value = e.target.value;
        });

        thicknessValue.addEventListener('input', (e) => {
            thicknessRange.value = e.target.value;
        });
    }

    return modelingUI;
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelingToolsUI, createModelingToolsUI, setupModelingToolsEventListeners };
} else {
    // Browser environment
    window.ModelingToolsUI = ModelingToolsUI;
    window.createModelingToolsUI = createModelingToolsUI;
    window.setupModelingToolsEventListeners = setupModelingToolsEventListeners;
}
                            <button class="preset-btn bg-gray-700 hover:bg-dental-primary border border-gray-600 rounded-lg p-2 text-sm transition-colors" data-preset="buccalBack">
                                <i class="fas fa-chevron-left mb-1"></i>
                                <div>Buccal Back</div>
                            </button>
                            <button class="preset-btn bg-gray-700 hover:bg-dental-primary border border-gray-600 rounded-lg p-2 text-sm transition-colors" data-preset="mesialView">
                                <i class="fas fa-eye mb-1"></i>
                                <div>Mesial View</div>
                            </button>
                            <button class="preset-btn bg-gray-700 hover:bg-dental-primary border border-gray-600 rounded-lg p-2 text-sm transition-colors" data-preset="distalView">
                                <i class="fas fa-eye mb-1"></i>
                                <div>Distal View</div>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Manual Rotation Controls -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Manual Rotation (Degrees)</label>
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">X-Axis</label>
                                <input type="range" id="rotationX" min="-180" max="180" value="0" step="1" class="w-full">
                                <div class="text-xs text-center text-gray-400" id="rotationXValue">0°</div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Y-Axis</label>
                                <input type="range" id="rotationY" min="-180" max="180" value="0" step="1" class="w-full">
                                <div class="text-xs text-center text-gray-400" id="rotationYValue">0°</div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Z-Axis</label>
                                <input type="range" id="rotationZ" min="-180" max="180" value="0" step="1" class="w-full">
                                <div class="text-xs text-center text-gray-400" id="rotationZValue">0°</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Current Orientation Display -->
                    <div class="bg-gray-900 rounded p-3 text-xs">
                        <div class="text-gray-400 mb-1">Current Orientation:</div>
                        <div id="currentOrientation" class="text-white font-mono">X: 0°, Y: 0°, Z: 0°</div>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button class="apply-orientation-btn flex-1 bg-dental-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                        <i class="fas fa-check mr-2"></i>
                        Apply Orientation
                    </button>
                    <button class="reset-orientation-btn bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-undo mr-2"></i>
                        Reset
                    </button>
                    <button class="cancel-btn bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Get current orientation and update sliders
        const currentOrientation = this.modelingTools.getModelOrientation(targetModel);
        if (currentOrientation) {
            dialog.getElementById('rotationX').value = Math.round(currentOrientation.x);
            dialog.getElementById('rotationY').value = Math.round(currentOrientation.y);
            dialog.getElementById('rotationZ').value = Math.round(currentOrientation.z);
            this.updateOrientationDisplay(dialog, currentOrientation);
        }

        this.setupOrientationEventHandlers(dialog, targetModel);
    }

    // Show solidification dialog
    showSolidificationDialog(targetModel = null) {
        if (!targetModel) {
            this.showNotification('Please select a model first', 'error');
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-cube mr-2 text-dental-primary"></i>
                        Solidify Model
                    </h3>
                    <button class="close-dialog text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="text-sm text-gray-300 mb-4">
                        Convert hollow model to solid by extruding walls inward and creating boolean solid geometry.
                    </div>
                    
                    <!-- Extrusion Depth -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Wall Thickness (mm)</label>
                        <div class="flex items-center space-x-3">
                            <input type="range" id="extrusionDepth" min="0.5" max="5.0" value="2.0" step="0.1" class="flex-1">
                            <div class="text-sm text-white font-mono w-16" id="extrusionValue">2.0mm</div>
                        </div>
                        <div class="text-xs text-gray-400 mt-1">Recommended: 1.5-3.0mm for dental applications</div>
                    </div>
                    
                    <!-- Preview -->
                    <div class="bg-gray-900 rounded p-3 text-xs">
                        <div class="text-gray-400 mb-1">Operation:</div>
                        <div class="text-white">
                            • Create inner surface by extruding inward<br>
                            • Generate connecting walls<br>
                            • Combine into solid geometry
                        </div>
                    </div>
                    
                    <!-- Warning -->
                    <div class="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded p-3 text-xs">
                        <div class="flex items-center text-yellow-400 mb-1">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Important
                        </div>
                        <div class="text-yellow-300">
                            This operation will modify the model geometry. Use undo (Ctrl+Z) to revert if needed.
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button class="apply-solidify-btn flex-1 bg-dental-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                        <i class="fas fa-cube mr-2"></i>
                        Solidify Model
                    </button>
                    <button class="cancel-btn bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        this.setupSolidificationEventHandlers(dialog, targetModel);
    }

    // Setup event handlers for orientation dialog
    setupOrientationEventHandlers(dialog, targetModel) {
        // Preset buttons
        dialog.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.getAttribute('data-preset');
                this.modelingTools.applyOrientation(targetModel, preset);
                
                // Update sliders to reflect preset
                const orientation = this.modelingTools.getModelOrientation(targetModel);
                if (orientation) {
                    dialog.getElementById('rotationX').value = Math.round(orientation.x);
                    dialog.getElementById('rotationY').value = Math.round(orientation.y);
                    dialog.getElementById('rotationZ').value = Math.round(orientation.z);
                    this.updateOrientationDisplay(dialog, orientation);
                }
            });
        });

        // Manual rotation sliders
        ['X', 'Y', 'Z'].forEach(axis => {
            const slider = dialog.getElementById(`rotation${axis}`);
            const valueDisplay = dialog.getElementById(`rotation${axis}Value`);
            
            slider.addEventListener('input', () => {
                const value = parseInt(slider.value);
                valueDisplay.textContent = `${value}°`;
                
                // Apply real-time rotation
                const x = parseInt(dialog.getElementById('rotationX').value);
                const y = parseInt(dialog.getElementById('rotationY').value);
                const z = parseInt(dialog.getElementById('rotationZ').value);
                
                this.modelingTools.setCustomOrientation(targetModel, x, y, z);
                this.updateOrientationDisplay(dialog, { x, y, z });
            });
        });

        // Apply button (already applied in real-time, just close dialog)
        dialog.querySelector('.apply-orientation-btn').addEventListener('click', () => {
            this.showNotification('Orientation applied successfully', 'success');
            dialog.remove();
        });

        // Reset button
        dialog.querySelector('.reset-orientation-btn').addEventListener('click', () => {
            this.modelingTools.applyOrientation(targetModel, 'default');
            dialog.getElementById('rotationX').value = 0;
            dialog.getElementById('rotationY').value = 0;
            dialog.getElementById('rotationZ').value = 0;
            dialog.getElementById('rotationXValue').textContent = '0°';
            dialog.getElementById('rotationYValue').textContent = '0°';
            dialog.getElementById('rotationZValue').textContent = '0°';
            this.updateOrientationDisplay(dialog, { x: 0, y: 0, z: 0 });
        });

        // Close handlers
        const closeDialog = () => dialog.remove();
        dialog.querySelector('.close-dialog').addEventListener('click', closeDialog);
        dialog.querySelector('.cancel-btn').addEventListener('click', closeDialog);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });
    }

    // Setup event handlers for solidification dialog
    setupSolidificationEventHandlers(dialog, targetModel) {
        // Extrusion depth slider
        const depthSlider = dialog.getElementById('extrusionDepth');
        const depthValue = dialog.getElementById('extrusionValue');
        
        depthSlider.addEventListener('input', () => {
            const value = parseFloat(depthSlider.value);
            depthValue.textContent = `${value.toFixed(1)}mm`;
        });

        // Apply solidification
        dialog.querySelector('.apply-solidify-btn').addEventListener('click', () => {
            const depth = parseFloat(depthSlider.value);
            
            // Show loading state
            const btn = dialog.querySelector('.apply-solidify-btn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
            
            // Apply solidification
            setTimeout(() => {
                const success = this.modelingTools.applySolidification(targetModel, depth);
                
                if (success) {
                    this.showNotification(`Model solidified with ${depth}mm thickness`, 'success');
                    dialog.remove();
                } else {
                    this.showNotification('Failed to solidify model', 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-cube mr-2"></i>Solidify Model';
                }
            }, 100); // Small delay to show loading state
        });

        // Close handlers
        const closeDialog = () => dialog.remove();
        dialog.querySelector('.close-dialog').addEventListener('click', closeDialog);
        dialog.querySelector('.cancel-btn').addEventListener('click', closeDialog);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });
    }

    // Update orientation display
    updateOrientationDisplay(dialog, orientation) {
        const display = dialog.getElementById('currentOrientation');
        if (display) {
            display.textContent = `X: ${Math.round(orientation.x)}°, Y: ${Math.round(orientation.y)}°, Z: ${Math.round(orientation.z)}°`;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        }`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle'
                }"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelingToolsUI };
} else {
    // Browser environment
    window.ModelingToolsUI = ModelingToolsUI;
}
