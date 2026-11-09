# Paris, After Dark — Paul-Antoine Joly

An interactive personal portfolio built around an atmospheric **nighttime cycling journey through Paris**. Inspired by the *interactive-environment concept* of Jesse Zhou's 3D Ramen Shop, while using original UI, original portfolio content, and real geographic map data (no copied assets).

## Ride controls

| Input | Action |
| --- | --- |
| **W / Up** | Pedal and accelerate |
| **S / Down** | Brake; hold to reverse slowly |
| **A / Left** | Steer left |
| **D / Right** | Steer right |
| **Shift** | Sprint while pedaling |
| **E** | Open a nearby glowing portfolio exhibit |
| **B** | Ring the bicycle bell when ambience is on |
| **M** | See the aerial city overview |
| **Mouse drag** | Look to the sides temporarily |
| **Touch arrows** | Ride on mobile |

- Speed rises and falls gradually; the handlebar overlay leans when steering.
- A low free-camera mode positions the viewpoint close to bicycle height. Camera position follows simulated bicycle coordinates.
- Aerial view lets visitors navigate by zooming, panning or selecting exhibits. Choose **Ride Mode** to return to the bicycle.
- The map covers central and surrounding Paris within configured bounds. This is free-roam **camera navigation**, not yet collision-aware, road-snapped bike physics.
- The map includes eight portfolio exhibits based on real Paris geographic points. Pins are themed project placements, **not** employer office locations.
- The speedometer and distance tracker are simulation values, not actual measurements of a route or cycling activity.
- Ambient wind is synthesized in-browser and off by default. Bell is synthesized with audio oscillators and requires enabled ambience.

## Visual design

- Deep indigo night sky, warm amber light blooms and glowing geographic markers.
- Night color treatment applied to the Street 3D vector map, with dark water, roads, parks and building volumes.
- MapLibre sky/fog treatment, evening lighting, and a skyline viewed from a low camera angle.
- Simulated streetlights placed artistically around the Seine (not an accurate streetlight inventory).
- Illustrated bicycle cockpit, headlight beam and optional atmospheric audio.
- Responsive typography, cinematic welcome, touch controls, and accessible portfolio drawers.

## Technical stack

- Static HTML/CSS and vanilla JS with MapLibre GL JS 6, hosted on Vercel.
- Maptoolkit Community Street 3D style based on OpenStreetMap with optional Scene3D roof/tree enhancement.
- Maptoolkit 3D and style attribution is retained. See https://docs.maptoolkit.org.
- No application secret is required. Scene loading depends on network availability and browser WebGL support.
- `index.html`: semantic UI structure.
- `city.js`: map initialization, cycling simulation, 3D camera, story interactions and audio.
- `city.css`: base responsive interface.
- `night.css`: atmospheric presentation, night overlays and cockpit illustration.
- `vercel.json`: existing Vercel config.

For local development run `python3 -m http.server 8000` from this repository and open http://localhost:8000. For Vercel use **Framework Preset: Other**, no build command, output directory `./`.

## Deployment and auto-updates

The existing Vercel project automatically publishes deployments of the repository's production branch (**main**) and generates previews for pull request branches. The project already has successful Vercel GitHub statuses. **This branch is for preview only** until verified and merged; pushing to it should update its preview, not the live paulantoinejoly.com domain.

## Reality check: visual fidelity

This is a polished, playable **3D city-map prototype**, **not hyper-photorealistic Paris**. It lacks photogrammetric building textures, high-quality night window emissives, people/vehicles, detailed street furniture, collision, terrain-safe bike physics and dedicated route mesh. The bike is represented via a first-person cockpit overlay rather than a fully rigged third-person model.

For Jesse-Zhou-level detailed interaction *across the entire city*, the next phase needs a high-quality custom Three.js/Blender district around the Seine, with carefully licensed glTF assets and real-time lighting, optionally transitioning into the geographic map for citywide exploration. Google photorealistic 3D Tiles, when considered, need separate API keys, commercial licensing and usage-cost planning.

© 2026 Paul-Antoine Joly.
