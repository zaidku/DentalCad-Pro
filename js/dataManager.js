/**
 * DentalCAD Pro - Data Management System
 * Handles persistent storage of patient data, STL files, and workflow state
 */

class DataManager {
    constructor() {
        this.storagePrefix = 'dentalcad_';
        this.currentCaseId = null;
        this.init();
    }
// ...existing code...
                console.log('💾 localStorage failed, falling back to optimized storage');
                this.saveSTLFileOptimized(file, id).then(resolve).catch(reject);
            });
        });
    }

    async saveLargeFileDirectly(file, id) {
        return new Promise((resolve) => {
            const fileData = {
                id: id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                uploadedAt: new Date().toISOString(),
                storageType: 'direct_blob',
                blobUrl: URL.createObjectURL(file),
                originalFile: file
            };
            if (!window.dentalCADMemoryStorage) {
                window.dentalCADMemoryStorage = {};
            }
            window.dentalCADMemoryStorage[id] = fileData;
            const existingFiles = this.getSTLFilesFromLocalStorage();
            const metadataOnly = {
                id: fileData.id,
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                lastModified: fileData.lastModified,
                uploadedAt: fileData.uploadedAt,
                storageType: 'direct_blob'
            };
            existingFiles[id] = metadataOnly;
            localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
            console.log('📦 Large STL file saved (direct blob):', file.name, 'ID:', id);
            resolve({ id, fileData });
        });
    }

    async saveSTLFileOptimized(file, id) {
        return new Promise((resolve, reject) => {
            const fileData = {
                id: id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                uploadedAt: new Date().toISOString(),
                storageType: 'optimized_blob',
                blobUrl: URL.createObjectURL(file),
                originalFile: file
            };
            try {
                const existingFiles = this.getSTLFilesFromLocalStorage();
                const metadataOnly = {
                    id: fileData.id,
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type,
                    lastModified: fileData.lastModified,
                    uploadedAt: fileData.uploadedAt,
                    storageType: 'optimized_blob'
                };
                existingFiles[id] = metadataOnly;
                localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
                if (!window.dentalCADMemoryStorage) {
                    window.dentalCADMemoryStorage = {};
                }
                window.dentalCADMemoryStorage[id] = fileData;
                console.log('� STL file saved (optimized):', file.name, 'ID:', id);
                resolve({ id, fileData });
            } catch (error) {
                if (!window.dentalCADMemoryStorage) {
                    window.dentalCADMemoryStorage = {};
                }
                fileData.storageType = 'memory_only';
                window.dentalCADMemoryStorage[id] = fileData;
                console.log('🧠 STL file saved (memory only):', file.name, 'ID:', id);
                resolve({ id, fileData });
            }
        });
    }

    async saveSTLFileToLocalStorage(file, id) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const fileData = {
                        id: id,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        data: reader.result,
                        uploadedAt: new Date().toISOString(),
                        storageType: 'localStorage'
                    };
                    const existingFiles = this.getSTLFilesFromLocalStorage();
                    existingFiles[id] = fileData;
                    localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
                    console.log('📁 STL file saved (localStorage):', file.name, 'ID:', id);
                    resolve({ id, fileData });
                } catch (error) {
                    console.warn('⚠️ localStorage failed:', error.message);
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    getSTLFilesFromLocalStorage() {
        const data = localStorage.getItem(this.caseKey + '_files');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('❌ Error parsing STL files from localStorage:', error);
                return {};
            }
        }
        return {};
    }

    getSTLFiles() {
        let files = {};
        const localStorageFiles = this.getSTLFilesFromLocalStorage();
        Object.assign(files, localStorageFiles);
        if (window.dentalCADMemoryStorage) {
            Object.keys(window.dentalCADMemoryStorage).forEach(id => {
                const fileData = window.dentalCADMemoryStorage[id];
                if (files[id]) {
                    files[id] = { ...files[id], ...fileData };
                } else {
                    files[id] = fileData;
                }
            });
        }
        return files;
    }

    // ...existing code...
}
                return {};
            }
        }
        
        return {};
    }

    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get all STL files for current case
    getSTLFiles() {
        let files = {};
        
        // Get files from localStorage (metadata and small files with full data)
        const localStorageFiles = this.getSTLFilesFromLocalStorage();
        Object.assign(files, localStorageFiles);
        
        // Merge with memory storage (medium and large files)
        if (window.dentalCADMemoryStorage) {
            Object.keys(window.dentalCADMemoryStorage).forEach(id => {
                const fileData = window.dentalCADMemoryStorage[id];
                if (fileData.caseId === this.currentCaseId) {
                    // If we have metadata in localStorage but file in memory, merge them
                    if (files[id]) {
                        files[id] = { ...files[id], ...fileData };
                    } else {
    constructor() {
        this.storagePrefix = 'dentalcad_';
        // Always use a single flexible case for the current workflow session
        this.caseKey = this.storagePrefix + 'currentCase';
        this.init();
    }

    init() {
        console.log('📊 DataManager initialized for flexible workflow case');
    }

    // Save patient and order information
    saveOrderData(orderData) {
        localStorage.setItem(this.caseKey + '_order', JSON.stringify({
            ...orderData,
            lastUpdated: new Date().toISOString()
        }));
        console.log('💾 Order data saved for workflow');
        return true;
    }

    // Get patient and order information
    getOrderData() {
        const data = localStorage.getItem(this.caseKey + '_order');
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                console.log('📖 Order data loaded for workflow');
                return parsedData;
            } catch (error) {
                console.error('❌ Error parsing order data:', error);
                return null;
            }
        }
        return null;
    }

    // Save STL file data (using efficient storage method)
    async saveSTLFile(file, fileId = null) {
        return new Promise((resolve, reject) => {
            const id = fileId || this.generateFileId();
            console.log(`📁 Processing file: ${file.name}, Size: ${this.formatFileSize(file.size)}`);
            // For very large files (>10MB), use direct blob storage without reading contents
            if (file.size > 10 * 1024 * 1024) {
                console.log('📦 Large file detected, using direct blob storage');
                this.saveLargeFileDirectly(file, id).then(resolve).catch(reject);
                return;
            }
            // For medium files (1-10MB), use optimized storage
            if (file.size > 1 * 1024 * 1024) {
                console.log('📄 Medium file detected, using optimized storage');
                this.saveSTLFileOptimized(file, id).then(resolve).catch(reject);
                return;
            }
            // For small files (<1MB), try localStorage first
            console.log('💾 Small file detected, using localStorage');
            this.saveSTLFileToLocalStorage(file, id).then(resolve).catch(() => {
                console.log('💾 localStorage failed, falling back to optimized storage');
                this.saveSTLFileOptimized(file, id).then(resolve).catch(reject);
            });
        });
    }

    // Save very large files directly without reading contents
    async saveLargeFileDirectly(file, id) {
        return new Promise((resolve) => {
            const fileData = {
                id: id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                uploadedAt: new Date().toISOString(),
                storageType: 'direct_blob',
                blobUrl: URL.createObjectURL(file),
                originalFile: file
            };
            if (!window.dentalCADMemoryStorage) {
                window.dentalCADMemoryStorage = {};
            }
            window.dentalCADMemoryStorage[id] = fileData;
            // Save metadata to localStorage
            const existingFiles = this.getSTLFilesFromLocalStorage();
            const metadataOnly = {
                id: fileData.id,
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                lastModified: fileData.lastModified,
                uploadedAt: fileData.uploadedAt,
                storageType: 'direct_blob'
            };
            existingFiles[id] = metadataOnly;
            localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
            console.log('📦 Large STL file saved (direct blob):', file.name, 'ID:', id);
            resolve({ id, fileData });
        });
    }

    // Save medium files with optimization
    async saveSTLFileOptimized(file, id) {
        return new Promise((resolve, reject) => {
            const fileData = {
                id: id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                uploadedAt: new Date().toISOString(),
                storageType: 'optimized_blob',
                blobUrl: URL.createObjectURL(file),
                originalFile: file
            };
            try {
                const existingFiles = this.getSTLFilesFromLocalStorage();
                const metadataOnly = {
                    id: fileData.id,
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type,
                    lastModified: fileData.lastModified,
                    uploadedAt: fileData.uploadedAt,
                    storageType: 'optimized_blob'
                };
                existingFiles[id] = metadataOnly;
                localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
                if (!window.dentalCADMemoryStorage) {
                    window.dentalCADMemoryStorage = {};
                }
                window.dentalCADMemoryStorage[id] = fileData;
                console.log('� STL file saved (optimized):', file.name, 'ID:', id);
                resolve({ id, fileData });
            } catch (error) {
                if (!window.dentalCADMemoryStorage) {
                    window.dentalCADMemoryStorage = {};
                }
                fileData.storageType = 'memory_only';
                window.dentalCADMemoryStorage[id] = fileData;
                console.log('🧠 STL file saved (memory only):', file.name, 'ID:', id);
                resolve({ id, fileData });
            }
        });
    }

    // Save small files to localStorage with base64
    async saveSTLFileToLocalStorage(file, id) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const fileData = {
                        id: id,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        data: reader.result,
                        uploadedAt: new Date().toISOString(),
                        storageType: 'localStorage'
                    };
                    const existingFiles = this.getSTLFilesFromLocalStorage();
                    existingFiles[id] = fileData;
                    localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
                    console.log('📁 STL file saved (localStorage):', file.name, 'ID:', id);
                    resolve({ id, fileData });
                } catch (error) {
                    console.warn('⚠️ localStorage failed:', error.message);
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    // Helper method to get files from localStorage only
    getSTLFilesFromLocalStorage() {
        const data = localStorage.getItem(this.caseKey + '_files');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('❌ Error parsing STL files from localStorage:', error);
                return {};
            }
        }
        return {};
    }

    // Get all STL files for current workflow
    getSTLFiles() {
        let files = {};
        const localStorageFiles = this.getSTLFilesFromLocalStorage();
        Object.assign(files, localStorageFiles);
        if (window.dentalCADMemoryStorage) {
            Object.keys(window.dentalCADMemoryStorage).forEach(id => {
                const fileData = window.dentalCADMemoryStorage[id];
                if (files[id]) {
                    files[id] = { ...files[id], ...fileData };
                } else {
                    files[id] = fileData;
                }
            });
        }
        return files;
    }

    // ...existing code...
            
            // If we have base64 data (localStorage format), convert it
            if (fileData.data) {
                console.log('📄 Converting from base64 data:', fileData.name);
                // Convert base64 back to binary
                const base64Data = fileData.data.split(',')[1];
                const binaryData = atob(base64Data);
                const bytes = new Uint8Array(binaryData.length);
                
                for (let i = 0; i < binaryData.length; i++) {
                    bytes[i] = binaryData.charCodeAt(i);
                }
                
                // Create File object
                const file = new File([bytes], fileData.name, {
                    type: fileData.type,
                    lastModified: fileData.lastModified
                });
                
                return file;
            }
            
            // For other storage types, we need the original file
            console.warn('⚠️ Cannot reconstruct file - missing file data:', fileData.name, 'Storage type:', fileData.storageType);
            return null;
        } catch (error) {
            console.error('❌ Error converting data to file:', error, fileData);
            return null;
        }
    }

    // Convert blob URL back to File object
    async blobUrlToFile(fileData) {
        try {
            const response = await fetch(fileData.blobUrl);
            const blob = await response.blob();
            
            const file = new File([blob], fileData.name, {
                type: fileData.type || blob.type,
                lastModified: fileData.lastModified
            });
            
            console.log('✅ Successfully converted blob URL to file:', fileData.name);
            return file;
        } catch (error) {
            console.error('❌ Failed to convert blob URL to file:', error, fileData.name);
            return null;
        }
    }

    // Remove STL file
    removeSTLFile(fileId) {
        let removed = false;
        
        // Remove from localStorage
        const files = this.getSTLFiles();
        if (files[fileId]) {
            delete files[fileId];
            const key = this.storagePrefix + 'files_' + this.currentCaseId;
            
            // Filter out memory-only files from localStorage
            const persistentFiles = {};
            Object.keys(files).forEach(id => {
                if (files[id].storageType !== 'memory') {
                    persistentFiles[id] = files[id];
                }
            });
            
            try {
                localStorage.setItem(key, JSON.stringify(persistentFiles));
            } catch (error) {
                console.warn('⚠️ Could not update localStorage:', error);
            }
            removed = true;
        }
        
        // Remove from memory storage
        if (window.dentalCADMemoryStorage && window.dentalCADMemoryStorage[fileId]) {
            // Clean up blob URL to prevent memory leaks
            if (window.dentalCADMemoryStorage[fileId].blobUrl) {
                URL.revokeObjectURL(window.dentalCADMemoryStorage[fileId].blobUrl);
            }
            delete window.dentalCADMemoryStorage[fileId];
            removed = true;
        }
        
        if (removed) {
            console.log('🗑️ STL file removed:', fileId);
        }
        
        return removed;
    }

    // Generate unique file ID
    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save workflow state
    saveWorkflowState(state) {
        const key = this.storagePrefix + 'workflow_' + this.currentCaseId;
        const workflowData = {
            ...state,
            lastUpdated: new Date().toISOString(),
            caseId: this.currentCaseId
        };
        
        localStorage.setItem(key, JSON.stringify(workflowData));
        console.log('🔄 Workflow state saved for case:', this.currentCaseId);
    }

    // Get workflow state
    getWorkflowState() {
        const key = this.storagePrefix + 'workflow_' + this.currentCaseId;
        const data = localStorage.getItem(key);
        
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('❌ Error parsing workflow state:', error);
                return null;
            }
        }
        
        return null;
    }

    // Get case summary
    getCaseSummary() {
        const orderData = this.getOrderData();
        const files = this.getSTLFiles();
        const workflow = this.getWorkflowState();
        
        return {
            caseId: this.currentCaseId,
            orderData,
            fileCount: Object.keys(files).length,
            files: Object.values(files).map(f => ({
                id: f.id,
                name: f.name,
                size: f.size,
                uploadedAt: f.uploadedAt
            })),
            workflow,
            lastActivity: this.getLastActivity()
        };
    }

    // Get last activity timestamp
    getLastActivity() {
        const orderData = this.getOrderData();
        const workflow = this.getWorkflowState();
        
        const timestamps = [];
        if (orderData?.lastUpdated) timestamps.push(new Date(orderData.lastUpdated));
        if (workflow?.lastUpdated) timestamps.push(new Date(workflow.lastUpdated));
        
        if (timestamps.length > 0) {
            return new Date(Math.max(...timestamps)).toISOString();
        }
        
        return new Date().toISOString();
    }

    // Check storage usage
    getStorageInfo() {
        let totalSize = 0;
        let itemCount = 0;
        let memoryFiles = 0;
        
        // Count localStorage usage
        for (let key in localStorage) {
            if (key.startsWith(this.storagePrefix)) {
                totalSize += localStorage[key].length;
                itemCount++;
            }
        }
        
        // Count memory storage
        if (window.dentalCADMemoryStorage) {
            memoryFiles = Object.keys(window.dentalCADMemoryStorage).length;
        }
        
        return {
            itemCount,
            memoryFiles,
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            available: this.isStorageAvailable(),
            quotaWarning: totalSize > 4 * 1024 * 1024 // Warn if over 4MB
        };
    }

    // Check if localStorage is available and has space
    isStorageAvailable() {
        try {
            const test = 'localStorage-test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Export case data
    exportCaseData() {
        const summary = this.getCaseSummary();
        const files = this.getSTLFiles();
        
        const exportData = {
            ...summary,
            fullFileData: files,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        return exportData;
    }

    // Import case data
    importCaseData(importData) {
        try {
            if (importData.version !== '1.0') {
                throw new Error('Unsupported data version');
            }
            
            // Save order data
            if (importData.orderData) {
                this.saveOrderData(importData.orderData);
            }
            
            // Save files
            if (importData.fullFileData) {
                const key = this.storagePrefix + 'files_' + this.currentCaseId;
                localStorage.setItem(key, JSON.stringify(importData.fullFileData));
            }
            
            // Save workflow
            if (importData.workflow) {
                this.saveWorkflowState(importData.workflow);
            }
            
            console.log('📥 Case data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Error importing case data:', error);
            return false;
        }
    }

    // Clean up old cases (keep last 10 cases)
    cleanupOldCases() {
        const maxCases = 10;
        const cases = [];
        
        // Find all case keys
        for (let key in localStorage) {
            if (key.startsWith(this.storagePrefix + 'case_')) {
                const caseId = key.replace(this.storagePrefix + 'case_', '');
                try {
                    const data = JSON.parse(localStorage[key]);
                    cases.push({
                        caseId,
                        lastUpdated: new Date(data.lastUpdated || 0)
                    });
                } catch (error) {
                    // Invalid data, mark for cleanup
                    cases.push({
                        caseId,
                        lastUpdated: new Date(0)
                    });
                }
            }
        }
        
        // Sort by last updated (newest first)
        cases.sort((a, b) => b.lastUpdated - a.lastUpdated);
        
        // Remove old cases
        if (cases.length > maxCases) {
            const casesToRemove = cases.slice(maxCases);
            casesToRemove.forEach(caseInfo => {
                localStorage.removeItem(this.storagePrefix + 'case_' + caseInfo.caseId);
                localStorage.removeItem(this.storagePrefix + 'files_' + caseInfo.caseId);
                localStorage.removeItem(this.storagePrefix + 'workflow_' + caseInfo.caseId);
            });
            
            console.log('🧹 Cleaned up', casesToRemove.length, 'old cases');
        }
    }

    // Show storage warning to user
    showStorageWarning(message, type = 'warning') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        
        switch (type) {
            case 'success':
                notification.className += ' bg-green-600 text-white';
class DataManager {
    constructor() {
        this.storagePrefix = 'dentalcad_';
        this.caseKey = this.storagePrefix + 'currentCase';
        this.init();
    }

    init() {
        console.log('📊 DataManager initialized for flexible workflow case');
    }

    saveOrderData(orderData) {
        localStorage.setItem(this.caseKey + '_order', JSON.stringify({
            ...orderData,
            lastUpdated: new Date().toISOString()
        }));
        console.log('💾 Order data saved for workflow');
        return true;
    }

    getOrderData() {
        const data = localStorage.getItem(this.caseKey + '_order');
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                console.log('📖 Order data loaded for workflow');
                return parsedData;
            } catch (error) {
                console.error('❌ Error parsing order data:', error);
                return null;
            }
        }
        return null;
    }

    async saveSTLFile(file, fileId = null) {
        return new Promise((resolve, reject) => {
            const id = fileId || this.generateFileId();
            console.log(`📁 Processing file: ${file.name}, Size: ${this.formatFileSize(file.size)}`);
            if (file.size > 10 * 1024 * 1024) {
                console.log('📦 Large file detected, using direct blob storage');
                this.saveLargeFileDirectly(file, id).then(resolve).catch(reject);
                return;
            }
            if (file.size > 1 * 1024 * 1024) {
                console.log('📄 Medium file detected, using optimized storage');
                this.saveSTLFileOptimized(file, id).then(resolve).catch(reject);
                return;
            }
            console.log('💾 Small file detected, using localStorage');
            this.saveSTLFileToLocalStorage(file, id).then(resolve).catch(() => {
                console.log('💾 localStorage failed, falling back to optimized storage');
                this.saveSTLFileOptimized(file, id).then(resolve).catch(reject);
            });
        });
    }

    async saveLargeFileDirectly(file, id) {
        return new Promise((resolve) => {
            const fileData = {
                id: id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                uploadedAt: new Date().toISOString(),
                storageType: 'direct_blob',
                blobUrl: URL.createObjectURL(file),
                originalFile: file
            };
            if (!window.dentalCADMemoryStorage) {
                window.dentalCADMemoryStorage = {};
            }
            window.dentalCADMemoryStorage[id] = fileData;
            const existingFiles = this.getSTLFilesFromLocalStorage();
            const metadataOnly = {
                id: fileData.id,
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                lastModified: fileData.lastModified,
                uploadedAt: fileData.uploadedAt,
                storageType: 'direct_blob'
            };
            existingFiles[id] = metadataOnly;
            localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
            console.log('📦 Large STL file saved (direct blob):', file.name, 'ID:', id);
            resolve({ id, fileData });
        });
    }

    async saveSTLFileOptimized(file, id) {
        return new Promise((resolve, reject) => {
            const fileData = {
                id: id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                uploadedAt: new Date().toISOString(),
                storageType: 'optimized_blob',
                blobUrl: URL.createObjectURL(file),
                originalFile: file
            };
            try {
                const existingFiles = this.getSTLFilesFromLocalStorage();
                const metadataOnly = {
                    id: fileData.id,
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type,
                    lastModified: fileData.lastModified,
                    uploadedAt: fileData.uploadedAt,
                    storageType: 'optimized_blob'
                };
                existingFiles[id] = metadataOnly;
                localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
                if (!window.dentalCADMemoryStorage) {
                    window.dentalCADMemoryStorage = {};
                }
                window.dentalCADMemoryStorage[id] = fileData;
                console.log('� STL file saved (optimized):', file.name, 'ID:', id);
                resolve({ id, fileData });
            } catch (error) {
                if (!window.dentalCADMemoryStorage) {
                    window.dentalCADMemoryStorage = {};
                }
                fileData.storageType = 'memory_only';
                window.dentalCADMemoryStorage[id] = fileData;
                console.log('🧠 STL file saved (memory only):', file.name, 'ID:', id);
                resolve({ id, fileData });
            }
        });
    }

    async saveSTLFileToLocalStorage(file, id) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const fileData = {
                        id: id,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        data: reader.result,
                        uploadedAt: new Date().toISOString(),
                        storageType: 'localStorage'
                    };
                    const existingFiles = this.getSTLFilesFromLocalStorage();
                    existingFiles[id] = fileData;
                    localStorage.setItem(this.caseKey + '_files', JSON.stringify(existingFiles));
                    console.log('📁 STL file saved (localStorage):', file.name, 'ID:', id);
                    resolve({ id, fileData });
                } catch (error) {
                    console.warn('⚠️ localStorage failed:', error.message);
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    getSTLFilesFromLocalStorage() {
        const data = localStorage.getItem(this.caseKey + '_files');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('❌ Error parsing STL files from localStorage:', error);
                return {};
            }
        }
        return {};
    }

    getSTLFiles() {
        let files = {};
        const localStorageFiles = this.getSTLFilesFromLocalStorage();
        Object.assign(files, localStorageFiles);
        if (window.dentalCADMemoryStorage) {
            Object.keys(window.dentalCADMemoryStorage).forEach(id => {
                const fileData = window.dentalCADMemoryStorage[id];
                if (files[id]) {
                    files[id] = { ...files[id], ...fileData };
                } else {
                    files[id] = fileData;
                }
            });
        }
        return files;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Create global instance
window.dataManager = new DataManager();
console.log('✅ DataManager loaded and initialized');

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Create global instance
window.dataManager = new DataManager();

// Global debug function for browser console
window.debugDentalCAD = function() {
    console.log('🐛 DentalCAD Debug Information:');
    console.log('📊 DataManager:', window.dataManager);
    console.log('🌉 WorkflowDataBridge:', window.workflowDataBridge);
    
    if (window.dataManager) {
        const debug = {
            currentCaseId: window.dataManager.currentCaseId,
            orderData: window.dataManager.getOrderData(),
            files: window.dataManager.getSTLFiles(),
            storageInfo: window.dataManager.getStorageInfo(),
            localStorageKeys: Object.keys(localStorage).filter(key => key.startsWith('dentalcad_')),
            memoryStorage: window.dentalCADMemoryStorage ? Object.keys(window.dentalCADMemoryStorage) : []
        };
        console.log('📋 Debug data:', debug);
        
        // Check raw localStorage data
        console.log('🗄️ Raw localStorage data:');
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('dentalcad_')) {
                console.log(key + ':', localStorage.getItem(key));
            }
        });
        
        return debug;
    }
    
    return null;
};

// Helper function to manually trigger data load
window.reloadStageData = function() {
    if (window.workflowDataBridge) {
        console.log('🔄 Manually reloading stage data...');
        window.workflowDataBridge.loadStageData();
    } else {
        console.log('❌ WorkflowDataBridge not available');
    }
};

console.log('✅ DataManager loaded and initialized');
console.log('💡 Use debugDentalCAD() in browser console for debugging');
