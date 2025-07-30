// Dental Bases Module - Predefined horseshoe jaw bases and related functions
// This module loads real STL files for upper and lower jaw bases

class DentalBases {
    constructor() {
        this.loader = new THREE.STLLoader();
        this.basePaths = {
            upperJaw: 'assets/Verti_UpperBase.stl',
            lowerJaw: 'assets/Verti_LowerBase.stl'
        };
        this.loadedBases = {};
        this.loadingPromises = {};
    }

    // Load STL base file asynchronously
    async loadBase(type) {
        const baseType = type === 'upper' || type === 'upperJaw' ? 'upperJaw' : 'lowerJaw';
        
        // Return cached base if already loaded
        if (this.loadedBases[baseType]) {
            console.log(`🦷 Using cached ${baseType} base`);
            return this.loadedBases[baseType].clone();
        }

        // Return existing promise if already loading
        if (this.loadingPromises[baseType]) {
            console.log(`🦷 Waiting for ${baseType} base to finish loading`);
            return this.loadingPromises[baseType];
        }

        // Start loading the STL file
        console.log(`🦷 Loading ${baseType} base from ${this.basePaths[baseType]}`);
        
        this.loadingPromises[baseType] = new Promise((resolve, reject) => {
            this.loader.load(
                this.basePaths[baseType],
                (geometry) => {
                    console.log(`✅ ${baseType} base loaded successfully`);
                    
                    // Center and prepare geometry
                    geometry.computeBoundingBox();
                    const center = new THREE.Vector3();
                    geometry.boundingBox.getCenter(center);
                    geometry.translate(-center.x, -center.y, -center.z);
                    geometry.computeVertexNormals();
                    
                    // Cache the loaded geometry
                    this.loadedBases[baseType] = geometry;
                    
                    // Clean up the loading promise
                    delete this.loadingPromises[baseType];
                    
                    resolve(geometry.clone());
                },
                (progress) => {
                    console.log(`📥 Loading ${baseType} base: ${Math.round((progress.loaded / progress.total) * 100)}%`);
                },
                (error) => {
                    console.error(`❌ Error loading ${baseType} base:`, error);
                    delete this.loadingPromises[baseType];
                    reject(error);
                }
            );
        });

        return this.loadingPromises[baseType];
    }

    // Get base geometry by type (legacy method - now async)
    async getBase(type) {
        return await this.loadBase(type);
    }

    // Create Three.js mesh from base with async loading
    async createBaseMesh(type, material = null) {
        try {
            const baseGeometry = await this.loadBase(type);
            
            // Default material if none provided
            if (!material) {
                material = new THREE.MeshPhongMaterial({
                    color: 0xd4c299, // Stone color
                    specular: 0x444444,
                    shininess: 30,
                    side: THREE.DoubleSide
                });
            }

            const mesh = new THREE.Mesh(baseGeometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.filename = `${type}_jaw_base.stl`;
            mesh.userData.visible = true;
            mesh.userData.isBase = true;

            console.log(`✅ Created ${type} jaw base mesh`);
            return mesh;
            
        } catch (error) {
            console.error(`❌ Failed to create ${type} base mesh:`, error);
            return null;
        }
    }

    // Fit base to existing model
    async fitBaseToModel(baseType, targetModel) {
        try {
            const baseMesh = await this.createBaseMesh(baseType);
            if (!baseMesh || !targetModel) return null;

            // Get target model bounds
            targetModel.geometry.computeBoundingBox();
            const targetBox = targetModel.geometry.boundingBox;
            const targetCenter = new THREE.Vector3();
            targetBox.getCenter(targetCenter);
            const targetSize = targetBox.getSize(new THREE.Vector3());

            // Get base bounds
            baseMesh.geometry.computeBoundingBox();
            const baseBox = baseMesh.geometry.boundingBox;
            const baseCenter = new THREE.Vector3();
            baseBox.getCenter(baseCenter);
            const baseSize = baseBox.getSize(new THREE.Vector3());

            // Scale base to match target model size (with some adjustment for dental proportions)
            const scaleX = (targetSize.x * 1.2) / baseSize.x; // Slightly larger for proper fit
            const scaleZ = (targetSize.z * 1.2) / baseSize.z;
            const avgScale = Math.min(scaleX, scaleZ); // Use minimum to ensure it fits
            baseMesh.scale.set(avgScale, avgScale, avgScale);

            // Position base below the target model
            baseMesh.position.set(
                targetCenter.x,
                targetBox.min.y - (baseSize.y * avgScale) - 2, // Position base below model with gap
                targetCenter.z
            );

            console.log(`✅ Fitted ${baseType} base to target model with scale ${avgScale.toFixed(2)}`);
            return baseMesh;
            
        } catch (error) {
            console.error(`❌ Failed to fit ${baseType} base to model:`, error);
            return null;
        }
    }

    // Preload both bases for better performance
    async preloadBases() {
        console.log('🦷 Preloading dental bases...');
        try {
            await Promise.all([
                this.loadBase('upper'),
                this.loadBase('lower')
            ]);
            console.log('✅ All dental bases preloaded successfully');
        } catch (error) {
            console.error('❌ Error preloading dental bases:', error);
        }
    }
}

// Dental Base Integration Functions
class DentalBaseIntegrator {
    constructor(dentalBases) {
        this.dentalBases = dentalBases;
    }

    // Combine model with fitted base
    async combineModelWithBase(targetModel, baseType) {
        if (!targetModel) {
            console.error('No target model provided');
            return null;
        }

        try {
            console.log(`🦷 Starting combination of model with ${baseType} base...`);
            
            // Create fitted base
            const baseMesh = await this.dentalBases.fitBaseToModel(baseType, targetModel);
            if (!baseMesh) {
                console.error('Failed to create base mesh');
                return null;
            }

            // Get geometries
            const modelGeometry = targetModel.geometry;
            const baseGeometry = baseMesh.geometry;

            // Apply transformations to get world positions
            const modelPositions = modelGeometry.attributes.position.array;
            const basePositions = baseGeometry.attributes.position.array;

            // Transform base positions according to base mesh transformation
            baseMesh.updateMatrixWorld(true);
            const baseWorldPositions = new Float32Array(basePositions.length);
            for (let i = 0; i < basePositions.length; i += 3) {
                const vertex = new THREE.Vector3(
                    basePositions[i],
                    basePositions[i + 1],
                    basePositions[i + 2]
                );
                vertex.applyMatrix4(baseMesh.matrixWorld);
                baseWorldPositions[i] = vertex.x;
                baseWorldPositions[i + 1] = vertex.y;
                baseWorldPositions[i + 2] = vertex.z;
            }

            // Combine vertices
            const combinedVertices = new Float32Array(modelPositions.length + baseWorldPositions.length);
            combinedVertices.set(modelPositions, 0);
            combinedVertices.set(baseWorldPositions, modelPositions.length);

            // Create new combined geometry
            const combinedGeometry = new THREE.BufferGeometry();
            combinedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(combinedVertices, 3));
            combinedGeometry.computeVertexNormals();
            combinedGeometry.computeBoundingBox();

            // Update target model with combined geometry
            targetModel.geometry.dispose();
            targetModel.geometry = combinedGeometry;

            // Update filename
            const baseTypeName = baseType === 'upper' ? 'upper' : 'lower';
            targetModel.userData.filename = targetModel.userData.filename.replace('.stl', `_with_${baseTypeName}_base.stl`);

            console.log(`✅ Combined model with ${baseTypeName} jaw base`);
            return targetModel;
            
        } catch (error) {
            console.error(`❌ Error combining model with ${baseType} base:`, error);
            return null;
        }
    }

    // Add base as separate model
    async addBaseAsModel(baseType, scene, loadedModels) {
        try {
            console.log(`🦷 Adding ${baseType} base as separate model...`);
            
            const baseMesh = await this.dentalBases.createBaseMesh(baseType);
            if (!baseMesh) {
                console.error('Failed to create base mesh');
                return null;
            }

            scene.add(baseMesh);
            loadedModels.push(baseMesh);

            console.log(`✅ Added ${baseType} jaw base as separate model`);
            return baseMesh;
            
        } catch (error) {
            console.error(`❌ Error adding ${baseType} base:`, error);
            return null;
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DentalBases, DentalBaseIntegrator };
} else {
    // Browser environment
    window.DentalBases = DentalBases;
    window.DentalBaseIntegrator = DentalBaseIntegrator;
}
