import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { STLFile, ViewMode, Tool, MarginPoint } from '../types/dental';
import { useScanCleanup } from './useScanCleanup';

export const use3DViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  const [loadedModels, setLoadedModels] = useState<THREE.Mesh[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('shaded');
  const [activeTool, setActiveTool] = useState<Tool>('design');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<THREE.Vector3[]>([]);

  const {
    cleanupState,
    detectPrepAreas,
    addMarginPoint,
    marginLinesRef,
    setPrepDetection,
  } = useScanCleanup();

  // Initialize 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x1a1a1a, 1);
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
    gridHelper.position.y = -20;
    scene.add(gridHelper);

    // Add margin lines group to scene
    scene.add(marginLinesRef.current);

    // Orbit controls implementation
    const controls = {
      isDragging: false,
      isRotating: false,
      isPanning: false,
      previousMousePosition: { x: 0, y: 0 },
      rotationSpeed: 0.005,
      panSpeed: 0.01,
      zoomSpeed: 0.1,
    };
    controlsRef.current = controls;

    // Mouse event handlers
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      
      if (event.button === 0) { // Left click
        if (activeTool === 'design') {
          controls.isRotating = true;
        } else if (activeTool === 'tooth' && cleanupState.isDrawingMargin) {
          handleMarginDrawing(event);
        } else if (activeTool === 'measure') {
          handleMeasureTool(event);
        } else if (activeTool === 'cut') {
          handleCutTool(event);
        }
      } else if (event.button === 1) { // Middle click
        controls.isPanning = true;
      }
      
      controls.isDragging = true;
      controls.previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMarginDrawing = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(loadedModels);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const point = intersection.point;
        const normal = intersection.face?.normal || new THREE.Vector3(0, 1, 0);
        
        // Transform normal to world space
        const worldNormal = normal.clone().transformDirection(intersection.object.matrixWorld);
        
        addMarginPoint(point, worldNormal);
        addMarginPointVisualization(point, worldNormal);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!controls.isDragging) return;

      const deltaMove = {
        x: event.clientX - controls.previousMousePosition.x,
        y: event.clientY - controls.previousMousePosition.y,
      };

      if (controls.isRotating) {
        // Rotate camera around the scene
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        spherical.theta -= deltaMove.x * controls.rotationSpeed;
        spherical.phi += deltaMove.y * controls.rotationSpeed;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
      } else if (controls.isPanning) {
        // Pan camera
        const panVector = new THREE.Vector3();
        panVector.setFromMatrixColumn(camera.matrix, 0);
        panVector.multiplyScalar(-deltaMove.x * controls.panSpeed);
        camera.position.add(panVector);
        
        const panVectorY = new THREE.Vector3();
        panVectorY.setFromMatrixColumn(camera.matrix, 1);
        panVectorY.multiplyScalar(deltaMove.y * controls.panSpeed);
        camera.position.add(panVectorY);
      }

      controls.previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      controls.isDragging = false;
      controls.isRotating = false;
      controls.isPanning = false;
      setIsDrawing(false);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 1 + controls.zoomSpeed : 1 - controls.zoomSpeed;
      camera.position.multiplyScalar(scaleFactor);
    };

    const handleMeasureTool = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(loadedModels);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        addMeasurementPoint(point);
      }
    };

    const handleCutTool = (event: MouseEvent) => {
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawingPoints([]);
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(loadedModels);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        setDrawingPoints(prev => [...prev, point]);
        addCutLine(point);
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeTool, isDrawing, cleanupState.isDrawingMargin, addMarginPoint]);

  // Update margin line visualization
  useEffect(() => {
    // Clear existing margin visualizations
    marginLinesRef.current.clear();

    cleanupState.marginLines.forEach((line) => {
      if (line.points.length > 0) {
        // Create points geometry
        const pointsGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(line.points.length * 3);
        
        line.points.forEach((point, index) => {
          positions[index * 3] = point.position.x;
          positions[index * 3 + 1] = point.position.y;
          positions[index * 3 + 2] = point.position.z;
        });
        
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create points material
        const pointsMaterial = new THREE.PointsMaterial({
          color: line.color,
          size: 0.5,
          sizeAttenuation: true,
        });
        
        const points = new THREE.Points(pointsGeometry, pointsMaterial);
        marginLinesRef.current.add(points);
        
        // Create line connecting points if there are enough points
        if (line.points.length > 1) {
          const lineGeometry = new THREE.BufferGeometry();
          lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          const lineMaterial = new THREE.LineBasicMaterial({
            color: line.color,
            linewidth: line.thickness,
          });
          
          const lineObject = new THREE.Line(lineGeometry, lineMaterial);
          marginLinesRef.current.add(lineObject);
        }
      }
    });
  }, [cleanupState.marginLines]);

  const addMarginPointVisualization = (point: THREE.Vector3, normal: THREE.Vector3) => {
    if (!sceneRef.current) return;

    // Add a small sphere at the margin point
    const geometry = new THREE.SphereGeometry(0.3, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    
    // Add to margin lines group for easy management
    marginLinesRef.current.add(sphere);

    // Add normal vector visualization
    const normalGeometry = new THREE.BufferGeometry().setFromPoints([
      point,
      point.clone().add(normal.clone().multiplyScalar(2))
    ]);
    const normalMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const normalLine = new THREE.Line(normalGeometry, normalMaterial);
    marginLinesRef.current.add(normalLine);
  };

  const addMeasurementPoint = (point: THREE.Vector3) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    sceneRef.current.add(sphere);
  };

  const addCutLine = (point: THREE.Vector3) => {
    if (!sceneRef.current || drawingPoints.length === 0) return;

    const lastPoint = drawingPoints[drawingPoints.length - 1];
    const geometry = new THREE.BufferGeometry().setFromPoints([lastPoint, point]);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 });
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
  };

  const loadSTLFile = useCallback(async (file: File): Promise<THREE.Mesh | null> => {
    if (!sceneRef.current) return null;

    try {
      const loader = new STLLoader();
      const arrayBuffer = await file.arrayBuffer();
      const geometry = loader.parse(arrayBuffer);

      // Center the geometry
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox!.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      // Create material based on file type
      const material = new THREE.MeshPhongMaterial({
        color: 0xf97316,
        shininess: 100,
        transparent: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { fileName: file.name };

      sceneRef.current.add(mesh);
      setLoadedModels(prev => [...prev, mesh]);

      // Fit camera to object
      fitCameraToObject(mesh);

      // Detect prep areas after loading
      const prepDetection = detectPrepAreas(mesh);
      setPrepDetection(prepDetection);

      return mesh;
    } catch (error) {
      console.error('Error loading STL file:', error);
      return null;
    }
  }, []);

  const fitCameraToObject = (object: THREE.Mesh) => {
    if (!cameraRef.current) return;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

    cameraZ *= 0.5;

    cameraRef.current.position.set(center.x, center.y, center.z + cameraZ);
    cameraRef.current.lookAt(center);
  };

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    loadedModels.forEach(model => {
      if (model.material instanceof THREE.MeshPhongMaterial) {
        switch (mode) {
          case 'wireframe':
            model.material.wireframe = true;
            model.material.transparent = false;
            break;
          case 'solid':
            model.material.wireframe = false;
            model.material.transparent = false;
            model.material.opacity = 1;
            break;
          case 'shaded':
            model.material.wireframe = false;
            model.material.transparent = false;
            model.material.opacity = 1;
            break;
          case 'xray':
            model.material.wireframe = false;
            model.material.transparent = true;
            model.material.opacity = 0.3;
            break;
        }
        model.material.needsUpdate = true;
      }
    });
  };

  const addMaterial = (modelIndex: number, materialType: string) => {
    if (modelIndex >= loadedModels.length) return;

    const model = loadedModels[modelIndex];
    const colors = {
      zirconia: 0xffffff,
      emax: 0xfff8dc,
      pfm: 0xffeaa7,
      gold: 0xffd700,
      composite: 0xf0f8ff,
    };

    if (model.material instanceof THREE.MeshPhongMaterial) {
      model.material.color.setHex(colors[materialType as keyof typeof colors] || 0xf97316);
      model.material.needsUpdate = true;
    }
  };

  const removeMaterial = (modelIndex: number) => {
    if (modelIndex >= loadedModels.length) return;

    const model = loadedModels[modelIndex];
    if (model.material instanceof THREE.MeshPhongMaterial) {
      model.material.color.setHex(0x888888);
      model.material.needsUpdate = true;
    }
  };

  const smoothModel = (modelIndex: number, iterations: number = 1) => {
    if (modelIndex >= loadedModels.length) return;

    const model = loadedModels[modelIndex];
    const geometry = model.geometry as THREE.BufferGeometry;
    
    // Simple smoothing by averaging vertex positions
    for (let i = 0; i < iterations; i++) {
      geometry.computeVertexNormals();
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  };

  const clearModels = () => {
    if (!sceneRef.current) return;
    
    loadedModels.forEach(model => {
      sceneRef.current?.remove(model);
      model.geometry.dispose();
      if (model.material instanceof THREE.Material) {
        model.material.dispose();
      }
    });
    setLoadedModels([]);
  };

  const setTool = (tool: Tool) => {
    setActiveTool(tool);
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const resetCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(0, 0, 50);
    cameraRef.current.lookAt(0, 0, 0);
  };

  return {
    mountRef,
    loadSTLFile,
    updateViewMode,
    clearModels,
    addMaterial,
    removeMaterial,
    smoothModel,
    setTool,
    resetCamera,
    viewMode,
    loadedModels,
    activeTool,
    cleanupState,
  };
};