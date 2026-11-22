#!/usr/bin/env python3
"""Generate a relative depth map from the user's already-present reference photo.

Depth Anything V2 Small checkpoint and code are Apache-2.0. Inference runs once
on a free GitHub Actions CPU runner; the Vercel site then serves a static PNG.
This produces one-view 2.5D, not fabricated unseen room geometry.
"""
from pathlib import Path
import numpy as np
import torch
from PIL import Image,ImageFilter
from transformers import AutoImageProcessor,AutoModelForDepthEstimation

root=Path(__file__).resolve().parents[1]
src=root/'public/assets/photo-apartment-reference.jpg'
dst=root/'public/assets/photo-apartment-depth.png'
model_id='depth-anything/Depth-Anything-V2-Small-hf'
photo=Image.open(src).convert('RGB')
print('Original image:',photo.size,flush=True)
print('Downloading/initializing Apache-2.0 model',model_id,flush=True)
processor=AutoImageProcessor.from_pretrained(model_id)
model=AutoModelForDepthEstimation.from_pretrained(model_id).eval()
torch.set_num_threads(3)
with torch.inference_mode():
    tensors=processor(images=photo,return_tensors='pt')
    raw=model(**tensors).predicted_depth
    raw=torch.nn.functional.interpolate(
      raw.unsqueeze(1),size=(photo.height,photo.width),
      mode='bicubic',align_corners=False).squeeze().float().cpu().numpy()
p1,p99=np.percentile(raw,[1,99])
normalized=np.clip((raw-p1)/max(1e-6,p99-p1),0,1)
print('Relative inverse-depth raw range',float(raw.min()),float(raw.max()),'pct',p1,p99,flush=True)
img=Image.fromarray((normalized*255).astype('uint8'),'L')
img=img.filter(ImageFilter.GaussianBlur(.8))
img.save(dst,optimize=True)
print('Wrote',dst,dst.stat().st_size,'bytes',flush=True)
