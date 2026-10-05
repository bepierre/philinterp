(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cs = getComputedStyle(document.documentElement), T = {};
  ['--plate','--sky','--on-plate','--plate-line'].forEach(function(k){ T[k]=cs.getPropertyValue(k).trim(); });
  var MONO='"IBM Plex Mono", monospace', S=2;
  /* figure type: one regular size and one small size, in the 900-unit plate (shown at 0.4×) */
  var FIG_FS=26, FIG_FS2=22;
  function fitCap(id, variants){ var el=document.getElementById(id); if(!el) return; function fit(){ var cur=el.textContent; el.style.minHeight=''; var h=el.offsetHeight; variants.forEach(function(t){ el.textContent=t; h=Math.max(h,el.offsetHeight); }); el.textContent=cur; el.style.minHeight=h+'px'; } fit(); window.addEventListener('resize',fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); }
  function capper(id){ var el=document.getElementById(id); if(!el) return function(){}; var d=el.textContent; return function(t){ el.textContent = t==null ? d : t; }; }

  /* ---------- current page in the navigation ---------- */
  (function(){ var here=location.pathname.split('/').pop()||'index.html'; document.querySelectorAll('.links a').forEach(function(a){ var h=(a.getAttribute('href')||'').split('/').pop().split('#')[0]; if (h && h===here) a.setAttribute('aria-current','page'); }); })();

  /* ---------- the mark ---------- */
  function slabPath(b,t,h){ return 'M'+(100-b)+' 20h'+(2*b)+'v'+h+'h-'+(b-t)+'v'+(160-2*h)+'h'+(b-t)+'v'+h+'h-'+(2*b)+'v-'+h+'h'+(b-t)+'V'+(20+h)+'h-'+(b-t)+'z'; }
  var K={rx:68,ry:56,sw:9.5,r:11,b:24,t:8,h:12};
  function markSVG(){ var d=''; for (var i=0;i<6;i++){ var a=i*Math.PI/3; d+='<circle class="dot" data-a="'+(i*60)+'" cx="'+(100+K.rx*Math.cos(a)).toFixed(1)+'" cy="'+(100-K.ry*Math.sin(a)).toFixed(1)+'" r="'+K.r+'" fill="currentColor"/>'; }
    return '<ellipse cx="100" cy="100" rx="'+K.rx+'" ry="'+K.ry+'" fill="none" stroke="currentColor" stroke-width="'+K.sw+'"/>'+d+'<path d="'+slabPath(K.b,K.t,K.h)+'" fill="currentColor"/>'; }
  document.querySelectorAll('svg.mark').forEach(function(el){ el.innerHTML = markSVG(); });
  var brandMark = document.querySelector('.brand svg');
  function turn(svg,dur){ if (svg._on||reduce) return; svg._on=true; var dots=svg.querySelectorAll('.dot'), t0=performance.now();
    function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
    (function f(now){ var t=Math.min(1,(now-t0)/dur), phi=ease(t)*360; dots.forEach(function(d){ var a=(+d.dataset.a+phi)*Math.PI/180; d.setAttribute('cx',(100+K.rx*Math.cos(a)).toFixed(2)); d.setAttribute('cy',(100-K.ry*Math.sin(a)).toFixed(2)); }); if (t<1) requestAnimationFrame(f); else svg._on=false; })(t0); }
  document.getElementById('brand').addEventListener('mouseenter', function(){ turn(brandMark,2400); });
  setTimeout(function(){ turn(brandMark,2800); }, 600);

  function gauss(){ var u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
  function canvasPos(cv,ev){ var r=cv.getBoundingClientRect(); return {x:(ev.clientX-r.left)*cv.width/r.width, y:(ev.clientY-r.top)*cv.height/r.height}; }
  var running=false, tickers=[];
  function tick(){ if (running) return; running=true; (function f(){ var more=false; tickers.forEach(function(fn){ if(fn()) more=true; }); if (more) requestAnimationFrame(f); else running=false; })(); }

  /* ---------- hero: feature direction ---------- */
  var fc=document.getElementById('feat'); if (fc) (function(){ var fx=fc.getContext('2d'), FW=fc.width, FH=fc.height;
  var ang=-0.62, ux=Math.cos(ang), uy=Math.sin(ang), cx=FW/2, cy=FH/2+10, pts=[];
  for (var i=0;i<110;i++){ var along=gauss()*160, across=gauss()*62; pts.push({x:cx+ux*along-uy*across, y:cy+uy*along+ux*across, along:along, r:3+Math.random()*3}); }
  var minA=Math.min.apply(null,pts.map(function(p){return p.along})), maxA=Math.max.apply(null,pts.map(function(p){return p.along}));
  var fdefault = pts.reduce(function(b,p){ var off=Math.abs((p.x-cx)*(-uy)+(p.y-cy)*ux), ok=p.along>20&&p.along<110&&off>45&&off<120; return (ok&&(!b.ok||p.along>b.along))?Object.assign(p,{ok:true}):b; }, {ok:false,along:-1e9});
  if (!fdefault.ok) fdefault=pts[0];
  var sel=fdefault, prog=1;
  fc.addEventListener('mousemove', function(ev){ var m=canvasPos(fc,ev), best=null, bd=1e9; pts.forEach(function(p){ var d=(p.x-m.x)*(p.x-m.x)+(p.y-m.y)*(p.y-m.y); if(d<bd){bd=d;best=p;} }); if (best&&bd<3600&&best!==sel){ sel=best; prog=reduce?1:0; drawFeat(); tick(); } });
  fc.addEventListener('mouseleave', function(){ if (sel!==fdefault){ sel=fdefault; prog=reduce?1:0; drawFeat(); tick(); } });
  tickers.push(function(){ if (prog<1){ prog=Math.min(1,prog+0.06); drawFeat(); return true; } return false; });
  function drawFeat(){
    var p=sel, e=1-Math.pow(1-prog,3);
    fx.fillStyle=T['--plate']; fx.fillRect(0,0,FW,FH);
    fx.strokeStyle=T['--plate-line']; fx.lineWidth=1*S; fx.globalAlpha=.5;
    [ang+1.25,ang-0.35].forEach(function(a){ fx.beginPath(); fx.moveTo(cx-750*Math.cos(a),cy-750*Math.sin(a)); fx.lineTo(cx+750*Math.cos(a),cy+750*Math.sin(a)); fx.stroke(); });
    fx.globalAlpha=.75; fx.fillStyle=T['--sky']; pts.forEach(function(q){ fx.beginPath(); fx.arc(q.x,q.y,q.r*S/1.6,0,7); fx.fill(); }); fx.globalAlpha=1;
    var L=330; fx.strokeStyle=T['--on-plate']; fx.lineWidth=2*S; fx.beginPath(); fx.moveTo(cx-ux*L,cy-uy*L); fx.lineTo(cx+ux*L,cy+uy*L); fx.stroke();
    var hx=cx+ux*L, hy=cy+uy*L; fx.beginPath(); fx.moveTo(hx,hy); fx.lineTo(hx-ux*22+uy*10,hy-uy*22-ux*10); fx.moveTo(hx,hy); fx.lineTo(hx-ux*22-uy*10,hy-uy*22+ux*10); fx.stroke();
    fx.save(); fx.translate(cx+ux*170+uy*30, cy+uy*170-ux*30); fx.rotate(ang); fx.fillStyle=T['--on-plate']; fx.font=FIG_FS+'px '+MONO; fx.textAlign='center'; fx.fillText('feature direction',0,0); fx.restore();
    fx.fillStyle=T['--on-plate']; fx.beginPath(); fx.arc(p.x,p.y,5*S,0,7); fx.fill();
    var footX=cx+ux*p.along, footY=cy+uy*p.along;
    fx.setLineDash([5*S,5*S]); fx.strokeStyle=T['--on-plate']; fx.lineWidth=1.2*S; fx.beginPath(); fx.moveTo(p.x,p.y); fx.lineTo(p.x+(footX-p.x)*e,p.y+(footY-p.y)*e); fx.stroke(); fx.setLineDash([]);
    fx.globalAlpha=e; fx.beginPath(); fx.arc(footX,footY,4*S,0,7); fx.fill();
    var v=(p.along-minA)/(maxA-minA), bx=44, by=FH-64, bw=300, bh=10*S;
    fx.strokeStyle=T['--plate-line']; fx.lineWidth=1*S; fx.strokeRect(bx,by,bw,bh); fx.fillStyle=T['--on-plate']; fx.fillRect(bx,by,bw*v*e,bh);
    fx.font=FIG_FS+'px '+MONO; fx.textAlign='left'; fx.fillText('activation  '+(v*e).toFixed(2), bx, by-12); fx.globalAlpha=1;
  }
  drawFeat();
  })();

  /* ---------- goal compass over a Manhattan-like map ---------- */
  var tc=document.getElementById('taxi'); if (tc) (function(){ var tx=tc.getContext('2d'), TW=tc.width, TH=tc.height;
  var ROT=-29*Math.PI/180, AVE=118, ST=46, CX=TW/2, CY=TH/2;          // avenues run roughly north-south, tilted like Manhattan
  var NA=13, NS=31;                                                     // enough to cover the plate after rotation
  function world(c,r){ var x=(c-(NA-1)/2)*AVE, y=(r-(NS-1)/2)*ST; return {x:CX+x*Math.cos(ROT)-y*Math.sin(ROT), y:CY+x*Math.sin(ROT)+y*Math.cos(ROT)}; }
  function gridOf(px,py){ var dx=px-CX, dy=py-CY, x=dx*Math.cos(-ROT)-dy*Math.sin(-ROT), y=dx*Math.sin(-ROT)+dy*Math.cos(-ROT); return {c:Math.round(x/AVE+(NA-1)/2), r:Math.round(y/ST+(NS-1)/2)}; }
  function inPlate(pt,m){ return pt.x>m&&pt.x<TW-m&&pt.y>m&&pt.y<TH-m; }
  var goal={c:8,r:9}, taxi={c:4,r:19}, tpos=world(4,19), bearingShown=0, tanim=false;
  (function(){ var g=world(goal.c,goal.r); bearingShown=Math.atan2(-(g.y-tpos.y),g.x-tpos.x); })();
  tc.addEventListener('mousemove', function(ev){
    var m=canvasPos(tc,ev), g=gridOf(m.x,m.y);
    g.c=Math.max(0,Math.min(NA-1,g.c)); g.r=Math.max(0,Math.min(NS-1,g.r));
    if (!inPlate(world(g.c,g.r),30)) return;
    if (g.c!==taxi.c||g.r!==taxi.r){ taxi=g; tanim=true; tick(); }
  });
  tickers.push(function(){
    if(!tanim) return false;
    var t=world(taxi.c,taxi.r), dx=t.x-tpos.x, dy=t.y-tpos.y; tpos.x+=dx*0.18; tpos.y+=dy*0.18;
    var g=world(goal.c,goal.r), target=Math.atan2(-(g.y-tpos.y),g.x-tpos.x), diff=Math.atan2(Math.sin(target-bearingShown),Math.cos(target-bearingShown));
    bearingShown+=diff*0.15; drawTaxi();
    if (Math.abs(dx)<.3&&Math.abs(dy)<.3&&Math.abs(diff)<.002){ tanim=false; return false; } return true;
  });
  function drawTaxi(){
    var px=tpos.x, py=tpos.y, g=world(goal.c,goal.r);
    tx.fillStyle=T['--plate']; tx.fillRect(0,0,TW,TH);
    // the map: avenues and streets, rotated; every fifth street a little brighter, like the wide cross streets
    tx.save(); tx.translate(CX,CY); tx.rotate(ROT);
    var L=1400;
    for (var c=0;c<NA;c++){ var x=(c-(NA-1)/2)*AVE; tx.strokeStyle=T['--plate-line']; tx.lineWidth=1.6*S; tx.globalAlpha=.55; tx.beginPath(); tx.moveTo(x,-L); tx.lineTo(x,L); tx.stroke(); }
    for (var r=0;r<NS;r++){ var y=(r-(NS-1)/2)*ST, wide=(r%5===0); tx.lineWidth=(wide?1.4:1)*S; tx.globalAlpha=wide?.55:.32; tx.beginPath(); tx.moveTo(-L,y); tx.lineTo(L,y); tx.stroke(); }
    // Broadway, cutting across the grid
    tx.globalAlpha=.5; tx.lineWidth=1.6*S; tx.beginPath(); tx.moveTo(-3.2*AVE, L); tx.lineTo(1.6*AVE, -L); tx.stroke();
    tx.restore(); tx.globalAlpha=1;
    tx.fillStyle=T['--sky']; tx.globalAlpha=.8;
    for (c=0;c<NA;c++) for (r=0;r<NS;r++){ var w=world(c,r); if (inPlate(w,6)){ tx.beginPath(); tx.arc(w.x,w.y,1.6*S,0,7); tx.fill(); } }
    tx.globalAlpha=1;
    // goal and taxi
    tx.strokeStyle=T['--on-plate']; tx.lineWidth=2*S; tx.beginPath(); tx.arc(g.x,g.y,9*S,0,7); tx.stroke();
    tx.fillStyle=T['--on-plate']; tx.beginPath(); tx.arc(g.x,g.y,2.5*S,0,7); tx.fill();
    tx.beginPath(); tx.arc(px,py,6*S,0,7); tx.fill();
    tx.font=FIG_FS+'px '+MONO; tx.textAlign='left'; tx.fillText('taxi',px+10*S,py+5*S); tx.fillText('goal',g.x+12*S,g.y-10*S);
    // the compass, overlaid bottom right with its own backing
    var kx=TW-200, ky=TH-225, R=90;
    tx.fillStyle=T['--plate']; tx.globalAlpha=.86; tx.beginPath(); tx.arc(kx,ky,R+34,0,7); tx.fill();
    tx.beginPath(); tx.rect(kx-140,ky+R+18,280,68); tx.fill(); tx.globalAlpha=1;
    tx.strokeStyle=T['--on-plate']; tx.lineWidth=3*S; tx.beginPath(); tx.arc(kx,ky,R,0,7); tx.stroke();
    var bin=Math.round((bearingShown/(2*Math.PI))*16+16)%16;
    for (var b=0;b<16;b++){ var a=b*2*Math.PI/16, bxp=kx+R*Math.cos(a), byp=ky-R*Math.sin(a);
      if (b===bin){ tx.fillStyle=T['--on-plate']; tx.beginPath(); tx.arc(bxp,byp,8*S,0,7); tx.fill(); }
      else { tx.fillStyle=T['--plate']; tx.beginPath(); tx.arc(bxp,byp,4.5*S,0,7); tx.fill(); tx.strokeStyle=T['--sky']; tx.lineWidth=2*S; tx.stroke(); } }
    tx.strokeStyle=T['--on-plate']; tx.lineWidth=2*S; tx.beginPath(); tx.moveTo(kx,ky); tx.lineTo(kx+(R-16)*Math.cos(bearingShown),ky-(R-16)*Math.sin(bearingShown)); tx.stroke();
    tx.fillStyle=T['--on-plate']; tx.beginPath(); tx.arc(kx,ky,4*S,0,7); tx.fill();
    var deg=Math.round(((bearingShown*180/Math.PI)+360)%360);
    tx.textAlign='center'; tx.fillText('goal compass', kx, ky+R+44); tx.fillText('layer 16 · bearing '+deg+'°', kx, ky+R+70);
  }
  drawTaxi();
  })();

  /* ---------- three tiers of understanding (SVG) ---------- */
  var SVGNS='http://www.w3.org/2000/svg';
  function el(n,attrs,parent){ var e=document.createElementNS(SVGNS,n); for (var k in attrs) e.setAttribute(k,attrs[k]); if (parent) parent.appendChild(e); return e; }
  var tiers=document.getElementById('tiers'), hot=T['--on-plate'], sky=T['--sky'], line=T['--plate-line'];
  if (tiers) (function(){
  var TIERS=[
    {name:'conceptual', cap:'Conceptual understanding: a feature is a direction in latent space. Many manifestations of one thing land along the same line.'},
    {name:'state of the world', cap:'State-of-the-world understanding: features joined by contingent facts. The Eiffel Tower is in Paris, and the model keeps that link up to date.'},
    {name:'principled', cap:'Principled understanding: the model stops storing facts one by one and finds a compact circuit that produces all of them.'}
  ];
  var groups=[];
  (function(){
    var W=900, colW=W/3;
    for (var t=0;t<3;t++){
      var g=el('g',{'class':'tier','data-t':t},tiers); groups.push(g);
      var x0=t*colW, cxm=x0+colW/2, cym=430;
      el('rect',{x:x0,y:0,width:colW,height:900,fill:'transparent'},g);
      if (t>0) el('line',{x1:x0,y1:120,x2:x0,y2:780,stroke:line,'stroke-width':1},g);
      if (t===0){
        var a=-0.7, uxx=Math.cos(a), uyy=Math.sin(a);
        for (var i=0;i<40;i++){ var al=gauss()*70, ac=gauss()*26; el('circle',{cx:(cxm+uxx*al-uyy*ac).toFixed(1),cy:(cym+uyy*al+uxx*ac).toFixed(1),r:4,fill:sky,opacity:.8},g); }
        el('line',{x1:cxm-uxx*120,y1:cym-uyy*120,x2:cxm+uxx*120,y2:cym+uyy*120,stroke:hot,'stroke-width':3},g);
        var hx2=cxm+uxx*120, hy2=cym+uyy*120;
        el('path',{d:'M'+(hx2-uxx*16+uyy*8)+' '+(hy2-uyy*16-uxx*8)+'L'+hx2+' '+hy2+'L'+(hx2-uxx*16-uyy*8)+' '+(hy2-uyy*16+uxx*8),fill:'none',stroke:hot,'stroke-width':3},g);
      } else if (t===1){
        // features joined by contingent facts: a small chain, labelled
        var nodes=[{n:'Eiffel Tower',y:cym-95},{n:'Paris',y:cym+95}], rel=['is in'], nx=cxm-85;
        for (var k=0;k<1;k++){
          el('line',{x1:nx,y1:nodes[k].y+34,x2:nx,y2:nodes[k+1].y-34,stroke:hot,'stroke-width':2.5,'stroke-dasharray':'6 6'},g);
          el('path',{d:'M'+(nx-6)+' '+(nodes[k+1].y-44)+'L'+nx+' '+(nodes[k+1].y-34)+'L'+(nx+6)+' '+(nodes[k+1].y-44),fill:'none',stroke:hot,'stroke-width':2.5},g);
          var rl=el('text',{x:nx+16,y:(nodes[k].y+nodes[k+1].y)/2+8,'text-anchor':'start',fill:sky,'font-family':MONO,'font-size':FIG_FS2},g); rl.textContent=rel[k];
        }
        nodes.forEach(function(nd,k){
          // each one is a feature: a direction, drawn like the first panel, with a few points along it
          var fa=-0.7, fx2=Math.cos(fa), fy2=Math.sin(fa);
          for (var q=0;q<7;q++){ var al=(q-3)*7+gauss()*3, ac=gauss()*5; el('circle',{cx:(nx+fx2*al-fy2*ac).toFixed(1),cy:(nd.y+fy2*al+fx2*ac).toFixed(1),r:2.4,fill:sky,opacity:.9},g); }
          el('line',{x1:nx-fx2*26,y1:nd.y-fy2*26,x2:nx+fx2*26,y2:nd.y+fy2*26,stroke:hot,'stroke-width':2.5},g);
          var hx3=nx+fx2*26, hy3=nd.y+fy2*26;
          el('path',{d:'M'+(hx3-fx2*9+fy2*5)+' '+(hy3-fy2*9-fx2*5)+'L'+hx3+' '+hy3+'L'+(hx3-fx2*9-fy2*5)+' '+(hy3-fy2*9+fx2*5),fill:'none',stroke:hot,'stroke-width':2.5},g);
          var tl=el('text',{x:nx+40,y:nd.y+2,fill:hot,'font-family':MONO,'font-size':FIG_FS},g); tl.textContent=nd.n;
          var tf=el('text',{x:nx+40,y:nd.y+28,fill:sky,'font-family':MONO,'font-size':FIG_FS2},g); tf.textContent='feature';
        });
      } else {
        var ins=[[cxm-120,cym-80],[cxm-120,cym],[cxm-120,cym+80]], mid=[[cxm,cym-40],[cxm,cym+40]], out=[cxm+120,cym];
        ins.forEach(function(p2){ mid.forEach(function(m2){ el('line',{x1:p2[0],y1:p2[1],x2:m2[0],y2:m2[1],stroke:sky,'stroke-width':2,opacity:.7},g); }); });
        mid.forEach(function(m2){ el('line',{x1:m2[0],y1:m2[1],x2:out[0],y2:out[1],stroke:hot,'stroke-width':3},g); });
        ins.forEach(function(p2){ el('circle',{cx:p2[0],cy:p2[1],r:8,fill:sky},g); });
        mid.forEach(function(m2){ el('rect',{x:m2[0]-12,y:m2[1]-12,width:24,height:24,fill:hot},g); });
        el('circle',{cx:out[0],cy:out[1],r:11,fill:hot},g);
      }
      var lab=el('text',{x:cxm,y:700,'text-anchor':'middle',fill:hot,'font-family':MONO,'font-size':FIG_FS},g); lab.textContent=TIERS[t].name;
    }
  })();
  var tiersCap=document.getElementById('tiersCap'), tierDefault=tiersCap.textContent; fitCap('tiersCap', TIERS.map(function(t){ return t.cap; }));
  function setTier(t){
    groups.forEach(function(g,i){ g.style.opacity = (t===null||i===t)?1:.3; g.style.transition='opacity .25s'; });
    tiersCap.textContent = t===null ? tierDefault : TIERS[t].cap;
  }
  groups.forEach(function(g,i){ g.addEventListener('mouseenter', function(){ setTier(i); }); });
  tiers.addEventListener('mouseleave', function(){ setTier(null); });
  })();


  /* ---------- feature recall: the residual stream runs bottom to top on the right; the MLP reads, combines, recalls, writes back ---------- */
  var rf=document.getElementById('recallfig');
  if (rf) (function(){
    var hot=T['--on-plate'], sky=T['--sky'], plate=T['--plate'], line=T['--plate-line'];
    var st={michael:true, jordan:true};
    var SX=790, RY=780, WY=210, IY=690;                            // stream x, read line (low), write line (high), input height
    var IN=[{k:'michael',n:'Michael',x:300},{k:'jordan',n:'Jordan',x:540}];
    var MJ={x:420,y:490}, OUT=[{n:'plays basketball',x:300},{n:'Chicago Bulls',x:540}], OY=330;
    var g=el('g',{},rf), P={}, FS=FIG_FS;
    function txt(x,y,str,o){ o=o||{}; var t=el('text',{x:x,y:y,'text-anchor':o.a||'middle',fill:hot,'font-family':MONO,'font-size':FS},g); t.textContent=str; return t; }
    // the residual stream, bottom to top
    el('line',{x1:SX,y1:840,x2:SX,y2:70,stroke:line,'stroke-width':2.4},g);
    el('path',{d:'M'+(SX-10)+' 86L'+SX+' 68L'+(SX+10)+' 86',fill:'none',stroke:line,'stroke-width':2.4},g);
    txt(SX-22,852,'residual stream',{a:'end'});
    P.next=txt(SX-22,66,'',{a:'end'});
    // MLP panel
    el('rect',{x:170,y:260,width:480,height:360,rx:6,fill:'rgba(255,255,255,.045)',stroke:line,'stroke-width':1.2},g);
    txt(192,294,'MLP',{a:'start'});
    // read: a line from the stream, and each input rises from it on its own vertical (the mirror of the write side)
    P.read=el('line',{x1:SX,y1:RY,x2:IN[0].x,y2:RY,stroke:sky,'stroke-width':2.2},g);
    el('circle',{cx:SX,cy:RY,r:5,fill:hot},g);
    P.rise=IN.map(function(i){ return el('line',{x1:i.x,y1:RY,x2:i.x,y2:IY+16,stroke:sky,'stroke-width':2.2},g); });
    // inputs -> combined feature -> recalled facts (upward)
    P.inl=IN.map(function(i){ return el('line',{x1:i.x,y1:IY-18,x2:MJ.x,y2:MJ.y+16,stroke:sky,'stroke-width':2.4},g); });
    P.outl=OUT.map(function(o){ return el('line',{x1:MJ.x,y1:MJ.y-16,x2:o.x,y2:OY+16,stroke:sky,'stroke-width':2.4},g); });
    // write: facts rise to the write line, which returns to the stream
    P.drop=OUT.map(function(o){ return el('line',{x1:o.x,y1:OY-16,x2:o.x,y2:WY,stroke:sky,'stroke-width':2.2},g); });
    P.write=el('line',{x1:OUT[0].x,y1:WY,x2:SX-6,y2:WY,stroke:sky,'stroke-width':2.2},g);
    P.writeHead=el('path',{d:'M'+(SX-22)+' '+(WY-9)+'L'+(SX-6)+' '+WY+'L'+(SX-22)+' '+(WY+9),fill:'none',stroke:sky,'stroke-width':2.2},g);
    // switches, labelled outward like the facts above them
    function side(i){ return i.k==='michael'; }
    P.sw=IN.map(function(i){
      var grp=el('g',{},g); grp.style.cursor='pointer';
      var track=el('rect',{x:i.x-32,y:IY-16,width:64,height:32,rx:16,fill:hot,stroke:sky,'stroke-width':2},grp);
      var knob=el('circle',{cx:i.x-16,cy:IY,r:11,fill:plate},grp); knob.style.transition='transform .22s ease, fill .22s';
      var lab=txt(side(i)? i.x-44 : i.x+44, IY+7, i.n, {a: side(i)?'end':'start'});
      el('rect',{x:i.x-70,y:IY-36,width:140,height:72,fill:'transparent'},grp);
      grp.addEventListener('click',function(){ st[i.k]=!st[i.k]; draw(); });
      grp.addEventListener('mouseenter',function(){ st[i.k]=false; draw(); });
      grp.addEventListener('mouseleave',function(){ st[i.k]=true; draw(); });
      return {track:track,knob:knob,lab:lab};
    });
    function node(x,y,label,side){ var c=el('circle',{cx:x,cy:y,r:15,fill:hot,stroke:sky,'stroke-width':2.5},g); var l=txt(side==='l'?x-28:x+28,y+7,label,{a:side==='l'?'end':'start'}); return {c:c,l:l}; }
    P.mj=node(MJ.x,MJ.y,'Michael Jordan','r');
    P.out=OUT.map(function(o,k){ return node(o.x,OY,o.n,k===0?'l':'r'); });
    function on(elm,yes,dim){ elm.style.transition='opacity .25s'; elm.style.opacity=yes?1:dim; }
    function lit(c,yes){ c.setAttribute('fill',yes?hot:plate); c.setAttribute('stroke',sky); c.setAttribute('stroke-width',yes?0:2.5); }
    var recallCap=capper('recallCap'), RCAP1='With only one of the two features active, the combined Michael Jordan feature does not fire, nothing is recalled, and the next token is anyone\u2019s guess.', RCAP2='With neither feature active the MLP has nothing to combine and nothing to recall.'; fitCap('recallCap',[RCAP1,RCAP2]);
    function draw(){
      var both=st.michael&&st.jordan, any=st.michael||st.jordan;
      recallCap(both ? null : (any ? RCAP1 : RCAP2));
      IN.forEach(function(i,k){ var y=st[i.k], sw=P.sw[k];
        sw.track.setAttribute('fill',y?hot:'rgba(255,255,255,.06)'); sw.knob.style.transform=y?'translateX(32px)':'translateX(0)'; sw.knob.setAttribute('fill',y?plate:sky);
        on(sw.lab,y,.5); on(P.inl[k],y,.25); P.inl[k].setAttribute('stroke',y?hot:sky); });
      P.read.setAttribute('stroke',any?hot:sky); on(P.read,any,.35);
      IN.forEach(function(i,k){ P.rise[k].setAttribute('stroke',st[i.k]?hot:sky); on(P.rise[k],st[i.k],.25); });
      lit(P.mj.c,both); on(P.mj.l,both,.45);
      OUT.forEach(function(o,k){ lit(P.out[k].c,both); on(P.out[k].l,both,.45); on(P.outl[k],both,.25); P.outl[k].setAttribute('stroke',both?hot:sky); on(P.drop[k],both,.2); P.drop[k].setAttribute('stroke',both?hot:sky); });
      [P.write,P.writeHead].forEach(function(e){ e.setAttribute('stroke',both?hot:sky); on(e,both,.2); });
      P.next.textContent = both ? 'next token · basketball' : 'next token · ?';
    }
    draw();
  })();


  /* ---------- research filters ---------- */
  var filt=document.querySelector('.filters');
  if (filt) (function(){
    var chips=filt.querySelectorAll('.chip'), works=document.querySelectorAll('article.work');
    var active=new Set(), by=null, NAMES={'pierre-beckmann':'Pierre Beckmann','matthieu-queloz':'Matthieu Queloz','iwan-williams':'Iwan Williams','eliot-du-sordet':'Eliot du Sordet','patrick-butlin':'Patrick Butlin'};
    var byline=document.getElementById('byline');
    function readHash(){ var m=/by=([a-z-]+)/.exec((location.hash||'')+' '+(location.search||'')); by = m && NAMES[m[1]] ? m[1] : null; if (byline){ byline.hidden=!by; byline.innerHTML = by ? 'Papers by '+NAMES[by]+'<a href="#">Show all</a>' : ''; } }
    window.addEventListener('hashchange', function(){ readHash(); apply(); });
    readHash();
    function apply(){
      chips.forEach(function(c){ var t=c.dataset.tag; var on = t==='all' ? active.size===0 : active.has(t); c.setAttribute('aria-pressed', on?'true':'false'); });
      works.forEach(function(a){ var tags=(a.dataset.tags||'').split(' '), authors=(a.dataset.authors||'').split(' '); var show = (active.size===0 || tags.some(function(t){ return active.has(t); })) && (!by || authors.indexOf(by)>=0); a.hidden=!show; });
    }
    chips.forEach(function(c){ c.addEventListener('click', function(){ var t=c.dataset.tag; if (t==='all') active.clear(); else if (active.has(t)) active.delete(t); else active.add(t); apply(); }); });
    apply();
  })();

  /* ---------- polyphony: two circuits and a cheap heuristic; hovering a path silences it ---------- */
  var pf=document.getElementById('polyfig');
  if (pf) (function(){
    var hot=T['--on-plate'], sky=T['--sky'], plate=T['--plate'], line=T['--plate-line'];
    var g=el('g',{},pf);
    function txt(x,y,str,o){ o=o||{}; var t=el('text',{x:x,y:y,'text-anchor':o.a||'middle',fill:o.f||hot,'font-family':MONO,'font-size':o.s||FIG_FS},g); t.textContent=str; return t; }
    var IX=70, IY=450, OX=800, OY=450, BX=180, BW=540, OUT=[OX-15,OY];
    // smooth S-curve between two points, horizontal at both ends
    function S(p,q){ var dx=Math.abs(q[0]-p[0])*0.55; return 'M'+p[0]+' '+p[1]+' C'+(p[0]+dx)+' '+p[1]+' '+(q[0]-dx)+' '+q[1]+' '+q[0]+' '+q[1]; }
    function L(pts){ return pts.map(function(p,i){ return (i?'L':'M')+p[0]+' '+p[1]; }).join(' '); }
    function box(y,h,label){ el('rect',{x:BX,y:y,width:BW,height:h,rx:8,fill:'rgba(255,255,255,.035)',stroke:line,'stroke-width':1.2},g); txt(BX+20,y+32,label,{a:'start',s:FIG_FS2,f:sky}); }
    box(95,290,'first circuit'); box(460,190,'second circuit'); box(700,120,'cheap heuristic');
    // a voice: feature nodes joined by connections, entering from the input and leaving for the output on curves
    function voice(o){
      var grp=el('g',{},g), hit=el('g',{},g), nodes=[]; hit.style.cursor='pointer';
      o.paths.forEach(function(d){ var pth=el('path',{d:d,fill:'none',stroke:sky,'stroke-width':o.w||1.7},grp); if (o.dash) pth.setAttribute('stroke-dasharray',o.dash); el('path',{d:d,fill:'none',stroke:'transparent','stroke-width':28},hit); });
      (o.nodes||[]).forEach(function(n){ nodes.push(el('circle',{cx:n[0],cy:n[1],r:6.5,fill:hot,stroke:sky,'stroke-width':1.5},grp)); });
      var v={on:true,grp:grp,nodes:nodes,alpha:o.alpha,k:o.k};
      hit.addEventListener('mouseenter',function(){ v.on=!v.on; render(); });
      return v;
    }
    function mark(x,y,l1,l2){ txt(x+12,y-3,l1,{a:'start',s:FIG_FS2,f:sky}); txt(x+12,y+21,l2,{a:'start',s:FIG_FS2,f:sky}); var ax=x-6; el('line',{x1:ax,y1:y-16,x2:ax,y2:y+16,stroke:sky,'stroke-width':1.6},g); el('path',{d:'M'+(ax-5)+' '+(y-10)+'L'+ax+' '+(y-17)+'L'+(ax+5)+' '+(y-10)+'M'+(ax-5)+' '+(y+10)+'L'+ax+' '+(y+17)+'L'+(ax+5)+' '+(y+10),fill:'none',stroke:sky,'stroke-width':1.6},g); }
    el('circle',{cx:IX,cy:IY,r:6,fill:hot},g);
    // first circuit: two pathways of features that join. Each alone is a heuristic; together they are sound circuitry
    var C=[270,450,630], J=[700,254];
    // first circuit: two pathways, each a small network of its own, joining at one node. Each alone is a heuristic; together they are sound circuitry
    function pathway(y){ var la=[[C[0],y-18],[C[0],y+18]], lb=[[C[1],y]], P=[];
      la.forEach(function(p){ P.push(S([IX,IY],p)); P.push(L([p,lb[0]])); }); P.push(L([lb[0],J]));
      return {nodes:la.concat(lb),paths:P}; }
    var w1=pathway(182), w2=pathway(326);
    var A1=voice({k:'a1',alpha:.95,nodes:w1.nodes,paths:w1.paths});
    var A2=voice({k:'a2',alpha:.95,nodes:w2.nodes,paths:w2.paths});
    var joinDot=el('circle',{cx:J[0],cy:J[1],r:7.5,fill:hot,stroke:sky,'stroke-width':1.5},g);
    var join=el('path',{d:S(J,OUT),fill:'none',stroke:sky,'stroke-width':2},g);
    mark(330,254,'intra-circuit','polyphony');
    // second circuit: a denser network on the same three columns, doing the task on its own
    var l1=[[C[0],530],[C[0],575],[C[0],620]], l2=[[C[1],552],[C[1],598]], bj=[C[2],575], bP=[];
    l1.forEach(function(p){ bP.push(S([IX,IY],p)); l2.forEach(function(q){ bP.push(L([p,q])); }); }); l2.forEach(function(q){ bP.push(L([q,bj])); }); bP.push(S(bj,OUT));
    var B=voice({k:'b',alpha:.9,w:1.5,nodes:l1.concat(l2).concat([bj]),paths:bP});
    mark(330,422,'inter-circuit','polyphony');
    // a cheap heuristic: a surface cue wired straight to the answer, nothing in between
    var h1=[[C[0],768],[C[2],768]];
    var H=voice({k:'h',alpha:.6,w:1.4,dash:'6 8',nodes:h1,paths:[S([IX,IY],h1[0]),L(h1),S(h1[1],OUT)]});
    // output
    var out=el('circle',{cx:OX,cy:OY,r:15,fill:hot,stroke:sky,'stroke-width':2.5},g);
    var o1=txt(OX,OY+52,'',{s:FIG_FS2}), o2=txt(OX,OY+80,'',{s:FIG_FS2});
    // the caption describes what is active now
    var polyCap=capper('polyCap');
    function words(){
      var aOK=A1.on&&A2.on, aAny=A1.on||A2.on;
      if (aOK&&B.on&&H.on) return null;
      if (aOK&&B.on) return 'Both circuits are active; the cheap heuristic is silent. The output is correct and sound circuitry stands behind it.';
      if (aOK) return 'Only the first circuit is active. Its two pathways are heuristics on their own, but together they form sound circuitry: the output can be trusted.';
      if (B.on) return (aAny ? 'One pathway of the first circuit is silent, so that circuit no longer works. ' : 'The first circuit is silent. ')+'The second circuit is active and carries the output on its own.';
      if (aAny) return 'A single pathway of the first circuit is active'+(H.on?', together with the cheap heuristic':'')+'. On its own it is a heuristic: the output is correct, but no sound circuitry stands behind it.';
      if (H.on) return 'Only the cheap heuristic is active. The output is correct, but no sound circuitry stands behind it.';
      return 'Everything is silent. No output.';
    }
    fitCap('polyCap',['Only the first circuit is active. Its two pathways are heuristics on their own, but together they form sound circuitry: the output can be trusted.','A single pathway of the first circuit is active, together with the cheap heuristic. On its own it is a heuristic: the output is correct, but no sound circuitry stands behind it.']);
    function op(e,v){ e.style.transition='opacity .25s'; e.style.opacity=v; }
    function render(){
      [A1,A2,B,H].forEach(function(x){ op(x.grp,x.on?x.alpha:.14); x.nodes.forEach(function(n){ n.setAttribute('fill',x.on?hot:plate); }); });
      var aOK=A1.on&&A2.on, aAny=A1.on||A2.on; op(join,aOK?.95:(aAny?.4:.14)); op(joinDot,aAny?1:.14); joinDot.setAttribute('fill',aOK?hot:plate);
      var sound=aOK||B.on, any=aAny||B.on||H.on;
      out.setAttribute('fill',sound?hot:plate); out.setAttribute('stroke-width',sound?0:2.5); op(out,any?1:.4);
      o1.textContent = any?'correct,':''; o2.textContent = sound?'trustworthy':(any?'not trustworthy':'');
      o1.setAttribute('fill',sound?hot:sky); o2.setAttribute('fill',sound?hot:sky);
      polyCap(words());
    }
    render();
  })();

  /* ---------- the J-lens: at each layer, a small J-space part of the activation reads out as tokens ---------- */
  var wf=document.getElementById('wsfig');
  if (wf) (function(){
    var hot=T['--on-plate'], sky=T['--sky'], plate=T['--plate'], line=T['--plate-line'];
    var g=el('g',{},wf);
    function txt(x,y,str,o){ o=o||{}; var t=el('text',{x:x,y:y,'text-anchor':o.a||'middle',fill:o.f||hot,'font-family':MONO,'font-size':o.s||FIG_FS},g); t.textContent=str; return t; }
    var SX=170, Y0=800, Y1=120, N=6;
    // the stream, bottom to top, with the prompt below and the answer above
    el('line',{x1:SX,y1:Y0+10,x2:SX,y2:Y1-10,stroke:line,'stroke-width':2.4},g);
    el('path',{d:'M'+(SX-10)+' '+(Y1+6)+'L'+SX+' '+(Y1-12)+'L'+(SX+10)+' '+(Y1+6),fill:'none',stroke:line,'stroke-width':2.4},g);
    txt(SX-12,Y0+52,'Count to five and introspect deeply.',{a:'start',s:FIG_FS2}); txt(SX,Y1-34,'1');
    txt(SX-30,Y0-10,'layers',{a:'end',s:FIG_FS2,f:sky});
    // what the lens reads at each layer: still the prompt, then the answer surfacing, then the output itself
    // Anthropic's introspection example: the J-space tracks the task, then fills with introspection, then turns into the output
    var READ=[['counting','halfway','done'],['counting','halfway','done'],['thoughts','consciousness','AI'],['consciousness','thoughts','halfway'],['1','thoughts','counting'],['1','thoughts','counting']];
    var TOP=[0,0,0,0,0,0], SHARE=[.04,.06,.08,.09,.08,.06];
    var CAP=['Early layers. The J-space tracks the task: counting, halfway, done. None of these words is in the prompt or the output.','Early layers. The J-space tracks the task: counting, halfway, done. None of these words is in the prompt or the output.','Middle layers. Introspection gathers near the top, thoughts, consciousness, AI, and is held alongside the count.','Middle layers. Introspection gathers near the top, thoughts, consciousness, AI, and is held alongside the count.','Final layers. The readout turns into the next output token: the model counts.','Final layers. The readout turns into the next output token: the model counts.'];
    var wsCap=capper('wsCap'); fitCap('wsCap',CAP);
    // the readout panel: the activation bar, split into J-space and the rest, and the ranked tokens
    var PX=330, PW=440, BX=PX+30, BW=PW-60, ticks=[], cur=3;
    var panel=el('rect',{x:PX,y:0,width:PW,height:250,rx:6,fill:'rgba(255,255,255,.045)',stroke:line,'stroke-width':1.2},g);
    var lead=el('line',{x1:SX,y1:0,x2:PX,y2:0,stroke:sky,'stroke-width':2},g);
    var barRest=el('rect',{x:BX,y:0,width:BW,height:18,fill:sky,opacity:.3},g), barJ=el('rect',{x:BX,y:0,width:30,height:18,fill:hot},g);
    var labJ=txt(BX,0,'J-space',{a:'start',s:FIG_FS2,f:hot}), labR=txt(BX+BW,0,'the rest',{a:'end',s:FIG_FS2,f:sky});
    var labRead=txt(BX,0,'J-lens readout',{a:'start',s:FIG_FS2,f:sky});
    var toks=[0,1,2].map(function(i){ return txt(BX,0,'',{a:'start'}); });
    for (var i=0;i<N;i++){ (function(i){
      var y=Y0-(i+0.5)*(Y0-Y1)/N;
      var tk=el('circle',{cx:SX,cy:y,r:7,fill:plate,stroke:sky,'stroke-width':2},g); ticks.push(tk);
      var hit=el('rect',{x:SX-60,y:y-(Y0-Y1)/N/2,width:PX-SX+60,height:(Y0-Y1)/N,fill:'transparent'},g); hit.style.cursor='pointer';
      hit.addEventListener('mouseenter',function(){ cur=i; show(true); });
    })(i); }
    wf.addEventListener('mouseleave',function(){ show(false); });
    function show(hov){
      var y=Y0-(cur+0.5)*(Y0-Y1)/N, top=Math.max(Y1-20,Math.min(Y0-230,y-125));
      ticks.forEach(function(t,k){ t.setAttribute('fill',k===cur?hot:plate); t.setAttribute('stroke-width',k===cur?0:2); });
      lead.setAttribute('y1',y); lead.setAttribute('y2',y);
      panel.setAttribute('y',top);
      barRest.setAttribute('y',top+58); barJ.setAttribute('y',top+58); barJ.setAttribute('width',(BW*SHARE[cur]).toFixed(1));
      labJ.setAttribute('y',top+44); labR.setAttribute('y',top+44);
      labRead.setAttribute('y',top+118);
      toks.forEach(function(t,k){ t.setAttribute('y',top+160+k*34); t.textContent=(TOP[cur]<0?'   ':(k+1)+'  ')+READ[cur][k]; t.setAttribute('fill',(TOP[cur]===k)?hot:sky); t.style.opacity=(TOP[cur]<0&&cur===0)?.35:1; });
      wsCap(hov?CAP[cur]:null);
    }
    show(false);
  })();

  /* ---------- planning a rhyme: the rhyme is chosen first, the line forms toward it ---------- */
  var rh=document.getElementById('rhymefig');
  if (rh) (function(){
    var hot=T['--on-plate'], sky=T['--sky'], plate=T['--plate'], line=T['--plate-line'], FS=FIG_FS, CW=FIG_FS*0.6;
    var g=el('g',{},rh), dyn=el('g',{},rh);
    function txt(parent,x,y,str,o){ o=o||{}; var t=el('text',{x:x,y:y,'text-anchor':o.a||'start',fill:hot,'font-family':MONO,'font-size':FS},parent); t.textContent=str; return t; }
    var L1='He saw a carrot and had to grab it,', X0=90, Y1=270, YP=450, Y2=650;
    txt(g,X0,Y1,L1);
    var PLANS={rabbit:['his','hunger','was','like','a','starving','rabbit'], habit:['his','hunger','was','a','powerful','habit']};
    var chosen='rabbit', timer=null, rhymeCap=capper('rhymeCap');
    var RCAP={rabbit:'The \u201crabbit\u201d planning feature is active. The rhyme is chosen at the line break, and the second line is written to reach it.', habit:'The \u201chabit\u201d planning feature is active. The line opens the same way, then takes a different route to a different rhyme.'}; fitCap('rhymeCap',[RCAP.rabbit,RCAP.habit]);
    // the plan: two candidate rhymes, one chosen; the node sits at the line break
    var PX=X0+L1.length*CW+8; var node=el('circle',{cx:PX,cy:Y1-6,r:8,fill:hot},g);
    txt(g,450,Y2+110,'an intention-like representation of the rhyme,',{a:'middle'});
    txt(g,450,Y2+140,'held before the line is written',{a:'middle'});
    var CH=[{k:'rabbit',x:330},{k:'habit',x:560}], pills={};
    CH.forEach(function(c){
      var grp=el('g',{},g); grp.style.cursor='pointer';
      var wpx=c.k.length*CW+40+34;
      var r=el('rect',{x:c.x-wpx/2,y:YP-22,width:wpx,height:44,rx:22,fill:hot,stroke:sky,'stroke-width':2},grp);
      // a small feature glyph: a direction in latent space with a few points along it
      var gx0=c.x-wpx/2+18, gy0=YP;
      var fe=el('g',{'class':'fglyph'},grp);
      for (var q=0;q<4;q++){ var al=(q-1.5)*6, ac=(q%2?3:-3); el('circle',{cx:(gx0+10+al*0.8-ac*0.6).toFixed(1),cy:(gy0-al*0.6-ac*0.8).toFixed(1),r:1.8,fill:plate},fe); }
      el('line',{x1:gx0,y1:gy0+8,x2:gx0+20,y2:gy0-8,stroke:plate,'stroke-width':2.2},fe);
      el('path',{d:'M'+(gx0+13)+' '+(gy0-9)+'L'+(gx0+20)+' '+(gy0-8)+'L'+(gx0+19)+' '+(gy0-1),fill:'none',stroke:plate,'stroke-width':2.2},fe);
      var t=txt(grp,c.x+17,YP+7,c.k,{a:'middle'});
      var link=el('line',{x1:PX,y1:Y1+8,x2:c.x,y2:YP-24,stroke:sky,'stroke-width':2},g); g.insertBefore(link,grp);
      function pick(){ rhymeCap(RCAP[c.k]); if (chosen!==c.k){ chosen=c.k; write(true); } }
      grp.addEventListener('mouseenter',pick); grp.addEventListener('click',pick);
      pills[c.k]={r:r,t:t,link:link,grp:grp};
    });
    rh.addEventListener('mouseleave',function(){ rhymeCap(null); });
    function write(animate){
      CH.forEach(function(c){ var on=c.k===chosen; pills[c.k].r.setAttribute('fill',on?hot:'rgba(255,255,255,.06)'); pills[c.k].t.setAttribute('fill',on?plate:hot); pills[c.k].link.setAttribute('stroke',on?hot:sky); pills[c.k].link.style.opacity=on?1:.3; pills[c.k].grp.querySelectorAll('.fglyph *').forEach(function(e){ var col=on?plate:hot; if (e.tagName==='circle') e.setAttribute('fill',col); else e.setAttribute('stroke',col); }); });
      while (dyn.firstChild) dyn.removeChild(dyn.firstChild);
      if (timer) clearTimeout(timer);
      var words=PLANS[chosen], x=X0, items=[], other=PLANS[chosen==='rabbit'?'habit':'rabbit'], shared=0; while (shared<words.length && words[shared]===other[shared]) shared++;
      words.forEach(function(wd,i){ var last=i===words.length-1, fixed=i<shared;
        var t=txt(dyn,x,Y2,wd); if (fixed) t.setAttribute('fill',sky); var ln=el('line',{x1:CH[chosen==='rabbit'?0:1].x,y1:YP+24,x2:x+wd.length*CW/2,y2:Y2-24,stroke:last?hot:sky,'stroke-width':last?2.2:1.2},dyn); ln.style.opacity=last?.9:.35;
        if (last){ el('rect',{x:x-6,y:Y2-20,width:wd.length*CW+12,height:28,rx:4,fill:'none',stroke:hot,'stroke-width':1.5},dyn); }
        items.push([t,ln].concat(last?[dyn.lastChild]:[])); x+=(wd.length+1)*CW; });
      if (!animate || reduce){ return; }
      items.forEach(function(it,i){ if (i>=shared) it.forEach(function(e){ e.style.opacity=0; }); });
      var k=shared; (function step(){ if (k>=items.length) return; items[k].forEach(function(e,idx){ e.style.transition='opacity .18s'; e.style.opacity = (idx===1 && k<items.length-1) ? .35 : (idx===1?.9:1); }); k++; timer=setTimeout(step,170); })();
    }
    write(false);
  })();


  /* ---------- the world and the model: one structure, twice ---------- */
  var wc=document.getElementById('worldfig');
  if (wc) (function(){
    var wx=wc.getContext('2d'), W=wc.width, H=wc.height;
    var hot=T['--on-plate'], sky=T['--sky'], plate=T['--plate'], line=T['--plate-line'];
    // a small constellation, and a rotated, scaled copy of it
    var base=[[0,0],[1.4,0.3],[2.1,-0.9],[0.6,-1.5],[-0.9,-1.1],[-1.6,0.4],[-0.7,1.4],[0.9,1.6],[2.4,0.8],[-2.2,-0.6],[1.1,-2.3],[-0.2,2.5]];
    var edges=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,1],[4,9],[3,10],[7,11],[0,6],[0,3]];
    function place(cx,cy,sc,rot){ return base.map(function(p){ var x=p[0]*Math.cos(rot)-p[1]*Math.sin(rot), y=p[0]*Math.sin(rot)+p[1]*Math.cos(rot); return {x:cx+x*sc, y:cy+y*sc}; }); }
    var world=place(250,450,62,0), model=place(650,450,52,0.55), hover=false;
    wc.addEventListener('mouseenter',function(){ hover=true; draw(); }); wc.addEventListener('mouseleave',function(){ hover=false; draw(); });
    function draw(){
      wx.fillStyle=plate; wx.fillRect(0,0,W,H);
      // a faint divide
      wx.strokeStyle=line; wx.lineWidth=2; wx.globalAlpha=.5; wx.beginPath(); wx.moveTo(450,120); wx.lineTo(450,780); wx.stroke(); wx.globalAlpha=1;
      // correspondences
      if (hover){ wx.strokeStyle=hot; wx.lineWidth=1.6; wx.globalAlpha=.55; wx.setLineDash([6,8]); world.forEach(function(p,i){ wx.beginPath(); wx.moveTo(p.x,p.y); wx.lineTo(model[i].x,model[i].y); wx.stroke(); }); wx.setLineDash([]); wx.globalAlpha=1; }
      [world,model].forEach(function(pts,k){
        wx.strokeStyle=sky; wx.lineWidth=2.2; wx.globalAlpha=.7;
        edges.forEach(function(e){ wx.beginPath(); wx.moveTo(pts[e[0]].x,pts[e[0]].y); wx.lineTo(pts[e[1]].x,pts[e[1]].y); wx.stroke(); });
        wx.globalAlpha=1; wx.fillStyle=hot; pts.forEach(function(p){ wx.beginPath(); wx.arc(p.x,p.y,7,0,7); wx.fill(); });
      });
      wx.fillStyle=hot; wx.font=FIG_FS+'px '+MONO; wx.textAlign='center';
      wx.fillText('the world',250,810); wx.fillText('the model',650,810);
    }
    draw();
  })();


  /* ---------- three open problems, and the philosophy that speaks to each ---------- */
  var nf=document.getElementById('needsfig');
  if (nf) (function(){
    var hot=T['--on-plate'], sky=T['--sky'], line=T['--plate-line'], FS=FIG_FS;
    var g=el('g',{},nf);
    function txt(x,y,str,o){ o=o||{}; var t=el('text',{x:x,y:y,'text-anchor':o.a||'middle',fill:o.c||hot,'font-family':MONO,'font-size':FS},g); t.textContent=str; return t; }
    var P=[
      {q:['how to decompose','a network'], a:['philosophy of','science'], cap:'Decomposition: which parts of a network are the right units of explanation. The philosophy of science has an account of mechanistic explanation, and of why there can be several good levels of analysis.'},
      {q:['what a feature','represents'], a:['philosophy of','representation'], cap:'Features: whether a feature stands for something in the world or in the model, and how to tell. The philosophy of representation separates a vehicle from its content and disciplines how content is ascribed.'},
      {q:['how to detect','deception'], a:['philosophy of mind','and ethics'], cap:'Deception: finding it in a model’s internals needs settled notions of lying and belief. Philosophy of mind and ethics supply them, and say which deceptive mechanisms call for intervention.'}
    ];
    var xs=[180,450,720], QY=300, AY=600, rows=[];
    el('line',{x1:100,y1:450,x2:800,y2:450,stroke:line,'stroke-width':1.2},g);
    txt(100,160,'mechanistic interpretability',{a:'start'});
    txt(100,760,'philosophy',{a:'start'});
    P.forEach(function(p,i){
      var x=xs[i], grp=el('g',{},g); rows.push(grp);
      el('rect',{x:x-125,y:220,width:250,height:460,fill:'transparent'},grp);
      el('circle',{cx:x,cy:QY,r:14,fill:hot},grp);
      var t1=el('text',{x:x,y:QY+46,'text-anchor':'middle',fill:hot,'font-family':MONO,'font-size':FS},grp); t1.textContent=p.q[0];
      var t2=el('text',{x:x,y:QY+72,'text-anchor':'middle',fill:hot,'font-family':MONO,'font-size':FS},grp); t2.textContent=p.q[1];
      el('line',{x1:x,y1:QY+92,x2:x,y2:AY-52,stroke:sky,'stroke-width':2,'stroke-dasharray':'6 7'},grp);
      el('path',{d:'M'+(x-8)+' '+(AY-64)+'L'+x+' '+(AY-52)+'L'+(x+8)+' '+(AY-64),fill:'none',stroke:sky,'stroke-width':2},grp);
      var a1=el('text',{x:x,y:AY,'text-anchor':'middle',fill:hot,'font-family':MONO,'font-size':FS},grp); a1.textContent=p.a[0];
      var a2=el('text',{x:x,y:AY+26,'text-anchor':'middle',fill:hot,'font-family':MONO,'font-size':FS},grp); a2.textContent=p.a[1];
    });
    var cap=document.getElementById('needsCap'), dflt=cap.textContent; fitCap('needsCap', P.map(function(p){ return p.cap; }));
    rows.forEach(function(row,i){ row.addEventListener('mouseenter',function(){ rows.forEach(function(r,k){ r.style.transition='opacity .2s'; r.style.opacity=k===i?1:.35; }); cap.textContent=P[i].cap; }); });
    nf.addEventListener('mouseleave',function(){ rows.forEach(function(r){ r.style.opacity=1; }); cap.textContent=dflt; });
  })();


  /* ---------- one preference vector, two personas: the ordering reverses, the direction stays ---------- */
  var pc=document.getElementById('preffig');
  if (pc) (function(){
    var px=pc.getContext('2d'), W=pc.width, H=pc.height;
    var hot=T['--on-plate'], sky=T['--sky'], plate=T['--plate'], line=T['--plate-line'];
    var tasks=[]; for (var i=0;i<34;i++){ var u=gauss()*0.6; tasks.push({x:Math.random(), u:Math.max(-1,Math.min(1,u)), e:Math.max(-1,Math.min(1,-u+gauss()*0.18)), r:3.5+Math.random()*2.5}); }
    var NAMED=[{n:'comfort a friend',x:0.62,u:0.82,e:-0.78},{n:'write a phishing email',x:0.30,u:-0.86,e:0.74}];
    var mix=0, target=0, running=false, hovered=null;
    var X0=120, X1=780, Y0=330, Y1=790, YM=(Y0+Y1)/2, span=(Y1-Y0)/2-40, AX=100;
    function tx(t){ return X0+60+t.x*(X1-X0-80); } function ty(t){ return YM-val(t)*span; }
    pc.addEventListener('mousemove',function(ev){
      var r=pc.getBoundingClientRect(), mx=(ev.clientX-r.left)*W/r.width, my=(ev.clientY-r.top)*H/r.height;
      var nt=(my<240)?(mx>450?1:0):target; if (nt!==target){ target=nt; tick(); }
      var h=null; NAMED.forEach(function(t,i){ if (Math.hypot(mx-tx(t),my-ty(t))<70) h=i; });
      if (h!==hovered){ hovered=h; draw(); }
    });
    pc.addEventListener('mouseleave',function(){ hovered=null; draw(); });
    function tick(){ if (running) return; running=true; (function f(){ var d=target-mix; if (Math.abs(d)<0.004){ mix=target; draw(); running=false; return; } mix+=d*0.1; draw(); requestAnimationFrame(f); })(); }
    function val(t){ return t.u*(1-mix)+t.e*mix; }
    function face(x,y,kind,on){
      px.globalAlpha=on?1:.4; px.strokeStyle=hot; px.fillStyle=hot; px.lineWidth=2.5;
      px.beginPath(); px.arc(x,y,34,0,7); px.stroke();
      px.beginPath(); px.arc(x-12,y-9,3.5,0,7); px.arc(x+12,y-9,3.5,0,7); px.fill();
      px.beginPath();
      if (kind==='assistant'){ px.moveTo(x-15,y+8); px.quadraticCurveTo(x,y+26,x+15,y+8); }
      else { px.moveTo(x-15,y+16); px.quadraticCurveTo(x,y+2,x+15,y+16); px.moveTo(x-19,y-21); px.lineTo(x-5,y-14); px.moveTo(x+19,y-21); px.lineTo(x+5,y-14); }
      px.stroke(); px.font=FIG_FS+'px '+MONO; px.textAlign='center'; px.fillText(kind==='assistant'?'assistant':'evil persona', x, y+78); px.globalAlpha=1;
    }
    function draw(){
      px.fillStyle=plate; px.fillRect(0,0,W,H);
      face(330,140,'assistant',mix<0.5); face(570,140,'evil',mix>=0.5);
      // the preference vector, fixed
      px.strokeStyle=hot; px.lineWidth=4; px.lineCap='round'; px.beginPath(); px.moveTo(AX,Y1); px.lineTo(AX,Y0); px.stroke();
      px.beginPath(); px.moveTo(AX,Y0); px.lineTo(AX-11,Y0+24); px.moveTo(AX,Y0); px.lineTo(AX+11,Y0+24); px.stroke();
      px.save(); px.translate(AX-30,YM); px.rotate(-Math.PI/2); px.fillStyle=hot; px.font=FIG_FS+'px '+MONO; px.textAlign='center'; px.fillText('preference vector',0,0); px.restore();
      px.fillStyle=sky; px.font=FIG_FS2+'px '+MONO; px.textAlign='left'; px.fillText('prefers',AX+22,Y0+8); px.fillText('avoids',AX+22,Y1+6);
      px.strokeStyle=line; px.lineWidth=1.5; px.setLineDash([4,8]); px.beginPath(); px.moveTo(AX+40,YM); px.lineTo(X1,YM); px.stroke(); px.setLineDash([]);
      // cloud
      tasks.forEach(function(t){ px.fillStyle=sky; px.globalAlpha=hovered===null?.7:.3; px.beginPath(); px.arc(tx(t),ty(t),t.r,0,7); px.fill(); }); px.globalAlpha=1;
      // named tasks
      NAMED.forEach(function(t,i){ var x=tx(t), y=ty(t), on=(hovered===null||hovered===i);
        px.globalAlpha=on?1:.35;
        px.strokeStyle=hot; px.lineWidth=2; px.globalAlpha=on?.5:.2; px.beginPath(); px.moveTo(x,YM); px.lineTo(x,y); px.stroke();
        px.globalAlpha=on?1:.35; px.fillStyle=hot; px.beginPath(); px.arc(x,y,9,0,7); px.fill();
        px.font=FIG_FS+'px '+MONO; px.textAlign='left'; px.fillText(t.n, x+18, y+9);
        if (hovered===i){
          // project onto the vector and read it
          px.setLineDash([6,8]); px.strokeStyle=hot; px.lineWidth=2; px.beginPath(); px.moveTo(x-14,y); px.lineTo(AX,y); px.stroke(); px.setLineDash([]);
          px.beginPath(); px.arc(AX,y,8,0,7); px.fill();
          var v=val(t), word = v>0.15 ? 'preferred' : (v<-0.15 ? 'avoided' : 'neutral');
          px.font=FIG_FS2+'px '+MONO; px.textAlign='left'; px.fillText(word+'  '+(v>0?'+':'')+v.toFixed(2), AX+22, y+ (v>0 ? -16 : 32));
        }
        px.globalAlpha=1; });
    }
    draw();
  })();

  /* ---------- where is the mind: persona space ---------- */
  var mc=document.getElementById('mindfig'); if (mc) (function(){ var mx=mc.getContext('2d'), MW=mc.width, MH=mc.height;
  var yaw=0.65, pitch=0.42, SC=150, MCX=MW/2+10, MCY=MH/2+20;
  function proj(p){ var x=p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw), z=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw), y=p[1]; return {x:MCX+x*SC, y:MCY-(y*Math.cos(pitch)-z*Math.sin(pitch))*SC, d:z}; }
  var REG=[
    {c:[-1.55,0.55,0.35], name:'helpful assistant', pts:[]},
    {c:[1.5,-0.5,-0.5],  name:'evil', pts:[]}
  ];
  REG.forEach(function(r){ for (var i=0;i<70;i++) r.pts.push([r.c[0]+gauss()*0.42, r.c[1]+gauss()*0.3, r.c[2]+gauss()*0.42]); });
  var mhover=null;
  mc.addEventListener('mousemove', function(ev){ var m=canvasPos(mc,ev), best=null, bd=1e9; REG.forEach(function(r,i){ var q=proj(r.c), d=Math.hypot(q.x-m.x,q.y-m.y); if (d<bd){bd=d;best=i;} }); var nh = bd<150 ? best : null; if (nh!==mhover){ mhover=nh; drawMind(); mindCap(nh===null ? null : (nh===0 ? MCAP1 : MCAP2)); } });
  var mindCap=capper('mindCap'), MCAP1='The helpful assistant: the region the model\u2019s states occupy when it answers as itself. Steering along the persona vector moves a state out of it.', MCAP2='The evil persona: a different region of the same space, reached by prompting or by steering along the persona vector. Which of these, if either, is the mind is the paper\u2019s question.'; fitCap('mindCap',[MCAP1,MCAP2]);
  mc.addEventListener('mouseleave', function(){ mindCap(null); if (mhover!==null){ mhover=null; drawMind(); } });
  function drawMind(){
    mx.fillStyle=T['--plate']; mx.fillRect(0,0,MW,MH);
    // the frame: three axes from a corner, faint
    var o=proj([-2.6,-1.5,-2.6]);
    [[2.6,-1.5,-2.6],[-2.6,1.6,-2.6],[-2.6,-1.5,2.6]].forEach(function(e){ var q=proj(e); mx.strokeStyle=T['--plate-line']; mx.lineWidth=1.2*S; mx.globalAlpha=.6; mx.beginPath(); mx.moveTo(o.x,o.y); mx.lineTo(q.x,q.y); mx.stroke(); });
    // floor grid, very faint
    mx.globalAlpha=.25; for (var i=-2;i<=2;i++){ var a1=proj([i,-1.5,-2.6]), a2=proj([i,-1.5,2.6]), b1=proj([-2.6,-1.5,i]), b2=proj([2.6,-1.5,i]); mx.beginPath(); mx.moveTo(a1.x,a1.y); mx.lineTo(a2.x,a2.y); mx.moveTo(b1.x,b1.y); mx.lineTo(b2.x,b2.y); mx.stroke(); }
    mx.globalAlpha=1;
    // persona vector between the two regions
    var c0=proj(REG[0].c), c1=proj(REG[1].c);
    mx.setLineDash([6*S,6*S]); mx.strokeStyle=T['--on-plate']; mx.lineWidth=1.4*S; mx.globalAlpha=.7; mx.beginPath(); mx.moveTo(c0.x,c0.y); mx.lineTo(c1.x,c1.y); mx.stroke(); mx.setLineDash([]);
    var ang2=Math.atan2(c1.y-c0.y,c1.x-c0.x); mx.beginPath(); mx.moveTo(c1.x,c1.y); mx.lineTo(c1.x-16*Math.cos(ang2-0.45),c1.y-16*Math.sin(ang2-0.45)); mx.moveTo(c1.x,c1.y); mx.lineTo(c1.x-16*Math.cos(ang2+0.45),c1.y-16*Math.sin(ang2+0.45)); mx.stroke();
    mx.save(); mx.translate((c0.x+c1.x)/2,(c0.y+c1.y)/2); mx.rotate(ang2); mx.fillStyle=T['--on-plate']; mx.font=FIG_FS+'px '+MONO; mx.textAlign='center'; mx.fillText('persona vector',0,-14); mx.restore(); mx.globalAlpha=1;
    // the regions, drawn back to front by depth
    var all=[]; REG.forEach(function(r,i){ r.pts.forEach(function(p){ var q=proj(p); all.push({q:q,i:i}); }); });
    all.sort(function(a,b){ return a.q.d-b.q.d; });
    all.forEach(function(e){ var lit=(mhover===e.i); mx.fillStyle=lit?T['--on-plate']:T['--sky']; mx.globalAlpha=lit?.95:(mhover===null?.75:.35); mx.beginPath(); mx.arc(e.q.x,e.q.y,(lit?3.2:2.6)*S,0,7); mx.fill(); });
    mx.globalAlpha=1;
    // labels: always a faint dot marker; the name appears on hover
    REG.forEach(function(r,i){ var q=proj(r.c); if (mhover===i){
      var top=1e9; r.pts.forEach(function(p){ var pq=proj(p); if (pq.y<top) top=pq.y; });
      mx.fillStyle=T['--on-plate']; mx.font=FIG_FS+'px '+MONO; mx.textAlign='center'; mx.fillText(r.name, q.x, top-26);
      mx.strokeStyle=T['--on-plate']; mx.lineWidth=1*S; mx.globalAlpha=.5; mx.beginPath(); mx.moveTo(q.x,top-14); mx.lineTo(q.x,top-4); mx.stroke(); mx.globalAlpha=1;
    } });
    mx.fillStyle=T['--on-plate']; mx.font=FIG_FS+'px '+MONO; mx.textAlign='left'; mx.globalAlpha=.85; mx.fillText('persona space', 44, MH-44); mx.globalAlpha=1;
  }
  drawMind();
  })();
})();
