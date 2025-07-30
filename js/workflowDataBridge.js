/**
 * DentalCAD Pro - Workflow Data Bridge
 * Handles data synchronization between different workflow stages
 */

class WorkflowDataBridge {
    constructor() {
        this.dataManager = window.dataManager;
        this.currentStage = this.detectCurrentStage();
        this.init();
    }

    init() {
        console.log('🌉 WorkflowDataBridge initialized for stage:', this.currentStage);
        
        // Auto-load data based on current stage
        this.loadStageData();
        
        // Setup page visibility handling for data sync
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncStageData();
            }
        });
        
        // Setup beforeunload to save current state
        window.addEventListener('beforeunload', () => {
            this.saveCurrentStageData();
        });
    }

    // Detect which stage we're currently in
    detectCurrentStage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        const stageMap = {
            'orderform.html': 'orderForm',
            'index.html': 'scanCleaning',
            'margin-setup.html': 'marginSetup',
            'design.html': 'design',
            'finalize.html': 'finalize'
        };
        
        return stageMap[page] || 'scanCleaning';
    }

    // Load data appropriate for current stage
    async loadStageData() {
        switch (this.currentStage) {
            case 'orderForm':
                await this.loadOrderFormData();
                break;
            case 'scanCleaning':
                await this.loadScanCleaningData();
                break;
            case 'marginSetup':
                await this.loadMarginSetupData();
                break;
            case 'design':
                await this.loadDesignData();
                break;
            case 'finalize':
                await this.loadFinalizeData();
                break;
        }
    }

    // Save data from current stage
    saveCurrentStageData() {
        switch (this.currentStage) {
            case 'orderForm':
                this.saveOrderFormData();
                break;
            case 'scanCleaning':
                this.saveScanCleaningData();
                break;
            case 'marginSetup':
                this.saveMarginSetupData();
                break;
            case 'design':
                this.saveDesignData();
                break;
            case 'finalize':
                this.saveFinalizeData();
                break;
        }
    }

    // Order form data handling
    async loadOrderFormData() {
        const orderData = this.dataManager.getOrderData();
        if (orderData) {
            this.populateOrderForm(orderData);
        }
        
        // Load existing files
        const files = this.dataManager.getSTLFiles();
        this.populateFileList(files);
        
        console.log('📋 Order form data loaded');
    }

    saveOrderFormData() {
        const orderData = this.extractOrderFormData();
        // Save order data regardless of STL file presence
        console.log('💾 Saving order form data for case:', this.dataManager.currentCaseId);
        console.log('📋 Order data to save:', orderData);
        // Save current file count for info only
        const files = this.dataManager.getSTLFiles();
        orderData.fileCount = Object.keys(files).length;
        console.log('📁 Files in storage when saving order:', Object.keys(files).length);
        this.dataManager.saveOrderData(orderData);
        console.log('✅ Order form data saved successfully');
    }

    populateOrderForm(orderData) {
        // Patient information
        if (orderData.patientName) {
            const nameField = document.getElementById('patientName');
            if (nameField) nameField.value = orderData.patientName;
        }
        
        if (orderData.patientAge) {
            const ageField = document.getElementById('patientAge');
            if (ageField) ageField.value = orderData.patientAge;
        }
        
        if (orderData.patientGender) {
            const genderField = document.getElementById('patientGender');
            if (genderField) genderField.value = orderData.patientGender;
        }
        
        // Tooth selection
        if (orderData.selectedTeeth) {
            orderData.selectedTeeth.forEach(toothNumber => {
                const toothElement = document.querySelector(`[data-tooth="${toothNumber}"]`);
                if (toothElement) {
                    toothElement.classList.add('selected');
                }
            });
        }
        
        // Material selection
        if (orderData.selectedMaterial) {
            const materialField = document.getElementById('materialSelect');
            if (materialField) materialField.value = orderData.selectedMaterial;
        }
        
        // Restoration type
        if (orderData.restorationType) {
            const typeField = document.getElementById('restorationType');
            if (typeField) typeField.value = orderData.restorationType;
        }
        
        console.log('📝 Order form populated with saved data');
    }

    extractOrderFormData() {
        const data = {};
        
        // Patient information
        const patientName = document.getElementById('patientName');
        if (patientName) data.patientName = patientName.value;
        
        const patientAge = document.getElementById('patientAge');
        if (patientAge) data.patientAge = patientAge.value;
        
        const patientGender = document.getElementById('patientGender');
        if (patientGender) data.patientGender = patientGender.value;
        
        // Selected teeth
        const selectedTeeth = [];
        document.querySelectorAll('.tooth-number.selected').forEach(tooth => {
            selectedTeeth.push(tooth.dataset.tooth);
        });
        data.selectedTeeth = selectedTeeth;
        
        // Material and restoration type
        const materialSelect = document.getElementById('materialSelect');
        if (materialSelect) data.selectedMaterial = materialSelect.value;
        
        const restorationType = document.getElementById('restorationType');
        if (restorationType) data.restorationType = restorationType.value;
        
        return data;
    }

    // Scan cleaning data handling
    async loadScanCleaningData() {
        console.log('🔧 Loading scan cleaning data...');
        
        // Load patient/order info for display
        const orderData = this.dataManager.getOrderData();
        console.log('📋 Order data retrieved:', orderData ? 'Found' : 'Not found');
        if (orderData) {
            this.displayOrderInfo(orderData);
        }
        
        // Load STL files into the 3D viewer
        const files = this.dataManager.getSTLFiles();
        console.log('📁 STL files retrieved:', Object.keys(files).length, 'files');
        
        if (Object.keys(files).length > 0) {
            console.log('📁 File details:', Object.values(files).map(f => ({
                name: f.name,
                size: this.formatFileSize(f.size),
                storageType: f.storageType
            })));
            
            await this.loadSTLFilesIntoViewer(files);
        } else {
            console.log('⚠️ No STL files found in storage');
            
            // Check if there might be data in a different case
            const allCases = this.dataManager.getAllCases ? this.dataManager.getAllCases() : [];
            console.log('📊 Available cases:', allCases);
        }
        
        console.log('🔧 Scan cleaning data loading completed');
    }

    saveScanCleaningData() {
        // Save current 3D model states if modified
        if (window.loadedModels && window.loadedModels.length > 0) {
            const modelStates = window.loadedModels.map(model => ({
                filename: model.userData.filename,
                visible: model.visible,
                position: {
                    x: model.position.x,
                    y: model.position.y,
                    z: model.position.z
                },
                rotation: {
                    x: model.rotation.x,
                    y: model.rotation.y,
                    z: model.rotation.z
                },
                scale: {
                    x: model.scale.x,
                    y: model.scale.y,
                    z: model.scale.z
                }
            }));
            
            this.dataManager.saveWorkflowState({
                stage: 'scanCleaning',
                modelStates,
                lastModified: new Date().toISOString()
            });
        }
        
        console.log('💾 Scan cleaning data saved');
    }

    displayOrderInfo(orderData) {
        // Update order info panel
        const orderPanel = document.getElementById('orderInfoPanel');
        if (orderPanel && orderData) {
            orderPanel.classList.remove('hidden');
            
            // Update patient name
            const patientNameEl = document.getElementById('orderPatientName');
            if (patientNameEl) patientNameEl.textContent = orderData.patientName || 'Unknown Patient';
            
            // Update case ID
            const caseIdEl = document.getElementById('orderCaseId');
            if (caseIdEl) caseIdEl.textContent = this.dataManager.currentCaseId;
            
            // Update selected teeth
            const teethListEl = document.getElementById('orderSelectedTeeth');
            if (teethListEl && orderData.selectedTeeth) {
                teethListEl.innerHTML = orderData.selectedTeeth.map(tooth => 
                    `<span class="bg-dental-primary text-white px-2 py-1 rounded text-xs">${tooth}</span>`
                ).join(' ');
            }
            
            // Update material
            const materialEl = document.getElementById('orderMaterial');
            if (materialEl) materialEl.textContent = orderData.selectedMaterial || 'Not specified';
            
            console.log('ℹ️ Order info displayed in scan cleaning stage');
        }
    }

    async loadSTLFilesIntoViewer(files) {
        if (!window.loadSTL) {
            console.warn('⚠️ STL loader not available yet, retrying...');
            setTimeout(() => this.loadSTLFilesIntoViewer(files), 1000);
            return;
        }
        
        const fileArray = Object.values(files);
        if (fileArray.length === 0) {
            console.log('ℹ️ No STL files to load');
            return;
        }
        
        console.log('📁 Loading', fileArray.length, 'STL files into viewer');
        
        for (const fileData of fileArray) {
            try {
                console.log('🔄 Processing file:', fileData.name, 'Storage type:', fileData.storageType);
                
                // Handle async file conversion for blob URLs
                let file;
                if (fileData.blobUrl && !fileData.originalFile) {
                    file = await this.dataManager.blobUrlToFile(fileData);
                } else {
                    file = this.dataManager.dataToFile(fileData);
                }
                
                if (file) {
                    await new Promise((resolve) => {
                        // Load the file and wait for completion
                        const originalLoadSTL = window.loadSTL;
                        window.loadSTL = function(file) {
                            originalLoadSTL(file);
                            setTimeout(resolve, 100); // Small delay to ensure loading completes
                        };
                        
                        window.loadSTL(file);
                        window.loadSTL = originalLoadSTL; // Restore original function
                    });
                    
                    console.log('✅ Loaded STL file:', fileData.name);
                } else {
                    console.error('❌ Failed to convert file data:', fileData.name);
                    this.dataManager.showStorageWarning(
                        `Could not load ${fileData.name}. File may need to be re-uploaded.`, 
                        'error'
                    );
                }
            } catch (error) {
                console.error('❌ Error loading STL file:', fileData.name, error);
                this.dataManager.showStorageWarning(
                    `Error loading ${fileData.name}: ${error.message}`, 
                    'error'
                );
            }
        }
        
        console.log('🎯 All STL files processed for viewer');
    }

    populateFileList(files) {
        const fileList = document.getElementById('uploadedFilesList');
        const noFilesMessage = document.getElementById('noFilesMessage');
        
        if (!fileList) return;
        
        const fileArray = Object.values(files);
        
        if (fileArray.length === 0) {
            if (noFilesMessage) {
                noFilesMessage.style.display = 'block';
                noFilesMessage.textContent = 'No files uploaded yet';
            }
            return;
        }
        
        // Hide no files message
        if (noFilesMessage) {
            noFilesMessage.style.display = 'none';
        }
        
        // Clear existing file list (except no files message)
        const existingFiles = fileList.querySelectorAll('.file-item');
        existingFiles.forEach(item => item.remove());
        
        // Add files to list
        fileArray.forEach(fileData => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item flex items-center space-x-2 p-2 bg-gray-800 rounded text-sm mb-1';
            
            // Show storage type with appropriate icon
            let storageIcon, storageTitle;
            switch (fileData.storageType) {
                case 'localStorage':
                    storageIcon = '<i class="fas fa-save text-green-500"></i>';
                    storageTitle = 'Saved to localStorage (persistent)';
                    break;
                case 'optimized_blob':
                    storageIcon = '<i class="fas fa-memory text-blue-500"></i>';
                    storageTitle = 'Optimized storage (session-based)';
                    break;
                case 'direct_blob':
                    storageIcon = '<i class="fas fa-database text-purple-500"></i>';
                    storageTitle = 'Direct blob storage (large file)';
                    break;
                case 'memory_only':
                    storageIcon = '<i class="fas fa-clock text-yellow-500"></i>';
                    storageTitle = 'Memory only (temporary)';
                    break;
                default:
                    storageIcon = '<i class="fas fa-question text-gray-500"></i>';
                    storageTitle = 'Unknown storage type';
            }
            
            fileElement.innerHTML = `
                <i class="fas fa-file text-dental-primary"></i>
                <span class="truncate flex-1">${fileData.name}</span>
                <span class="text-xs text-gray-400">${this.formatFileSize(fileData.size)}</span>
                <span title="${storageTitle}">${storageIcon}</span>
                <button class="remove-file-btn text-gray-400 hover:text-red-500 cursor-pointer" data-file-id="${fileData.id}" title="Remove File">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add remove functionality
            const removeBtn = fileElement.querySelector('.remove-file-btn');
            removeBtn.addEventListener('click', () => {
                this.removeFile(fileData.id);
            });
            
            fileList.appendChild(fileElement);
        });
        
        console.log('📋 File list populated with', fileArray.length, 'files');
    }

    // Handle file upload in order form
    async handleFileUpload(files) {
        const uploadedFiles = [];
        
        console.log('📁 Starting file upload process...');
        console.log('Current case ID:', this.dataManager.currentCaseId);
        console.log('Files to upload:', files.length);
        
        // Check storage before uploading
        const storageInfo = this.dataManager.getStorageInfo();
        if (storageInfo.quotaWarning) {
            this.dataManager.showStorageWarning(
                'Storage space is getting low. Large files will be kept in memory only during this session.',
                'warning'
            );
        }
        
        for (const file of files) {
            try {
                console.log('📄 Uploading file:', file.name, 'Size:', this.formatFileSize(file.size));
                const result = await this.dataManager.saveSTLFile(file);
                uploadedFiles.push(result);
                
                console.log('✅ File saved successfully:', {
                    name: file.name,
                    id: result.id,
                    storageType: result.fileData.storageType,
                    caseId: result.fileData.caseId
                });
                
                // Show appropriate message based on storage type
                if (result.fileData.storageType === 'memory_only') {
                    this.dataManager.showStorageWarning(
                        `${file.name} saved to memory only (will be lost on page refresh)`,
                        'warning'
                    );
                }
                
            } catch (error) {
                console.error('❌ Error uploading file:', file.name, error);
                this.dataManager.showStorageWarning(
                    `Failed to save ${file.name}: ${error.message}`,
                    'error'
                );
            }
        }
        
        // Verify files were saved
        const allFiles = this.dataManager.getSTLFiles();
        console.log('📋 Verification - Total files in storage:', Object.keys(allFiles).length);
        
        // Refresh file list
        this.populateFileList(allFiles);
        
        return uploadedFiles;
    }

    // Remove file
    removeFile(fileId) {
        const success = this.dataManager.removeSTLFile(fileId);
        if (success) {
            // Refresh file list
            const files = this.dataManager.getSTLFiles();
            this.populateFileList(files);
            console.log('🗑️ File removed:', fileId);
        }
    }

    // Helper method to format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Debug method to check data persistence
    debugDataPersistence() {
        console.log('🐛 Data persistence debug:');
        console.log('Current case ID:', this.dataManager.currentCaseId);
        
        const orderData = this.dataManager.getOrderData();
        console.log('Order data:', orderData);
        
        const files = this.dataManager.getSTLFiles();
        console.log('Files:', files);
        
        const storageInfo = this.dataManager.getStorageInfo();
        console.log('Storage info:', storageInfo);
        
        // Check memory storage
        if (window.dentalCADMemoryStorage) {
            console.log('Memory storage keys:', Object.keys(window.dentalCADMemoryStorage));
        }
        
        return {
            caseId: this.dataManager.currentCaseId,
            orderData,
            files,
            storageInfo
        };
    }

    // Navigation helper
    navigateToStage(stagePath) {
        window.location.href = stagePath;
    }

    // Sync data when returning to a stage
    syncStageData() {
        console.log('🔄 Syncing data for stage:', this.currentStage);
        this.loadStageData();
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Navigation with data preservation
    navigateToStage(stagePage) {
        this.saveCurrentStageData();
        window.location.href = stagePage;
    }

    // Get current case summary
    getCaseSummary() {
        return this.dataManager.getCaseSummary();
    }

    // Placeholder methods for other stages
    async loadMarginSetupData() {
        const orderData = this.dataManager.getOrderData();
        const files = this.dataManager.getSTLFiles();
        console.log('📏 Margin setup data loaded');
    }

    saveMarginSetupData() {
        console.log('💾 Margin setup data saved');
    }

    async loadDesignData() {
        const orderData = this.dataManager.getOrderData();
        const files = this.dataManager.getSTLFiles();
        console.log('🎨 Design data loaded');
    }

    saveDesignData() {
        console.log('💾 Design data saved');
    }

    async loadFinalizeData() {
        const orderData = this.dataManager.getOrderData();
        const files = this.dataManager.getSTLFiles();
        console.log('🏁 Finalize data loaded');
    }

    saveFinalizeData() {
        console.log('💾 Finalize data saved');
    }
}

// Initialize immediately when script loads
if (typeof window !== 'undefined') {
    window.workflowDataBridge = new WorkflowDataBridge();
    console.log('✅ WorkflowDataBridge initialized immediately');
}

// Also initialize on DOM ready as backup
document.addEventListener('DOMContentLoaded', function() {
    if (!window.workflowDataBridge) {
        window.workflowDataBridge = new WorkflowDataBridge();
        console.log('✅ WorkflowDataBridge initialized on DOM ready');
    }
});

console.log('✅ WorkflowDataBridge loaded');
