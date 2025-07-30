// Advanced Modeling Tools Module
// This module handles model orientation, extrusion, and boolean operations

class ModelingTools {
    constructor() {
        this.orientationPresets = {
            default: { x: 0, y: 0, z: 0 },
            occlusalUp: { x: 0, y: 0, z: 0 },
            occlusalDown: { x: Math.PI, y: 0, z: 0 },
            buccalFront: { x: 0, y: 0, z: 0 },
            buccalBack: { x: 0, y: Math.PI, z: 0 },
            lingualView: { x: 0, y: Math.PI, z: 0 },
            mesialView: { x: 0, y: Math.PI/2, z: 0 },
            distalView: { x: 0, y: -Math.PI/2, z: 0 }
        };
    }

    // Apply orientation preset to model
    applyOrientation(model, presetName) {
        if (!model || !this.orientationPresets[presetName]) {
            console.error('Invalid model or orientation preset');
            return false;
        }

        const orientation = this.orientationPresets[presetName];
        model.rotation.set(orientation.x, orientation.y, orientation.z);
        
        console.log(`✅ Applied ${presetName} orientation to model`);
        return true;
    }

    // Set custom orientation
    setCustomOrientation(model, x, y, z) {
        if (!model) {
            console.error('No model provided');
            return false;
        }

        model.rotation.set(
            (x * Math.PI) / 180, // Convert degrees to radians
            (y * Math.PI) / 180,
            (z * Math.PI) / 180
        );

        console.log(`✅ Applied custom orientation: X:${x}°, Y:${y}°, Z:${z}°`);
        return true;
    }

    // Solidify model using extrusion and boolean operations
    solidifyModel(model, extrusionDepth = 2.0) {
        if (!model || !model.geometry) {
            console.error('Invalid model for solidification');
            return null;
        }

        console.log('🔧 Starting model solidification...');

        try {
            const originalGeometry = model.geometry;
            const positions = originalGeometry.attributes.position.array;
            const normals = originalGeometry.attributes.normal ? originalGeometry.attributes.normal.array : null;

            // Compute normals if not present
            if (!normals) {
                originalGeometry.computeVertexNormals();
            }

            // Create inner surface by extruding inward
            const innerPositions = new Float32Array(positions.length);
            const computedNormals = originalGeometry.attributes.normal.array;

            for (let i = 0; i < positions.length; i += 3) {
                // Get vertex position
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];

                // Get vertex normal (inverted for inward extrusion)
                const nx = -computedNormals[i];
                const ny = -computedNormals[i + 1];
                const nz = -computedNormals[i + 2];

                // Extrude vertex inward
                innerPositions[i] = x + (nx * extrusionDepth);
                innerPositions[i + 1] = y + (ny * extrusionDepth);
                innerPositions[i + 2] = z + (nz * extrusionDepth);
            }

            // Create walls connecting outer and inner surfaces
            const wallVertices = this.createConnectingWalls(positions, innerPositions);

            // Combine all vertices: outer surface + inner surface (reversed) + walls
            const totalVertices = positions.length + innerPositions.length + wallVertices.length;
            const solidVertices = new Float32Array(totalVertices);

            let offset = 0;

            // Add outer surface
            solidVertices.set(positions, offset);
            offset += positions.length;

            // Add inner surface (with reversed winding order)
            for (let i = 0; i < innerPositions.length; i += 9) {
                // Reverse triangle winding order for inner surface
                solidVertices.set([
                    innerPositions[i + 6], innerPositions[i + 7], innerPositions[i + 8],
                    innerPositions[i + 3], innerPositions[i + 4], innerPositions[i + 5],
                    innerPositions[i], innerPositions[i + 1], innerPositions[i + 2]
                ], offset + i);
            }
            offset += innerPositions.length;

            // Add connecting walls
            solidVertices.set(wallVertices, offset);

            // Create new solid geometry
            const solidGeometry = new THREE.BufferGeometry();
            solidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(solidVertices, 3));
            solidGeometry.computeVertexNormals();
            solidGeometry.computeBoundingBox();

            console.log(`✅ Model solidified with ${extrusionDepth}mm thickness`);
            return solidGeometry;

        } catch (error) {
            console.error('❌ Error during solidification:', error);
            return null;
        }
    }

    // Create walls connecting outer and inner surfaces
    createConnectingWalls(outerPositions, innerPositions) {
        const wallVertices = [];
        const tolerance = 0.1; // Tolerance for edge detection

        // Find boundary edges by detecting vertices that are on the edge
        const boundaryVertices = this.findBoundaryVertices(outerPositions, tolerance);

        console.log(`🔧 Found ${boundaryVertices.length} boundary vertices for wall creation`);

        // Create walls for boundary vertices
        for (let i = 0; i < boundaryVertices.length - 1; i++) {
            const idx1 = boundaryVertices[i];
            const idx2 = boundaryVertices[i + 1];

            // Outer vertices
            const outer1 = [outerPositions[idx1 * 3], outerPositions[idx1 * 3 + 1], outerPositions[idx1 * 3 + 2]];
            const outer2 = [outerPositions[idx2 * 3], outerPositions[idx2 * 3 + 1], outerPositions[idx2 * 3 + 2]];

            // Inner vertices
            const inner1 = [innerPositions[idx1 * 3], innerPositions[idx1 * 3 + 1], innerPositions[idx1 * 3 + 2]];
            const inner2 = [innerPositions[idx2 * 3], innerPositions[idx2 * 3 + 1], innerPositions[idx2 * 3 + 2]];

            // Create two triangles for wall segment
            wallVertices.push(
                // First triangle
                ...outer1, ...outer2, ...inner1,
                // Second triangle
                ...inner1, ...outer2, ...inner2
            );
        }

        return new Float32Array(wallVertices);
    }

    // Find boundary vertices (simplified approach)
    findBoundaryVertices(positions, tolerance) {
        const vertices = [];
        const boundaryIndices = [];

        // Convert positions to vertex array
        for (let i = 0; i < positions.length; i += 3) {
            vertices.push({
                x: positions[i],
                y: positions[i + 1],
                z: positions[i + 2],
                index: i / 3
            });
        }

        // Simple approach: find vertices that are likely on boundaries
        // This is a simplified implementation - for production, you'd want more sophisticated edge detection
        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            let neighborCount = 0;

            // Count nearby vertices
            for (let j = 0; j < vertices.length; j++) {
                if (i === j) continue;
                
                const other = vertices[j];
                const distance = Math.sqrt(
                    Math.pow(vertex.x - other.x, 2) +
                    Math.pow(vertex.y - other.y, 2) +
                    Math.pow(vertex.z - other.z, 2)
                );

                if (distance < tolerance) {
                    neighborCount++;
                }
            }

            // Vertices with fewer neighbors are likely on boundaries
            if (neighborCount < 6) { // Threshold for boundary detection
                boundaryIndices.push(vertex.index);
            }
        }

        return boundaryIndices;
    }

    // Apply solidification to a model
    applySolidification(model, extrusionDepth = 2.0) {
        if (!model) {
            console.error('No model selected for solidification');
            return false;
        }

        // Save undo state if available
        if (typeof saveUndoState === 'function') {
            saveUndoState();
        }

        const solidGeometry = this.solidifyModel(model, extrusionDepth);
        if (solidGeometry) {
            // Replace model geometry
            model.geometry.dispose();
            model.geometry = solidGeometry;

            // Update filename
            if (model.userData.filename) {
                model.userData.filename = model.userData.filename.replace('.stl', '_solid.stl');
            }

            console.log('✅ Model solidification applied successfully');
            return true;
        }

        return false;
    }

    // Get available orientation presets
    getOrientationPresets() {
        return Object.keys(this.orientationPresets);
    }

    // Get current model orientation in degrees
    getModelOrientation(model) {
        if (!model) return null;

        return {
            x: (model.rotation.x * 180) / Math.PI,
            y: (model.rotation.y * 180) / Math.PI,
            z: (model.rotation.z * 180) / Math.PI
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelingTools };
} else {
    // Browser environment
    window.ModelingTools = ModelingTools;
}
