
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/docs/apresentacao-ja-logistica.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
for name, font in [('Regular','segoeui.ttf'),('Bold','segoeuib.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / font)))
W,H = 595.276,841.89
NAVY='#10333d'; DEEP='#0b262e'; ORANGE='#f0800f'; MUTED='#52646d'; PALE='#f2f6f7'
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('J.A Logística - Apresentação comercial')
c.setAuthor('J.A Logística')
c.setSubject('Transporte, armazenagem e movimentação de cargas')
def rect(x,y,w,h,color,r=0):
    c.setFillColor(HexColor(color)); c.setStrokeColor(HexColor(color))
    if r:c.roundRect(x,H-y-h,w,h,r,stroke=0,fill=1)
    else:c.rect(x,H-y-h,w,h,stroke=0,fill=1)
def text(s,x,y,size=12,color=NAVY,bold=False):
    c.setFont('Bold' if bold else 'Regular',size);c.setFillColor(HexColor(color));c.drawString(x,H-y-size,s)
def para(s,x,y,w,size=11,color=MUTED,leading=None,bold=False):
    style=ParagraphStyle('body',fontName='Bold' if bold else 'Regular',fontSize=size,leading=leading or size*1.5,textColor=HexColor(color))
    p=Paragraph(s,style);_,h=p.wrap(w,1000);p.drawOn(c,x,H-y-h);return h
def photo(file,x,y,w,h,bg=PALE):
    rect(x,y,w,h,bg)
    reader=ImageReader(str(ROOT / 'assets/img' / file));iw,ih=reader.getSize();scale=min(w/iw,h/ih)
    dw,dh=iw*scale,ih*scale
    c.drawImage(reader,x+(w-dw)/2,H-y-(h+dh)/2,width=dw,height=dh,mask='auto')
def link(label,url,x,y,w,size=11,color=NAVY):
    text(label,x,y,size,color,True)
    c.linkURL(url,(x,H-y-24,x+w,H-y+2),relative=0,thickness=0)
def footer(n):
    rect(40,800,W-80,1,'#dce5e8')
    text('J.A LOGISTICA LTDA | CNPJ 58.180.321/0001-03',40,811,8,MUTED)
    link('jalogisticas.com','https://www.jalogisticas.com/',383,810,125,9)
    text(str(n)+' / 3',530,811,8,MUTED)
def header(kicker,title):
    rect(0,0,W,9,ORANGE)
    text(kicker.upper(),40,40,10,'#884300',True)
    text(title,40,65,28,NAVY,True)

# 1 - Company and evidence from its own operation.
rect(0,0,W,270,DEEP)
rect(40,30,92,90,'#ffffff',10)
c.drawImage(str(ROOT/'assets/logos/logo-jalogistica.png'),51,H-110,width=70,height=70*349/431,mask='auto')
text('LOGÍSTICA E ARMAZENAGEM',155,48,10,'#ffcb90',True)
text('J.A Logística',155,72,29,'#ffffff',True)
text('Apresentação comercial',155,114,12,'#cadce1')
text('Sua carga. Do jeito certo,',40,158,25,'#ffffff',True)
text('do início ao fim.',40,195,25,'#ffb561',True)
text('Transporte, armazenagem e movimentação de cargas.',40,242,11,'#cadce1')
photo('transporte-bobinas.jpg',40,288,W-80,290)
text('Transporte de bobinas em carretas adequadas à carga.',40,586,10,MUTED)
for x,num,label in [(40,'20+','Equipamentos na frota'),(216,'3.000+','Serviços realizados'),(392,'15+','Clientes atendidos')]:
    text(num,x,621,29,'#884300',True);text(label,x,662,10,MUTED)
rect(40,704,W-80,72,PALE,10)
text('Nordeste e parte da região Norte',56,716,14,NAVY,True)
para('Terminal em Caucaia-CE. Consulte a disponibilidade para sua rota com nosso comercial.',56,740,W-112,10)
footer(1);c.showPage()

# 2 - Services.
header('O que fazemos','Serviços para sua operação')
para('Frota própria e estrutura no terminal para atender às necessidades da sua carga.',40,110,W-80,11)
cards=[
('Cargas especiais','carregamento-caminhao.jpg','Transporte de cargas com peso e dimensões especiais e produtos siderúrgicos. Apoio às licenças rodoviárias (AET) e à escolta.'),
('Contêineres e carga geral','bobinas-aco.jpg','Transporte de contêineres, contêiner próprio tipo baú e carga geral com lotação completa.'),
('Armazenagem','armazem-paletes.jpg','Armazém coberto para cargas, armazenagem de carga geral e espaço para depot de contêineres vazios.'),
('Movimentação de cargas','container-carga.jpg','Desova, ovação, carregamento, descarregamento, paletização e preparação de cargas. Relatórios fotográficos dos serviços.')]
cw=(W-100)/2
for i,(title,img,body) in enumerate(cards):
    x=40+(i%2)*(cw+20);y=155+(i//2)*293
    rect(x,y,cw,275,PALE,10)
    photo(img,x+10,y+10,cw-20,130,'#e9eff1')
    text(title,x+14,y+154,13,NAVY,True)
    h=para(body,x+14,y+181,cw-28,10.5)
    assert h<82,(title,h)
rect(40,750,W-80,30,DEEP,6)
text('Empilhadeiras próprias de 2,5 e 7 toneladas no terminal.',54,757,11,'#ffffff',True)
footer(2);c.showPage()

# 3 - Planning and ways to contact.
header('Vamos conversar','Planeje sua próxima operação')
para('Para solicitar uma cotação, informe o serviço, as características da carga, a origem e o destino. Peso, dimensões e data desejada ajudam nossa equipe a avaliar a operação.',40,112,W-80,12)
rect(40,187,W-80,104,DEEP,10)
text('COMERCIAL',58,201,10,'#ffcb90',True)
text('Luiz Antonio | (85) 9 9175-3831',58,223,18,'#ffffff',True)
link('Solicitar cotação pelo WhatsApp','https://wa.me/5585991753831',58,257,330,12,'#ffcb90')
for x,title,name,phone,number in [
    (40,'Operacional','Equipe operacional','(85) 9 9985-0477','5585999850477'),
    (307,'Financeiro','Larissa Gaspar','(85) 9 9944-3284','5585999443284')]:
    text(title,x,317,13,NAVY,True)
    text(name,x,342,11,MUTED)
    link(phone,'https://wa.me/'+number,x,364,245,12)
photo('bobinas-aco.jpg',40,410,W-80,205)
text('Nosso terminal',40,635,18,NAVY,True)
para('Rodovia CE 155, 16.226 - Distrito Industrial<br/>Caucaia-CE, em frente à fábrica do Cimento Apodi.',40,666,W-80,11)
link('Como chegar pelo Google Maps','https://www.google.com/maps/dir/?api=1&destination=-3.667260441859176%2C-38.85793904658222',40,718,W-80)
link('Conheça mais: www.jalogisticas.com','https://www.jalogisticas.com/',40,754,W-80)
footer(3);c.save()
pdf=PdfReader(str(OUT))
assert len(pdf.pages)==3
alltext='\n'.join(p.extract_text() for p in pdf.pages)
for required in ['Nordeste e parte da região Norte','Luiz Antonio','Larissa Gaspar','9 9985-0477','9 9944-3284','9 9175-3831']:
    assert required in alltext,required
assert '9192-9356' not in alltext
print({'pages':len(pdf.pages),'bytes':OUT.stat().st_size,'links':sum(len(p.get('/Annots',[])) for p in pdf.pages),'output':str(OUT)})
