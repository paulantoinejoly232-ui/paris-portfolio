# A Walk Through Paris — Paul-Antoine Joly

A cinematic 3D portfolio: take a sunset stroll along the Seine and approach eight green art stands to discover personal projects, work, and interests.

## Run

This is a **static website**, no build command or account required.

- From the project folder run `python3 -m http.server 8000` and open `http://localhost:8000`.
- Or install the Vercel CLI and run `vercel` in the project folder.
- Or push the contents to a GitHub repo and import it in Vercel. Framework Preset: **Other**; Build Command: **none**; Output Directory: **./**.
- In Vercel project settings > Domains, connect your own domain (e.g. `paulantoinejoly.com`) and follow the DNS instructions.

The runtime imports Three.js from jsDelivr CDN, and therefore needs a network connection. A fallback graphic is provided while the 3D scene loads.

## Controls

- **Start:** BEGIN THE WALK
- **Move:** W A S D or W / S / arrow-up / arrow-down
- **Look:** mouse (click to lock cursor) or drag on canvas; left/right arrows to turn
- **Sprint:** Shift + W
- **Interact:** E when near a green Seine art stand
- **Gallery:** menu button or G
- **Exit interaction / release:** Escape
- **Mobile:** touch direction buttons and VIEW ART when close to a stand

## Customize

- Edit the `exhibits` array near the top of `main.js` for accurate professional projects and bios.
- `styles.css` controls HTML user interface and fonts.
- `main.js` controls environmental lighting, architecture, river, and work stands. You can replace procedural objects with real licensed photogrammetry/glTF assets using Three.js `GLTFLoader`.

## Visual honesty / limitations

This is a **playable atmospheric 3D concept** with procedural Paris-inspired façades, Louvre-style stone texture, quayside boxes, a bridge, sunset lighting, water shaders and a simplified Eiffel Tower silhouette. It is not a photogrammetric or geographically accurate reconstruction of a particular stretch of the Seine. For *true* high-end photorealism, use detailed licensed textured 3D buildings, scanned quay assets, HDR environment maps, volumetrics, postprocessing, and rigorous device performance testing. Those assets are not included here.

The artwork and portfolio details are illustrative/curated and should be reviewed before public deployment. No private contact information is included.

## Files

- `index.html` — markup + accessibility shell
- `styles.css` — editorial overlay and responsive navigation
- `main.js` — 3D scene, movement, interactions, exhibits

© 2026 personal website prototype. Three.js is loaded from the official jsDelivr distribution under its own license.
