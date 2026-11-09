# Paris After Dark — a playable 3D cycling portfolio

**This is a real Three.js world, not a pitched map or a slideshow.** Visitors ride a virtual bicycle beside the Seine at night and discover Paul-Antoine Joly's portfolio at illuminated art stands.

The site keeps its existing Vercel static hosting and its GitHub-based deployment pipeline.

## Controls

- **W / Up** — pedal and accelerate.
- **S / Down** — brake or slowly reverse.
- **A / D / left / right arrows** — steer.
- **Shift** — sprint while pedaling.
- **E** — open a nearby exhibit.
- **G** — open the project gallery.
- **Drag the scene with a mouse** — look around.
- **Mobile** — directional touch buttons.
- **Sound button** — toggle optional synthesized wind ambience.

## What is actually in the 3D scene

The environment is authored with Three.js mesh geometry, materials and animated shaders rather than a MapLibre map. It includes:

- a rideable 700-metre *Paris-inspired* waterfront corridor at night,
- masonry quays, wet cobblestones, street and road geometry,
- Haussmann-inspired 3D building volumes, mansard roofs, dormer windows, balconies, lit shopfronts and façade textures,
- animated Seine water shader with nocturnal reflections,
- wrought-iron lamps and glowing light sprites,
- trees, car headlights, moving vehicles and light mist,
- a distant Eiffel Tower silhouette, an arched bridge and twilight/night sky,
- a 3D bike handlebar cockpit attached to the first-person camera,
- eight bookstall-style interactive project exhibits.

The bike uses simple acceleration / friction / steering simulation, with a speedometer and distance counter. This is **not** collision-aware cycling; the current ride is constrained to a waterfront play area.

## Technical stack

- Three.js 0.180, native ES modules, JavaScript, CSS.
- Three.js EffectComposer + bloom for scene glow on capable desktop devices.
- Canvas-generated textures and 3D meshes with no external paid API, only the Three.js CDN.
- Vercel static website, no build command. Serve locally with `python3 -m http.server 8000`.
- `index.html` — page and gallery/exhibit structure.
- `ride.css` — cinematic typography and responsive interface.
- `world.js` — real-time 3D buildings, streets, river, monuments, lighting, stalls and bike cockpit.
- `ride.js` — cycling controls, camera, WebGL renderer, bloom, gallery and optional audio.
- Previous `main.js` and `styles.css` remain from the original prototype but are not loaded.

## Visual quality / limitations

This is a **genuine explorable 3D prototype**, but not hyper-photorealistic or geographically accurate Paris. Realistically portraying *all* of Paris requires a different production pipeline: licensed photogrammetry or 3D Tiles, detailed Paris landmarks and street-level assets, collision data, aggressive streaming, custom night shaders, artist-reviewed materials, and performance optimization. None of that can be honestly claimed from procedural meshes alone.

To reach the high-detail interactive quality of Jesse Zhou's Ramen Shop, build one exceptionally detailed neighborhood with licensed textured 3D assets and PBR materials, then use streamed world tiles to extend the environment. The current version is intended as an engine and interaction foundation for that work.

## Production auto-update

Vercel already deploys the connected GitHub repository. The custom domain **paulantoinejoly.com** should update automatically when changes are merged or pushed to the configured production branch (`main`) after review. This new version is on a feature branch and will **not** overwrite production until merged.

© 2026 Paul-Antoine Joly.