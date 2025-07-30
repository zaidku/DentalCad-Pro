// UI Components for Dental Bases
// This module handles the user interface for dental base selection and management

class DentalBaseUI {
    constructor(dentalBases, integrator, scene, loadedModels, addToFileList) {
        this.dentalBases = dentalBases;
        this.integrator = integrator;
        this.scene = scene;
        this.loadedModels = loadedModels;
        this.addToFileList = addToFileList;
    }

    // Create base selection dialog
    showBaseSelectionDialog(targetModel = null) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white flex items-center">
                        <i class="fas fa-teeth mr-2 text-dental-primary"></i>
                        Dental Base Selection
                    </h3>
                    <button class="close-dialog text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="text-sm text-gray-300 mb-4">
                        ${targetModel ? 'Choose a horseshoe jaw base to combine with the selected model:' : 'Choose a horseshoe jaw base to add to the scene:'}
                    </div>
                    
                    <!-- Base Type Selection -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Base Type</label>
                        <div class="grid grid-cols-2 gap-3">
                            <button class="base-type-btn bg-gray-700 hover:bg-dental-primary border border-gray-600 rounded-lg p-3 text-center transition-colors" data-type="upper">
                                <i class="fas fa-smile text-2xl mb-2 text-dental-primary"></i>
                                <div class="text-sm font-medium">Upper Jaw</div>
                                <div class="text-xs text-gray-400">Wider arch</div>
                            </button>
                            <button class="base-type-btn bg-gray-700 hover:bg-dental-primary border border-gray-600 rounded-lg p-3 text-center transition-colors" data-type="lower">
                                <i class="fas fa-meh text-2xl mb-2 text-dental-primary"></i>
                                <div class="text-sm font-medium">Lower Jaw</div>
                                <div class="text-xs text-gray-400">Narrower arch</div>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Action Selection -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Action</label>
                        <div class="space-y-2">
                            ${targetModel ? `
                            <label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="action" value="combine" class="text-dental-primary" checked>
                                <span class="text-sm">Combine with selected model</span>
                            </label>
                            ` : ''}
                            <label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="action" value="separate" class="text-dental-primary" ${!targetModel ? 'checked' : ''}>
                                <span class="text-sm">Add as separate model</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Preview -->
                    <div class="bg-gray-900 rounded p-3 text-xs">
                        <div class="text-gray-400 mb-1">Preview:</div>
                        <div id="basePreviewText" class="text-white">Select a base type to see preview</div>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button class="apply-base-btn flex-1 bg-dental-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <i class="fas fa-plus mr-2"></i>
                        Apply Base
                    </button>
                    <button class="cancel-btn flex-shrink-0 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        let selectedBaseType = null;

        // Handle base type selection
        dialog.querySelectorAll('.base-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update selection
                dialog.querySelectorAll('.base-type-btn').forEach(b => {
                    b.classList.remove('bg-dental-primary', 'text-white');
                    b.classList.add('bg-gray-700');
                });
                btn.classList.remove('bg-gray-700');
                btn.classList.add('bg-dental-primary', 'text-white');
                
                selectedBaseType = btn.getAttribute('data-type');
                console.log('🦷 Base type selected:', selectedBaseType);
                
                // Update preview
                const previewText = dialog.querySelector('#basePreviewText');
                const action = dialog.querySelector('input[name="action"]:checked').value;
                const baseTypeName = selectedBaseType === 'upper' ? 'Upper Jaw' : 'Lower Jaw';
                
                if (action === 'combine' && targetModel) {
                    previewText.textContent = `Will combine ${baseTypeName} base with "${targetModel.userData.filename}"`;
                } else {
                    previewText.textContent = `Will add ${baseTypeName} base as separate model`;
                }
                
                // Enable apply button
                const applyBtn = dialog.querySelector('.apply-base-btn');
                if (applyBtn) {
                    applyBtn.disabled = false;
                    console.log('✅ Apply button enabled');
                } else {
                    console.error('❌ Could not find apply button');
                }
            });
        });

        // Handle action change
        dialog.querySelectorAll('input[name="action"]').forEach(input => {
            input.addEventListener('change', () => {
                if (selectedBaseType) {
                    const previewText = dialog.querySelector('#basePreviewText');
                    const baseTypeName = selectedBaseType === 'upper' ? 'Upper Jaw' : 'Lower Jaw';
                    
                    if (input.value === 'combine' && targetModel) {
                        previewText.textContent = `Will combine ${baseTypeName} base with "${targetModel.userData.filename}"`;
                    } else {
                        previewText.textContent = `Will add ${baseTypeName} base as separate model`;
                    }
                }
            });
        });

        // Handle apply
        dialog.querySelector('.apply-base-btn').addEventListener('click', async () => {
            console.log('🦷 Apply button clicked. Selected type:', selectedBaseType);
            
            if (!selectedBaseType) {
                console.warn('⚠️ No base type selected');
                return;
            }

            const action = dialog.querySelector('input[name="action"]:checked').value;
            console.log('🦷 Action selected:', action);
            
            // Disable button during operation
            const applyBtn = dialog.querySelector('.apply-base-btn');
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
            
            try {
                if (action === 'combine' && targetModel) {
                    await this.combineWithBase(targetModel, selectedBaseType);
                } else {
                    await this.addSeparateBase(selectedBaseType);
                }
                
                dialog.remove();
            } catch (error) {
                console.error('Error during base operation:', error);
                // Re-enable button on error
                applyBtn.disabled = false;
                applyBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Apply Base';
            }
        });

        // Handle close/cancel
        const closeDialog = () => dialog.remove();
        dialog.querySelector('.close-dialog').addEventListener('click', closeDialog);
        dialog.querySelector('.cancel-btn').addEventListener('click', closeDialog);
        
        // Close on outside click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });
    }

    // Combine model with base
    async combineWithBase(targetModel, baseType) {
        if (!targetModel) {
            console.error('No target model selected');
            return;
        }

        // Save undo state
        if (typeof saveUndoState === 'function') {
            saveUndoState();
        }

        // Show loading notification
        this.showNotification(`Loading ${baseType} jaw base...`, 'info');

        try {
            const result = await this.integrator.combineModelWithBase(targetModel, baseType);
            if (result) {
                // Refresh tool status if needed
                if (typeof selectTool === 'function' && typeof activeTool !== 'undefined') {
                    selectTool(activeTool);
                }
                
                console.log(`✅ Successfully combined model with ${baseType} jaw base`);
                
                // Show success message
                this.showNotification(`Model combined with ${baseType} jaw base`, 'success');
            } else {
                console.error('Failed to combine model with base');
                this.showNotification('Failed to combine model with base', 'error');
            }
        } catch (error) {
            console.error('Error combining model with base:', error);
            this.showNotification('Error combining model with base', 'error');
        }
    }

    // Add base as separate model
    async addSeparateBase(baseType) {
        // Show loading notification
        this.showNotification(`Loading ${baseType} jaw base...`, 'info');

        try {
            const baseMesh = await this.integrator.addBaseAsModel(baseType, this.scene, this.loadedModels);
            if (baseMesh) {
                // Add to file list
                this.addToFileList(baseMesh.userData.filename, baseMesh);
                
                // Auto-select the new base
                if (typeof selectModel === 'function') {
                    selectModel(baseMesh);
                }
                
                console.log(`✅ Successfully added ${baseType} jaw base`);
                
                // Show success message
                this.showNotification(`${baseType} jaw base added to scene`, 'success');
            } else {
                console.error('Failed to create base mesh');
                this.showNotification('Failed to create base', 'error');
            }
        } catch (error) {
            console.error('Error adding base:', error);
            this.showNotification('Error adding base', 'error');
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
    module.exports = { DentalBaseUI };
} else {
    // Browser environment
    window.DentalBaseUI = DentalBaseUI;
}
