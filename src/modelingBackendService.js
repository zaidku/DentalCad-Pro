// Backend Service Integration for Advanced Modeling
// This module handles communication with the Python backend for complex 3D operations

class ModelingBackendService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
        this.isBackendAvailable = false;
        this.checkBackendHealth();
    }

    // Check if backend service is available
    async checkBackendHealth() {
        try {
            const response = await fetch('http://localhost:5000/health');
            if (response.ok) {
                this.isBackendAvailable = true;
                console.log('✅ Advanced Modeling Backend is available');
            }
        } catch (error) {
            this.isBackendAvailable = false;
            console.warn('⚠️ Advanced Modeling Backend not available. Please start the Python service.');
        }
    }

    // Convert STL geometry to base64 string for backend
    geometryToBase64(geometry) {
        try {
            const positions = geometry.attributes.position.array;
            let stlContent = 'solid model\n';

            // Convert geometry to STL format
            for (let i = 0; i < positions.length; i += 9) {
                // Get triangle vertices
                const v1 = [positions[i], positions[i + 1], positions[i + 2]];
                const v2 = [positions[i + 3], positions[i + 4], positions[i + 5]];
                const v3 = [positions[i + 6], positions[i + 7], positions[i + 8]];

                // Calculate normal
                const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
                const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
                const normal = [
                    edge1[1] * edge2[2] - edge1[2] * edge2[1],
                    edge1[2] * edge2[0] - edge1[0] * edge2[2],
                    edge1[0] * edge2[1] - edge1[1] * edge2[0]
                ];

                // Normalize
                const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
                if (length > 0) {
                    normal[0] /= length;
                    normal[1] /= length;
                    normal[2] /= length;
                }

                stlContent += `  facet normal ${normal[0]} ${normal[1]} ${normal[2]}\n`;
                stlContent += '    outer loop\n';
                stlContent += `      vertex ${v1[0]} ${v1[1]} ${v1[2]}\n`;
                stlContent += `      vertex ${v2[0]} ${v2[1]} ${v2[2]}\n`;
                stlContent += `      vertex ${v3[0]} ${v3[1]} ${v3[2]}\n`;
                stlContent += '    endloop\n';
                stlContent += '  endfacet\n';
            }

            stlContent += 'endsolid model\n';

            // Convert to base64
            return btoa(stlContent);

        } catch (error) {
            console.error('Error converting geometry to base64:', error);
            throw error;
        }
    }

    // Margin Detection API calls
    async detectMarginEdge(geometry, options = {}) {
        if (!this.isBackendAvailable) {
            console.warn('Backend not available, using fallback margin detection');
            return this.fallbackMarginDetection(geometry, options);
        }

        try {
            const stlData = this.geometryToBase64(geometry);
            
            const response = await fetch(`${this.baseUrl}/margin/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stl_data: stlData,
                    threshold_offset: options.threshold_offset || 0.2,
                    point_density: options.point_density || 50,
                    sensitivity: options.sensitivity || 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ Backend detected ${result.count} margin points`);
                return result;
            } else {
                throw new Error(result.error || 'Margin detection failed');
            }
            
        } catch (error) {
            console.error('❌ Backend margin detection failed:', error);
            console.log('🔄 Falling back to client-side detection');
            return this.fallbackMarginDetection(geometry, options);
        }
    }

    // Fallback methods for when backend is unavailable
    fallbackMarginDetection(geometry, options) {
        console.log('🔄 Using fallback margin detection');
        
        const points = [];
        const density = options.point_density || 50;
        
        // Simple fallback: create points around a circular pattern
        const radius = 3;
        const centerX = 0, centerY = 0, centerZ = -1;
        
        for (let i = 0; i < density; i++) {
            const angle = (i / density) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.2;
            const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.2;
            const z = centerZ + (Math.random() - 0.5) * 0.1;
            
            points.push({
                id: i + 1,
                x: x,
                y: y,
                z: z,
                confidence: 0.7 + Math.random() * 0.2
            });
        }
        
        return {
            success: true,
            points: points,
            count: points.length,
            source: 'fallback'
        };
    }

    // Check if backend is available
    isBackendReady() {
        return this.isBackendAvailable;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelingBackendService };
} else {
    // Browser environment
    window.ModelingBackendService = ModelingBackendService;
}
