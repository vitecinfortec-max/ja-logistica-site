
"""Build the three-page commercial presentation with the site's approved content."""
from pathlib import Path
import os
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics import renderPDF
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/docs/apresentacao-ja-logistica.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path(os.environ.get('JA_PDF_FONT_DIR', 'C:/Windows/Fonts'))
for name, font in [('Regular','segoeui.ttf'),('Bold','segoeuib.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / font)))
W,H = 595.276,841.89
M=36
CW=W-2*M
NAVY='#10333d'
DEEP='#0b262e'
ORANGE='#f0800f'
GOLD='#ffb96b'
MUTED='#52646d'
PALE='#f2f6f7'
LINE='#d9e3e6'
WHITE='#ffffff'
SITE='https://www.jalogisticas.com/'
WHATSAPP='https://wa.me/5585991753831'
DIRECTIONS='https://www.google.com/maps/dir/?api=1&destination=-3.667260441859176%2C-38.85793904658222'
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('J.A Logística - Apresentação comercial')
c.setAuthor('J.A Logística')
c.setSubject('Transporte, armazenagem e movimentação de cargas')
c.setCreator('J.A Logística')

def rect(x,y,w,h,color,r=0):
    c.setFillColor(HexColor(color))
    if r:
        c.roundRect(x,H-y-h,w,h,r,stroke=0,fill=1)
    else:
        c.rect(x,H-y-h,w,h,stroke=0,fill=1)

def text(s,x,y,size=12,color=NAVY,bold=False):
    assert x + pdfmetrics.stringWidth(s,'Bold' if bold else 'Regular',size) <= W-M+2, s
    c.setFont('Bold' if bold else 'Regular',size)
    c.setFillColor(HexColor(color))
    c.drawString(x,H-y-size,s)

def para(s,x,y,w,size=11,color=MUTED,leading=None,bold=False,max_height=None):
    style=ParagraphStyle('body',fontName='Bold' if bold else 'Regular',
        fontSize=size,leading=leading or size*1.45,textColor=HexColor(color))
    p=Paragraph(s,style)
    _,h=p.wrap(w,1000)
    if max_height is not None:
        assert h<=max_height, (s,h,max_height)
    p.drawOn(c,x,H-y-h)
    return h

def photo(file,x,y,w,h,bg=PALE):
    # Fit without cropping or stretching the original photograph.
    rect(x,y,w,h,bg)
    reader=ImageReader(str(ROOT / 'assets/img' / file))
    iw,ih=reader.getSize()
    scale=min(w/iw,h/ih)
    dw,dh=iw*scale,ih*scale
    c.drawImage(reader,x+(w-dw)/2,H-y-(h+dh)/2,width=dw,height=dh,mask='auto')

def logo(x,y,w):
    h=w*349/431
    c.drawImage(str(ROOT/'assets/logos/logo-jalogistica.png'),x,H-y-h,width=w,height=h,mask='auto')

def link(label,url,x,y,w,size=11,color=NAVY):
    text(label,x,y,size,color,True)
    c.linkURL(url,(x,H-y-24,x+w,H-y+2),relative=0,thickness=0)

def arrow(x,y,color=NAVY):
    c.setStrokeColor(HexColor(color));c.setLineWidth(1.2)
    c.line(x,H-y,x+10,H-y)
    c.line(x+6,H-y-4,x+10,H-y)
    c.line(x+6,H-y+4,x+10,H-y)

def button(label,url,x,y,w,h=35):
    rect(x,y,w,h,ORANGE,5)
    text(label,x+14,y+9,11,DEEP,True)
    arrow(x+w-27,y+h/2,DEEP)
    c.linkURL(url,(x,H-y-h,x+w,H-y),relative=0,thickness=0)

def footer(n,dark=False):
    color='#c6d8dd' if dark else MUTED
    rect(M,800,CW,0.6,'#31505a' if dark else LINE)
    text('J.A LOGISTICA LTDA | CNPJ 58.180.321/0001-03',M,811,7.3,color)
    link('jalogisticas.com',SITE,410,809,108,8.5,GOLD if dark else NAVY)
    text(str(n).zfill(2),543,809,9,color,True)

def section_header(number,label,title_lines):
    rect(0,0,W,5,ORANGE)
    text(number+' / '+label.upper(),M,34,9,'#884300',True)
    logo(505,21,54)
    for i,line in enumerate(title_lines):
        text(line,M,67+i*37,31,NAVY,True)

def qr(url,x,y,size):
    widget=QrCodeWidget(url,barLevel='M')
    bx,by,bw,bh=widget.getBounds()
    drawing=Drawing(size,size,transform=[size/(bw-bx),0,0,size/(bh-by),0,0])
    drawing.add(widget)
    renderPDF.draw(drawing,c,x,H-y-size)

# Page 1: a full-width operational photo and clear commercial indicators.
rect(0,0,W,H,DEEP)
rect(0,0,W,112,WHITE)
logo(M,16,94)
text('APRESENTAÇÃO',350,34,13,NAVY,True)
text('COMERCIAL',350,54,20,NAVY,True)
rect(M,140,32,3,ORANGE)
text('Sua carga.',M,157,42,WHITE,True)
text('Do jeito certo,',M,207,42,WHITE,True)
text('do início ao fim.',M,257,42,GOLD,True)
text('Transporte, armazenagem e movimentação de cargas.',M,319,11.5,'#cfdee2')
photo('transporte-bobinas.jpg',0,350,W,W*900/1600,DEEP)
stats_y=350+W*900/1600
rect(0,stats_y,W,101,WHITE)
stats=[('20+','Equipamentos na frota'),('3.000+','Serviços realizados'),('15+','Clientes atendidos')]
col=CW/3
for i,(value,label) in enumerate(stats):
    x=M+i*col
    if i:rect(x-14,stats_y+22,0.7,57,LINE)
    text(value,x,stats_y+16,31,NAVY,True)
    rect(x,stats_y+59,19,2,ORANGE)
    text(label,x,stats_y+70,9.6,MUTED)
footer(1,True);c.showPage()

# Page 2: an editorial list preserves service detail without bulky cards.
section_header('02','Nossos serviços',['Estrutura que acompanha','sua operação.'])
para('Frota própria e apoio em cada etapa, do transporte ao atendimento da carga no terminal.',
    M,146,CW,11,max_height=32)
cards=[
('Cargas especiais','carregamento-caminhao.jpg',
 'Transporte de cargas com peso e dimensões especiais e produtos siderúrgicos. Apoio às licenças rodoviárias (AET) e à escolta.'),
('Contêineres e carga geral','bobinas-aco.jpg',
 'Transporte de contêineres, contêiner próprio tipo baú e carga geral com lotação completa.'),
('Armazenagem','armazem-paletes.jpg',
 'Armazém coberto para cargas, armazenagem de carga geral e espaço para depot de contêineres vazios.'),
('Movimentação de cargas','container-carga.jpg',
 'Desova, ovação, carregamento, descarregamento, paletização e preparação de cargas. Relatórios fotográficos dos serviços.')]
for i,(title,img,body) in enumerate(cards):
    y=195+i*136
    photo(img,M,y,174,112)
    text(str(i+1).zfill(2),231,y+1,9,'#884300',True)
    text(title,231,y+20,16,NAVY,True)
    para(body,231,y+49,W-M-231,11,leading=15.5,max_height=64)
    if i<3:rect(M,y+124,CW,0.6,LINE)
rect(M,752,CW,34,DEEP,5)
text('NO TERMINAL',M+13,764,8.5,GOLD,True)
text('Empilhadeiras próprias de 2,5 e 7 toneladas.',M+108,761,11,WHITE,True)
footer(2);c.showPage()

# Page 3: actionable contact details, a scannable WhatsApp QR and exact location.
section_header('03','Contato e atendimento',['Vamos planejar sua','próxima operação.'])
para('Informe o serviço, as características da carga, a origem e o destino. Peso, dimensões e data desejada ajudam nossa equipe a avaliar a operação.',
    M,151,CW,11.5,leading=16,max_height=48)
rect(M,216,CW,184,DEEP,10)
text('FALE COM O COMERCIAL',M+20,233,9,GOLD,True)
text('Luiz Antonio',M+20,256,24,WHITE,True)
text('(85) 9 9175-3831',M+20,292,21,WHITE,True)
button('Solicitar cotação pelo WhatsApp',WHATSAPP,M+20,340,258,37)
rect(425,245,114,114,WHITE,6)
qr(WHATSAPP,430,250,104)
text('Aponte a câmera',435,369,9,'#cfdee2')

for x,title,name,phone,number in [
    (M,'Operacional','Equipe operacional','(85) 9 9985-0477','5585999850477'),
    (307,'Financeiro','Larissa Gaspar','(85) 9 9944-3284','5585999443284')]:
    rect(x,421,252,112,PALE,7)
    rect(x+16,438,18,2,ORANGE)
    text(title,x+16,451,13,NAVY,True)
    text(name,x+16,474,10.5,MUTED)
    link(phone,'https://wa.me/'+number,x+16,494,218,14)

photo('bobinas-aco.jpg',M,560,235,123)
text('Nosso terminal',293,559,17,NAVY,True)
para('Rodovia CE 155, 16.226<br/>Distrito Industrial, Caucaia-CE<br/>Em frente à fábrica do Cimento Apodi.',
    293,589,266,10.5,leading=16,max_height=53)
link('Como chegar pelo Google Maps',DIRECTIONS,293,650,265,10.5)
rect(M,710,3,65,ORANGE)
text('Nordeste e parte da região Norte',M+16,710,18,NAVY,True)
para('Terminal em Caucaia-CE. Consulte a disponibilidade de atendimento para sua rota com o comercial.',
    M+16,742,CW-16,11,max_height=34)
footer(3);c.showPage()
c.save()

pdf=PdfReader(str(OUT))
assert len(pdf.pages)==3
alltext='\n'.join(p.extract_text() for p in pdf.pages)
required=[
 'Nordeste e parte da região Norte','Luiz Antonio','Larissa Gaspar',
 '9 9985-0477','9 9944-3284','9 9175-3831','58.180.321/0001-03',
 'Cargas especiais','Contêineres e carga geral','Armazenagem',
 'Movimentação de cargas','2,5 e 7 toneladas','3.000+','20+','15+']
for phrase in required:
    assert phrase in alltext,phrase
assert '9192-9356' not in alltext
urls=[a.get_object()['/A']['/URI'] for p in pdf.pages for a in p.get('/Annots',[])
    if a.get_object().get('/A',{}).get('/URI')]
for url in [SITE,WHATSAPP,DIRECTIONS,'https://wa.me/5585999850477','https://wa.me/5585999443284']:
    assert url in urls,url
print({'pages':len(pdf.pages),'bytes':OUT.stat().st_size,'links':len(urls),'output':str(OUT)})
