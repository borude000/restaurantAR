# Models folder

Place your original 3D assets here (GLB/GLTF/USDZ, textures, etc.).

Recommended workflow:
- Drop uncompressed source files here, e.g. `dish.glb`.
- Run `npm run models:compress` to generate optimized versions into `client/public/models-compressed/`.
- In production, point your `modelUrl` to `/models-compressed/<file>.glb` for faster loads.

Notes:
- iOS USDZ can also be placed here; after compression you can copy or convert USDZs into the `models-compressed` folder and use it via the `iosSrc` prop on `ModelViewer`.
