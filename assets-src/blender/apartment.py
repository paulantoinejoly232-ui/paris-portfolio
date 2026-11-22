"""Original Paris apartment asset generator.
Free toolchain: Blender -> textured PBR GLB -> Vite + React Three Fiber.
Run: blender --background --python assets-src/blender/apartment.py
This exports public/models/apartment.glb with distinct tiled material maps.
The earlier 2K shared Cycles lightmap corrupted all visible surfaces and is
intentionally NOT applied to the 3D model. This edition prioritizes correct
physical materials and normal realtime lighting over noisy light baking.
No other creator's source or models are copied.
"""
import bpy, math, os, sys, random
from mathutils import Vector
from math import pi, sin, cos
random.seed(27)
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
OUT=os.path.join(ROOT,'public','models')
os.makedirs(OUT,exist_ok=True)
BAKE=False  # Do not apply low-resolution global bake to material base colours
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for data in bpy.data.materials: bpy.data.materials.remove(data)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24 if BAKE else 16
scene.render.resolution_x=1200
scene.render.resolution_y=800
scene.render.resolution_percentage=100
scene.world.color=(.58,.48,.38)
scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX' if 'AgX' in [x.identifier for x in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items] else 'Standard'
# Helpers
opaque=[]
transparent=[]
def material(name,color,roughness=.8,metal=0,fabric=False):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 nt=m.node_tree;bs=nt.nodes.get('Principled BSDF')
 bs.inputs['Base Color'].default_value=(*color,1)
 bs.inputs['Roughness'].default_value=roughness
 bs.inputs['Metallic'].default_value=metal
 if fabric:
  noise=nt.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=330
  bump=nt.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.17;bump.inputs['Distance'].default_value=.006
  nt.links.new(noise.outputs['Fac'],bump.inputs['Height']);nt.links.new(bump.outputs['Normal'],bs.inputs['Normal'])
 return m
PLASTER=material('warm plaster',(.89,.83,.76),.86,0,False)
TRIM=material('painted Parisian cornice',(.95,.87,.77),.73)
FLOOR=material('oak herringbone',(.66,.44,.28),.40,0,False)
FABRIC=material('textured chenille sofa',(.57,.52,.47),.94,0,False)
CUSHION=material('linen cushions',(.64,.54,.46),.91,0,True)
RUG=material('wool rug',(.46,.40,.35),.98,0,True)
DARKWOOD=material('dark walnut',(.24,.16,.11),.43,0,False)
MARBLE=material('ivory marble',(.89,.86,.81),.23,0,False)
BLACK=material('blackened steel',(.045,.037,.031),.28,.5)
BRASS=material('brushed brass',(.63,.39,.14),.19,.76)
OLIVE=material('olive leaves',(.23,.31,.17),.90)
FLOWER=material('hydrangea petals',(.86,.78,.65),.87)
GLASS=material('window glass',(.65,.76,.81),.09)
GLASS.blend_method='BLEND'
GLASS.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.10
if 'Transmission Weight' in GLASS.node_tree.nodes.get('Principled BSDF').inputs:
 GLASS.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=.80

# Physically based material maps. UVs belong to each mesh, not an indiscriminate
# joined atlas. Embedded GLB PNG images preserve stable colours and textures.
def apply_texture(mat,name,size=768):
 import numpy as np
 y,x=np.indices((size,size),dtype=np.float32)
 rng=np.random.default_rng({'oak':11,'walnut':21,'marble':31,'linen':41,'rug':51,'plaster':61}[name])
 noise=rng.normal(0,1,(size,size)).astype(np.float32)
 f=noise*.012
 if name=='oak':
  a=(x+y)*.70710678;b=(y-x)*.70710678
  flip=(np.floor(a/124)+np.floor(b/124))%2
  u=np.where(flip>0,b,a);v=np.where(flip>0,a,b)
  board=np.floor(v/94)
  grain=np.sin(u*.12+np.sin(v*.065)*1.2)*.018 + np.sin(u*.58)*.007
  shade=(np.sin(board*29.42)*.5+np.sin(board*11.9)*.5)*.045
  seam=np.minimum(np.mod(v,94),94-np.mod(v,94))<1.5
  seam|=np.minimum(np.mod(u,260),260-np.mod(u,260))<1.8
  base=np.array([.68,.48,.32],dtype=np.float32)
  val=grain+shade+f
 elif name=='walnut':
  grain=np.sin(x*.08+np.sin(y*.024)*1.4)*.024+np.sin(x*.37+np.sin(y*.11)*.9)*.009
  base=np.array([.25,.17,.115],dtype=np.float32)
  val=grain+f*.38
  seam=np.zeros((size,size),dtype=bool)
 elif name=='marble':
  vein=np.sin(x*.019+y*.008+np.sin(y*.022)*2.1+np.sin(x*.007)*1.8)
  vein+=np.sin(x*.084+y*.12)*.19
  fine=np.power(np.maximum(0,vein-.80),8)*.22
  base=np.array([.89,.85,.78],dtype=np.float32)
  val=-fine+f*.28
  seam=np.zeros((size,size),dtype=bool)
 elif name=='linen':
  weave=(np.sin(x*1.1)*np.cos(y*1.27))*.019
  base=np.array([.65,.58,.52],dtype=np.float32)
  val=weave+f*.7
  seam=np.zeros((size,size),dtype=bool)
 elif name=='rug':
  base=np.array([.63,.56,.49],dtype=np.float32)
  val=f*2.3
  seam=np.zeros((size,size),dtype=bool)
 else:
  base=np.array([.89,.83,.77],dtype=np.float32)
  val=f*.19
  seam=np.zeros((size,size),dtype=bool)
 rgb=np.clip(base[None,None,:]+val[:,:,None],0,1)
 if name=='oak':rgb[seam]=np.array([.28,.20,.15])
 rgba=np.concatenate([rgb,np.ones((size,size,1),dtype=np.float32)],axis=2)
 image=bpy.data.images.new('Archviz '+name,width=size,height=size,alpha=True,float_buffer=False)
 image.pixels.foreach_set(rgba.ravel())
 image.filepath_raw=os.path.join(OUT,'texture-'+name+'.png')
 image.file_format='PNG';image.save()
 tex=mat.node_tree.nodes.new('ShaderNodeTexImage')
 tex.image=image;tex.interpolation='Linear'
 mat.node_tree.links.new(tex.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 return image

for mat,name,size in [
 (FLOOR,'oak',2048),(DARKWOOD,'walnut',1024),
 (MARBLE,'marble',1024),(FABRIC,'linen',768),
 (CUSHION,'linen',768),(RUG,'rug',768),(PLASTER,'plaster',768)
]:
 apply_texture(mat,name,size)

def own(obj,mat,trans=False):
 obj.data.materials.append(mat)
 (transparent if trans else opaque).append(obj)
 return obj
def bevel(obj,r):
 if r<=0:return
 mod=obj.modifiers.new('soft machined edges','BEVEL');mod.width=r;mod.segments=3
 if hasattr(mod,'affect'): mod.affect='EDGES'
 bpy.context.view_layer.objects.active=obj
 try:bpy.ops.object.modifier_apply(modifier=mod.name)
 except Exception:pass
 # weighted normals keep edges clean
def cube(name,loc,scale,mat,r=.0,trans=False):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name
 o.dimensions=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 bevel(o,min(r,min(scale)*.3))
 return own(o,mat,trans)
def ball(name,loc,r,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=18,ring_count=12,radius=r,location=loc)
 o=bpy.context.object;o.name=name
 bpy.ops.object.shade_smooth();return own(o,mat)
def column(name,loc,radius,depth,mat,vertices=20):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
 o=bpy.context.object;o.name=name
 bevel(o,min(.008,radius*.2))
 return own(o,mat)
def rod(name,a,b,r,mat):
 a,b=Vector(a),Vector(b);d=b-a
 o=column(name,(a+b)*.5,r,d.length,mat,12)
 o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
 return o
def panel(name,x,y,z,w,h,d,mat,r=0):
 return cube(name,(x,y,z),(w,h,d),mat,r)
def light(name,typ,loc,color,power,size=None):
 datab=bpy.data.lights.new(name,typ);datab.energy=power;datab.color=color
 if size and typ=='AREA':datab.shape='DISK';datab.size=size
 obj=bpy.data.objects.new(name,datab);scene.collection.objects.link(obj);obj.location=loc
 if typ=='AREA':obj.rotation_euler=(Vector((0,1,-3))-obj.location).to_track_quat('-Z','Y').to_euler()
 return obj

# Apartment architecture: metres, Y is horizontal depth in Blender, Z vertical.
# Three.js frontend uses Y vertical, negative Z towards the Paris window.
def P(x,height,z):return (x,-z,height)
cube('Solid herringbone oak floor',P(0,-.15,0),(14,14,.25),FLOOR)
cube('Warm plaster ceiling',P(0,4.47,0),(14,14,.24),TRIM)
cube('Left apartment wall',P(-6.98,2.2,0),(.2,14,4.4),PLASTER)
cube('Right apartment wall',P(6.98,2.2,0),(.2,14,4.4),PLASTER)
cube('Entrance wall',P(0,2.2,7.03),(14,.2,4.4),PLASTER)
cube('Kitchen-side window wall',P(4.7,2.2,-6.95),(4.6,.2,4.4),PLASTER)
cube('Window lower sill',P(-2.46,.30,-6.95),(9.15,.20,.60),PLASTER)
cube('Window upper transom',P(-2.46,4.06,-6.95),(9.15,.20,.68),PLASTER)
cube('Right lower window band',P(6.91,.30,-4.3),(.2,5,.6),PLASTER)
cube('Right upper window band',P(6.91,4.07,-4.3),(.2,5,.66),PLASTER)

for y in (4.13,4.23,4.35):
 for z in (-6.76,6.76):
  cube('Haussmann cornice front',P(0,y,z),(13.9,.14,.065),TRIM,.018)
 for x in (-6.76,6.76):
  cube('Haussmann cornice side',P(x,y,0),(.14,13.9,.065),TRIM,.018)
for z in (-6.78,6.78):
 cube('Full-length baseboard',P(0,.12,z),(13.9,.13,.22),TRIM,.013)
for x in (-6.78,6.78):
 cube('Side baseboard',P(x,.12,0),(.13,13.9,.22),TRIM,.013)
cube('Ceiling beam',P(1.42,4.32,0),(.2,14,.16),TRIM)
cube('Cross beam',P(0,4.32,-2.5),(14,.2,.16),TRIM)
for i in range(6):
 x=-6.95+i*1.79
 cube('French door stile',P(x,2.20,-6.87),(.075,.16,3.42),TRIM,.009)
 if i<5:
  cube('French door glazing',P(x+.895,2.19,-6.94),(1.73,.008,3.32),GLASS,trans=True)
  cube('Window midrail',P(x+.895,2.11,-6.84),(1.70,.09,.045),TRIM,.007)
  cube('Window upper rail',P(x+.895,3.39,-6.84),(1.70,.09,.045),TRIM,.007)
  cube('Door handles brushed brass',P(x+.9,1.48,-6.79),(.035,.07,.21),BRASS,.008)
for i in range(4):
 z=-6.8+i*1.53
 cube('Kitchen side window stile',P(6.86,2.20,z),(.16,.08,3.42),TRIM)
 if i<3:cube('Kitchen side window glazing',P(6.96,2.21,z+.76),(.008,1.44,3.3),GLASS,trans=True)
# Ornamental balcony balustrades.
for i in range(52):
 x=-6.9+i*.175
 rod('wrought iron vertical',P(x,.12,-7.56),P(x,.95,-7.56),.011,BLACK)
 if i%4==0:
  ball('iron rosette',P(x,.8,-7.56),.032,BRASS)
for yy in (.15,.96):
 rod('balcony continuous rail',P(-6.9,yy,-7.56),P(2.25,yy,-7.56),.038,BLACK)
# Creased linen curtains
for j,x in enumerate((-6.7,.15)):
 for i in range(10):
  xx=x+i*.045
  o=cube('curtain pleat',P(xx,2.3,-6.61+i*.02),(.04,.14,3.4),CUSHION,.014)
# Seating area
cube('large textured wool rug',P(-3.45,.018,.83),(6,4.08,.05),RUG,.015)
def sofa(x,y,angle=0):
 pieces=[]
 pieces.append(cube('sofa seat',P(x,.52,y),(2.54,1.10,.49),FABRIC,.16))
 pieces.append(cube('sofa back',P(x,.91,y+.45),(2.52,.29,.85),FABRIC,.1))
 for dx in (-1.12,1.12):pieces.append(cube('sofa arm',P(x+dx,.70,y),(.29,1.12,.55),FABRIC,.095))
 for dx in (-.7,0,.7):
  pieces.append(cube('seat cushion',P(x+dx,.85,y-.08),(.65,.83,.15),CUSHION,.06))
  pieces.append(cube('back cushion',P(x+dx,1.14,y+.34),(.53,.17,.44),FABRIC,.04))
 for p in pieces:
  p.rotation_euler.z=angle
sofa(-5.5,2.18,.1)
def chair(x,y,a=0):
 pieces=[]
 pieces.append(cube('armchair seat',P(x,.57,y),(1.11,1.02,.38),FABRIC,.135))
 pieces.append(cube('armchair back',P(x,.94,y+.38),(1.12,.24,.76),FABRIC,.087))
 for dx in (-.47,.47):pieces.append(cube('armchair arm',P(x+dx,.74,y),(.24,.95,.46),FABRIC,.08))
 pieces.append(cube('armchair linen cushion',P(x,.90,y+.27),(.45,.14,.4),CUSHION,.045))
 for p in pieces:p.rotation_euler.z=a
chair(-3.35,-1.07,.2)
chair(-1.78,-1.07,-.2)
# Tables and books
column('round coffee pedestal',P(-3.45,.22,1.41),.18,.43,DARKWOOD)
column('round coffee surface',P(-3.45,.46,1.41),.68,.06,MARBLE,56)
cube('rectangular coffee base',P(-3.10,.28,-.05),(1.43,.87,.51),DARKWOOD,.02)
cube('rectangular marble top',P(-3.10,.53,-.05),(1.54,.98,.08),MARBLE,.015)
for j in range(3):cube('stacked coffee table book',P(-3.05,.59+j*.037,-.2),(.52,.35,.034),[TRIM,DARKWOOD,CUSHION][j],.006)
column('flower vase',P(-2.99,.72,-.33),.105,.31,GLASS,20)
for i in range(16):
 a=i*2.41
 xx=-2.99+sin(a)*.2;yy=-.33+cos(a)*.2;zz=1.05+(i%5)*.06
 rod('flower stem',P(-2.99,.76,-.33),P(xx,zz,yy),.005,OLIVE)
 ball('white blossom',P(xx,zz,yy),.048,FLOWER)
# Kitchen wall, oven, cabinetry and large marble island
cube('dark walnut tower',P(5.75,2.10,-5.46),(2.23,1.03,4.13),DARKWOOD,.014)
for h in (1.77,2.87):
 cube('built-in oven bezel',P(5.75,h,-4.94),(.83,.046,.80),BLACK,.012)
 cube('brushed oven pull',P(5.75,h-.3,-4.90),(.53,.055,.029),BRASS,.005)
cube('back counter cupboard',P(5.05,.88,-1.3),(3.84,.71,1.75),DARKWOOD,.01)
cube('back marble worktop',P(5.05,1.79,-1.3),(3.94,.74,.09),MARBLE,.012)
cube('wall unit cupboards',P(5.05,3.26,-1.3),(3.94,.64,1.62),DARKWOOD,.012)
cube('island joinery',P(3.63,.52,1.13),(3.58,1.48,1.05),DARKWOOD,.035)
cube('large marble island',P(3.63,1.09,1.13),(3.70,1.60,.10),MARBLE,.016)
cube('black undermount sink',P(4.46,1.15,.95),(.75,.54,.012),BLACK,.007)
rod('brass tap rise',P(4.65,1.13,.95),P(4.65,1.76,.95),.024,BRASS)
rod('brass tap spout',P(4.65,1.76,.95),P(4.39,1.76,.95),.024,BRASS)
rod('brass tap down',P(4.39,1.76,.95),P(4.39,1.56,.95),.024,BRASS)
def stool(x,y):
 column('bar stool cushion',P(x,.79,y),.24,.10,BLACK)
 cube('bar stool back',P(x,1.03,y+.12),(.49,.08,.38),FABRIC,.05)
 for xx in (-.17,.17):
  for yy in (-.16,.16):cube('thin brass stool leg',P(x+xx,.35,y+yy),(.034,.034,.69),BLACK,.009)
stool(2.86,2.30);stool(4.13,2.30)
column('dining table pedestal',P(1.24,.38,-3.63),.22,.75,DARKWOOD)
column('round dining table top',P(1.24,.77,-3.63),1.05,.065,DARKWOOD,56)
def dining(x,y,a=0):
 pieces=[cube('dining chair seat',P(x,.53,y),(.56,.62,.12),FABRIC,.06),
 cube('dining chair back',P(x,.99,y+.25),(.56,.14,.82),FABRIC,.07)]
 for xx in (-.2,.2):
  for yy in (-.2,.2):
   pieces.append(cube('dining chair tapered legs',P(x+xx,.25,y+yy),(.035,.034,.47),BLACK))
 for p in pieces:p.rotation_euler.z=a
dining(.06,-3.60,-1.1);dining(2.47,-3.60,1.1);dining(1.28,-4.78)
# Ceiling pendant cluster
for i in range(3):
 x=2.55+i*.45;h=3.34-i*.46
 rod('pendant brass cable',P(x,4.36,.36),P(x,h+.19,.36),.009,BRASS)
 ball('warm alabaster lamp sphere',P(x,h,.36),.21-i*.024,FLOWER)
# Plants, travel journal near the door
for px,py in ((-6.35,-6.1),(.38,-6.15)):
 column('flower pot',P(px,.27,py),.26,.51,MARBLE)
 rod('plant trunk',P(px,.50,py),P(px,1.37,py),.034,DARKWOOD)
 for i in range(21):
  theta=i*2.4
  xx=px+cos(theta)*(.17+.06*(i%5));yy=py+sin(theta)*(.17+.07*(i%4))
  zz=1.13+(i%6)*.10
  rod('plant twig',P(px,.62,py),P(xx,zz,yy),.011,DARKWOOD)
  ball('olive foliage',P(xx,zz,yy),.08+(i%4)*.014,OLIVE)
cube('personal travel case',P(-6.5,.39,4.7),(.46,.31,.73),DARKWOOD,.048)
cube('brass suitcase latch',P(-6.5,.72,4.7),(.32,.08,.035),BRASS,.009)


# Joinery details: every cupboard gets a deliberate inset and a gold accent.
for x in (3.65,4.55,5.45,6.35):
 cube('walnut cabinetry join',P(x,3.25,-.93),(.013,.015,1.54),BLACK,.003)
 cube('under counter cabinet reveal',P(x,.82,-.93),(.012,.017,1.51),BLACK,.002)
 cube('island front reveal',P(x,.58,1.88),(.013,.012,.78),BLACK,.002)
for x in (4.05,4.90,5.75,6.60):
 cube('fine brass cabinet pull',P(x,3.18,-.962),(.21,.024,.025),BRASS,.007)
# Dining place settings, dishware and objects create scale cues.
for x,y in ((.30,-3.60),(2.22,-3.60),(1.2,-4.31)):
 column('ceramic plate at dining table',P(x,.83,y),.20,.013,MARBLE,32)
 column('porcelain cup',P(x+.16,.90,y-.15),.046,.115,TRIM,22)
# Add edge strips to the kitchen island; the empty box looked like cabinetry.
cube('island plinth shadow line',P(3.63,.085,1.17),(3.5,1.33,.055),BLACK,.005)
cube('island plinth inset',P(3.63,.055,1.17),(3.35,1.19,.05),DARKWOOD,.006)
# A folded throw and additional linen upholstery folds.
cube('sofa throw',P(-6.08,.90,2.04),(.55,.76,.035),CUSHION,.02)
# Recessed wall-panels; subtle architectural relief.
for z in (3.2,5.1):
 cube('wall field frame',P(-6.82,2.1,z),(.05,1.36,2.8),TRIM,.014)
 cube('wall field inset',P(-6.78,2.1,z),(.012,1.27,2.61),PLASTER,.002)

# A beautiful warm-bounce lighting rig optimized for a fixed residential time of day.
light('golden-hour sun','SUN',(-16,-33,33),(1,.66,.4),2.5)
light('sun-lit window fill','AREA',(-5,-5,3.0),(1,.71,.48),720,8.0)
light('warm back-wall bounce','AREA',(4,1.4,4.1),(1,.88,.73),430,5.5)
light('soft apartment ambient','AREA',(-2,3.7,3.2),(1,.90,.80),510,7.0)
for x,h in ((2.55,3.34),(3.0,2.88),(3.45,2.42)):
 light('pendant illumination','POINT',P(x,h,.36),(1,.78,.57),42)
camd=bpy.data.cameras.new('delivery camera')
camera=bpy.data.objects.new('delivery camera',camd);scene.collection.objects.link(camera)
camera.location=P(0,1.7,5.1)
target=Vector(P(-1.4,1.7,-2.5))
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camd.lens=24;scene.camera=camera
# Save editable Blender source for future architectural revisions.
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'assets-src','blender','apartment-source.blend'))
# Do not combine all materials into an emissive lightmap: this caused the
# screenshot's splotchy, uniformly brown scene. Keep PBR materials separate.
# The GLB is the artifact loaded by React Three Fiber; no server-side GPU charges.
bpy.ops.object.select_all(action='DESELECT')
for obj in opaque+transparent:
 try:obj.select_set(True)
 except ReferenceError:pass
# Export the original objects with their individual material textures.
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'apartment.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_animations=False)
# Render a quick real Cycles review frame from the same door-facing camera.
# This is used for visual QA and has no impact on browser runtime.
scene.render.engine='CYCLES'
scene.cycles.samples=20
scene.render.resolution_percentage=68
scene.render.image_settings.file_format='JPEG'
scene.render.image_settings.quality=87
scene.render.filepath=os.path.join(OUT,'apartment-review.jpg')
bpy.ops.render.render(write_still=True)
print('PBR asset and review ready:',os.path.join(OUT,'apartment.glb'))
