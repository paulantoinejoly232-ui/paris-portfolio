# Photographic depth walkthrough

This branch replaces CSS panning of a photograph with an actual per-pixel **depth-projected 3D surface**.

- Model: [Depth Anything V2 Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf), Apache 2.0.
- Inference: `scripts/build-photo-depth.py` runs once in GitHub Actions on CPU, saving a PNG; there is **no inference or GPU bill at runtime**.
- Rendering: React Three Fiber triangulates ~65,000 samples and maps the actual source-photo pixels onto the surface. Keyboard movement changes the viewpoint, rather than moving a rectangular image.
- Visitors can move with WASD inside a deliberately limited range and activate portfolio objects with E or click.
- The site still offers the original browser 3D apartment as an alternative.

**Physical limitation:** A single source photograph does not contain the apartment behind the camera or behind foreground objects. This 2.5D reconstruction offers *real geometric parallax near the original viewpoint*, **not** a fully walkable 360-degree recreation. For full movement at photographic quality, replace the photo depth surface with a coherent multi-view Gaussian splat (`.spz`) from a permitted source. Do not misrepresent this as a complete scan.

**Image rights:** The reference image appears to come from Major Keys; attribution is not a substitute for permission. Obtain reuse rights before using it permanently on a public portfolio.
