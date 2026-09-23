(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cs = getComputedStyle(document.documentElement), T = {};
  ['--plate','--sky','--on-plate','--plate-line'].forEach(function(k){ T[k]=cs.getPropertyValue(k).trim(); });
  var MONO='"IBM Plex Mono", monospace', S=2;

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
    fx.save(); fx.translate(cx+ux*170+uy*30, cy+uy*170-ux*30); fx.rotate(ang); fx.fillStyle=T['--on-plate']; fx.font=(13*S)+'px '+MONO; fx.textAlign='center'; fx.fillText('feature direction',0,0); fx.restore();
    fx.fillStyle=T['--on-plate']; fx.beginPath(); fx.arc(p.x,p.y,5*S,0,7); fx.fill();
    var footX=cx+ux*p.along, footY=cy+uy*p.along;
    fx.setLineDash([5*S,5*S]); fx.strokeStyle=T['--on-plate']; fx.lineWidth=1.2*S; fx.beginPath(); fx.moveTo(p.x,p.y); fx.lineTo(p.x+(footX-p.x)*e,p.y+(footY-p.y)*e); fx.stroke(); fx.setLineDash([]);
    fx.globalAlpha=e; fx.beginPath(); fx.arc(footX,footY,4*S,0,7); fx.fill();
    var v=(p.along-minA)/(maxA-minA), bx=44, by=FH-64, bw=300, bh=10*S;
    fx.strokeStyle=T['--plate-line']; fx.lineWidth=1*S; fx.strokeRect(bx,by,bw,bh); fx.fillStyle=T['--on-plate']; fx.fillRect(bx,by,bw*v*e,bh);
    fx.font=(13*S)+'px '+MONO; fx.textAlign='left'; fx.fillText('activation  '+(v*e).toFixed(2), bx, by-12); fx.globalAlpha=1;
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
    tx.font=(13*S)+'px '+MONO; tx.textAlign='left'; tx.fillText('taxi',px+10*S,py+5*S); tx.fillText('goal',g.x+12*S,g.y-10*S);
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
        var nodes=[{n:'Eiffel Tower',y:cym-95},{n:'Paris',y:cym+95}], rel=['is in'], nx=cxm-60;
        for (var k=0;k<1;k++){
          el('line',{x1:nx,y1:nodes[k].y+34,x2:nx,y2:nodes[k+1].y-34,stroke:hot,'stroke-width':2.5,'stroke-dasharray':'6 6'},g);
          el('path',{d:'M'+(nx-6)+' '+(nodes[k+1].y-44)+'L'+nx+' '+(nodes[k+1].y-34)+'L'+(nx+6)+' '+(nodes[k+1].y-44),fill:'none',stroke:hot,'stroke-width':2.5},g);
          var rl=el('text',{x:nx-16,y:(nodes[k].y+nodes[k+1].y)/2+6,'text-anchor':'end',fill:sky,'font-family':MONO,'font-size':16},g); rl.textContent=rel[k];
        }
        nodes.forEach(function(nd,k){
          // each one is a feature: a direction, drawn like the first panel, with a few points along it
          var fa=-0.7, fx2=Math.cos(fa), fy2=Math.sin(fa);
          for (var q=0;q<7;q++){ var al=(q-3)*7+gauss()*3, ac=gauss()*5; el('circle',{cx:(nx+fx2*al-fy2*ac).toFixed(1),cy:(nd.y+fy2*al+fx2*ac).toFixed(1),r:2.4,fill:sky,opacity:.9},g); }
          el('line',{x1:nx-fx2*26,y1:nd.y-fy2*26,x2:nx+fx2*26,y2:nd.y+fy2*26,stroke:hot,'stroke-width':2.5},g);
          var hx3=nx+fx2*26, hy3=nd.y+fy2*26;
          el('path',{d:'M'+(hx3-fx2*9+fy2*5)+' '+(hy3-fy2*9-fx2*5)+'L'+hx3+' '+hy3+'L'+(hx3-fx2*9-fy2*5)+' '+(hy3-fy2*9+fx2*5),fill:'none',stroke:hot,'stroke-width':2.5},g);
          var tl=el('text',{x:nx+40,y:nd.y+2,fill:hot,'font-family':MONO,'font-size':19},g); tl.textContent=nd.n;
          var tf=el('text',{x:nx+40,y:nd.y+22,fill:sky,'font-family':MONO,'font-size':14},g); tf.textContent='feature';
        });
      } else {
        var ins=[[cxm-120,cym-80],[cxm-120,cym],[cxm-120,cym+80]], mid=[[cxm,cym-40],[cxm,cym+40]], out=[cxm+120,cym];
        ins.forEach(function(p2){ mid.forEach(function(m2){ el('line',{x1:p2[0],y1:p2[1],x2:m2[0],y2:m2[1],stroke:sky,'stroke-width':2,opacity:.7},g); }); });
        mid.forEach(function(m2){ el('line',{x1:m2[0],y1:m2[1],x2:out[0],y2:out[1],stroke:hot,'stroke-width':3},g); });
        ins.forEach(function(p2){ el('circle',{cx:p2[0],cy:p2[1],r:8,fill:sky},g); });
        mid.forEach(function(m2){ el('rect',{x:m2[0]-12,y:m2[1]-12,width:24,height:24,fill:hot},g); });
        el('circle',{cx:out[0],cy:out[1],r:11,fill:hot},g);
      }
      var lab=el('text',{x:cxm,y:700,'text-anchor':'middle',fill:hot,'font-family':MONO,'font-size':22},g); lab.textContent=TIERS[t].name;
    }
  })();
  var tiersCap=document.getElementById('tiersCap'), tierDefault=tiersCap.textContent;
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
    var g=el('g',{},rf), P={}, FS=19;
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
      return {track:track,knob:knob,lab:lab};
    });
    function node(x,y,label,side){ var c=el('circle',{cx:x,cy:y,r:15,fill:hot,stroke:sky,'stroke-width':2.5},g); var l=txt(side==='l'?x-28:x+28,y+7,label,{a:side==='l'?'end':'start'}); return {c:c,l:l}; }
    P.mj=node(MJ.x,MJ.y,'Michael Jordan','r');
    P.out=OUT.map(function(o,k){ return node(o.x,OY,o.n,k===0?'l':'r'); });
    function on(elm,yes,dim){ elm.style.transition='opacity .25s'; elm.style.opacity=yes?1:dim; }
    function lit(c,yes){ c.setAttribute('fill',yes?hot:plate); c.setAttribute('stroke',sky); c.setAttribute('stroke-width',yes?0:2.5); }
    function draw(){
      var both=st.michael&&st.jordan, any=st.michael||st.jordan;
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
  mc.addEventListener('mousemove', function(ev){ var m=canvasPos(mc,ev), best=null, bd=1e9; REG.forEach(function(r,i){ var q=proj(r.c), d=Math.hypot(q.x-m.x,q.y-m.y); if (d<bd){bd=d;best=i;} }); var nh = bd<150 ? best : null; if (nh!==mhover){ mhover=nh; drawMind(); } });
  mc.addEventListener('mouseleave', function(){ if (mhover!==null){ mhover=null; drawMind(); } });
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
    mx.save(); mx.translate((c0.x+c1.x)/2,(c0.y+c1.y)/2); mx.rotate(ang2); mx.fillStyle=T['--on-plate']; mx.font=(13*S)+'px '+MONO; mx.textAlign='center'; mx.fillText('persona vector',0,-14); mx.restore(); mx.globalAlpha=1;
    // the regions, drawn back to front by depth
    var all=[]; REG.forEach(function(r,i){ r.pts.forEach(function(p){ var q=proj(p); all.push({q:q,i:i}); }); });
    all.sort(function(a,b){ return a.q.d-b.q.d; });
    all.forEach(function(e){ var lit=(mhover===e.i); mx.fillStyle=lit?T['--on-plate']:T['--sky']; mx.globalAlpha=lit?.95:(mhover===null?.75:.35); mx.beginPath(); mx.arc(e.q.x,e.q.y,(lit?3.2:2.6)*S,0,7); mx.fill(); });
    mx.globalAlpha=1;
    // labels: always a faint dot marker; the name appears on hover
    REG.forEach(function(r,i){ var q=proj(r.c); if (mhover===i){
      var top=1e9; r.pts.forEach(function(p){ var pq=proj(p); if (pq.y<top) top=pq.y; });
      mx.fillStyle=T['--on-plate']; mx.font=(15*S)+'px '+MONO; mx.textAlign='center'; mx.fillText(r.name, q.x, top-26);
      mx.strokeStyle=T['--on-plate']; mx.lineWidth=1*S; mx.globalAlpha=.5; mx.beginPath(); mx.moveTo(q.x,top-14); mx.lineTo(q.x,top-4); mx.stroke(); mx.globalAlpha=1;
    } });
    mx.fillStyle=T['--on-plate']; mx.font=(13*S)+'px '+MONO; mx.textAlign='left'; mx.globalAlpha=.85; mx.fillText('persona space', 44, MH-44); mx.globalAlpha=1;
  }
  drawMind();
  })();
})();
