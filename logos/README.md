# Skill Cube Logo Images

This folder contains the logo images used for each face of the 3D skill cube.

## Required Files

The cube expects exactly 6 images with these names:

1. **js.png** - JavaScript logo (Right face)
2. **cpp.png** - C++ logo (Left face)
3. **python.png** - Python logo (Top face)
4. **node.png** - Node.js logo (Bottom face)
5. **opencv.png** - OpenCV logo (Front face)
6. **typescript.png** - TypeScript logo (Back face)

## Image Requirements

- **Format**: PNG (with transparency recommended)
- **Size**: 512x512px or higher (square aspect ratio)
- **Quality**: High resolution for sharp rendering
- **Background**: Transparent PNG works best

## Current Status

✓ All 6 images are present and loaded

## Customization

To change a skill logo:
1. Replace the corresponding PNG file in this folder
2. Keep the same filename
3. Refresh your browser to see the change

## Face Mapping

```
         [python.png]
              ↑
              |
[cpp.png] ← [CUBE] → [js.png]
              |
              ↓
         [node.png]

Front: opencv.png
Back: typescript.png
```

## Notes

- Images are loaded asynchronously
- Failed loads will show console warnings
- Cube continues to work even if some images fail to load
- All images use LinearFilter for sharp rendering



