# A Walk Through Paris — city-scale interactive portfolio

This branch implements a **navigable 3D map of Paris** as the foundation of Paul-Antoine Joly's personal portfolio, inspired by the *interaction design approach* of Jesse Zhou's 3D Ramen Shop (without copying models, textures, or code).

## Features

- Explore a geographically grounded, streamed map of **all of Paris**, rather than a single static 3D scene.
- Tilt, rotate, pan and zoom around OpenStreetMap-based buildings and Paris streets.
- Eight story pins across well-known Paris landmarks, each opening a curated portfolio exhibit.
- Click **Enter Paris** for a close camera perspective near the Seine.
- Use **WASD** to move the camera, arrow keys to turn; **E** opens a nearby exhibit.
- Choose a destination to fly between locations, or use **City Overview** for the whole city.
- Mobile-friendly touch movement, touch-based maps, project list and keyboard escape handling.
- 3D roofs and trees loaded as an optional enhancement where available from the Maptoolkit scene plugin.

## Run locally

This is a plain static Vercel project. With files checked out, run:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Framework preset: **Other**; no build command.

## Deploying to paulantoinejoly.com

GitHub's `main` branch is connected to Vercel; recent commits have been successfully deployed. This feature remains on its own branch until reviewed and merged into `main`. Assuming the Vercel project's **Production Branch** stays set to `main` and the custom domain is attached to the same project, merging to `main` triggers automatic production deployment. Other branches can receive preview deployments.

## Technology and data

- MapLibre GL JS 6, loaded from unpkg.
- Maptoolkit Community tiles: `https://styles.maptoolkit.org/street-3d.json`, based on OpenStreetMap. **Visible map and copyright attribution must be retained.**
- Optional `@maptoolkit/maplibre-scene3d-control` for roof models and trees. The built-in extrusion map remains usable if the enhancement is unavailable.
- No map API key is required with this community style for eligible personal sites; follow current [community terms](https://www.maptoolkit.org/).
- No copies of proprietary Paris 3D meshes, imagery or of Jesse Zhou's ramen shop artwork are included.

## What this is *not* (yet)

The city-scale map currently has GIS-grade OSM geometry, not a handcrafted, photo-realistic recreation of every Paris building. It is also a pitched navigable map camera, not full first-person collision-aware street navigation. To achieve Jesse's **fully bespoke immersive quality**, the next stage is building a highly detailed **Seine/Île de la Cité experience** in Blender/Three.js and blending it into the streamed city environment; true citywide photorealism would likely require commercial licensed photogrammetry or 3D map tiles, substantial bandwidth and rendering budgets.

The eight map pin placements are thematic exhibits, **not representations of physical employer office locations**.

## Main files

- `index.html` — page markup and project exhibits
- `city.css` — interface, typography, map styling and mobile layout
- `city.js` — MapLibre controls, 3D camera, map pins and exhibits
- `main.js` and `styles.css` — retained from the original prototype for reference; unused by the new landing page

© 2026 Paul-Antoine Joly.