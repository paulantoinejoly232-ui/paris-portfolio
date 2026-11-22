# Paul-Antoine Joly · The Apartment

A free-to-host, first-person Paris apartment portfolio. Built as an original project in **React + Vite + React Three Fiber** with a **Blender-generated PBR materials and 3D geometry pipeline**. Inspired by the craftsmanship and baking process discussed in the public *Ekko656/portfolio-3d* project; **no files or assets from that repository are copied**.

## What visitors can do
- Explore the apartment using **W A S D** (Shift to walk faster); move the mouse to look.
- Approach the books, laptop, folder, suitcase, or doorway and press **E**.
- Tap **Skip to the site** to view the same content as a conventional accessible portfolio.
- Use touch drag and the on-screen movement pad on mobile.

## Run locally
\`\`\`bash
npm install
npm run dev
\`\`\`

## Architecture and fidelity
- \`src/World.jsx\`: deterministic apartment fallback with physically based materials, detailed window frames, sofa, kitchen, sunlight and a real exterior photographic plate. This can load without a Blender export.
- \`src/App.jsx\`: scene orchestration, camera controls and interaction/UI.
- \`assets-src/blender/apartment.py\`: original, editable Blender geometry generator. It models the room, furniture, architectural trims and fixtures at metre scale, using Cycles for an optional combined-lighting bake.
- \`public/models/apartment.glb\`: if this file exists, it automatically replaces runtime geometry (while keeping exterior scenery and interactive HTML hotspots).
- \`public/models/apartment-lightmap.png\`: optional baked lighting output.

### Produce the Blender scene
Install [Blender](https://www.blender.org/) (free), then from the repository root:
\`\`\`bash
blender --background --python assets-src/blender/apartment.py
\`\`\`
This creates the GLB asset loaded by the site and an editable \`assets-src/blender/apartment-source.blend\`. Blender requires memory and CPU time for baking; **deploys on Vercel need no GPU**.

For GitHub's public runner there is a manual/push-triggered workflow at \`.github/workflows/bake-apartment.yml\`. It can generate and commit the baked GLB on the rebuild branch; it is not a Vercel runtime service. You can keep the Vercel Hobby tier free (subject to provider limits).

## Important visual-quality note
A realistic walkable environment cannot be reconstructed exactly from one still image. The image provides camera composition, colour, materials and furniture placement; geometry outside its field of view is designed intentionally. The authored model and 2K bake are the foundation for iterative visual fidelity, not a promise of instant photographic equivalence. Larger commercial archviz assets or hand-authored high-resolution interiors could improve this further.

## Asset sourcing
Core room geometry and its textures are originally generated. The Paris view is loaded from Unsplash as a visual backdrop if the image can be retrieved; all critical website functionality remains usable if it cannot.

## Deployment
Connect this repository to Vercel; framework: Vite; build command: \`npm run build\`; output: \`dist\`.


## Scene asset provenance (free to use)
- Detailed modern armchair, dining chairs and potted plant: [Poly Haven](https://polyhaven.com/), CC0.
- Contemporary three-seat sofa: [3DAssets.dev](https://3dassets.dev/assets/bedroom-and-living-room-furniture-sofa-three-seat-6be9b44b), CC0.
- Paris exterior photograph: [Unsplash](https://unsplash.com/), under the Unsplash License. Cached locally for reliability; the image is a background plate, not part of the navigable geometry.
- Other architecture and the surface texture maps were created for this site.

This is a free hosted real-time architectural scene, not yet a perfect photogrammetric recreation of the source photo.
