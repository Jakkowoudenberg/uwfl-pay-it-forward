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
  allmeta[-1]['source']=dict(kind='geometric-study',title='Geometrische UWFL-uitwerking van het beschreven legverband; geen exacte historische reconstructie',references=references)

 publicmeta.append({k:v for k,v in allmeta[-1].items() if k not in ('source','adaptation')})
 print(code,len(shapes),'pieces · complete field')
(ROOT/'docs/pattern-provenance.json').write_text(json.dumps(allmeta,ensure_ascii=False,indent=2)+'\n')
(OUT/'catalogue.json').write_text(json.dumps(publicmeta,ensure_ascii=False,indent=2)+'\n')
