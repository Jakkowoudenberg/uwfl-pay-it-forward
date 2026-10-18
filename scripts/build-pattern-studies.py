"""Geometric studies after Interior Hardwood Co., Book of Designs (1892).
These are explicitly adapted studies, not exact transcriptions or cutting plans.
The geometry covers each field; the shared outer frame is always 5 cm.
No external libraries or source scans are needed to regenerate the SVGs.
"""
from pathlib import Path
import math,json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'preview/assets/patterns'
OUT.mkdir(exist_ok=True)
S=900
def fmt(v):return f'{v:.3f}'.rstrip('0').rstrip('.')

def rect(x,y,w,h):return [(x,y),(x+w,y),(x+w,y+h),(x,y+h)]
def move(p,x,y):return [(a+x,b+y)for a,b in p]
def rotate(p,deg,ox=450,oy=450):
 t=math.radians(deg);c=math.cos(t);s=math.sin(t)
 return [(ox+(x-ox)*c-(y-oy)*s,oy+(x-ox)*s+(y-oy)*c)for x,y in p]
def clip(poly):
 for axis,bound,sign in [(0,0,1),(0,S,-1),(1,0,1),(1,S,-1)]:
  result=[]
  for a,b in zip(poly,poly[1:]+poly[:1]):
   ia=(a[axis]-bound)*sign>=-1e-8;ib=(b[axis]-bound)*sign>=-1e-8
   if ia:result.append(a)
   if ia!=ib:
    t=(bound-a[axis])/(b[axis]-a[axis]);v=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];v[axis]=bound;result.append(tuple(v))
  poly=result
  if not poly:break
 return poly
def area(p):return abs(sum(x*y2-x2*y for (x,y),(x2,y2)in zip(p,p[1:]+p[:1])))/2

def blocks():
 for j in range(6):
  for i in range(6):
   for k in range(3):yield rect(i*150+(k*50 if (i+j)%2 else 0),j*150+(0 if (i+j)%2 else k*50),50 if (i+j)%2 else 150,150 if (i+j)%2 else 50)

def herringbone():
 w=45;L=4
 for m in range(-10,11):
  for n in range(-25,26):
   x=(m*L-n)*w+450;y=(m*L+n)*w+450
   for p in [rect(x,y,L*w,w),rect(x+L*w,y,w,L*w)]:yield rotate(p,45)

def pinwheel(split=False):
 for j in range(6):
  for i in range(6):
   x=i*150;y=j*150
   for p in [rect(0,0,120,30),rect(120,0,30,120),rect(30,120,120,30),rect(0,30,30,120)]:
    if split:
     a,b,c,d=p
     # Each broad member is split into two equal staves.
     if b[0]-a[0]>c[1]-b[1]:
      yield move(rect(a[0],a[1],b[0]-a[0],15),x,y);yield move(rect(a[0],a[1]+15,b[0]-a[0],15),x,y)
     else:
      yield move(rect(a[0],a[1],15,c[1]-b[1]),x,y);yield move(rect(a[0]+15,a[1],15,c[1]-b[1]),x,y)
    else:yield move(p,x,y)
   yield rect(x+30,y+30,90,90)

def cross_weave():
 for j in range(6):
  for i in range(6):
   x=i*150;y=j*150
   for k in range(2):
    if (i+j)%2:yield rect(x+k*30,y,30,60)
    else:yield rect(x,y+k*30,60,30)
    yield rect(x+60,y+k*30,90,30)
    yield rect(x+k*30,y+60,30,90)
   yield rect(x+60,y+60,90,90)

def weave():
 # Distinct running weave with square keys, from the field structure of no. 742.
 for j in range(-1,8):
  for i in range(-1,8):
   x=i*120;y=j*120
   yield rect(x,y,30,30)
   yield rect(x+30,y,90,30)
   yield rect(x,y+30,30,90)
   for k in range(3):yield rect(x+30,y+30+k*30,90,30)

def hexagons():
 r=90;h=math.sqrt(3)*r/2
 for i in range(-1,9):
  for j in range(-1,9):
   cx=i*1.5*r;cy=(2*j+(i%2))*h
   p=[(cx+r*math.cos(math.radians(k*60)),cy+r*math.sin(math.radians(k*60)))for k in range(6)]
   # Six triangular wood pieces per hexagon, a readable rosette study.
   for k in range(6):yield [(cx,cy),p[k],p[(k+1)%6]]

def framed_cubes():
 # Three rhombi per hexagon: the classic cube field, after Wyrsch no. 71.
 r=100;h=math.sqrt(3)*r/2;ratio=.78
 for i in range(-1,9):
  for j in range(-1,9):
   cx=i*1.5*r;cy=(2*j+(i%2))*h
   outer=[(cx+r*math.cos(k*math.pi/3),cy+r*math.sin(k*math.pi/3)) for k in range(6)]
   inner=[(cx+(x-cx)*ratio,cy+(y-cy)*ratio) for x,y in outer]
   for k in range(6):yield [outer[k],outer[(k+1)%6],inner[(k+1)%6],inner[k]]
   for k in range(0,6,2):yield [(cx,cy),inner[k],inner[(k+1)%6],inner[(k+2)%6]]

def octagons():
 z=225;c=z/(2+math.sqrt(2))
 for i in range(4):
  for j in range(4):
   yield move([(c,0),(z-c,0),(z,c),(z,z-c),(z-c,z),(c,z),(0,z-c),(0,c)],i*z,j*z)
 for i in range(5):
  for j in range(5):yield move([(0,-c),(c,0),(0,c),(-c,0)],i*z,j*z)

def diamonds():
 # Square field modules with diagonal framed diamonds, after no. 700.
 z=180;mid=z/2;inset=25
 for i in range(5):
  for j in range(5):
   x=i*z;y=j*z;outer=[(mid,0),(z,mid),(mid,z),(0,mid)];inner=[(mid,inset),(z-inset,mid),(mid,z-inset),(inset,mid)]
   for k in range(4):yield move([outer[k],outer[(k+1)%4],inner[(k+1)%4],inner[k]],x,y)
   for k in range(4):yield move([(mid,mid),inner[k],inner[(k+1)%4]],x,y)
   for p in [[(0,0),(mid,0),(0,mid)],[(z,0),(z,mid),(mid,0)],[(z,z),(mid,z),(z,mid)],[(0,z),(0,mid),(mid,z)]]:yield move(p,x,y)

def panels():
 z=225;w=25
 for i in range(4):
  for j in range(4):
   x=i*z;y=j*z
   for p in [[(0,0),(z,0),(z-w,w),(w,w)],[(z,0),(z,z),(z-w,z-w),(z-w,w)],[(z,z),(0,z),(w,z-w),(z-w,z-w)],[(0,z),(0,0),(w,w),(w,z-w)]]:yield move(p,x,y)
   for k in range(5):
    if (i+j)%2:yield rect(x+w+k*35,y+w,35,175)
    else:yield rect(x+w,y+w+k*35,175,35)

def double_herringbone():
 # Paired staves alter the joint structure; not a rotated copy of P002.
 w=30;L=4
 for m in range(-12,13):
  for n in range(-30,31):
   x=(m*L-n)*w*2+450;y=(m*L+n)*w*2+450
   for k in range(2):
    yield rotate(rect(x,y+k*w,L*w*2,w),45)
    yield rotate(rect(x+L*w*2+k*w,y,w,L*w*2),45)

def stars():
 z=300
 for i in range(3):
  for j in range(3):
   cx=i*z+150;cy=j*z+150;inner=[];outer=[]
   for k in range(16):
    a=k*math.pi/8;dx=math.cos(a);dy=math.sin(a);r=135 if k%2==0 else 60
    inner.append((cx+dx*r,cy+dy*r));q=150/max(abs(dx),abs(dy));outer.append((cx+dx*q,cy+dy*q))
   for k in range(16):
    n=(k+1)%16
    yield [(cx,cy),inner[k],inner[n]]
    yield [inner[k],outer[k],outer[n],inner[n]]


def grouped_herringbone(count):
 # Same overall scale; the number of parallel pieces changes the joint structure.
 w=22.5;g=w*count;L=6/count
 for m in range(-8,9):
  for n in range(-22,23):
   x=(m*L-n)*g+450;y=(m*L+n)*g+450
   for k in range(count):
    yield rotate(rect(x,y+k*w,L*g,w),45)
    yield rotate(rect(x+L*g+k*w,y,w,L*g),45)

def chevron(cut_angle=45,rail=0):
 # Cut angle is measured between the end cut and the long edge of a stave.
 z=150;pitch=45;slope=math.tan(math.radians(90-cut_angle))
 for i in range(-1,7):
  x=i*z;direction=1 if i%2==0 else -1;phase=0 if i%2==0 else z*slope
  if rail:
   for j in range(-1,7):yield rect(x,j*150,rail,150)
  for j in range(-12,30):
   y=j*pitch+phase;start=y+direction*slope*rail;end=y+direction*slope*z
   yield [(x+rail,start),(x+z,end),(x+z,end+pitch),(x+rail,start+pitch)]

def strip_bond(offset=0,paired=False):
 z=180;h=45
 for j in range(20):
  shift=((j//2 if paired else j)*offset*z)%z
  for i in range(-1,6):yield rect(i*z+shift,j*h,z,h)

def ladder(rails=1):
 z=180;rail=30;gap=z-rails*rail
 for j in range(5):
  for i in range(5):
   x=i*z;y=j*z
   for k in range(rails):yield rect(x,y+k*rail,z,rail)
   for k in range(5):yield rect(x+k*36,y+rails*rail,36,gap)

def two_strip_basket():
 z=180
 for j in range(5):
  for i in range(5):
   for k in range(2):yield rect(i*z+(k*z/2 if (i+j)%2 else 0),j*z+(0 if (i+j)%2 else k*z/2),z/2 if (i+j)%2 else z,z if (i+j)%2 else z/2)

def single_weave():
 z=150;w=30
 for j in range(-2,9):
  for i in range(-2,9):
   cx=i*z;cy=j*z
   if (i+j)%2==0:yield rect(cx-z+w/2,cy-w/2,2*z-w,w)
   else:yield rect(cx-w/2,cy-z+w/2,w,2*z-w)
   yield rect(cx+w/2,cy+w/2,z-w,z-w)

def plain_cubes():
 r=100;h=math.sqrt(3)*r/2
 for i in range(-1,9):
  for j in range(-1,9):
   cx=i*1.5*r;cy=(2*j+(i%2))*h
   p=[(cx+r*math.cos(k*math.pi/3),cy+r*math.sin(k*math.pi/3)) for k in range(6)]
   for k in range(0,6,2):yield [(cx,cy),p[k],p[(k+1)%6],p[(k+2)%6]]

def rhombus_field():
 a=90;b=a/math.sqrt(3)
 for i in range(-12,13):
  for j in range(-12,13):
   x=(i-j)*a+450;y=(i+j)*b+450
   yield [(x,y),(x+a,y+b),(x,y+2*b),(x-a,y+b)]

def plain_hexagons():
 r=90;h=math.sqrt(3)*r/2
 for i in range(-1,9):
  for j in range(-1,9):
   cx=i*1.5*r;cy=(2*j+(i%2))*h
   yield [(cx+r*math.cos(k*math.pi/3),cy+r*math.sin(k*math.pi/3)) for k in range(6)]

def square_field():
 for j in range(6):
  for i in range(6):yield rect(i*150,j*150,150,150)

def plain_diamond_panels():
 z=180;m=z/2;inset=25
 for j in range(5):
  for i in range(5):
   outer=[(m,0),(z,m),(m,z),(0,m)];inner=[(m,inset),(z-inset,m),(m,z-inset),(inset,m)]
   for k in range(4):yield move([outer[k],outer[(k+1)%4],inner[(k+1)%4],inner[k]],i*z,j*z)
   yield move(inner,i*z,j*z)
   for p in [[(0,0),(m,0),(0,m)],[(z,0),(z,m),(m,0)],[(z,z),(m,z),(z,m)],[(0,z),(0,m),(m,z)]]:yield move(p,i*z,j*z)

def four_point_stars():
 z=225
 for j in range(4):
  for i in range(4):
   cx=i*z+z/2;cy=j*z+z/2;inner=[];outer=[]
   for k in range(8):
    a=k*math.pi/4;dx=math.cos(a);dy=math.sin(a);r=100 if k%2==0 else 40
    inner.append((cx+dx*r,cy+dy*r));q=z/2/max(abs(dx),abs(dy));outer.append((cx+dx*q,cy+dy*q))
   for k in range(8):
    n=(k+1)%8
    yield [(cx,cy),inner[k],inner[n]]
    yield [inner[k],outer[k],outer[n],inner[n]]



def inside_clip(poly,boundary):
 for a,b in zip(boundary,boundary[1:]+boundary[:1]):
  def cross(p):return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])
  result=[]
  for p,q in zip(poly,poly[1:]+poly[:1]):
   cp=cross(p);cq=cross(q);ip=cp>=-1e-8;iq=cq>=-1e-8
   if ip:result.append(p)
   if ip!=iq:
    t=cp/(cp-cq);result.append((p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])))
  poly=result
  if not poly:break
 return poly

def rim_shapes(outer,inner):
 for k in range(len(outer)):yield [outer[k],outer[(k+1)%len(outer)],inner[(k+1)%len(inner)],inner[k]]

def key_weave():
 z=180;w=72
 for j in range(5):
  for i in range(5):
   arms=[rect(0,0,z-w,w),rect(z-w,0,w,z-w),rect(w,z-w,z-w,w),rect(0,w,w,z-w)]
   for p in arms:
    x,y=p[0];a=p[1][0]-x;b=p[2][1]-y
    for k in range(3):yield move(rect(x+k*w/3 if a==w else x,y+k*w/3 if b==w else y,w/3 if a==w else a,w/3 if b==w else b),i*z,j*z)
   yield rect(i*z+w,j*z+w,z-2*w,z-2*w)

def ribbon_weave(count=3,skew=0):
 z=150;w=45 if count>1 else 30
 def transform(p):return [(x+skew*y,y) for x,y in p]
 for j in range(-5,12):
  for i in range(-7,12):
   cx=i*z;cy=j*z
   for k in range(count):
    if (i+j)%2==0:p=rect(cx-z+w/2,cy-w/2+k*w/count,2*z-w,w/count)
    else:p=rect(cx-w/2+k*w/count,cy-z+w/2,w/count,2*z-w)
    yield transform(p)
   yield transform(rect(cx+w/2,cy+w/2,z-w,z-w))

def offset_square_fields():
 z=180
 for j in range(5):
  for i in range(5):
   outer=rect(0,0,z,z);inner=rect(30,55,100,100)
   if (i+j)%2:inner=rect(50,25,100,100)
   for p in rim_shapes(outer,inner):yield move(p,i*z,j*z)
   yield move(inner,i*z,j*z)

def rectangular_weave():
 z=300
 for j in range(3):
  for i in range(3):
   pieces=[rect(0,k*50,300,50) for k in range(3)]
   pieces +=[rect(a*150+k*50,150,50,150) for a in range(2) for k in range(3)]
   for p in pieces:yield move(rotate(p,90 if (i+j)%2 else 0,150,150),i*z,j*z)

def maze_fields():
 # A square spiral divided into practical rectangular pieces, with no overlap.
 n=7;path=set();points=[(0,0),(6,0),(6,6),(0,6),(0,2),(4,2),(4,4),(2,4),(2,3)]
 for (x,y),(xx,yy) in zip(points,points[1:]):
  dx=0 if xx==x else (1 if xx>x else -1);dy=0 if yy==y else (1 if yy>y else -1)
  while (x,y)!=(xx,yy):path.add((x,y));x+=dx;y+=dy
  path.add((xx,yy))
 pieces=[]
 for cells in [set(path),{(x,y) for x in range(n) for y in range(n)}-path]:
  while cells:
   candidates=[]
   for x,y in cells:
    for w in range(1,n-x+1):
     if not all((x+k,y) in cells for k in range(w)):break
     h=1
     while y+h<n and all((x+k,y+h) in cells for k in range(w)):h+=1
     candidates.append((w*h,w,h,x,y))
   _,w,h,x,y=max(candidates);pieces.append(rect(x*30,y*30,w*30,h*30));cells-={(x+k,y+l) for k in range(w) for l in range(h)}
 for j in range(-1,5):
  for i in range(-1,5):
   for p in pieces:yield move(p,i*210,j*210)

def octagon_links():
 z=225;c=z/(2+math.sqrt(2));base=[(c,0),(z-c,0),(z,c),(z,z-c),(z-c,z),(c,z),(0,z-c),(0,c)]
 inner=[(z/2+(x-z/2)*.72,z/2+(y-z/2)*.72) for x,y in base]
 for i in range(4):
  for j in range(4):
   for p in rim_shapes(base,inner):yield move(p,i*z,j*z)
   yield move(inner,i*z,j*z)
 for i in range(5):
  for j in range(5):yield move([(0,-c),(c,0),(0,c),(-c,0)],i*z,j*z)

def truncated_pieces(p,t):
 inner=[];corners=[]
 for k,v in enumerate(p):
  a=p[k-1];b=p[(k+1)%len(p)];pa=(v[0]+t*(a[0]-v[0]),v[1]+t*(a[1]-v[1]));pb=(v[0]+t*(b[0]-v[0]),v[1]+t*(b[1]-v[1]))
  inner +=[pa,pb];corners.append([v,pb,pa])
 yield inner
 yield from corners

def twelve_sided_hex_fields():
 for p in plain_hexagons():yield from truncated_pieces(p,1/(2+math.sqrt(3)))

def hex_triangle_fields():
 a=180;h=math.sqrt(3)*a/2
 for i in range(-10,11):
  for j in range(-10,11):
   x=i*a+j*a/2+450;y=j*h+450
   for p in [[(x,y),(x+a,y),(x+a/2,y+h)],[(x+a,y),(x+1.5*a,y+h),(x+a/2,y+h)]]:yield from truncated_pieces(p,1/3)

def hex_stars():
 for p in plain_hexagons():
  cx=sum(x for x,y in p)/6;cy=sum(y for x,y in p)/6;outer=[];inner=[]
  for k in range(6):
   v=p[k];q=p[(k+1)%6];outer.extend([v,((v[0]+q[0])/2,(v[1]+q[1])/2)])
   inner.extend([(cx+.94*(v[0]-cx),cy+.94*(v[1]-cy)),(cx+.4*((v[0]+q[0])/2-cx),cy+.4*((v[1]+q[1])/2-cy))])
  for k in range(12):
   n=(k+1)%12;yield [(cx,cy),inner[k],inner[n]];yield [inner[k],outer[k],outer[n],inner[n]]

def twelve_stars():
 z=300
 for j in range(3):
  for i in range(3):
   cx=i*z+150;cy=j*z+150;inner=[];outer=[]
   for k in range(24):
    a=k*math.pi/12;dx=math.cos(a);dy=math.sin(a);r=135 if k%2==0 else 60
    inner.append((cx+dx*r,cy+dy*r));q=150/max(abs(dx),abs(dy));outer.append((cx+dx*q,cy+dy*q))
   for k in range(24):
    n=(k+1)%24;yield [(cx,cy),inner[k],inner[n]];yield [inner[k],outer[k],outer[n],inner[n]]

def square_fans():
 z=225;tri=[(0,0),(z,0),(z/2,z/2)]
 for j in range(4):
  for i in range(4):
   for k in range(4):
    for y in range(0,113,15):
     p=inside_clip(rect(0,y,z,15),tri)
     if len(p)>=3 and area(p)>1e-6:yield move(rotate(p,k*90,z/2,z/2),i*z,j*z)

def long_short_bond():
 for j in range(20):
  shift=(j%3)*90
  for i in range(-1,5):
   yield rect(i*270+shift,j*45,180,45);yield rect(i*270+shift+180,j*45,90,45)

def modular_three():
 for j in range(5):
  for i in range(5):
   for p in [rect(0,0,180,60),rect(0,60,120,120),rect(120,60,60,120)]:yield move(rotate(p,90 if (i+j)%2 else 0,90,90),i*180,j*180)

def square_diamonds():
 z=180;m=90
 for j in range(5):
  for i in range(5):
   inner=rect(45,45,90,90);yield move(inner,i*z,j*z)
   for p in [[(0,0),(m,0),(0,m)],[(z,0),(z,m),(m,0)],[(z,z),(m,z),(z,m)],[(0,z),(0,m),(m,z)],[(m,0),(135,45),(45,45)],[(z,m),(135,135),(135,45)],[(m,z),(45,135),(135,135)],[(0,m),(45,45),(45,135)]]:yield move(p,i*z,j*z)

def hex_diagonal_core():
 for p in plain_hexagons():yield [p[k] for k in [0,1,3,4]];yield [p[1],p[2],p[3]];yield [p[4],p[5],p[0]]

def cross_corner_fields():
 z=180
 for j in range(5):
  for i in range(5):
   pieces=[rect(0,60,180,60),rect(60,0,60,60),rect(60,120,60,60)]
   pieces +=[rect(x,y,60,60) for x in [0,120] for y in [0,120]]
   for p in pieces:yield move(p,i*z,j*z)

def framed_stave_fields(herring=True):
 z=300;w=20;bounds=rect(w,w,z-2*w,z-2*w)
 if herring:
  source=[clip(p) for p in herringbone()];source=[[(150+(x-450)*.5,150+(y-450)*.5) for x,y in p] for p in source if len(p)>=3 and area(p)>1e-6]
 else:source=[]
 # For the diagonal study use a continuous 22.5-unit pitch, avoiding tiny gaps.
 if not herring:source=[rotate(rect(-200,k*22.5,700,22.5),45,150,150) for k in range(-20,31)]
 pieces=list(rim_shapes(rect(0,0,z,z),bounds))
 for p in source:
  p=inside_clip(p,bounds)
  if len(p)>=3 and area(p)>1e-6:pieces.append(p)
 for j in range(3):
  for i in range(3):
   for p in pieces:yield move(p,i*z,j*z)

def hex_fans():
 h=math.sqrt(3)*90/2
 for cell in plain_hexagons():
  cx=sum(x for x,y in cell)/6;cy=sum(y for x,y in cell)/6;tri=[(cx-45,cy-h),(cx+45,cy-h),(cx,cy)]
  for k in range(6):
   for row in range(6):
    p=inside_clip(rect(cx-45,cy-h+row*15,90,15),tri)
    if len(p)>=3 and area(p)>1e-6:yield rotate(p,k*60,cx,cy)



def structured_weave(kind):
 p=90;w=30
 def horizontal(i,j):
  if kind=='twill2':return (i+j)%4<2
  if kind=='twill3':return (i+j)%6<3
  if kind=='panama':return (i//2+j//2)%2==0
  return (i+2*j)%5!=0
 for j in range(-6,17):
  start=-1080
  for i in range(-12,19):
   if not horizontal(i,j):
    end=i*p-w/2
    if end>start:yield rect(start,j*p-w/2,end-start,w)
    start=i*p+w/2
  yield rect(start,j*p-w/2,1800-start,w)
 for i in range(-6,17):
  start=-1080
  for j in range(-12,19):
   if horizontal(i,j):
    end=j*p-w/2
    if end>start:yield rect(i*p-w/2,start,w,end-start)
    start=j*p+w/2
  yield rect(i*p-w/2,start,w,1800-start)
 for j in range(-6,17):
  for i in range(-6,17):yield rect(i*p+w/2,j*p+w/2,p-w,p-w)

def strip_fill(boundary,angle=0,pitch=22.5):
 cx=sum(x for x,y in boundary)/len(boundary);cy=sum(y for x,y in boundary)/len(boundary)
 for k in range(-35,36):
  p=inside_clip(rotate(rect(cx-800,cy+k*pitch,1600,pitch),angle,cx,cy),boundary)
  if len(p)>=3 and area(p)>1e-6:yield p

def split_by_line(poly,a,b,c):
 output=[]
 for sign in [1,-1]:
  result=[]
  for p,q in zip(poly,poly[1:]+poly[:1]):
   u=sign*(a*p[0]+b*p[1]+c);v=sign*(a*q[0]+b*q[1]+c);ip=u>=-1e-8;iq=v>=-1e-8
   if ip:result.append(p)
   if ip!=iq:
    t=u/(u-v);result.append((p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])))
  if len(result)>=3 and area(result)>1e-6:output.append(result)
 return output

def cross_division(boundary,diagonal=False,size=180):
 m=size/2;d=16;lines=[(1,0,-m-d),(1,0,-m+d),(0,1,-m-d),(0,1,-m+d)]
 if diagonal:lines=[(1,1,-size-d),(1,1,-size+d),(1,-1,-d),(1,-1,d)]
 pieces=[boundary]
 for a,b,c in lines:pieces=[part for p in pieces for part in split_by_line(p,a,b,c)]
 yield from pieces

def rectangular_cassettes():
 a=300;b=180;c=30;outer=[(c,0),(a-c,0),(a,c),(a,b-c),(a-c,b),(c,b),(0,b-c),(0,c)];inner=[(a/2+(x-a/2)*.78,b/2+(y-b/2)*.65) for x,y in outer]
 pieces=list(rim_shapes(outer,inner))
 for j in range(-1,6):
  for i in range(-1,4):
   p=inside_clip(rect(i*120+(j%2)*60,j*30,120,30),inner)
   if len(p)>=3 and area(p)>1e-6:pieces.append(p)
 for j in range(5):
  for i in range(3):
   for p in pieces:yield move(p,i*a,j*b)
 for j in range(6):
  for i in range(4):yield move([(0,-c),(c,0),(0,c),(-c,0)],i*a,j*b)

def diamond_cross_fields():
 z=180;outer=[(90,0),(180,90),(90,180),(0,90)];inner=[(90,25),(155,90),(90,155),(25,90)]
 pieces=list(rim_shapes(outer,inner))+list(cross_division(inner,size=z))
 pieces +=[[(0,0),(90,0),(0,90)],[(180,0),(180,90),(90,0)],[(180,180),(90,180),(180,90)],[(0,180),(0,90),(90,180)]]
 for j in range(5):
  for i in range(5):
   for p in pieces:yield move(p,i*z,j*z)

def octagon_filled(star=False):
 z=225;c=z/(2+math.sqrt(2));outer=[(c,0),(z-c,0),(z,c),(z,z-c),(z-c,z),(c,z),(0,z-c),(0,c)]
 pieces=[]
 if star:
  inner=[]
  for k in range(16):
   a=k*math.pi/8;r=85 if k%2==0 else 42;inner.append((z/2+r*math.cos(a),z/2+r*math.sin(a)))
  # Triangular sectors partition the octagon; a notch on every other ray makes a star.
  boundary=[]
  for k in range(16):
   if k%2==0:boundary.append(outer[(k//2+2)%8])
   else:
    a=outer[(k//2+2)%8];b=outer[(k//2+3)%8];boundary.append(((a[0]+b[0])/2,(a[1]+b[1])/2))
  # Align inner rays with the corresponding octagon points.
  inner=[]
  for k,(x,y) in enumerate(boundary):
   ratio=.78 if k%2==0 else .32;inner.append((z/2+(x-z/2)*ratio,z/2+(y-z/2)*ratio))
  for k in range(16):
   n=(k+1)%16;pieces.append([(z/2,z/2),inner[k],inner[n]]);pieces.append([inner[k],boundary[k],boundary[n],inner[n]])
 else:pieces=list(strip_fill(outer,45,22.5))
 for j in range(4):
  for i in range(4):
   for p in pieces:yield move(p,i*z,j*z)
 for j in range(5):
  for i in range(5):yield move([(0,-c),(c,0),(0,c),(-c,0)],i*z,j*z)

def cassette_weave():
 z=300;bounds=rect(20,20,260,260);pieces=list(rim_shapes(rect(0,0,z,z),bounds))
 for p in single_weave():
  p=clip(p)
  if len(p)<3 or area(p)<1e-6:continue
  p=rotate([(150+(x-450)*.6,150+(y-450)*.6) for x,y in p],45,150,150);p=inside_clip(p,bounds)
  if len(p)>=3 and area(p)>1e-6:pieces.append(p)
 for j in range(3):
  for i in range(3):
   for p in pieces:yield move(p,i*z,j*z)

def diagonal_cross_cassettes():
 z=225;bounds=rect(18,18,189,189);pieces=list(rim_shapes(rect(0,0,z,z),bounds))+list(cross_division(bounds,True,z))
 for j in range(4):
  for i in range(4):
   for p in pieces:yield move(p,i*z,j*z)

def compass_fields(rectangular=False):
 a=300 if rectangular else 225;b=180 if rectangular else 225;cx=a/2;cy=b/2;rx=50 if rectangular else 32;ry=25 if rectangular else 32
 outer=[(0,0),(cx,0),(a,0),(a,cy),(a,b),(cx,b),(0,b),(0,cy)]
 inner=[(cx-rx,cy-ry),(cx,cy-ry),(cx+rx,cy-ry),(cx+rx,cy),(cx+rx,cy+ry),(cx,cy+ry),(cx-rx,cy+ry),(cx-rx,cy)]
 pieces=list(rim_shapes(outer,inner))+[rect(cx-rx,cy-ry,2*rx,2*ry)]
 for j in range(5 if rectangular else 4):
  for i in range(-1,4 if rectangular else 4):
   for p in pieces:yield move(p,i*a+(a/2 if rectangular and j%2 else 0),j*b)

def triangle_strip_fields():
 a=180;h=math.sqrt(3)*a/2
 for j in range(-1,7):
  for i in range(-4,7):
   x=i*a+j*a/2;y=j*h
   for n,tri in enumerate([[(x,y),(x+a,y),(x+a/2,y+h)],[(x+a,y),(x+1.5*a,y+h),(x+a/2,y+h)]]):
    yield from strip_fill(tri,((i+j+n)%3)*60,30)

def arrow_fields():
 z=180;pieces=[[(0,45),(90,45),(90,0),(180,90),(90,180),(90,135),(0,135)],rect(0,0,90,45),rect(0,135,90,45),[(90,0),(180,0),(180,90)],[(180,90),(180,180),(90,180)]]
 for j in range(5):
  for i in range(5):
   for p in pieces:yield move(rotate(p,180 if (i+j)%2 else 0,90,90),i*z,j*z)

def english_key_basket():
 u=15;z=11*u;w=5*u
 for j in range(-1,7):
  for i in range(-1,7):
   for p in [rect(0,0,z-w,w),rect(z-w,0,w,z-w),rect(w,z-w,z-w,w),rect(0,w,w,z-w)]:
    x,y=p[0];a=p[1][0]-x;b=p[2][1]-y
    for k in range(5):yield move(rect(x+k*u if a==w else x,y+k*u if b==w else y,u if a==w else a,u if b==w else b),i*z,j*z)
   yield rect(i*z+w,j*z+w,u,u)

def mixed_width_bond():
 y=0;j=0
 while y<900:
  h=30 if j%2==0 else 60
  for i in range(-1,7):yield rect(i*180+(90 if j%2 else 0),y,180,h)
  y+=h;j+=1

def irregular_bond():
 for j in range(20):
  x=-225;seed=73*(j+1);k=0
  while x<900:
   seed=(seed*1103515245+12345)%2147483648;length=[90,135,180,225][(seed//1024)%4]
   yield rect(x,j*45,length,45);x+=length;k+=1

def asymmetric_chevron():
 x=0;phase=0
 for i in range(6):
  width=120 if i%2==0 else 180;slope=1 if i%2==0 else -1
  for j in range(-18,35):
   y=j*45+phase;yield [(x,y),(x+width,y+slope*width),(x+width,y+slope*width+45),(x,y+45)]
  phase+=slope*width;x+=width

def diamond_fans():
 z=180;centre=(90,90);vertices=[(90,0),(180,90),(90,180),(0,90)];pieces=[]
 for k in range(4):
  tri=[centre,vertices[k],vertices[(k+1)%4]]
  # These triangles are oriented clockwise in the SVG coordinate system.
  a=vertices[k];b=vertices[(k+1)%4];angle=math.degrees(math.atan2(b[1]-a[1],b[0]-a[0]))
  pieces+=list(strip_fill(tri,angle,15))
 pieces +=[[(0,0),(90,0),(0,90)],[(180,0),(180,90),(90,0)],[(180,180),(90,180),(180,90)],[(0,180),(0,90),(90,180)]]
 for j in range(5):
  for i in range(5):
   for p in pieces:yield move(p,i*z,j*z)


meta=[
('P001','Blokpatroon','Blokken',705,15,'Afwisselende blokken van parallelle stroken.','De strookverdeling is vereenvoudigd naar drie delen per blok.',blocks),
('P002','Visgraat','Verbanden',719,17,'Rechthoekige delen ontmoeten elkaar onder een rechte hoek.','De verhoudingen en herhaling zijn opnieuw opgezet voor het UWFL-vlak.',herringbone),
('P003','Vierkantenvlecht','Vlechten',713,15,'Doorlopende beweging rond vierkante middenstukken.','Een vereenvoudigde geometrische studie van de stroken rond de vierkante accenten.',pinwheel),
('P004','Dubbele strokenvlecht','Vlechten',723,17,'Gepaarde stroken maken de vlechtbeweging zichtbaar.','De kruisingen wisselen boven en onder; de strookverdeling en schaal zijn aangepast.',cross_weave),
('P005','Raster met vierkante accenten','Vlechten',742,18,'Kleine vierkanten verbinden een ritmisch raster van stroken.','Strookritme en accenten zijn vereenvoudigd; houtkleur is bewust weggelaten.',weave),
('P006','Zeshoekrozet','Geometrisch',712,15,'Driehoekige delen vormen een veld van zeshoekige rozetten.','Geometrische studie naar het zeshoekige sterritme; geen exacte overtrek.',hexagons),
('P007','Achthoeken en vierkanten','Geometrisch',757,22,'Achthoekige velden sluiten aan op vierkante verbindingsstukken.','De interne houtvulling en accentlijnen zijn weggelaten om de hoofdindeling te tonen.',octagons),
('P008','Ruitenraster','Geometrisch',700,14,'Ruiten en driehoekige delen vormen een doorlopend raster.','Nieuwe geometrische uitwerking van het diagonale raster; geen exacte overtrek.',diamonds),
('P009','Gecombineerde parketvelden','Blokken',744,19,'Afwisselend gerichte stroken binnen vierkante veldmodules.','De hoekaccenten en profielen zijn vereenvoudigd tot verstekdelen.',panels),
('P010','Sterrozet','Sierpatronen',752,20,'Een ritme van stervormen, punten en aansluitende vlakken.','Eigen symmetrische uitwerking naar het historische sterritme; de historische draairichting is niet gekopieerd.',stars),
]
meta.append(('P011','Kubusverband met zeshoekige omlijsting','Geometrisch',71,48,'Drie ruitvormige vlakken per zeshoek vormen samen een kubusbeeld.','Geometrische studie naar Wyrsch nr. 71; de smalle meervoudige randen zijn vereenvoudigd tot één omlijsting.',framed_cubes))


new_designs=[
('Dubbele visgraat','Verbanden','Twee parallelle stroken per been maken het dubbele visgraatverband.','Double herringbone','Two parallel staves in each arm create the double herringbone pattern.',lambda:grouped_herringbone(2)),
('Driedubbele visgraat','Verbanden','Drie stroken per been vormen een breder ritme met verspringende haakse aansluitingen.','Triple herringbone','Three staves in each arm create a broader rhythm with staggered right-angle joints.',lambda:grouped_herringbone(3)),
('Viervoudige visgraat','Verbanden','Vier parallelle stroken per been geven het visgraatverband een gebundeld karakter.','Four-strip herringbone','Four parallel staves in each arm give the herringbone pattern a bundled structure.',lambda:grouped_herringbone(4)),
('Hongaarse punt 45°','Hongaarse punt','Schuine kopse aansluitingen van 45° vormen een doorlopende puntlijn.','Chevron 45°','End cuts at 45° meet along a continuous chevron line.',lambda:chevron(45)),
('Hongaarse punt 60°','Hongaarse punt','Kopse zaagsneden van 60° leveren een vlakkere punt dan de uitvoering met 45° kopse sneden.','Chevron 60°','End cuts at 60° create a shallower chevron than the version with 45° end cuts.',lambda:chevron(60)),
('Recht strokenverband','Verbanden','Rechthoekige stroken liggen in rechte rijen met doorlopende kopse voegen.','Stack-bond strips','Rectangular staves form straight rows with aligned end joints.',lambda:strip_bond()),
('Halfsteensverband','Verbanden','Iedere rij verspringt een halve strooklengte ten opzichte van de vorige.','Half-offset running bond','Each row is offset by half a stave length from the previous row.',lambda:strip_bond(.5)),
('Een derde verspringend verband','Verbanden','De kopse voegen schuiven per rij een derde strooklengte op.','Third-offset running bond','End joints shift by one third of a stave length in each successive row.',lambda:strip_bond(1/3)),
('Ladderverband','Verbanden','Dwarsstroken verbinden velden met evenwijdige korte stroken tot een ladderritme.','Ladder pattern','Cross strips connect fields of parallel short staves in a ladder rhythm.',lambda:ladder(1)),
('Dubbel ladderverband','Verbanden','Twee dwarsstroken per herhaling wisselen af met velden van korte evenwijdige stroken.','Double ladder pattern','Two cross strips in each repeat alternate with fields of parallel short staves.',lambda:ladder(2)),
('Tweestrooks blokverband','Blokken','Blokken van twee stroken wisselen haaks van legrichting.','Two-strip basket pattern','Blocks of two staves alternate at right angles.',two_strip_basket),
('Enkele strokenvlecht','Vlechten','Enkele doorlopende stroken kruisen afwisselend boven en onder rond vierkante open velden.','Single-strip weave','Single continuous strips alternate over and under around square fields.',single_weave),
('Kubusverband zonder binnenrand','Geometrisch','Drie ruitvormige vlakken sluiten rechtstreeks op elkaar aan tot een kubusbeeld, zonder randjes rond de vlakken.','Cube pattern without inner borders','Three rhombus faces meet directly to form a cube image, with no edging around the faces.',plain_cubes),
('Ruitenverband 60°','Geometrisch','Gelijke ruiten vormen een rustig doorlopend veld zonder omlijsting binnen het patroon.','60° rhombus field','Equal rhombi form a continuous field without internal framing.',rhombus_field),
('Zeshoekenverband','Geometrisch','Aaneengesloten zeshoeken tonen het honingraatritme zonder verdere vlakverdeling.','Hexagon field','Adjoining hexagons show a honeycomb rhythm without further subdivisions.',plain_hexagons),
('Vierkantenverband','Blokken','Gelijke vierkante delen vormen een regelmatig tegelverband.','Square field','Equal square pieces form a regular tiled field.',square_field),
('Ruitvelden met hoekstukken','Geometrisch','Omlijste ruitvormige middenvelden worden verbonden door driehoekige hoekstukken.','Framed diamond fields','Framed diamond centres connect through triangular corner pieces.',plain_diamond_panels),
('Vierpuntige stervelden','Sierpatronen','Vier lange punten per ster vormen een herhalend veld met aansluitende hoekvlakken.','Four-point star fields','Four long points in each star form repeating fields with adjoining corner pieces.',four_point_stars),
('Gepaarde rijen in halfsteensverband','Verbanden','Telkens twee rijen hebben gelijke kopse voegen; het volgende rijpaar verspringt een halve lengte.','Paired-row running bond','Two rows share aligned end joints; the next pair is offset by half a stave length.',lambda:strip_bond(.5,True)),
('Hongaarse punt met tussenstroken','Hongaarse punt','Smalle rechte tussenstroken scheiden de schuine puntvelden binnen het patroon.','Chevron with separating strips','Narrow straight strips separate the angled chevron fields within the pattern.',lambda:chevron(45,18)),
]
for index,(name,family,description,en_name,en_description,fn) in enumerate(new_designs,12):
 meta.append((f'P{index:03d}',name,family,None,None,description,'Nieuwe geometrische studie van het beschreven legverband; geen overtrek, historische reconstructie of zaagplan.',fn))
new_english={f'P{i:03d}':dict(name_en=n,description_en=d) for i,(_,_,_,n,d,_) in enumerate(new_designs,12)}

next_designs=[
('Drievoudige vlecht met vierkante sleutel','Vlechten','Drie stroken per arm draaien rond kleine vierkante sleutelstukken.','Triple weave with square keys','Three staves in each arm turn around small square keys.',key_weave),
('Driedelige strokenvlecht','Vlechten','Bundels van drie smalle stroken kruisen afwisselend boven en onder.','Three-strip ribbon weave','Bundles of three narrow strips alternate over and under.',ribbon_weave),
('Verspringende vierkantvelden','Geometrisch','Verschoven vierkante kernen zorgen voor afwisselend brede en smalle verstekdelen.','Offset square fields','Offset square centres create alternating broad and narrow mitred pieces.',offset_square_fields),
('Rechthoekige veldvlecht','Vlechten','Lange rechthoekige velden wisselen af met kortere haaks gelegde strookvelden.','Rectangular field weave','Long rectangular fields alternate with shorter fields of perpendicular staves.',rectangular_weave),
('Haakse meandervelden','Sierpatronen','Rechthoekige delen vormen een herhalende vierkante spiraalstructuur.','Angular meander fields','Rectangular pieces form repeating square spiral structures.',maze_fields),
('Schuine ruitenvlecht','Vlechten','Schuin kruisende stroken vormen een vlechtwerk met ruitvormige tussenvelden.','Oblique diamond weave','Obliquely crossing strips form a weave around rhombus-shaped fields.',lambda:ribbon_weave(1,.5)),
('Achthoekvelden met schakelrand','Geometrisch','Achthoekige middenvelden krijgen een gedeelde ritmiek van randdelen en vierkante sleutels.','Octagon fields with linked rims','Octagonal centres share a rhythm of rim pieces and square keys.',octagon_links),
('Twaalfhoekvelden met driehoekaccenten','Geometrisch','Afgeschuinde zeshoeken vormen twaalfzijdige velden met driehoekige aansluitstukken.','Twelve-sided fields with triangle accents','Truncated hexagons form twelve-sided fields with triangular joining pieces.',twelve_sided_hex_fields),
('Zeshoekvelden in driehoeksraster','Geometrisch','Zeshoekige kernen en driehoekige aansluitstukken volgen een gelijkzijdig driehoeksraster.','Hexagon fields in a triangular lattice','Hexagonal centres and triangular joining pieces follow an equilateral triangular lattice.',hex_triangle_fields),
('Zespuntige stervelden','Sierpatronen','Zes lange punten per ster herhalen zich binnen aansluitende zeshoekvelden.','Six-point star fields','Six long points in each star repeat within adjoining hexagonal fields.',hex_stars),
('Twaalfpuntige stervelden','Sierpatronen','Twaalf punten per rozet vormen een dicht ritme van ster- en hoekdelen.','Twelve-point star fields','Twelve points in each rosette create a dense rhythm of star and corner pieces.',twelve_stars),
('Vierdelige waaierrozet','Sierpatronen','Vier driehoekige waaiers van evenwijdige delen ontmoeten elkaar in het midden.','Four-part fan rosette','Four triangular fans of parallel pieces meet at the centre.',square_fans),
('Wisselend lang-kortverband','Verbanden','Lange en korte stroken wisselen elkaar af; de kopse voegen verspringen per rij.','Alternating long-short bond','Long and short staves alternate, with end joints shifting between rows.',long_short_bond),
('Modulair verband met drie formaten','Blokken','Een vierkant en twee rechthoekige formaten vormen afwisselend gerichte modules.','Three-format modular bond','A square and two rectangular formats form alternating modules.',modular_three),
('Vierkant-ruitenverband','Geometrisch','Vierkante kernen en driehoekige hoekdelen vormen samen een ruitritme.','Square-and-diamond bond','Square centres and triangular corner pieces combine in a diamond rhythm.',square_diamonds),
('Zeshoekverband met diagonale kern','Geometrisch','Een diagonale kern en twee driehoekige delen vullen iedere zeshoek.','Hexagon bond with diagonal centres','A diagonal centre and two triangular pieces fill each hexagon.',hex_diagonal_core),
('Kruisverband met hoekvierkanten','Blokken','Lange middenstroken en korte dwarsdelen kruisen tussen vierkante hoekstukken.','Cross bond with corner squares','Long central staves and short cross pieces meet between square corner pieces.',cross_corner_fields),
('Omlijste visgraatvelden','Verbanden','Kleine visgraatvelden worden samengebracht binnen vierkante verstekomlijstingen.','Framed herringbone fields','Small herringbone fields sit within square mitred frames.',framed_stave_fields),
('Omlijste diagonale strookvelden','Verbanden','Diagonale stroken vullen vierkante velden met een rechte verstekomlijsting.','Framed diagonal stave fields','Diagonal staves fill square fields with straight mitred frames.',lambda:framed_stave_fields(False)),
('Zesdelige waaierrozet','Sierpatronen','Zes driehoekige waaiers met evenwijdige stroken vormen samen een zeshoekrozet.','Six-part fan rosette','Six triangular fans of parallel staves form a hexagonal rosette.',hex_fans),
]
for index,(name,family,description,en_name,en_description,fn) in enumerate(next_designs,32):
 meta.append((f'P{index:03d}',name,family,None,None,description,'Nieuwe geometrische UWFL-studie; details en verbindingen zijn zelfstandig uitgewerkt. Geen exacte historische reconstructie of zaagplan.',fn))
 new_english[f'P{index:03d}']=dict(name_en=en_name,description_en=en_description)


third_designs=[
('Kepervlecht twee-over-twee','Vlechten','Stroken kruisen in een verschuivend ritme van twee boven en twee onder.','Two-over-two twill weave','Strips cross in a shifting rhythm of two over and two under.',lambda:structured_weave('twill2')),
('Kepervlecht drie-over-drie','Vlechten','Langere kruisingsreeksen van drie boven en drie onder vormen diagonale lijnen.','Three-over-three twill weave','Longer sequences of three over and three under form diagonal lines.',lambda:structured_weave('twill3')),
('Panamavlecht','Vlechten','Paren naast elkaar gelegen stroken delen dezelfde boven-onderherhaling.','Basket-group weave','Pairs of adjoining strips share the same over-under repeat.',lambda:structured_weave('panama')),
('Vijfdelige vlechtherhaling','Vlechten','Een kruising onderbreekt telkens vier doorgaande kruisingen in een verspringende herhaling.','Five-part weave repeat','One interruption follows four continuous crossings in a shifting repeat.',lambda:structured_weave('satin')),
('Rechthoekcassettes met ruitensleutels','Geometrisch','Omlijste rechthoekige velden met strookvulling sluiten aan op ruitvormige sleutels.','Rectangular cassettes with diamond keys','Framed rectangular stave fields meet diamond-shaped keys.',rectangular_cassettes),
('Ruitketting met kruisvulling','Geometrisch','Omlijste ruiten bevatten een kruisvormige vlakverdeling met kleine hoekdelen.','Diamond chain with cross divisions','Framed diamonds contain cross-shaped divisions with small corner pieces.',diamond_cross_fields),
('Achthoekvelden met sterkern','Sierpatronen','Stervormige kernen herhalen zich in achthoekvelden met vierkante aansluitstukken.','Octagonal fields with star centres','Star-shaped centres repeat in octagonal fields with square joining pieces.',lambda:octagon_filled(True)),
('Cassette met diagonale vlecht','Vlechten','Een diagonale strokenvlecht vult ieder vierkant binnen een rechte verstekomlijsting.','Cassette with diagonal weave','A diagonal strip weave fills each square within a straight mitred frame.',cassette_weave),
('Cassette met kruisende diagonalen','Geometrisch','Diagonaal kruisende stroken verdelen vierkante cassettes in midden- en hoekvlakken.','Cassette with crossing diagonals','Crossing diagonal strips divide square cassettes into centre and corner fields.',diagonal_cross_cassettes),
('Kompasvelden met vierkante kern','Sierpatronen','Acht uitwaaierende vlakken verbinden een vierkante kern met de buitenhoeken en zijden.','Compass fields with square centres','Eight radiating fields connect a square centre to the outer corners and sides.',compass_fields),
('Achthoekverband met diagonale stroken','Geometrisch','Diagonale stroken vullen achthoekige velden tussen kleine vierkante sleutels.','Octagonal bond with diagonal staves','Diagonal staves fill octagonal fields between small square keys.',octagon_filled),
('Driehoeksverband met strookvulling','Geometrisch','Driehoekige velden krijgen afwisselende legrichtingen door hun evenwijdige strookvulling.','Triangular bond with stave infill','Parallel staves give adjoining triangular fields alternating laying directions.',triangle_strip_fields),
('Pijlvormige blokvelden','Blokken','Pijlvormige hoofddelen wisselen van richting tussen rechte en driehoekige passtukken.','Arrow-shaped block fields','Arrow-shaped main pieces alternate direction between rectangular and triangular infill.',arrow_fields),
('Engels vlechtverband met sleutels','Vlechten','Bundels van vijf stroken van zes breedtes lang draaien rond kleine vierkante sleutelstukken.','English basket pattern with keys','Bundles of five staves, each six widths long, turn around small square keys.',english_key_basket),
('Wisselbreedteverband','Verbanden','Smalle en brede rijen wisselen elkaar af met verspringende kopse voegen.','Alternating-width bond','Narrow and broad rows alternate with staggered end joints.',mixed_width_bond),
('Wild strokenverband','Verbanden','Verschillende strooklengtes vormen een rustig veld zonder vaste kopse herhaling.','Irregular-length stave bond','Different stave lengths form a quiet field without a fixed end-joint repeat.',irregular_bond),
('Asymmetrische puntvelden','Hongaarse punt','Smalle en brede schuine banen ontmoeten elkaar in een asymmetrisch puntritme.','Asymmetric chevron fields','Narrow and broad angled lanes meet in an asymmetric chevron rhythm.',asymmetric_chevron),
('Puntverband 30°','Hongaarse punt','Kopse sneden van 30° leveren een scherpe puntlijn met steile strookrichtingen.','Chevron bond 30°','End cuts at 30° create a sharp chevron line with steep stave directions.',lambda:chevron(30)),
('Ruitvormige waaierrozet','Sierpatronen','Vier waaiervelden vullen een ruit en worden rondom verbonden door driehoekige hoekdelen.','Diamond-shaped fan rosette','Four fan fields fill a diamond surrounded by triangular corner pieces.',diamond_fans),
('Rechthoekige kompasvelden','Sierpatronen','Een langwerpige kern en uitwaaierende velden herhalen zich in verspringende rijen.','Rectangular compass fields','An elongated centre and radiating fields repeat in staggered rows.',lambda:compass_fields(True)),
]
for index,(name,family,description,en_name,en_description,fn) in enumerate(third_designs,52):
 meta.append((f'P{index:03d}',name,family,None,None,description,'Nieuwe geometrische UWFL-studie van het beschreven legverband. Geen exacte historische reconstructie of zaagplan.',fn));new_english[f'P{index:03d}']=dict(name_en=en_name,description_en=en_description)

def contains(poly,p):
 x,y=p;inside=False
 for (x1,y1),(x2,y2) in zip(poly,poly[1:]+poly[:1]):
  if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1:inside=not inside
 return inside
allmeta=[]
publicmeta=[]
for code,name,family,num,page,description,adaptation,fn in meta:
 shapes=[clip(p)for p in fn()];shapes=[p for p in shapes if len(p)>=3 and area(p)>1e-6]
 total=sum(area(p)for p in shapes)
 assert abs(total-S*S)<0.1,(code,total)
 # Test interior points for accidental overlapping boards and uncovered gaps.
 for a in range(29):
  for b in range(29):
   point=((a+.371)*S/29,(b+.219)*S/29)
   assert sum(contains(p,point)for p in shapes)==1,(code,point)
 title=f'{code} · {name}'
 outlines=''
 if code=='P006':
  r=90;h=math.sqrt(3)*r/2
  for i in range(-1,9):
   for j in range(-1,9):
    cx=i*1.5*r;cy=(2*j+(i%2))*h
    p=clip([(cx+r*math.cos(math.radians(k*60)),cy+r*math.sin(math.radians(k*60)))for k in range(6)])
    if len(p)>=3 and area(p)>1e-6:outlines+='<polygon points="'+' '.join(f'{fmt(x+50)},{fmt(y+50)}'for x,y in p)+'"/>'

 body=''.join('<polygon points="'+' '.join(f'{fmt(x+50)},{fmt(y+50)}'for x,y in p)+'"/>'for p in shapes)
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" role="img" aria-labelledby="title desc"><title id="title">{title}</title><desc id="desc">Zwart-witte geometrische studie. Werkvlak 90 bij 90 cm binnen de vaste eiken molenwiekband van 5 cm. Geen zaagplan.</desc><rect width="1000" height="1000" fill="white"/><g fill="white" stroke="#171717" stroke-width="1.7" stroke-linejoin="round">{body}</g><g fill="none" stroke="#171717" stroke-width="3">{outlines}</g><g fill="white" stroke="#171717" stroke-width="2.4"><path d="M50 0H1000V50H50Z"/><path d="M950 50H1000V1000H950Z"/><path d="M0 950H950V1000H0Z"/><path d="M0 0H50V950H0Z"/></g></svg>'''
 (OUT/f'{code.lower()}.svg').write_text(svg)
 allmeta.append(dict(id=code,name=name,family=family,description=description,adaptation=adaptation,image=f'assets/patterns/{code.lower()}.svg',source=dict(title='Interior Hardwood Co. · Book of Designs',year=1892,number=num,scanPage=page,printedPage=page-2 if page else None,url=f'https://floorborders.com/pubs/Book-of-Designs-1892/w{page:02d}.htm' if page else None)))
 if code=='P011':allmeta[-1]['source']=dict(title='Gebrüder Wyrsch · Parquet-Fabrik',year=1910,number=71,scanPage=48,url='https://archive.org/details/Parquet-fabrikGebrderWyrschBuochsSuisseGegrndet1875')
 if code in new_english:
  allmeta[-1].update(new_english[code])
  references=[]
  if 'visgraat' in name:references=['https://www.junckers.com/wood-flooring/solid-hardwood-flooring/herringbone-flooring/herringbone-flooring']
  elif family=='Hongaarse punt':references=['https://mafi.com/en/Products/Natural%20Wood%20Floors/Formats/Chevron']
  elif family in ('Verbanden','Blokken'):references=['https://www.havwoods.com/us/selection/parquet-flooring/']
  elif code in ('P023','P024'):references=['https://archive.org/details/Parquet-fabrikGebrderWyrschBuochsSuisseGegrndet1875']
  if code=='P065':references=['https://www.junckers.com/wood-flooring/guidance/technical-advice/product-data-sheets/c-floor-systems-commercial-residential/single-stave-blocks-laying-instructions-c-9-0']
  if code=='P069':references=[]
  allmeta[-1]['source']=dict(kind='geometric-study',title='Geometrische UWFL-uitwerking van het beschreven legverband; geen exacte historische reconstructie',references=references)
  inspirations={'P032':(759,22),'P033':(755,21),'P034':(724,18),'P036':(758,22),'P038':(756,21),'P042':(764,23)}
  if code in inspirations:
   catalog,scan=inspirations[code];allmeta[-1]['source']['inspiration']=dict(number=catalog,scanPage=scan,url=f'https://floorborders.com/pubs/Book-of-Designs-1892/w{scan:02d}.htm',note='Alleen het algemene motief is als vertrekpunt gebruikt; de geometrie is nieuw uitgewerkt.')

 publicmeta.append({k:v for k,v in allmeta[-1].items() if k not in ('source','adaptation')})
 print(code,len(shapes),'pieces · complete field')
(ROOT/'docs/pattern-provenance.json').write_text(json.dumps(allmeta,ensure_ascii=False,indent=2)+'\n')
(OUT/'catalogue.json').write_text(json.dumps(publicmeta,ensure_ascii=False,indent=2)+'\n')
