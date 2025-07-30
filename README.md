# DentalCAD Pro - Professional Dental Laboratory Software

A comprehensive dental CAD/CAM software solution featuring a professional multi-stage workflow system designed for dental laboratories and technicians.

## 🦷 Features

### Multi-Stage Workflow System
Professional dental lab workflow with intuitive progress tracking:

1. **📋 Order Form Stage**
   - Patient information and case details
   - Tooth selection with full FDI numbering
   - Material and shade selection
   - Special instructions and notes

2. **📁 Scan Cleaning Stage**
   - STL file upload with drag & drop
   - 3D scan cleaning and preparation
   - Advanced modeling tools (Add/Remove material, Smooth, Cut)
   - Real-time 3D visualization

3. **✏️ Margin Placement Stage**
   - Interactive margin line placement
   - Precision margin point editing
   - Adjustable smoothness and line width
   - Visual margin verification

4. **🦷 Crown Design Stage**
   - Crown library with anatomical templates
   - Real-time crown fitting and adjustment
   - Boolean operations (Union/Subtract)
   - Contact point verification

5. **✅ Finalization Stage**
   - Quality check and review
   - Multi-format export (STL, PTS, XYZ)
   - Case completion and archiving

### Professional Features
- **Progress Bar Navigation**: Visual workflow progress with stage completion tracking
- **3D Viewport**: Advanced Three.js-based 3D rendering with multiple view modes
- **File Management**: Complete STL file handling with upload, preview, and organization
- **Quality Control**: Built-in validation and quality checks at each stage
- **Export System**: Professional file export with multiple format support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DentalCad-Pro.git
cd DentalCad-Pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 🔧 Usage

### Starting a New Case
1. The workflow automatically starts at **Stage 1: Order Form**
2. Fill in patient information, tooth number, material, and shade
3. Click "Continue to Scan Upload" to proceed

### Uploading Scans
1. Drag and drop STL files or click to browse
2. Use cleaning tools to prepare the scan data
3. Continue to margin placement when ready

### Placing Margins
1. Click on the preparation surface to place margin points
2. Adjust point size, line width, and smoothness as needed
3. Edit or delete points as required

### Designing the Crown
1. Select from crown templates in the library
2. Adjust crown dimensions and fit
3. Use boolean operations for precise fitting
4. Verify contact points and occlusion

### Finalizing and Export
1. Review the complete design
2. Run quality checks
3. Select export formats
4. Export files for manufacturing

## 🎮 Demo Mode

The application includes a comprehensive demo system:

- **Stage-by-Stage Demo**: Click individual stage buttons to jump to specific workflow stages
- **Auto Demo**: Run a complete automated demonstration of all workflow stages
- **Reset Function**: Return to the beginning of the workflow at any time

Access the demo panel from the top-right corner of the application.

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Three.js** for 3D rendering
- **Font Awesome** for icons

### Key Components
- `DentalWorkflowManager` - Main workflow orchestration
- `DentalWorkflowDemo` - Interactive demonstration system
- React components for UI panels and controls
- 3D viewport with STL loading and manipulation

### File Structure
```
src/
├── components/           # React UI components
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── dentalWorkflow.js    # Main workflow management
├── workflowDemo.js      # Demo system
└── index.css           # Global styles and workflow CSS
```

## 🎨 Customization

### Colors
The application uses a professional dental color scheme defined in `tailwind.config.js`:
- Primary: `#1e90ff` (DodgerBlue)
- Secondary: `#4169e1` (RoyalBlue)
- Accent: `#00bfff` (DeepSkyBlue)

### Workflow Stages
Modify the workflow stages in `dentalWorkflow.js`:
```javascript
this.stages = {
    1: {
        name: 'Order Form',
        title: 'Patient & Order Information',
        description: 'Enter patient details and restoration requirements',
        // ... additional configuration
    }
    // ... more stages
}
```

## 📋 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Workflow Stages
1. Define the stage in `DentalWorkflowManager.stages`
2. Implement the stage creation method (`createNewStage`)
3. Add navigation logic and event handlers
4. Update the progress bar rendering

### Extending 3D Functionality
The 3D viewport supports:
- STL file loading and rendering
- Multiple view modes (wireframe, solid, shaded, x-ray)
- Interactive tools for mesh manipulation
- Camera controls and navigation

## 🔍 Quality Assurance

The workflow includes built-in quality checks:
- Scan quality validation
- Margin completeness verification
- Crown fit optimization
- Contact point validation
- Export file integrity

## 📁 Export Formats

Supported export formats:
- **STL** - 3D model files for manufacturing
- **PTS** - Point cloud data for margin lines
- **XYZ** - Coordinate data for reference points

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 Professional Use

DentalCAD Pro is designed for professional dental laboratories and follows industry standards for:
- File formats and compatibility
- Workflow efficiency and quality control
- User interface design for dental professionals
- Export formats compatible with CAM systems

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the demo system for usage examples

---

**DentalCAD Pro** - Professional dental CAD software for the modern dental laboratory.

## Screenshots

<img width="1888" height="912" alt="image" src="https://github.com/user-attachments/assets/fd5ad2cc-58b0-41a1-8911-73c8496457b0" />

<img width="1897" height="911" alt="image" src="https://github.com/user-attachments/assets/1453386c-5a84-456d-b9a2-0d660bc7213b" />

<img width="1886" height="914" alt="image" src="https://github.com/user-attachments/assets/cdebebc3-9ec5-41ad-a2e7-4d4aad94cc17" />


