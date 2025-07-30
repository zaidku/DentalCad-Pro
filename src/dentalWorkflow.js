// Dental Workflow Stage Management System
// Manages the multi-stage dental design process from order to final export

class DentalWorkflowManager {
    constructor() {
        this.currentStage = 2; // Start at Stage 2 (Scan Clean) since that's what index.html currently shows
        this.stages = {
            1: {
                name: 'Order Form',
                title: 'Patient & Order Information',
                description: 'Enter patient details and restoration requirements',
                component: 'OrderFormStage',
                color: '#dc2626', // Red
                icon: 'fas fa-clipboard-list'
            },
            2: {
                name: 'Scan Cleanup',
                title: 'Scan Upload & Cleaning',
                description: 'Upload STL files and clean scan data',
                component: 'ScanCleaningStage',
                color: '#ea580c', // Orange
                icon: 'fas fa-upload'
            },
            3: {
                name: 'Margin',
                title: 'Margin Placement',
                description: 'Define preparation margin line',
                component: 'MarginPlacementStage',
                color: '#737373', // Gray
                icon: 'fas fa-edit'
            },
            4: {
                name: 'Design',
                title: 'Crown Design',
                description: 'Place and fit crown restoration',
                component: 'CrownDesignStage',
                color: '#0d9488', // Teal
                icon: 'fas fa-tooth'
            },
            5: {
                name: 'Complete',
                title: 'Review & Export',
                description: 'Final review and export files',
                component: 'FinalizeStage',
                color: '#16a34a', // Green
                icon: 'fas fa-check-circle'
            }
        };
        
        this.orderData = {
            patientName: 'John Smith', // Default from current interface
            toothNumber: '14',
            shade: 'A2',
            material: 'Zirconia',
            notes: '',
            caseNumber: 'DC-2023-4872' // From the screenshot
        };
        
        this.stageData = {
            scans: [],
            margin: null,
            crown: null,
            modifications: []
        };
        
        // Make globally accessible
        window.dentalWorkflowManager = this;
        window.workflowManager = this;
        
        // Initialize backend service
        this.initializeBackendService();
        
        this.init();
    }
    
    initializeBackendService() {
        // Initialize the modeling backend service if available
        if (typeof ModelingBackendService !== 'undefined') {
            window.modelingBackendService = new ModelingBackendService();
            console.log('🔧 Modeling Backend Service initialized');
        } else {
            console.warn('⚠️ ModelingBackendService not available, using fallback methods');
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
    
    init() {
        this.createProgressBar();
        // Setup Next button with a small delay to ensure DOM is ready
        setTimeout(() => {
            this.setupNextButton();
        }, 100);
        // Don't automatically show stages - just add the progress bar to the existing interface
        // The existing index.html content represents Stage 2 (Scan Clean)
    }
    
    setupNextButton() {
        // Add event listener for the Next button
        const nextBtn = document.getElementById('workflowNextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextStage();
            });
            
            // Update button text based on current stage
            this.updateNextButton();
        }
    }
    
    updateNextButton() {
        const nextBtn = document.getElementById('workflowNextBtn');
        if (!nextBtn) return;
        
        const buttonText = nextBtn.querySelector('span');
        if (!buttonText) return;
        
        const nextStageNum = this.currentStage + 1;
        const nextStage = this.stages[nextStageNum];
        
        if (nextStage) {
            buttonText.textContent = `Next: ${nextStage.name}`;
            nextBtn.disabled = false;
            nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            buttonText.textContent = 'Complete';
            nextBtn.disabled = false;
            nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    createProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.id = 'workflow-progress';
        progressContainer.className = 'bg-gray-800 border-b border-gray-700 px-4 py-2';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'flex items-center space-x-1 max-w-6xl mx-auto';
        
        // Create the navigation tabs like in the screenshot
        const tabs = [
            { num: 1, name: 'Order Form', isActive: this.currentStage === 1 },
            { num: 2, name: 'Scan Cleanup', isActive: this.currentStage === 2 },
            { num: 3, name: 'Margin', isActive: this.currentStage === 3 },
            { num: 4, name: 'Design', isActive: this.currentStage === 4 }
        ];
        
        tabs.forEach((tab, index) => {
            const tabElement = document.createElement('button');
            tabElement.className = `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab.isActive 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`;
            tabElement.textContent = tab.name;
            
            // Add click handler to navigate to stage
            tabElement.addEventListener('click', () => {
                this.showStage(tab.num);
            });
            
            progressBar.appendChild(tabElement);
        });
        
        progressContainer.appendChild(progressBar);
        
        // Insert at the top of the page
        const body = document.body;
        const firstChild = body.firstElementChild;
        body.insertBefore(progressContainer, firstChild);
    }
    
    showStage(stageNumber) {
        this.currentStage = stageNumber;
        this.updateProgressBar();
        this.updateNextButton();
        
        if (stageNumber === 2) {
            // Stage 2 is the existing interface - don't hide it, just ensure it's visible
            const defaultInterface = document.querySelector('.default-interface');
            if (defaultInterface) {
                defaultInterface.style.display = 'flex';
            }
            
            // Hide any other stage content
            document.querySelectorAll('.stage-content').forEach(content => {
                if (content.id !== 'stage-2') {
                    content.style.display = 'none';
                }
            });
            
            console.log(`🏥 Switched to Stage ${stageNumber}: ${this.stages[stageNumber].name} (Existing Interface)`);
            return;
        }
        
        // Hide the default interface for other stages
        const defaultInterface = document.querySelector('.default-interface');
        if (defaultInterface) {
            defaultInterface.style.display = 'none';
        }
        
        // Hide all stage content
        document.querySelectorAll('.stage-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show current stage
        const stageContent = document.getElementById(`stage-${stageNumber}`);
        if (stageContent) {
            stageContent.style.display = 'flex';
        } else {
            this.createStageContent(stageNumber);
        }
        
        console.log(`🏥 Switched to Stage ${stageNumber}: ${this.stages[stageNumber].name}`);
    }
    
    updateProgressBar() {
        // Remove existing progress bar and recreate it with current state
        const existingProgress = document.getElementById('workflow-progress');
        if (existingProgress) {
            existingProgress.remove();
        }
        this.createProgressBar();
    }
    
    createStageContent(stageNumber) {
        const stage = this.stages[stageNumber];
        
        // Create main container for stage
        const stageContainer = document.createElement('div');
        stageContainer.id = `stage-${stageNumber}`;
        stageContainer.className = 'stage-content flex h-full';
        
        switch (stageNumber) {
            case 1:
                this.createOrderFormStage(stageContainer);
                break;
            case 2:
                this.createScanCleaningStage(stageContainer);
                break;
            case 3:
                this.createMarginPlacementStage(stageContainer);
                break;
            case 4:
                this.createCrownDesignStage(stageContainer);
                break;
            case 5:
                this.createFinalizeStage(stageContainer);
                break;
        }
        
        // Replace the current main content
        const mainContent = document.querySelector('.flex.h-full');
        if (mainContent && mainContent.parentNode) {
            mainContent.parentNode.appendChild(stageContainer);
        }
    }
    
    createOrderFormStage(container) {
        container.innerHTML = `
            <div class="w-full bg-gray-900 flex items-center justify-center">
                <div class="max-w-2xl w-full p-8">
                    <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
                        <div class="text-center mb-8">
                            <i class="fas fa-clipboard-list text-4xl text-dental-primary mb-4"></i>
                            <h1 class="text-2xl font-bold text-white mb-2">New Dental Case</h1>
                            <p class="text-gray-400">Enter patient information and restoration details</p>
                        </div>
                        
                        <form id="orderForm" class="space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Patient Name *</label>
                                    <input type="text" id="patientName" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent" placeholder="John Doe">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Case Number</label>
                                    <input type="text" id="caseNumber" readonly class="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-md text-gray-300" value="${this.orderData.caseNumber}">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Tooth Number *</label>
                                    <select id="toothNumber" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent">
                                        <option value="">Select Tooth</option>
                                        <optgroup label="Upper Right">
                                            <option value="1">1 - Third Molar</option>
                                            <option value="2">2 - Second Molar</option>
                                            <option value="3">3 - First Molar</option>
                                            <option value="4">4 - Second Premolar</option>
                                            <option value="5">5 - First Premolar</option>
                                            <option value="6">6 - Canine</option>
                                            <option value="7">7 - Lateral Incisor</option>
                                            <option value="8">8 - Central Incisor</option>
                                        </optgroup>
                                        <optgroup label="Upper Left">
                                            <option value="9">9 - Central Incisor</option>
                                            <option value="10">10 - Lateral Incisor</option>
                                            <option value="11">11 - Canine</option>
                                            <option value="12">12 - First Premolar</option>
                                            <option value="13">13 - Second Premolar</option>
                                            <option value="14">14 - First Molar</option>
                                            <option value="15">15 - Second Molar</option>
                                            <option value="16">16 - Third Molar</option>
                                        </optgroup>
                                        <optgroup label="Lower Left">
                                            <option value="17">17 - Third Molar</option>
                                            <option value="18">18 - Second Molar</option>
                                            <option value="19">19 - First Molar</option>
                                            <option value="20">20 - Second Premolar</option>
                                            <option value="21">21 - First Premolar</option>
                                            <option value="22">22 - Canine</option>
                                            <option value="23">23 - Lateral Incisor</option>
                                            <option value="24">24 - Central Incisor</option>
                                        </optgroup>
                                        <optgroup label="Lower Right">
                                            <option value="25">25 - Central Incisor</option>
                                            <option value="26">26 - Lateral Incisor</option>
                                            <option value="27">27 - Canine</option>
                                            <option value="28">28 - First Premolar</option>
                                            <option value="29">29 - Second Premolar</option>
                                            <option value="30">30 - First Molar</option>
                                            <option value="31">31 - Second Molar</option>
                                            <option value="32">32 - Third Molar</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Shade *</label>
                                    <select id="shade" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent">
                                        <option value="">Select Shade</option>
                                        <optgroup label="VITA Classical">
                                            <option value="A1">A1</option>
                                            <option value="A2">A2</option>
                                            <option value="A3">A3</option>
                                            <option value="A3.5">A3.5</option>
                                            <option value="A4">A4</option>
                                            <option value="B1">B1</option>
                                            <option value="B2">B2</option>
                                            <option value="B3">B3</option>
                                            <option value="B4">B4</option>
                                            <option value="C1">C1</option>
                                            <option value="C2">C2</option>
                                            <option value="C3">C3</option>
                                            <option value="C4">C4</option>
                                            <option value="D2">D2</option>
                                            <option value="D3">D3</option>
                                            <option value="D4">D4</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Material *</label>
                                <select id="material" required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent">
                                    <option value="">Select Material</option>
                                    <option value="zirconia">Zirconia</option>
                                    <option value="emax">IPS e.max</option>
                                    <option value="pfm">Porcelain Fused to Metal (PFM)</option>
                                    <option value="gold">Gold Alloy</option>
                                    <option value="composite">Composite Resin</option>
                                    <option value="titanium">Titanium</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Special Notes</label>
                                <textarea id="notes" rows="3" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-transparent" placeholder="Any special instructions or notes..."></textarea>
                            </div>
                            
                            <div class="flex justify-end pt-4">
                                <button type="submit" class="bg-dental-primary hover:bg-dental-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                    Continue to Scan Upload
                                    <i class="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add form submission handler
        const form = container.querySelector('#orderForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrderData();
            this.showStage(2);
        });
    }
    
    createScanCleaningStage(container) {
        // This will use the existing 3D interface but with stage-specific focus
        container.innerHTML = `
            <!-- This is the existing 3D interface content -->
            <div class="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 space-y-6">
                <!-- Logo -->
                <div class="w-10 h-10 rounded-md bg-dental-primary flex items-center justify-center text-white font-bold">
                    DC
                </div>

                <!-- Scan Cleaning Tools -->
                <div class="flex flex-col items-center space-y-4 w-full">
                    <button class="tool-button active w-12 h-12 rounded-lg flex items-center justify-center text-dental-primary hover:bg-gray-800" data-tool="select" title="Select Tool">
                        <i class="fas fa-mouse-pointer text-lg"></i>
                    </button>

                    <button class="tool-button w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-dental-primary" data-tool="addMaterial" title="Add Material">
                        <i class="fas fa-plus text-lg"></i>
                    </button>

                    <button class="tool-button w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-dental-primary" data-tool="removeMaterial" title="Remove Material">
                        <i class="fas fa-minus text-lg"></i>
                    </button>

                    <button class="tool-button w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-dental-primary" data-tool="smooth" title="Smooth Surface">
                        <i class="fas fa-magic text-lg"></i>
                    </button>

                    <button class="tool-button w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-dental-primary" data-tool="cut" title="Cut Tool">
                        <i class="fas fa-cut text-lg"></i>
                    </button>

                    <div class="border-t border-gray-800 w-8 mx-auto"></div>

                    <button class="tool-button w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-dental-primary" data-tool="layers" title="Layers">
                        <i class="fas fa-layer-group text-lg"></i>
                    </button>
                </div>

                <div class="mt-auto flex flex-col items-center space-y-4">
                    <button id="undoButton" class="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-dental-primary" title="Undo">
                        <i class="fas fa-undo text-lg"></i>
                    </button>
                    <button class="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-dental-primary" title="Settings">
                        <i class="fas fa-cog text-lg"></i>
                    </button>
                </div>
            </div>

            <!-- Left Panel - Case Info & File Upload -->
            <div class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div class="p-4 border-b border-gray-800">
                    <h2 class="font-semibold text-lg">Case Information</h2>
                    <div class="text-sm text-gray-400">${this.orderData.caseNumber}</div>
                </div>

                <div class="p-4 border-b border-gray-800">
                    <div class="flex items-center space-x-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-dental-primary flex items-center justify-center text-white">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div class="font-medium">${this.orderData.patientName || 'Patient Name'}</div>
                            <div class="text-xs text-gray-400">Tooth #${this.orderData.toothNumber || 'N/A'}</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="bg-gray-800 rounded p-2">
                            <div class="text-gray-400">Material</div>
                            <div>${this.orderData.material || 'N/A'}</div>
                        </div>
                        <div class="bg-gray-800 rounded p-2">
                            <div class="text-gray-400">Shade</div>
                            <div>${this.orderData.shade || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="p-4 border-b border-gray-800 flex-1">
                    <h3 class="font-medium mb-2">Scan Files</h3>

                    <div id="dropzone" class="dropzone rounded-lg p-4 mb-3 text-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-dental-primary transition-colors">
                        <i class="fas fa-cloud-upload-alt text-2xl text-dental-primary mb-2"></i>
                        <div class="text-sm">Drag & drop STL files here</div>
                        <div class="text-xs text-gray-500 mt-1">or click to browse</div>
                        <input type="file" id="fileInput" accept=".stl" class="hidden" multiple>
                    </div>

                    <div class="text-xs text-gray-400 mb-2">Uploaded Files:</div>
                    <div id="uploadedFilesList" class="space-y-1 max-h-40 overflow-y-auto">
                        <div class="text-gray-500 text-sm italic" id="noFilesMessage">No files uploaded yet</div>
                    </div>
                </div>

                <div class="p-4">
                    <button id="nextToMarginBtn" class="w-full bg-dental-primary hover:bg-dental-secondary text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed" disabled>
                        <span>Continue to Margin</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Main Content - 3D Viewport -->
            <div class="flex-1 flex flex-col bg-gray-900">
                <!-- Top Bar -->
                <div class="h-12 border-b border-gray-800 flex items-center px-4">
                    <div class="flex items-center space-x-4">
                        <div class="text-sm bg-gray-800 rounded-full px-3 py-1 flex items-center space-x-1">
                            <span class="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>Scan Cleaning Mode</span>
                        </div>

                        <div class="text-sm text-gray-400">
                            Tool: <span id="toolStatus" class="text-dental-primary">Select</span>
                        </div>
                    </div>

                    <div class="ml-auto flex items-center space-x-3">
                        <button class="text-gray-400 hover:text-dental-primary" title="Undo (Ctrl+Z)">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button id="clearButton" class="text-gray-400 hover:text-red-500" title="Clear All">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <!-- 3D Viewport -->
                <div class="flex-1 relative">
                    <div id="renderCanvas"></div>
                    
                    <!-- SVG overlay for lasso drawing -->
                    <svg id="lassoSVG" class="absolute top-0 left-0 w-full h-full pointer-events-none" style="z-index: 1000;">
                        <path id="lassoPath" class="lasso-line" d="" />
                    </svg>

                    <!-- Viewport Controls -->
                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full px-2 py-1 flex space-x-2">
                        <button id="resetViewBtn" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700" title="Reset View">
                            <i class="fas fa-rotate"></i>
                        </button>
                        <button id="zoomInBtn" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700" title="Zoom In">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button id="zoomOutBtn" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700" title="Zoom Out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button id="toggleGridBtn" class="w-8 h-8 rounded-full flex items-center justify-center bg-dental-primary text-white" title="Toggle Grid">
                            <i class="fas fa-cube"></i>
                        </button>
                    </div>

                    <!-- Viewport Options -->
                    <div class="absolute top-4 right-4 bg-gray-800 rounded-lg p-2">
                        <div class="grid grid-cols-2 gap-2">
                            <button id="wireframeBtn" class="viewport-btn px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600" data-mode="wireframe">Wireframe</button>
                            <button id="solidBtn" class="viewport-btn px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600" data-mode="solid">Solid</button>
                            <button id="shadedBtn" class="viewport-btn px-3 py-1 rounded text-xs bg-dental-primary text-white" data-mode="shaded">Shaded</button>
                            <button id="xrayBtn" class="viewport-btn px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600" data-mode="xray">X-ray</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Panel - Tool Settings -->
            <div class="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
                <div class="p-4 border-b border-gray-800">
                    <div class="flex space-x-2">
                        <button class="tab-button active px-3 py-1 rounded text-sm bg-dental-primary text-white">Tools</button>
                        <button class="tab-button px-3 py-1 rounded text-sm bg-gray-800 hover:bg-gray-700">Settings</button>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto">
                    <!-- Tool Settings Panel -->
                    <div class="tab-content active p-4 space-y-6">
                        <div>
                            <h3 class="font-medium mb-3">Tool Settings</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-xs text-gray-400 mb-1">Tool Strength</label>
                                    <div class="flex items-center space-x-3">
                                        <input type="range" id="strengthSlider" min="0.01" max="0.4" step="0.01" value="0.2" class="w-full property-input">
                                        <span id="strengthValue" class="text-xs w-12 text-center">0.20</span>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-xs text-gray-400 mb-1">Influence Size (mm)</label>
                                    <div class="flex items-center space-x-3">
                                        <input type="range" id="influenceSizeSlider" min="0.1" max="2.0" step="0.1" value="1.0" class="w-full property-input">
                                        <span id="influenceSizeValue" class="text-xs w-12 text-center">1.0</span>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="text-xs text-gray-400">Show Tool Info</label>
                                    <input type="checkbox" id="showToolInfo" checked class="text-dental-primary">
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="text-xs text-gray-400">Show Grid</label>
                                    <input type="checkbox" id="showGrid" checked class="text-dental-primary">
                                </div>
                            </div>
                        </div>

                        <!-- Advanced Modeling Tools -->
                        <div id="modelingToolsContainer">
                            <!-- Advanced modeling tools will be inserted here -->
                        </div>

                        <div class="text-xs text-gray-400 mt-6 p-3 bg-gray-800 rounded">
                            <div class="font-medium mb-2">Scan Cleaning Instructions:</div>
                            <div class="space-y-1">
                                <div>• <strong>Add Material:</strong> Fill holes or missing areas</div>
                                <div>• <strong>Remove Material:</strong> Clean artifacts or excess material</div>
                                <div>• <strong>Smooth:</strong> Smooth rough surfaces</div>
                                <div>• <strong>Cut:</strong> Remove unwanted sections</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize 3D viewer for this stage
        this.initializeStage2();
    }
    
    initializeStage2() {
        // Enable continue button when files are uploaded
        const nextBtn = document.getElementById('nextToMarginBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (loadedModels && loadedModels.length > 0) {
                    this.showStage(3);
                } else {
                    alert('Please upload at least one STL file before continuing.');
                }
            });
            
            // Check for loaded models periodically
            const checkModels = () => {
                if (typeof loadedModels !== 'undefined' && loadedModels.length > 0) {
                    nextBtn.disabled = false;
                    nextBtn.classList.remove('disabled:bg-gray-600', 'disabled:cursor-not-allowed');
                    nextBtn.classList.add('bg-dental-primary', 'hover:bg-dental-secondary');
                } else {
                    setTimeout(checkModels, 1000);
                }
            };
            checkModels();
        }
    }
    
    createMarginPlacementStage(container) {
        container.innerHTML = `
            <div class="w-full h-full bg-gray-900 flex">
                <!-- Left Panel - Margin Tools -->
                <div class="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
                    <div class="p-4 border-b border-gray-800">
                        <h2 class="font-semibold text-lg flex items-center">
                            <i class="fas fa-vector-square text-blue-400 mr-2"></i>
                            Margin Design
                        </h2>
                        <div class="text-sm text-gray-400">Define preparation margin line</div>
                        <div class="text-xs text-blue-400 mt-1">Tooth #${this.orderData.toothNumber || 'N/A'}</div>
                    </div>

                    <!-- Automatic Detection Section -->
                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3 flex items-center">
                            <i class="fas fa-magic text-purple-400 mr-2"></i>
                            Auto Detection
                        </h3>
                        <div class="space-y-2">
                            <button id="autoDetectMargin" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center">
                                <i class="fas fa-search mr-2"></i>Auto-Detect Margin Edge
                            </button>
                            <button id="refineDetection" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm" disabled>
                                <i class="fas fa-adjust mr-2"></i>Refine Detection
                            </button>
                        </div>
                        
                        <div class="mt-3 p-2 bg-gray-800 rounded text-xs">
                            <div class="text-gray-400">Detection Settings:</div>
                            <div class="mt-2 space-y-2">
                                <div>
                                    <label class="text-gray-400">Edge Sensitivity:</label>
                                    <input type="range" id="edgeSensitivity" min="0.1" max="1.0" step="0.1" value="0.7" class="w-full">
                                </div>
                                <div>
                                    <label class="text-gray-400">Point Density:</label>
                                    <input type="range" id="pointDensity" min="10" max="100" step="5" value="50" class="w-full">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Manual Placement Section -->
                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3 flex items-center">
                            <i class="fas fa-hand-pointer text-blue-400 mr-2"></i>
                            Manual Placement
                        </h3>
                        <div class="space-y-2">
                            <button id="addMarginPoint" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-plus mr-2"></i>Add Margin Point
                            </button>
                            <button id="editMarginPoint" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-edit mr-2"></i>Edit Points
                            </button>
                            <button id="deleteMarginPoint" class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-trash mr-2"></i>Delete Point
                            </button>
                            <button id="insertBetweenPoints" class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-plus-circle mr-2"></i>Insert Between
                            </button>
                        </div>
                    </div>

                    <!-- Margin Line Controls -->
                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3">Margin Line Settings</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Point Size (mm)</label>
                                <div class="flex items-center space-x-2">
                                    <input type="range" id="marginPointSize" min="0.1" max="2.0" step="0.1" value="0.3" class="flex-1">
                                    <span id="pointSizeValue" class="text-xs w-10 text-center">0.3</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Line Width (mm)</label>
                                <div class="flex items-center space-x-2">
                                    <input type="range" id="marginLineWidth" min="0.05" max="0.5" step="0.05" value="0.1" class="flex-1">
                                    <span id="lineWidthValue" class="text-xs w-10 text-center">0.1</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Curve Smoothness</label>
                                <div class="flex items-center space-x-2">
                                    <input type="range" id="marginSmoothness" min="1" max="10" step="1" value="5" class="flex-1">
                                    <span id="smoothnessValue" class="text-xs w-10 text-center">5</span>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between mt-3">
                                <label class="text-xs text-gray-400">Show Control Points</label>
                                <input type="checkbox" id="showControlPoints" checked class="text-blue-400">
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-xs text-gray-400">Close Curve</label>
                                <input type="checkbox" id="closeCurve" checked class="text-blue-400">
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-xs text-gray-400">Snap to Surface</label>
                                <input type="checkbox" id="snapToSurface" checked class="text-blue-400">
                            </div>
                        </div>
                    </div>

                    <!-- Margin Points List -->
                    <div class="p-4 border-b border-gray-800 flex-1">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="font-medium">Margin Points</h3>
                            <span id="pointCount" class="text-xs bg-gray-700 px-2 py-1 rounded">0 points</span>
                        </div>
                        <div id="marginPointsList" class="space-y-1 max-h-32 overflow-y-auto text-xs">
                            <div class="text-gray-500 text-sm italic" id="noPointsMessage">No margin points placed</div>
                        </div>
                        
                        <div class="mt-3 space-y-2">
                            <button id="exportMarginPts" class="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs" disabled>
                                <i class="fas fa-download mr-2"></i>Export as .PTS
                            </button>
                            <button id="importMarginPts" class="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs">
                                <i class="fas fa-upload mr-2"></i>Import .PTS File
                            </button>
                            <input type="file" id="ptsFileInput" accept=".pts,.txt" class="hidden">
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="p-4 border-t border-gray-800">
                        <div class="mb-3 p-2 bg-gray-800 rounded text-xs">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Margin Status:</span>
                                <span id="marginStatus" class="text-red-400">Not Defined</span>
                            </div>
                            <div class="flex justify-between items-center mt-1">
                                <span class="text-gray-400">Points Count:</span>
                                <span id="marginPointsCount" class="text-gray-300">0</span>
                            </div>
                        </div>
                        
                        <div class="flex space-x-2">
                            <button id="backToScanBtn" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg">
                                <i class="fas fa-arrow-left mr-2"></i>Back
                            </button>
                            <button id="nextToDesignBtn" class="flex-1 bg-dental-primary hover:bg-dental-secondary text-white py-2 px-4 rounded-lg" disabled>
                                Next <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Viewport -->
                <div class="flex-1 flex flex-col">
                    <div class="h-12 border-b border-gray-800 flex items-center px-4">
                        <div class="flex items-center space-x-4">
                            <div class="text-sm bg-gray-800 rounded-full px-3 py-1 flex items-center space-x-1">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Margin Design Mode</span>
                            </div>
                            <div class="text-sm text-gray-400">
                                Tool: <span id="marginToolStatus" class="text-blue-400">Select</span>
                            </div>
                        </div>

                        <div class="ml-auto flex items-center space-x-3">
                            <div class="text-xs text-gray-400">
                                Prep Mark: <span class="text-blue-400">Visible</span>
                            </div>
                            <button id="togglePrepMark" class="text-gray-400 hover:text-blue-400" title="Toggle Prep Mark">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button id="clearMarginPoints" class="text-gray-400 hover:text-red-500" title="Clear All Points">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex-1 relative">
                        <div id="marginRenderCanvas" class="w-full h-full"></div>
                        
                        <!-- Margin Tools Overlay -->
                        <div class="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 border border-gray-700">
                            <div class="text-xs text-gray-400 mb-2 font-medium">Margin Tools</div>
                            <div class="space-y-2">
                                <button id="placeTool" class="w-full px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                                    <i class="fas fa-crosshairs mr-1"></i>Place Points
                                </button>
                                <button id="editTool" class="w-full px-3 py-2 bg-gray-700 text-white rounded text-xs hover:bg-gray-600">
                                    <i class="fas fa-arrows-alt mr-1"></i>Edit Points
                                </button>
                                <button id="deleteTool" class="w-full px-3 py-2 bg-gray-700 text-white rounded text-xs hover:bg-gray-600">
                                    <i class="fas fa-minus mr-1"></i>Delete Points
                                </button>
                                <div class="border-t border-gray-600 my-2"></div>
                                <button id="fitViewToPrep" class="w-full px-3 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">
                                    <i class="fas fa-search mr-1"></i>Focus Prep
                                </button>
                            </div>
                        </div>

                        <!-- Margin Instructions Overlay -->
                        <div class="absolute bottom-4 left-4 bg-gray-800 rounded-lg p-3 border border-gray-700 max-w-xs">
                            <div class="text-xs text-gray-400 mb-2 font-medium">Instructions:</div>
                            <div class="text-xs text-gray-300 space-y-1">
                                <div>• Click on prep edge to place margin points</div>
                                <div>• Use Auto-Detect for quick start</div>
                                <div>• Drag points to adjust position</div>
                                <div>• Right-click to delete points</div>
                                <div>• Export as .PTS when complete</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize margin stage with enhanced functionality
        this.initializeMarginStage(container);
    }
    
    initializeMarginStage(container) {
        // Initialize margin data storage
        if (!this.marginData) {
            this.marginData = {
                points: [],
                curve: null,
                settings: {
                    pointSize: 0.3,
                    lineWidth: 0.1,
                    smoothness: 5,
                    showControlPoints: true,
                    closeCurve: true,
                    snapToSurface: true,
                    edgeSensitivity: 0.7,
                    pointDensity: 50
                }
            };
        }
        
        // Get UI elements
        const elements = {
            // Auto detection
            autoDetectBtn: container.querySelector('#autoDetectMargin'),
            refineBtn: container.querySelector('#refineDetection'),
            edgeSensitivity: container.querySelector('#edgeSensitivity'),
            pointDensity: container.querySelector('#pointDensity'),
            
            // Manual tools
            addPointBtn: container.querySelector('#addMarginPoint'),
            editPointBtn: container.querySelector('#editMarginPoint'),
            deletePointBtn: container.querySelector('#deleteMarginPoint'),
            insertBtn: container.querySelector('#insertBetweenPoints'),
            
            // Settings
            pointSizeSlider: container.querySelector('#marginPointSize'),
            lineWidthSlider: container.querySelector('#marginLineWidth'),
            smoothnessSlider: container.querySelector('#marginSmoothness'),
            pointSizeValue: container.querySelector('#pointSizeValue'),
            lineWidthValue: container.querySelector('#lineWidthValue'),
            smoothnessValue: container.querySelector('#smoothnessValue'),
            
            // Checkboxes
            showControlPoints: container.querySelector('#showControlPoints'),
            closeCurve: container.querySelector('#closeCurve'),
            snapToSurface: container.querySelector('#snapToSurface'),
            
            // Status and lists
            pointCount: container.querySelector('#pointCount'),
            pointsList: container.querySelector('#marginPointsList'),
            noPointsMessage: container.querySelector('#noPointsMessage'),
            marginStatus: container.querySelector('#marginStatus'),
            marginPointsCount: container.querySelector('#marginPointsCount'),
            
            // File operations
            exportBtn: container.querySelector('#exportMarginPts'),
            importBtn: container.querySelector('#importMarginPts'),
            fileInput: container.querySelector('#ptsFileInput'),
            
            // Navigation
            backBtn: container.querySelector('#backToScanBtn'),
            nextBtn: container.querySelector('#nextToDesignBtn'),
            
            // Viewport tools
            prepMarkToggle: container.querySelector('#togglePrepMark'),
            clearBtn: container.querySelector('#clearMarginPoints'),
            placeTool: container.querySelector('#placeTool'),
            editTool: container.querySelector('#editTool'),
            deleteTool: container.querySelector('#deleteTool'),
            fitViewBtn: container.querySelector('#fitViewToPrep'),
            
            // Status display
            toolStatus: container.querySelector('#marginToolStatus')
        };
        
        // Auto-detection functionality
        elements.autoDetectBtn?.addEventListener('click', () => {
            this.autoDetectMarginEdge();
        });
        
        elements.refineBtn?.addEventListener('click', () => {
            this.refineMarginDetection();
        });
        
        // Manual point placement
        elements.addPointBtn?.addEventListener('click', () => {
            this.setMarginTool('add');
        });
        
        elements.editPointBtn?.addEventListener('click', () => {
            this.setMarginTool('edit');
        });
        
        elements.deletePointBtn?.addEventListener('click', () => {
            this.setMarginTool('delete');
        });
        
        elements.insertBtn?.addEventListener('click', () => {
            this.setMarginTool('insert');
        });
        
        // Settings sliders with live updates
        elements.pointSizeSlider?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.marginData.settings.pointSize = value;
            elements.pointSizeValue.textContent = value.toFixed(1);
            this.updateMarginVisualization();
        });
        
        elements.lineWidthSlider?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.marginData.settings.lineWidth = value;
            elements.lineWidthValue.textContent = value.toFixed(2);
            this.updateMarginVisualization();
        });
        
        elements.smoothnessSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.marginData.settings.smoothness = value;
            elements.smoothnessValue.textContent = value;
            this.updateMarginCurve();
        });
        
        // Checkbox controls
        elements.showControlPoints?.addEventListener('change', (e) => {
            this.marginData.settings.showControlPoints = e.target.checked;
            this.updateMarginVisualization();
        });
        
        elements.closeCurve?.addEventListener('change', (e) => {
            this.marginData.settings.closeCurve = e.target.checked;
            this.updateMarginCurve();
        });
        
        elements.snapToSurface?.addEventListener('change', (e) => {
            this.marginData.settings.snapToSurface = e.target.checked;
        });
        
        // File operations
        elements.exportBtn?.addEventListener('click', () => {
            this.exportMarginPts();
        });
        
        elements.importBtn?.addEventListener('click', () => {
            elements.fileInput.click();
        });
        
        elements.fileInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importMarginPts(e.target.files[0]);
            }
        });
        
        // Navigation
        elements.backBtn?.addEventListener('click', () => this.showStage(2));
        elements.nextBtn?.addEventListener('click', () => {
            if (this.validateMarginCompletion()) {
                this.showStage(4);
            } else {
                alert('Please define margin points before proceeding to crown design.');
            }
        });
        
        // Viewport controls
        elements.prepMarkToggle?.addEventListener('click', () => {
            this.togglePrepMarkVisibility();
        });
        
        elements.clearBtn?.addEventListener('click', () => {
            if (confirm('Clear all margin points?')) {
                this.clearMarginPoints();
            }
        });
        
        elements.fitViewBtn?.addEventListener('click', () => {
            this.fitViewToPreparation();
        });
        
        // Tool buttons
        elements.placeTool?.addEventListener('click', () => this.setMarginTool('place'));
        elements.editTool?.addEventListener('click', () => this.setMarginTool('edit'));
        elements.deleteTool?.addEventListener('click', () => this.setMarginTool('delete'));
        
        // Initialize 3D viewport for margin stage
        this.initializeMargin3DViewport();
        
        // Set initial tool
        this.currentMarginTool = 'place';
        this.updateMarginToolStatus();
        
        console.log('🦷 Margin Design Stage Initialized');
    }
    
    // Auto-detection algorithms
    autoDetectMarginEdge() {
        console.log('🔍 Starting automatic margin edge detection...');
        
        // Show loading state
        const autoBtn = document.querySelector('#autoDetectMargin');
        const originalText = autoBtn.innerHTML;
        autoBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Detecting...';
        autoBtn.disabled = true;
        
        // Get detection parameters
        const sensitivity = parseFloat(document.querySelector('#edgeSensitivity')?.value || 0.7);
        const density = parseInt(document.querySelector('#pointDensity')?.value || 50);
        
        // Use backend service for margin detection
        if (window.modelingBackendService) {
            // Get current 3D model geometry (you'll need to implement this based on your 3D setup)
            const geometry = this.getCurrentModelGeometry();
            
            if (geometry) {
                window.modelingBackendService.detectMarginEdge(geometry, {
                    sensitivity: sensitivity,
                    point_density: density,
                    threshold_offset: 0.2
                })
                .then(result => {
                    if (result.success) {
                        this.marginData.points = result.points;
                        this.updateMarginVisualization();
                        this.updateMarginStatus();
                        
                        // Enable refine button
                        const refineBtn = document.querySelector('#refineDetection');
                        if (refineBtn) {
                            refineBtn.disabled = false;
                            refineBtn.classList.remove('opacity-50');
                        }
                        
                        console.log(`✅ ${result.source === 'fallback' ? 'Fallback' : 'Backend'} detected ${result.count} margin points`);
                    } else {
                        throw new Error(result.error || 'Detection failed');
                    }
                })
                .catch(error => {
                    console.error('❌ Margin detection failed:', error);
                    alert('Automatic detection failed. Please place points manually.');
                })
                .finally(() => {
                    autoBtn.innerHTML = originalText;
                    autoBtn.disabled = false;
                });
            } else {
                // Fallback to simulated detection
                this.runMarginDetectionAlgorithm()
                    .then(detectedPoints => {
                        this.marginData.points = detectedPoints;
                        this.updateMarginVisualization();
                        this.updateMarginStatus();
                        console.log(`✅ Simulated detection: ${detectedPoints.length} margin points`);
                    })
                    .finally(() => {
                        autoBtn.innerHTML = originalText;
                        autoBtn.disabled = false;
                    });
            }
        } else {
            // Fallback if backend service not available
            setTimeout(() => {
                this.runMarginDetectionAlgorithm()
                    .then(detectedPoints => {
                        this.marginData.points = detectedPoints;
                        this.updateMarginVisualization();
                        this.updateMarginStatus();
                        console.log(`✅ Simulated detection: ${detectedPoints.length} margin points`);
                    })
                    .finally(() => {
                        autoBtn.innerHTML = originalText;
                        autoBtn.disabled = false;
                    });
            }, 2000);
        }
    }
    
    getCurrentModelGeometry() {
        // This should return the current 3D model geometry from your Three.js scene
        // You'll need to implement this based on your existing 3D setup
        // For now, return null to use fallback
        console.log('🔍 Getting current model geometry for backend processing...');
        
        // Try to get geometry from loaded models
        if (typeof loadedModels !== 'undefined' && loadedModels.length > 0) {
            const model = loadedModels[0];
            if (model && model.geometry) {
                return model.geometry;
            }
        }
        
        // Try to get from global scene objects
        if (typeof scene !== 'undefined' && scene.children) {
            for (const child of scene.children) {
                if (child.geometry && child.type === 'Mesh') {
                    return child.geometry;
                }
            }
        }
        
        console.warn('⚠️ No model geometry found, using fallback detection');
        return null;
    }
    
    async runMarginDetectionAlgorithm() {
        // This would integrate with Python backend for actual edge detection
        // For now, simulate detected points around a preparation edge
        
        const sensitivity = parseFloat(document.querySelector('#edgeSensitivity')?.value || 0.7);
        const density = parseInt(document.querySelector('#pointDensity')?.value || 50);
        
        // Simulate detected margin points (in real app, this calls Python CV algorithms)
        const detectedPoints = [];
        const radius = 3; // Simulated prep radius
        const centerX = 0, centerY = 0, centerZ = -1;
        
        for (let i = 0; i < density; i++) {
            const angle = (i / density) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.2;
            const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.2;
            const z = centerZ + (Math.random() - 0.5) * 0.1;
            
            detectedPoints.push({
                id: i + 1,
                x: x,
                y: y,
                z: z,
                confidence: 0.8 + Math.random() * 0.2 // Simulated confidence score
            });
        }
        
        return detectedPoints;
    }
    
    refineMarginDetection() {
        console.log('🔧 Refining margin detection...');
        
        if (this.marginData.points.length === 0) {
            alert('No margin points to refine. Please detect or place points first.');
            return;
        }
        
        const refineBtn = document.querySelector('#refineDetection');
        const originalText = refineBtn.innerHTML;
        refineBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Refining...';
        refineBtn.disabled = true;
        
        // Use backend service for margin refinement
        if (window.modelingBackendService) {
            const smoothness = this.marginData.settings.smoothness;
            
            window.modelingBackendService.refineMarginPoints(this.marginData.points, smoothness)
                .then(result => {
                    if (result.success) {
                        this.marginData.points = result.points;
                        this.updateMarginVisualization();
                        this.updateMarginStatus();
                        console.log(`✅ ${result.source === 'fallback' ? 'Fallback' : 'Backend'} refined ${result.count} margin points`);
                    } else {
                        throw new Error(result.error || 'Refinement failed');
                    }
                })
                .catch(error => {
                    console.error('❌ Margin refinement failed:', error);
                    // Fallback to local smoothing
                    this.marginData.points = this.smoothMarginPoints(this.marginData.points);
                    this.updateMarginVisualization();
                    console.log('✅ Applied local smoothing');
                })
                .finally(() => {
                    refineBtn.innerHTML = originalText;
                    refineBtn.disabled = false;
                });
        } else {
            // Fallback to local refinement
            setTimeout(() => {
                this.marginData.points = this.smoothMarginPoints(this.marginData.points);
                this.updateMarginVisualization();
                console.log('✅ Applied local margin refinement');
                
                refineBtn.innerHTML = originalText;
                refineBtn.disabled = false;
            }, 1000);
        }
    }
    
    smoothMarginPoints(points) {
        // Apply smoothing algorithm to detected points
        const smoothed = [];
        const smoothness = this.marginData.settings.smoothness;
        
        for (let i = 0; i < points.length; i++) {
            const prev = points[(i - 1 + points.length) % points.length];
            const current = points[i];
            const next = points[(i + 1) % points.length];
            
            const smoothedPoint = {
                ...current,
                x: (prev.x + current.x * smoothness + next.x) / (smoothness + 2),
                y: (prev.y + current.y * smoothness + next.y) / (smoothness + 2),
                z: (prev.z + current.z * smoothness + next.z) / (smoothness + 2)
            };
            
            smoothed.push(smoothedPoint);
        }
        
        return smoothed;
    }
    
    // Manual margin tools
    setMarginTool(tool) {
        this.currentMarginTool = tool;
        this.updateMarginToolStatus();
        
        // Update tool button states
        document.querySelectorAll('.margin-tool-btn').forEach(btn => {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-gray-700');
        });
        
        const activeBtn = document.querySelector(`#${tool}Tool`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-700');
            activeBtn.classList.add('bg-blue-600');
        }
    }
    
    updateMarginToolStatus() {
        const statusElement = document.querySelector('#marginToolStatus');
        if (statusElement) {
            const toolNames = {
                'place': 'Place Points',
                'edit': 'Edit Points',
                'delete': 'Delete Points',
                'insert': 'Insert Points',
                'add': 'Add Points'
            };
            statusElement.textContent = toolNames[this.currentMarginTool] || 'Select';
        }
    }
    
    // Visualization updates
    updateMarginVisualization() {
        // Update 3D visualization of margin points and curve
        this.renderMarginPoints();
        this.renderMarginCurve();
        this.updateMarginPointsList();
    }
    
    updateMarginCurve() {
        if (this.marginData.points.length > 2) {
            this.marginData.curve = this.generateMarginCurve(this.marginData.points);
            this.renderMarginCurve();
        }
    }
    
    generateMarginCurve(points) {
        // Generate smooth curve through margin points
        if (points.length < 3) return null;
        
        // Use spline interpolation for smooth curve
        const curve = [];
        const segments = points.length * 4; // Higher resolution
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = this.interpolateSpline(points, t);
            curve.push(point);
        }
        
        return curve;
    }
    
    interpolateSpline(points, t) {
        // Catmull-Rom spline interpolation
        const n = points.length;
        if (n < 4) return points[Math.floor(t * (n - 1))];
        
        const segment = t * n;
        const index = Math.floor(segment);
        const localT = segment - index;
        
        const p0 = points[(index - 1 + n) % n];
        const p1 = points[index % n];
        const p2 = points[(index + 1) % n];
        const p3 = points[(index + 2) % n];
        
        return this.catmullRom(p0, p1, p2, p3, localT);
    }
    
    catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        return {
            x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
            z: 0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
        };
    }
    
    // File operations for .PTS format
    exportMarginPts() {
        if (this.marginData.points.length === 0) {
            alert('No margin points to export.');
            return;
        }
        
        const exportBtn = document.querySelector('#exportMarginPts');
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Exporting...';
        exportBtn.disabled = true;
        
        // Use backend service for .PTS export
        if (window.modelingBackendService) {
            window.modelingBackendService.exportMarginPts(
                this.marginData.points,
                this.orderData.caseNumber,
                this.orderData.toothNumber
            )
            .then(result => {
                if (result.success) {
                    // Download the file
                    const blob = new Blob([result.pts_content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = result.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log(`✅ ${result.source === 'fallback' ? 'Fallback' : 'Backend'} exported ${this.marginData.points.length} margin points to .PTS file`);
                } else {
                    throw new Error(result.error || 'Export failed');
                }
            })
            .catch(error => {
                console.error('❌ Backend export failed:', error);
                // Fallback to local export
                this.fallbackExportMarginPts();
            })
            .finally(() => {
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            });
        } else {
            // Fallback to local export
            setTimeout(() => {
                this.fallbackExportMarginPts();
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }, 500);
        }
    }
    
    fallbackExportMarginPts() {
        // Generate .PTS file content locally
        let ptsContent = `# Margin Points for Case ${this.orderData.caseNumber}\n`;
        ptsContent += `# Tooth: ${this.orderData.toothNumber}\n`;
        ptsContent += `# Generated: ${new Date().toISOString()}\n`;
        ptsContent += `# Point Count: ${this.marginData.points.length}\n\n`;
        
        this.marginData.points.forEach((point, index) => {
            ptsContent += `${point.x.toFixed(6)} ${point.y.toFixed(6)} ${point.z.toFixed(6)}\n`;
        });
        
        // Download file
        const blob = new Blob([ptsContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `margin_${this.orderData.caseNumber}_tooth${this.orderData.toothNumber}.pts`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`✅ Local export: ${this.marginData.points.length} margin points to .PTS file`);
    }
    
    async importMarginPts(file) {
        try {
            const content = await file.text();
            const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            
            const importedPoints = [];
            lines.forEach((line, index) => {
                const coords = line.trim().split(/\s+/);
                if (coords.length >= 3) {
                    importedPoints.push({
                        id: index + 1,
                        x: parseFloat(coords[0]),
                        y: parseFloat(coords[1]),
                        z: parseFloat(coords[2]),
                        confidence: 1.0
                    });
                }
            });
            
            if (importedPoints.length > 0) {
                this.marginData.points = importedPoints;
                this.updateMarginVisualization();
                this.updateMarginStatus();
                console.log(`✅ Imported ${importedPoints.length} margin points from .PTS file`);
            } else {
                alert('No valid points found in file.');
            }
        } catch (error) {
            console.error('❌ Failed to import .PTS file:', error);
            alert('Failed to import file. Please check the file format.');
        }
    }
    
    // Status and validation
    updateMarginStatus() {
        const statusElement = document.querySelector('#marginStatus');
        const countElement = document.querySelector('#marginPointsCount');
        const nextBtn = document.querySelector('#nextToDesignBtn');
        const exportBtn = document.querySelector('#exportMarginPts');
        
        const pointCount = this.marginData.points.length;
        
        if (countElement) countElement.textContent = pointCount;
        
        if (pointCount === 0) {
            if (statusElement) statusElement.textContent = 'Not Defined';
            if (statusElement) statusElement.className = 'text-red-400';
            if (nextBtn) nextBtn.disabled = true;
            if (exportBtn) exportBtn.disabled = true;
        } else if (pointCount < 10) {
            if (statusElement) statusElement.textContent = 'Incomplete';
            if (statusElement) statusElement.className = 'text-yellow-400';
            if (nextBtn) nextBtn.disabled = true;
            if (exportBtn) exportBtn.disabled = false;
        } else {
            if (statusElement) statusElement.textContent = 'Complete';
            if (statusElement) statusElement.className = 'text-green-400';
            if (nextBtn) nextBtn.disabled = false;
            if (exportBtn) exportBtn.disabled = false;
        }
        
        // Update point count display
        const pointCountElement = document.querySelector('#pointCount');
        if (pointCountElement) {
            pointCountElement.textContent = `${pointCount} points`;
        }
    }
    
    updateMarginPointsList() {
        const listElement = document.querySelector('#marginPointsList');
        const noPointsMessage = document.querySelector('#noPointsMessage');
        
        if (!listElement) return;
        
        if (this.marginData.points.length === 0) {
            if (noPointsMessage) noPointsMessage.style.display = 'block';
            listElement.innerHTML = '<div class="text-gray-500 text-sm italic" id="noPointsMessage">No margin points placed</div>';
        } else {
            if (noPointsMessage) noPointsMessage.style.display = 'none';
            
            const pointsHtml = this.marginData.points.map((point, index) => `
                <div class="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div class="flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span class="text-xs">Point ${point.id}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <span class="text-xs text-gray-400">${point.confidence ? (point.confidence * 100).toFixed(0) + '%' : ''}</span>
                        <button onclick="workflowManager.deleteMarginPoint(${point.id})" class="text-red-400 hover:text-red-300 text-xs">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            listElement.innerHTML = pointsHtml;
        }
    }
    
    validateMarginCompletion() {
        return this.marginData.points.length >= 10; // Minimum points for a complete margin
    }
    
    // Utility methods
    clearMarginPoints() {
        this.marginData.points = [];
        this.marginData.curve = null;
        this.updateMarginVisualization();
        this.updateMarginStatus();
        console.log('🗑️ Cleared all margin points');
    }
    
    deleteMarginPoint(pointId) {
        this.marginData.points = this.marginData.points.filter(p => p.id !== pointId);
        this.updateMarginVisualization();
        this.updateMarginStatus();
        console.log(`🗑️ Deleted margin point ${pointId}`);
    }
    
    togglePrepMarkVisibility() {
        // Toggle preparation mark visibility in 3D viewport
        this.prepMarkVisible = !this.prepMarkVisible;
        const toggle = document.querySelector('#togglePrepMark');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (this.prepMarkVisible) {
                icon.className = 'fas fa-eye';
                toggle.title = 'Hide Prep Mark';
            } else {
                icon.className = 'fas fa-eye-slash';
                toggle.title = 'Show Prep Mark';
            }
        }
        // Update 3D visualization
        this.updatePrepMarkVisibility();
    }
    
    fitViewToPreparation() {
        // Focus camera on preparation area
        console.log('📷 Fitting view to preparation');
        // This would adjust the 3D camera to focus on the prep area
    }
    
    // 3D Viewport initialization (placeholder for 3D integration)
    initializeMargin3DViewport() {
        console.log('🎮 Initializing 3D viewport for margin design');
        // This would set up Three.js scene specifically for margin placement
        // Including:
        // - Click handlers for point placement
        // - Hover effects for existing points
        // - Real-time curve rendering
        // - Prep mark overlay
    }
    
    renderMarginPoints() {
        // Render margin points in 3D viewport
        console.log(`🎯 Rendering ${this.marginData.points.length} margin points`);
    }
    
    renderMarginCurve() {
        // Render smooth margin curve in 3D viewport
        if (this.marginData.curve) {
            console.log(`📈 Rendering margin curve with ${this.marginData.curve.length} segments`);
        }
    }
    
    updatePrepMarkVisibility() {
        // Update preparation mark visibility in 3D scene
        console.log(`👁️ Prep mark visibility: ${this.prepMarkVisible ? 'visible' : 'hidden'}`);
    }
    
    createCrownDesignStage(container) {
        container.innerHTML = `
            <div class="w-full h-full bg-gray-900 flex">
                <!-- Left Panel -->
                <div class="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
                    <div class="p-4 border-b border-gray-800">
                        <h2 class="font-semibold text-lg flex items-center">
                            <i class="fas fa-tooth text-dental-primary mr-2"></i>
                            Crown Design
                        </h2>
                        <div class="text-sm text-gray-400">Place and fit crown restoration</div>
                    </div>

                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3">Crown Library</h3>
                        <div class="text-sm text-gray-400 mb-2">Tooth #${this.orderData.toothNumber || 'N/A'}</div>
                        <div class="grid grid-cols-2 gap-2">
                            <button class="crown-template bg-gray-800 hover:bg-gray-700 p-3 rounded text-center border-2 border-transparent hover:border-dental-primary">
                                <i class="fas fa-tooth text-2xl mb-2"></i>
                                <div class="text-xs">Standard</div>
                            </button>
                            <button class="crown-template bg-gray-800 hover:bg-gray-700 p-3 rounded text-center border-2 border-transparent hover:border-dental-primary">
                                <i class="fas fa-tooth text-2xl mb-2"></i>
                                <div class="text-xs">Anatomical</div>
                            </button>
                            <button class="crown-template bg-gray-800 hover:bg-gray-700 p-3 rounded text-center border-2 border-transparent hover:border-dental-primary">
                                <i class="fas fa-tooth text-2xl mb-2"></i>
                                <div class="text-xs">Minimal</div>
                            </button>
                            <button class="crown-template bg-gray-800 hover:bg-gray-700 p-3 rounded text-center border-2 border-transparent hover:border-dental-primary">
                                <i class="fas fa-tooth text-2xl mb-2"></i>
                                <div class="text-xs">Custom</div>
                            </button>
                        </div>
                    </div>

                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3">Crown Adjustment</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Crown Height</label>
                                <input type="range" id="crownHeight" min="0.5" max="2.0" step="0.1" value="1.0" class="w-full">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Crown Width</label>
                                <input type="range" id="crownWidth" min="0.8" max="1.5" step="0.1" value="1.0" class="w-full">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Occlusal Thickness</label>
                                <input type="range" id="occlusalThickness" min="0.5" max="3.0" step="0.1" value="1.5" class="w-full">
                            </div>
                        </div>
                    </div>

                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3">Boolean Operations</h3>
                        <div class="space-y-2">
                            <button id="snapToMargin" class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-link mr-2"></i>Snap to Margin
                            </button>
                            <button id="unionCrown" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-plus-circle mr-2"></i>Union with Base
                            </button>
                            <button id="subtractCrown" class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                                <i class="fas fa-minus-circle mr-2"></i>Subtract Excess
                            </button>
                        </div>
                    </div>

                    <div class="p-4 flex-1">
                        <h3 class="font-medium mb-3">Design Status</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Crown Placed:</span>
                                <span class="text-red-400">No</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Margin Fit:</span>
                                <span class="text-red-400">Not Checked</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Contact Points:</span>
                                <span class="text-red-400">Not Set</span>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 border-t border-gray-800">
                        <div class="flex space-x-2">
                            <button id="backToMarginBtn" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg">
                                <i class="fas fa-arrow-left mr-2"></i>Back
                            </button>
                            <button id="nextToFinalizeBtn" class="flex-1 bg-dental-primary hover:bg-dental-secondary text-white py-2 px-4 rounded-lg">
                                Finalize <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Viewport -->
                <div class="flex-1 flex flex-col">
                    <div class="h-12 border-b border-gray-800 flex items-center px-4">
                        <div class="text-sm bg-gray-800 rounded-full px-3 py-1 flex items-center space-x-1">
                            <span class="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>Crown Design Mode</span>
                        </div>
                        <div class="ml-auto text-sm text-gray-400">
                            Select crown template and adjust to fit preparation
                        </div>
                    </div>
                    
                    <div class="flex-1 relative">
                        <div id="crownRenderCanvas" class="w-full h-full"></div>
                        
                        <!-- Crown Design Tools -->
                        <div class="absolute top-4 right-4 bg-gray-800 rounded-lg p-2">
                            <div class="text-xs text-gray-400 mb-2">Crown Tools</div>
                            <div class="flex flex-col space-y-2">
                                <button class="px-3 py-1 bg-green-600 text-white rounded text-xs">Place Crown</button>
                                <button class="px-3 py-1 bg-blue-600 text-white rounded text-xs">Adjust Fit</button>
                                <button class="px-3 py-1 bg-yellow-600 text-white rounded text-xs">Check Contacts</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event handlers for stage 4
        const backBtn = container.querySelector('#backToMarginBtn');
        const nextBtn = container.querySelector('#nextToFinalizeBtn');
        
        backBtn.addEventListener('click', () => this.showStage(3));
        nextBtn.addEventListener('click', () => this.showStage(5));
    }
    
    createFinalizeStage(container) {
        container.innerHTML = `
            <div class="w-full h-full bg-gray-900 flex">
                <!-- Left Panel -->
                <div class="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
                    <div class="p-4 border-b border-gray-800">
                        <h2 class="font-semibold text-lg flex items-center">
                            <i class="fas fa-check-circle text-dental-primary mr-2"></i>
                            Finalize Design
                        </h2>
                        <div class="text-sm text-gray-400">Review and export final files</div>
                    </div>

                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3">Case Summary</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Patient:</span>
                                <span>${this.orderData.patientName || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Case #:</span>
                                <span>${this.orderData.caseNumber}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Tooth:</span>
                                <span>#${this.orderData.toothNumber || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Material:</span>
                                <span>${this.orderData.material || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Shade:</span>
                                <span>${this.orderData.shade || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3">Export Options</h3>
                        <div class="space-y-3">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" id="exportUpper" checked class="text-dental-primary">
                                <span class="text-sm">Upper.stl</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" id="exportLower" checked class="text-dental-primary">
                                <span class="text-sm">Lower.stl</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" id="exportMargin" checked class="text-dental-primary">
                                <span class="text-sm">Margin.pts / Margin.xyz</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" id="exportCrown" checked class="text-dental-primary">
                                <span class="text-sm">Crown_${this.orderData.toothNumber || 'N'}.stl</span>
                            </label>
                        </div>
                    </div>

                    <div class="p-4 border-b border-gray-800">
                        <h3 class="font-medium mb-3">Quality Check</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">Scan Quality:</span>
                                <span class="text-green-400"><i class="fas fa-check mr-1"></i>Good</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">Margin Definition:</span>
                                <span class="text-green-400"><i class="fas fa-check mr-1"></i>Complete</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">Crown Fit:</span>
                                <span class="text-green-400"><i class="fas fa-check mr-1"></i>Optimal</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-400">Contact Points:</span>
                                <span class="text-green-400"><i class="fas fa-check mr-1"></i>Verified</span>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 flex-1">
                        <h3 class="font-medium mb-3">Export Files</h3>
                        <div class="space-y-2">
                            <button id="exportAllBtn" class="w-full bg-dental-primary hover:bg-dental-secondary text-white py-2 px-4 rounded-lg">
                                <i class="fas fa-download mr-2"></i>Export All Files
                            </button>
                            <button id="previewExportBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                                <i class="fas fa-eye mr-2"></i>Preview Export
                            </button>
                        </div>
                    </div>

                    <div class="p-4 border-t border-gray-800">
                        <div class="flex space-x-2">
                            <button id="backToDesignBtn" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg">
                                <i class="fas fa-arrow-left mr-2"></i>Back
                            </button>
                            <button id="completeProjectBtn" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg">
                                Complete <i class="fas fa-check ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Viewport -->
                <div class="flex-1 flex flex-col">
                    <div class="h-12 border-b border-gray-800 flex items-center px-4">
                        <div class="text-sm bg-gray-800 rounded-full px-3 py-1 flex items-center space-x-1">
                            <span class="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>Final Review Mode</span>
                        </div>
                        <div class="ml-auto text-sm text-gray-400">
                            Final review before export
                        </div>
                    </div>
                    
                    <div class="flex-1 relative">
                        <div id="finalRenderCanvas" class="w-full h-full"></div>
                        
                        <!-- Final Review Tools -->
                        <div class="absolute top-4 right-4 bg-gray-800 rounded-lg p-2">
                            <div class="text-xs text-gray-400 mb-2">Review Tools</div>
                            <div class="flex flex-col space-y-2">
                                <button class="px-3 py-1 bg-blue-600 text-white rounded text-xs">Show All</button>
                                <button class="px-3 py-1 bg-green-600 text-white rounded text-xs">Crown Only</button>
                                <button class="px-3 py-1 bg-yellow-600 text-white rounded text-xs">Margin Line</button>
                                <button class="px-3 py-1 bg-purple-600 text-white rounded text-xs">X-Ray View</button>
                            </div>
                        </div>

                        <!-- Export Status -->
                        <div id="exportStatus" class="absolute bottom-4 left-4 bg-gray-800 rounded-lg p-3 hidden">
                            <div class="text-sm text-white mb-2">Exporting Files...</div>
                            <div class="w-48 bg-gray-700 rounded-full h-2">
                                <div id="exportProgress" class="bg-dental-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event handlers for stage 5
        const backBtn = container.querySelector('#backToDesignBtn');
        const completeBtn = container.querySelector('#completeProjectBtn');
        const exportBtn = container.querySelector('#exportAllBtn');
        
        backBtn.addEventListener('click', () => this.showStage(4));
        completeBtn.addEventListener('click', () => this.completeProject());
        exportBtn.addEventListener('click', () => this.exportFiles());
    }
    
    saveOrderData() {
        const form = document.getElementById('orderForm');
        if (form) {
            this.orderData.patientName = form.patientName.value;
            this.orderData.toothNumber = form.toothNumber.value;
            this.orderData.shade = form.shade.value;
            this.orderData.material = form.material.value;
            this.orderData.notes = form.notes.value;
            
            console.log('📋 Order data saved:', this.orderData);
        }
    }
    
    exportFiles() {
        const status = document.getElementById('exportStatus');
        const progress = document.getElementById('exportProgress');
        
        if (status && progress) {
            status.classList.remove('hidden');
            
            // Simulate export progress
            let progressValue = 0;
            const interval = setInterval(() => {
                progressValue += 20;
                progress.style.width = progressValue + '%';
                
                if (progressValue >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        status.classList.add('hidden');
                        alert('Files exported successfully!');
                    }, 1000);
                }
            }, 300);
        }
    }
    
    completeProject() {
        if (confirm('Are you sure you want to complete this project? This will finalize all work and export the files.')) {
            this.exportFiles();
            setTimeout(() => {
                alert(`Project ${this.orderData.caseNumber} completed successfully!`);
                // Could redirect to dashboard or start new project
            }, 2000);
        }
    }
    
    nextStage() {
        const nextStageNum = this.currentStage + 1;
        if (nextStageNum <= 5) {
            this.showStage(nextStageNum);
        } else {
            // Complete the workflow
            this.completeProject();
        }
    }
    
    previousStage() {
        if (this.currentStage > 1) {
            this.showStage(this.currentStage - 1);
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DentalWorkflowManager };
} else {
    window.DentalWorkflowManager = DentalWorkflowManager;
}
