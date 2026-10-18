"""Ten geometric studies after Interior Hardwood Co., Book of Designs (1892).
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
# Keep the more source-specific ten above; paired herringbone is retained as a reusable constructor.

def contains(poly,p):
 x,y=p;inside=False
 for (x1,y1),(x2,y2) in zip(poly,poly[1:]+poly[:1]):
  if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1:inside=not inside
 return inside
allmeta=[]
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
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" role="img" aria-labelledby="title desc"><title id="title">{title}</title><desc id="desc">Zwart-witte geometrische studie. Werkvlak 90 bij 90 cm binnen de vaste eiken molenwiekband van 5 cm. Bewerking naar Interior Hardwood Co., 1892, nummer {num}. Geen zaagplan.</desc><rect width="1000" height="1000" fill="white"/><g fill="white" stroke="#171717" stroke-width="1.7" stroke-linejoin="round">{body}</g><g fill="none" stroke="#171717" stroke-width="3">{outlines}</g><g fill="white" stroke="#171717" stroke-width="2.4"><path d="M0 0H950V50H0Z"/><path d="M950 0H1000V950H950Z"/><path d="M50 950H1000V1000H50Z"/><path d="M0 50H50V1000H0Z"/></g></svg>'''
 (OUT/f'{code.lower()}.svg').write_text(svg)
 allmeta.append(dict(id=code,name=name,family=family,description=description,adaptation=adaptation,image=f'assets/patterns/{code.lower()}.svg',source=dict(title='Interior Hardwood Co. · Book of Designs',year=1892,number=num,scanPage=page,printedPage=page-2,url=f'https://floorborders.com/pubs/Book-of-Designs-1892/w{page:02d}.htm')))
 print(code,len(shapes),'pieces · complete field')
(OUT/'catalogue.json').write_text(json.dumps(allmeta,ensure_ascii=False,indent=2)+'\n')
