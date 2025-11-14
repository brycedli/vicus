# Vicus Shader

A WebGL shader application with separate dedicated files for different visual presets.

## Features

- **Dedicated HTML Files**: Each preset has its own optimized HTML file
- **Modular Architecture**: Easy to modify individual presets without affecting others
- **Experimental Playground**: Dedicated file for testing new shader ideas
- **Enhanced Reflections**: Brightened matcap reflections for better visual impact

## Available Presets

### `/text` - Text/Typography Preset (`text.html`)
- **Normal Map**: `paragraph_normal.png`
- **Displacement Map**: `paragraph.png` 
- **Zoom Level**: 0.8
- **Displacement Strength**: 0.3
- **Matcap**: `matcap2.jpeg`

### `/logo` - Logo/Graphics Preset (`logo.html`)
- **Normal Map**: `normal.png`
- **Displacement Map**: `displacement.png`
- **Zoom Level**: 2.0
- **Displacement Strength**: 0.3
- **Matcap**: `matcap1.jpg`

### `/experimental` - Experimental Preset (`experimental.html`)
- **Enhanced Effects**: Time-based UV distortion, dynamic noise, color manipulation
- **Extra Brightness**: 2.0x matcap brightness with blue tint animation
- **Faster Animation**: Increased rotation speed for more dynamic visuals

### `/` - Default Route
- Serves the logo preset

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Visit different preset URLs:
   - `http://localhost:3000/` - Default (logo) preset
   - `http://localhost:3000/text` - Text preset
   - `http://localhost:3000/logo` - Logo preset
   - `http://localhost:3000/experimental` - Experimental preset

## Adding New Presets

To add a new preset:

1. **Create a new HTML file** in the `public/` directory (e.g., `mynewpreset.html`)
2. **Copy from an existing preset** and modify the configuration object
3. **Add a route** in `server.js`:

```javascript
app.get("/mynewpreset", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mynewpreset.html"));
});
```

## File Structure

```
public/
├── text.html          # Text/typography shader
├── logo.html          # Logo/graphics shader  
├── experimental.html  # Experimental shader with enhanced effects
├── index.html         # Original dynamic preset file (legacy)
└── [texture files...]
```

## Technical Details

- Built with Three.js for WebGL rendering
- Express.js server for preset management
- Custom fragment shader for visual effects
- Dynamic texture loading based on presets
