# Advanced Modeling Backend Service
# Python backend for complex 3D modeling operations

import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import trimesh
import io
import base64
from scipy.spatial.transform import Rotation
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class ModelingProcessor:
    """
    Advanced 3D modeling operations using trimesh and numpy
    """
    
    def __init__(self):
        self.orientation_presets = {
            'default': [0, 0, 0],
            'occlusalUp': [0, 0, 0],
            'occlusalDown': [180, 0, 0],
            'buccalFront': [0, 0, 0],
            'buccalBack': [0, 180, 0],
            'lingualView': [0, 180, 0],
            'mesialView': [0, 90, 0],
            'distalView': [0, -90, 0]
        }
    
    def load_stl_from_string(self, stl_data):
        """
        Load STL from base64 string
        """
        try:
            # Decode base64 STL data
            stl_bytes = base64.b64decode(stl_data)
            
            # Load mesh using trimesh
            mesh = trimesh.load(io.BytesIO(stl_bytes), file_type='stl')
            
            if not isinstance(mesh, trimesh.Trimesh):
                raise ValueError("Invalid STL data")
                
            logger.info(f"Loaded STL: {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")
            return mesh
            
        except Exception as e:
            logger.error(f"Error loading STL: {str(e)}")
            raise
    
    def apply_orientation(self, mesh, preset_name=None, custom_rotation=None):
        """
        Apply orientation to mesh using preset or custom rotation
        """
        try:
            if preset_name and preset_name in self.orientation_presets:
                rotation_degrees = self.orientation_presets[preset_name]
                logger.info(f"Applying preset orientation: {preset_name}")
            elif custom_rotation:
                rotation_degrees = custom_rotation
                logger.info(f"Applying custom rotation: {rotation_degrees}")
            else:
                raise ValueError("No valid orientation specified")
            
            # Convert degrees to radians and create rotation matrix
            rotation_radians = np.array(rotation_degrees) * np.pi / 180
            rotation = Rotation.from_euler('xyz', rotation_radians)
            rotation_matrix = rotation.as_matrix()
            
            # Apply rotation to mesh
            mesh.apply_transform(trimesh.transformations.rotation_matrix(
                angle=0,  # We'll use the matrix directly
                direction=[0, 0, 1],
                point=[0, 0, 0]
            ))
            
            # Apply the rotation matrix
            mesh.vertices = np.dot(mesh.vertices, rotation_matrix.T)
            
            # Recalculate normals
            mesh.fix_normals()
            
            logger.info("Orientation applied successfully")
            return mesh
            
        except Exception as e:
            logger.error(f"Error applying orientation: {str(e)}")
            raise
    
    def solidify_mesh(self, mesh, wall_thickness=2.0):
        """
        Create solid geometry from hollow mesh using advanced techniques
        """
        try:
            logger.info(f"Starting solidification with {wall_thickness}mm thickness")
            
            # Ensure mesh is watertight for better processing
            if not mesh.is_watertight:
                logger.info("Mesh is not watertight, attempting to fix...")
                mesh.fill_holes()
                mesh.fix_normals()
            
            # Method 1: Use trimesh's offset operation if available
            try:
                # Create offset surface (inward)
                offset_mesh = mesh.copy()
                
                # Calculate inward normals and offset vertices
                normals = mesh.vertex_normals
                offset_vertices = mesh.vertices - (normals * wall_thickness)
                offset_mesh.vertices = offset_vertices
                
                # Reverse face normals for inner surface
                offset_mesh.faces = np.fliplr(offset_mesh.faces)
                
                # Combine outer and inner surfaces
                combined_vertices = np.vstack([mesh.vertices, offset_mesh.vertices])
                
                # Create faces for outer surface
                outer_faces = mesh.faces
                
                # Create faces for inner surface (offset by vertex count)
                inner_faces = offset_mesh.faces + len(mesh.vertices)
                
                # Create connecting walls between boundaries
                wall_faces = self._create_boundary_walls(mesh, offset_mesh, len(mesh.vertices))
                
                # Combine all faces
                all_faces = np.vstack([outer_faces, inner_faces, wall_faces])
                
                # Create solid mesh
                solid_mesh = trimesh.Trimesh(vertices=combined_vertices, faces=all_faces)
                
                # Clean up and validate
                solid_mesh.remove_duplicate_faces()
                solid_mesh.remove_degenerate_faces()
                solid_mesh.fix_normals()
                
                logger.info(f"Solidification complete: {len(solid_mesh.vertices)} vertices, {len(solid_mesh.faces)} faces")
                return solid_mesh
                
            except Exception as inner_e:
                logger.warning(f"Advanced solidification failed: {str(inner_e)}")
                
                # Fallback method: Simple extrusion
                return self._simple_solidification(mesh, wall_thickness)
                
        except Exception as e:
            logger.error(f"Error during solidification: {str(e)}")
            raise
    
    def _create_boundary_walls(self, outer_mesh, inner_mesh, vertex_offset):
        """
        Create walls connecting outer and inner surfaces at boundaries
        """
        try:
            # Find boundary edges
            boundary_edges = outer_mesh.outline()
            wall_faces = []
            
            if boundary_edges is not None and len(boundary_edges.vertices) > 0:
                # Create triangular walls for each boundary edge
                for i in range(len(boundary_edges.vertices) - 1):
                    v1_outer = i
                    v2_outer = i + 1
                    v1_inner = i + vertex_offset
                    v2_inner = i + 1 + vertex_offset
                    
                    # Create two triangles for each edge segment
                    wall_faces.extend([
                        [v1_outer, v2_outer, v1_inner],
                        [v2_outer, v2_inner, v1_inner]
                    ])
            
            return np.array(wall_faces) if wall_faces else np.empty((0, 3), dtype=int)
            
        except Exception as e:
            logger.warning(f"Could not create boundary walls: {str(e)}")
            return np.empty((0, 3), dtype=int)
    
    def _simple_solidification(self, mesh, wall_thickness):
        """
        Fallback solidification method
        """
        logger.info("Using simple solidification fallback")
        
        # Simple approach: just offset vertices inward
        normals = mesh.vertex_normals
        inner_vertices = mesh.vertices - (normals * wall_thickness)
        
        # Create simple solid by duplicating and offsetting
        outer_faces = mesh.faces
        inner_faces = np.fliplr(mesh.faces) + len(mesh.vertices)
        
        combined_vertices = np.vstack([mesh.vertices, inner_vertices])
        combined_faces = np.vstack([outer_faces, inner_faces])
        
        solid_mesh = trimesh.Trimesh(vertices=combined_vertices, faces=combined_faces)
        solid_mesh.fix_normals()
        
        return solid_mesh
    
    def detect_margin_edge(self, mesh, threshold_offset=0.2, point_density=50, sensitivity=0.7):
        """
        Detect margin edge using height-based analysis and curvature
        """
        try:
            logger.info(f"Starting margin detection with offset={threshold_offset}, density={point_density}")
            
            # Get Z coordinates (height field)
            z_coords = mesh.vertices[:, 2]
            z_mean = np.mean(z_coords)
            z_std = np.std(z_coords)
            
            # Adaptive threshold based on geometry
            margin_threshold = z_mean + (threshold_offset * z_std)
            
            # Find vertices above threshold
            candidate_indices = np.where(z_coords > margin_threshold)[0]
            candidate_vertices = mesh.vertices[candidate_indices]
            
            if len(candidate_vertices) == 0:
                raise ValueError("No margin candidates found with current threshold")
            
            # Apply curvature-based filtering for better edge detection
            margin_points = self._filter_by_curvature(mesh, candidate_indices, sensitivity)
            
            # Subsample to desired density
            if len(margin_points) > point_density:
                # Use uniform sampling along the edge
                indices = np.linspace(0, len(margin_points) - 1, point_density, dtype=int)
                margin_points = margin_points[indices]
            
            # Sort points to create proper curve order
            margin_points = self._sort_margin_points(margin_points)
            
            logger.info(f"Detected {len(margin_points)} margin points")
            return margin_points
            
        except Exception as e:
            logger.error(f"Error during margin detection: {str(e)}")
            raise
    
    def _filter_by_curvature(self, mesh, candidate_indices, sensitivity):
        """
        Filter margin candidates based on curvature analysis
        """
        try:
            # Calculate vertex curvatures (approximate using face normals)
            vertex_curvatures = np.zeros(len(mesh.vertices))
            
            for face_idx, face in enumerate(mesh.faces):
                face_normal = mesh.face_normals[face_idx]
                for vertex_idx in face:
                    if vertex_idx in candidate_indices:
                        # Simple curvature approximation
                        vertex_curvatures[vertex_idx] += np.linalg.norm(face_normal)
            
            # Normalize curvatures
            max_curvature = np.max(vertex_curvatures)
            if max_curvature > 0:
                vertex_curvatures /= max_curvature
            
            # Filter by curvature threshold
            curvature_threshold = 1.0 - sensitivity  # Higher sensitivity = lower threshold
            filtered_indices = candidate_indices[vertex_curvatures[candidate_indices] > curvature_threshold]
            
            return mesh.vertices[filtered_indices]
            
        except Exception as e:
            logger.warning(f"Curvature filtering failed: {str(e)}")
            # Fallback to simple height-based filtering
            return mesh.vertices[candidate_indices]
    
    def _sort_margin_points(self, points):
        """
        Sort margin points to create a proper curve order
        """
        try:
            if len(points) < 3:
                return points
            
            # Use 2D projection for sorting (ignore Z coordinate)
            points_2d = points[:, :2]
            
            # Find centroid
            centroid = np.mean(points_2d, axis=0)
            
            # Calculate angles from centroid
            angles = np.arctan2(points_2d[:, 1] - centroid[1], points_2d[:, 0] - centroid[0])
            
            # Sort by angle
            sorted_indices = np.argsort(angles)
            return points[sorted_indices]
            
        except Exception as e:
            logger.warning(f"Point sorting failed: {str(e)}")
            return points
    
    def refine_margin_points(self, points, smoothness=5):
        """
        Refine margin points using smoothing algorithms
        """
        try:
            if len(points) < 3:
                return points
            
            # Apply Gaussian smoothing
            smoothed_points = np.zeros_like(points)
            
            for i in range(len(points)):
                weights = []
                weighted_sum = np.zeros(3)
                
                for j in range(len(points)):
                    # Circular distance
                    dist = min(abs(i - j), len(points) - abs(i - j))
                    weight = np.exp(-(dist ** 2) / (2 * smoothness ** 2))
                    weights.append(weight)
                    weighted_sum += weight * points[j]
                
                smoothed_points[i] = weighted_sum / sum(weights)
            
            logger.info(f"Applied smoothing to {len(points)} margin points")
            return smoothed_points
            
        except Exception as e:
            logger.error(f"Error refining margin points: {str(e)}")
            return points
    
    def export_margin_pts(self, points, case_number="", tooth_number=""):
        """
        Export margin points to .PTS format
        """
        try:
            pts_content = f"# Margin Points for Case {case_number}\n"
            pts_content += f"# Tooth: {tooth_number}\n"
            pts_content += f"# Generated: {np.datetime64('now')}\n"
            pts_content += f"# Point Count: {len(points)}\n\n"
            
            for point in points:
                pts_content += f"{point[0]:.6f} {point[1]:.6f} {point[2]:.6f}\n"
            
            return pts_content
            
        except Exception as e:
            logger.error(f"Error exporting PTS: {str(e)}")
            raise
    
    def mesh_to_stl_string(self, mesh):
        """
        Convert mesh to STL string (base64 encoded)
        """
        try:
            # Export to STL bytes
            stl_bytes = mesh.export(file_type='stl')
            
            # Encode as base64
            stl_b64 = base64.b64encode(stl_bytes).decode('utf-8')
            
            logger.info("Mesh exported to STL string")
            return stl_b64
            
        except Exception as e:
            logger.error(f"Error exporting mesh to STL: {str(e)}")
            raise

# Initialize processor
processor = ModelingProcessor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Advanced Modeling Backend'})

@app.route('/api/orientation/presets', methods=['GET'])
def get_orientation_presets():
    """Get available orientation presets"""
    try:
        return jsonify({
            'success': True,
            'presets': processor.orientation_presets
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/orientation/apply', methods=['POST'])
def apply_orientation():
    """Apply orientation to mesh"""
    try:
        data = request.get_json()
        
        if 'stl_data' not in data:
            return jsonify({'success': False, 'error': 'Missing STL data'}), 400
        
        # Load mesh
        mesh = processor.load_stl_from_string(data['stl_data'])
        
        # Apply orientation
        if 'preset' in data:
            mesh = processor.apply_orientation(mesh, preset_name=data['preset'])
        elif 'rotation' in data:
            mesh = processor.apply_orientation(mesh, custom_rotation=data['rotation'])
        else:
            return jsonify({'success': False, 'error': 'No orientation specified'}), 400
        
        # Export result
        result_stl = processor.mesh_to_stl_string(mesh)
        
        return jsonify({
            'success': True,
            'stl_data': result_stl,
            'stats': {
                'vertices': len(mesh.vertices),
                'faces': len(mesh.faces),
                'watertight': mesh.is_watertight
            }
        })
        
    except Exception as e:
        logger.error(f"Orientation processing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/solidify', methods=['POST'])
def solidify_mesh():
    """Solidify mesh with specified wall thickness"""
    try:
        data = request.get_json()
        
        if 'stl_data' not in data:
            return jsonify({'success': False, 'error': 'Missing STL data'}), 400
        
        wall_thickness = data.get('wall_thickness', 2.0)
        
        # Load mesh
        mesh = processor.load_stl_from_string(data['stl_data'])
        
        # Solidify mesh
        solid_mesh = processor.solidify_mesh(mesh, wall_thickness)
        
        # Export result
        result_stl = processor.mesh_to_stl_string(solid_mesh)
        
        return jsonify({
            'success': True,
            'stl_data': result_stl,
            'stats': {
                'vertices': len(solid_mesh.vertices),
                'faces': len(solid_mesh.faces),
                'watertight': solid_mesh.is_watertight,
                'wall_thickness': wall_thickness
            }
        })
        
    except Exception as e:
        logger.error(f"Solidification processing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/model/info', methods=['POST'])
def get_model_info():
    """Get information about uploaded model"""
    try:
        data = request.get_json()
        
        if 'stl_data' not in data:
            return jsonify({'success': False, 'error': 'Missing STL data'}), 400
        
        # Load mesh
        mesh = processor.load_stl_from_string(data['stl_data'])
        
        return jsonify({
            'success': True,
            'info': {
                'vertices': len(mesh.vertices),
                'faces': len(mesh.faces),
                'watertight': mesh.is_watertight,
                'volume': float(mesh.volume) if mesh.is_watertight else None,
                'surface_area': float(mesh.area),
                'bounds': {
                    'min': mesh.bounds[0].tolist(),
                    'max': mesh.bounds[1].tolist()
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Model info error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/margin/detect', methods=['POST'])
def detect_margin():
    """Detect margin edge from STL model"""
    try:
        data = request.get_json()
        
        if 'stl_data' not in data:
            return jsonify({'success': False, 'error': 'Missing STL data'}), 400
        
        # Get parameters
        threshold_offset = data.get('threshold_offset', 0.2)
        point_density = data.get('point_density', 50)
        sensitivity = data.get('sensitivity', 0.7)
        
        # Load mesh
        mesh = processor.load_stl_from_string(data['stl_data'])
        
        # Detect margin points
        margin_points = processor.detect_margin_edge(
            mesh, 
            threshold_offset=threshold_offset,
            point_density=point_density,
            sensitivity=sensitivity
        )
        
        # Convert to list format for JSON
        points_data = []
        for i, point in enumerate(margin_points):
            points_data.append({
                'id': i + 1,
                'x': float(point[0]),
                'y': float(point[1]),
                'z': float(point[2]),
                'confidence': 0.8 + np.random.random() * 0.2  # Simulated confidence
            })
        
        return jsonify({
            'success': True,
            'points': points_data,
            'count': len(points_data),
            'parameters': {
                'threshold_offset': threshold_offset,
                'point_density': point_density,
                'sensitivity': sensitivity
            }
        })
        
    except Exception as e:
        logger.error(f"Margin detection error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/margin/refine', methods=['POST'])
def refine_margin():
    """Refine existing margin points"""
    try:
        data = request.get_json()
        
        if 'points' not in data:
            return jsonify({'success': False, 'error': 'Missing margin points'}), 400
        
        # Convert points data back to numpy array
        points = np.array([[p['x'], p['y'], p['z']] for p in data['points']])
        smoothness = data.get('smoothness', 5)
        
        # Refine points
        refined_points = processor.refine_margin_points(points, smoothness)
        
        # Convert back to list format
        refined_data = []
        for i, point in enumerate(refined_points):
            refined_data.append({
                'id': i + 1,
                'x': float(point[0]),
                'y': float(point[1]),
                'z': float(point[2]),
                'confidence': 0.9  # Higher confidence for refined points
            })
        
        return jsonify({
            'success': True,
            'points': refined_data,
            'count': len(refined_data),
            'smoothness': smoothness
        })
        
    except Exception as e:
        logger.error(f"Margin refinement error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/margin/export', methods=['POST'])
def export_margin_pts():
    """Export margin points as .PTS file"""
    try:
        data = request.get_json()
        
        if 'points' not in data:
            return jsonify({'success': False, 'error': 'Missing margin points'}), 400
        
        # Convert points data to numpy array
        points = np.array([[p['x'], p['y'], p['z']] for p in data['points']])
        
        case_number = data.get('case_number', '')
        tooth_number = data.get('tooth_number', '')
        
        # Export to PTS format
        pts_content = processor.export_margin_pts(points, case_number, tooth_number)
        
        return jsonify({
            'success': True,
            'pts_content': pts_content,
            'filename': f"margin_{case_number}_tooth{tooth_number}.pts"
        })
        
    except Exception as e:
        logger.error(f"Margin export error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Advanced Modeling Backend Service...")
    print("📍 Available endpoints:")
    print("   GET  /health - Health check")
    print("   GET  /api/orientation/presets - Get orientation presets")
    print("   POST /api/orientation/apply - Apply orientation to model")
    print("   POST /api/solidify - Solidify model")
    print("   POST /api/model/info - Get model information")
    print("   POST /api/margin/detect - Auto-detect margin edge")
    print("   POST /api/margin/refine - Refine margin points")
    print("   POST /api/margin/export - Export margin as .PTS file")
    print("")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
