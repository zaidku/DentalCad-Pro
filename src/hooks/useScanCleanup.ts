import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { MarginPoint, MarginLine, PrepDetection, ScanCleanupState } from '../types/dental';

export const useScanCleanup = () => {
  const [cleanupState, setCleanupState] = useState<ScanCleanupState>({
    currentStage: 'upload',
    marginLines: [],
    activeMarginLine: null,
    prepDetection: null,
    isDrawingMargin: false,
    marginDrawingMode: 'manual',
  });

  const marginPointsRef = useRef<THREE.Points | null>(null);
  const marginLinesRef = useRef<THREE.Group>(new THREE.Group());

  // Detect prep areas in uploaded STL
  const detectPrepAreas = useCallback((mesh: THREE.Mesh): PrepDetection => {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal?.array;

    if (!normals) {
      geometry.computeVertexNormals();
    }

    // Simple prep detection algorithm
    // In a real application, this would use more sophisticated algorithms
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // Look for areas with significant curvature changes (simplified)
    const suggestedMargin: MarginPoint[] = [];
    const stepSize = Math.floor(positions.length / (3 * 50)); // Sample ~50 points

    for (let i = 0; i < positions.length; i += stepSize * 3) {
      if (i + 2 < positions.length) {
        const point = new THREE.Vector3(
          positions[i],
          positions[i + 1],
          positions[i + 2]
        );

        const normal = normals ? new THREE.Vector3(
          normals[i],
          normals[i + 1],
          normals[i + 2]
        ) : new THREE.Vector3(0, 1, 0);

        // Check if point is near the prep boundary (simplified heuristic)
        const distanceFromCenter = point.distanceTo(center);
        const relativeDistance = distanceFromCenter / (size.length() / 2);

        if (relativeDistance > 0.3 && relativeDistance < 0.8) {
          suggestedMargin.push({
            id: `suggested-${i}`,
            position: point.clone(),
            normal: normal.clone(),
            timestamp: Date.now(),
          });
        }
      }
    }

    return {
      detected: suggestedMargin.length > 10,
      confidence: Math.min(suggestedMargin.length / 50, 1),
      boundingBox,
      suggestedMargin: suggestedMargin.slice(0, 50), // Limit to 50 points
    };
  }, []);

  // Start margin drawing
  const startMarginDrawing = useCallback((mode: 'manual' | 'auto-detect' | 'assisted' = 'manual') => {
    const newMarginLine: MarginLine = {
      id: `margin-${Date.now()}`,
      points: [],
      isComplete: false,
      color: '#ff6b6b',
      thickness: 2,
    };

    setCleanupState(prev => ({
      ...prev,
      marginLines: [...prev.marginLines, newMarginLine],
      activeMarginLine: newMarginLine.id,
      isDrawingMargin: true,
      marginDrawingMode: mode,
      currentStage: 'margin-drawing',
    }));

    return newMarginLine.id;
  }, []);

  // Add point to active margin line
  const addMarginPoint = useCallback((point: THREE.Vector3, normal: THREE.Vector3) => {
    setCleanupState(prev => {
      if (!prev.activeMarginLine) return prev;

      const marginPoint: MarginPoint = {
        id: `point-${Date.now()}-${Math.random()}`,
        position: point.clone(),
        normal: normal.clone(),
        timestamp: Date.now(),
      };

      const updatedLines = prev.marginLines.map(line => {
        if (line.id === prev.activeMarginLine) {
          return {
            ...line,
            points: [...line.points, marginPoint],
          };
        }
        return line;
      });

      return {
        ...prev,
        marginLines: updatedLines,
      };
    });
  }, []);

  // Complete margin line drawing
  const completeMarginLine = useCallback(() => {
    setCleanupState(prev => {
      if (!prev.activeMarginLine) return prev;

      const updatedLines = prev.marginLines.map(line => {
        if (line.id === prev.activeMarginLine) {
          return {
            ...line,
            isComplete: true,
          };
        }
        return line;
      });

      return {
        ...prev,
        marginLines: updatedLines,
        activeMarginLine: null,
        isDrawingMargin: false,
        currentStage: 'review',
      };
    });
  }, []);

  // Apply auto-detected margin
  const applyAutoDetectedMargin = useCallback(() => {
    if (!cleanupState.prepDetection?.suggestedMargin) return;

    const autoMarginLine: MarginLine = {
      id: `auto-margin-${Date.now()}`,
      points: cleanupState.prepDetection.suggestedMargin,
      isComplete: true,
      color: '#4ecdc4',
      thickness: 2,
    };

    setCleanupState(prev => ({
      ...prev,
      marginLines: [...prev.marginLines, autoMarginLine],
      currentStage: 'review',
    }));
  }, [cleanupState.prepDetection]);

  // Delete margin line
  const deleteMarginLine = useCallback((lineId: string) => {
    setCleanupState(prev => ({
      ...prev,
      marginLines: prev.marginLines.filter(line => line.id !== lineId),
    }));
  }, []);

  // Clear all margin lines
  const clearAllMarginLines = useCallback(() => {
    setCleanupState(prev => ({
      ...prev,
      marginLines: [],
      activeMarginLine: null,
      isDrawingMargin: false,
    }));
  }, []);

  // Export STL and PTS files
  const exportFiles = useCallback((mesh: THREE.Mesh, filename: string) => {
    // Export STL file
    const stlExporter = {
      parse: (mesh: THREE.Mesh): string => {
        const geometry = mesh.geometry as THREE.BufferGeometry;
        const vertices = geometry.attributes.position.array;
        const normals = geometry.attributes.normal?.array;

        if (!normals) {
          geometry.computeVertexNormals();
        }

        let stlString = 'solid exported\n';

        for (let i = 0; i < vertices.length; i += 9) {
          const v1 = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
          const v2 = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
          const v3 = new THREE.Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);

          const normal = new THREE.Vector3()
            .crossVectors(
              new THREE.Vector3().subVectors(v2, v1),
              new THREE.Vector3().subVectors(v3, v1)
            )
            .normalize();

          stlString += `  facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
          stlString += '    outer loop\n';
          stlString += `      vertex ${v1.x} ${v1.y} ${v1.z}\n`;
          stlString += `      vertex ${v2.x} ${v2.y} ${v2.z}\n`;
          stlString += `      vertex ${v3.x} ${v3.y} ${v3.z}\n`;
          stlString += '    endloop\n';
          stlString += '  endfacet\n';
        }

        stlString += 'endsolid exported\n';
        return stlString;
      }
    };

    // Export PTS file (margin points)
    const exportPtsFile = (): string => {
      let ptsContent = '# Margin Points File\n';
      ptsContent += `# Generated: ${new Date().toISOString()}\n`;
      ptsContent += `# Total margin lines: ${cleanupState.marginLines.length}\n\n`;

      cleanupState.marginLines.forEach((line, lineIndex) => {
        ptsContent += `# Margin Line ${lineIndex + 1} (${line.points.length} points)\n`;
        ptsContent += `# Color: ${line.color}, Thickness: ${line.thickness}\n`;
        
        line.points.forEach((point, pointIndex) => {
          ptsContent += `${point.position.x.toFixed(6)} ${point.position.y.toFixed(6)} ${point.position.z.toFixed(6)} `;
          ptsContent += `${point.normal.x.toFixed(6)} ${point.normal.y.toFixed(6)} ${point.normal.z.toFixed(6)}\n`;
        });
        
        ptsContent += '\n';
      });

      return ptsContent;
    };

    // Create and download STL file
    const stlContent = stlExporter.parse(mesh);
    const stlBlob = new Blob([stlContent], { type: 'application/octet-stream' });
    const stlUrl = URL.createObjectURL(stlBlob);
    const stlLink = document.createElement('a');
    stlLink.href = stlUrl;
    stlLink.download = `${filename}_cleaned.stl`;
    stlLink.click();
    URL.revokeObjectURL(stlUrl);

    // Create and download PTS file
    const ptsContent = exportPtsFile();
    const ptsBlob = new Blob([ptsContent], { type: 'text/plain' });
    const ptsUrl = URL.createObjectURL(ptsBlob);
    const ptsLink = document.createElement('a');
    ptsLink.href = ptsUrl;
    ptsLink.download = `${filename}_margin.pts`;
    ptsLink.click();
    URL.revokeObjectURL(ptsUrl);

    console.log('Files exported successfully:', {
      stl: `${filename}_cleaned.stl`,
      pts: `${filename}_margin.pts`,
      marginLines: cleanupState.marginLines.length,
      totalPoints: cleanupState.marginLines.reduce((sum, line) => sum + line.points.length, 0),
    });
  }, [cleanupState.marginLines]);

  // Update cleanup stage
  const setCurrentStage = useCallback((stage: ScanCleanupState['currentStage']) => {
    setCleanupState(prev => ({
      ...prev,
      currentStage: stage,
    }));
  }, []);

  // Set prep detection result
  const setPrepDetection = useCallback((detection: PrepDetection) => {
    setCleanupState(prev => ({
      ...prev,
      prepDetection: detection,
      currentStage: detection.detected ? 'detection' : 'margin-drawing',
    }));
  }, []);

  return {
    cleanupState,
    detectPrepAreas,
    startMarginDrawing,
    addMarginPoint,
    completeMarginLine,
    applyAutoDetectedMargin,
    deleteMarginLine,
    clearAllMarginLines,
    exportFiles,
    setCurrentStage,
    setPrepDetection,
    marginLinesRef,
  };
};