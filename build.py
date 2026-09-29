#!/usr/bin/env python3
"""Build the PhilInterp site from src/. Usage: build.py [--out DIR] [--index URL --research URL --people URL --assets URL]
Without URL options, pages link to each other relatively (for deployment)."""
import sys, os, argparse
ap=argparse.ArgumentParser(); ap.add_argument('--out',default='.'); ap.add_argument('--index',default='index.html'); ap.add_argument('--research',default='research.html'); ap.add_argument('--people',default='people.html'); ap.add_argument('--events',default='events.html'); ap.add_argument('--assets',default='assets/'); ap.add_argument('--inline-images',action='store_true',help='embed assets/people/*.jpg as data URIs (for artifact review)')
a=ap.parse_args()
here=os.path.dirname(os.path.abspath(__file__)); src=lambda n: open(os.path.join(here,'src',n)).read()
links={'index':a.index,'research':a.research,'people':a.people,'events':a.events,'assets':a.assets}
parts={'style':src('style.css').rstrip(),'js':src('site.js').rstrip(),'works':src('works.html').format(**links),'nav':src('nav.html').format(**links),'footer':src('footer.html').format(**links)}
os.makedirs(a.out,exist_ok=True)
for page in ['index','research','people','events']:
    t=src(page+'.html')
    for k,v in list(parts.items())+list(links.items()): t=t.replace('{'+k+'}',v)
    if a.inline_images:
        import base64, re, glob
        for f in glob.glob(os.path.join(here,'assets','people','*.jpg')):
            uri='data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode()
            t=t.replace(a.assets+'people/'+os.path.basename(f), uri)
    open(os.path.join(a.out,page+'.html'),'w').write(t)
print('built', a.out)
