/* The guides' own parts: diagrams drawn as inline SVG from a spec (a sequence of who calls whom, a lifecycle of states,
   a decision tree, spans on a clock), a request beside its response, the certification cases as a matrix, and a readiness
   checklist the reader ticks in order. No library. Loaded by the five guide pages only. */
(function(){
  var GD=window.GD={};
  var esc=function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') };
  var lines=function(s){ return String(s).split('\n') };
  /* text with tspans for each line, anchored where asked */
  function text(x,y,s,cls,anchor){ var ls=lines(s); return '<text x="'+x+'" y="'+y+'" class="'+(cls||'')+'"'+(anchor?' text-anchor="'+anchor+'"':'')+'>'+ls.map(function(l,i){ return '<tspan x="'+x+'" dy="'+(i?16:0)+'">'+esc(l)+'</tspan>' }).join('')+'</text>' }
  /* an arrowhead at (x,y) pointing along (dx,dy) */
  function head(x,y,dx,dy){ var L=Math.sqrt(dx*dx+dy*dy)||1, ux=dx/L, uy=dy/L, px=-uy, py=ux, s=7, w=3.5; return '<polygon class="gd-head" points="'+x+','+y+' '+(x-ux*s+px*w)+','+(y-uy*s+py*w)+' '+(x-ux*s-px*w)+','+(y-uy*s-py*w)+'"/>' }
  function svg(w,h,body,label){ return '<svg class="gd-svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label||'')+'" style="min-width:'+Math.min(w,560)+'px">'+body+'</svg>' }
  function mount(el,html){ el=typeof el==='string'?document.getElementById(el):el; if(el) el.innerHTML=html; return el }

  /* ── sequence: lanes across, messages down, a note sits on one lane ───────────────────────── */
  GD.seq=function(el,spec){
    var lanes=spec.lanes, n=lanes.length, W=spec.w||640, pad=8, laneW=(W-pad*2)/n, cx=lanes.map(function(_,i){ return Math.round(pad+laneW*(i+0.5)) });
    /* each step takes the height its label needs: a line of label above the arrow, a line of caption under it, a note as tall as its lines */
    var y=64, out='', body='';
    spec.steps.forEach(function(s){ var nl=lines(s.l).length, a=cx[lanes.map(function(l){return l.k}).indexOf(s.from)], b=cx[lanes.map(function(l){return l.k}).indexOf(s.to)];
      if(s.from===s.to){ var bw=Math.round(laneW-32), bh=16*nl+14; body+='<rect class="gd-note" x="'+(a-bw/2)+'" y="'+y+'" width="'+bw+'" height="'+bh+'" rx="6"/>'+text(a,y+19,s.l,'gd-note-t','middle'); y+=bh+20; return }
      var ly=y+16*(nl-1)+12, ay=ly+10, dir=b>a?1:-1, x1=a+dir*4, x2=b-dir*6, mid=Math.round((a+b)/2);
      body+='<line class="gd-msg'+(s.kind==='return'?' is-return':'')+(s.kind==='event'?' is-event':'')+'" x1="'+x1+'" y1="'+ay+'" x2="'+x2+'" y2="'+ay+'"/>'+head(b-dir*2,ay,dir,0)+text(mid,y+12,s.l,'gd-msg-t','middle')+(s.t?text(mid,ay+16,s.t,'gd-msg-s','middle'):'');
      y=ay+(s.t?32:20) });
    var H=y+4;
    lanes.forEach(function(l,i){ var x=Math.round(cx[i]-laneW/2+8); out+='<rect class="gd-lane" x="'+x+'" y="0" width="'+Math.round(laneW-16)+'" height="32" rx="6"/>'+text(cx[i],21,l.n,'gd-lane-t','middle')+'<line class="gd-life" x1="'+cx[i]+'" y1="40" x2="'+cx[i]+'" y2="'+(H-4)+'"/>' });
    out+=body;
    return mount(el,'<div class="gd-fig">'+svg(W,H,out,spec.label)+'</div>') };

  /* ── states: boxes where the spec puts them, edges from a side to a side ───────────────────── */
  GD.states=function(el,spec){
    var W=spec.w||640, H=spec.h||220, bw=spec.bw||116, bh=32, out='', at={};
    spec.nodes.forEach(function(nd){ at[nd.id]=nd; out+='<rect class="gd-state'+(nd.tone?' '+nd.tone:'')+'" x="'+nd.x+'" y="'+nd.y+'" width="'+bw+'" height="'+bh+'" rx="6"/>'+text(nd.x+bw/2,nd.y+21,nd.l,'gd-state-t'+(nd.tone?' '+nd.tone:''),'middle') });
    var side=function(nd,s){ return s==='r'?[nd.x+bw,nd.y+bh/2]:s==='l'?[nd.x,nd.y+bh/2]:s==='t'?[nd.x+bw/2,nd.y]:[nd.x+bw/2,nd.y+bh] };
    spec.edges.forEach(function(e){ var p=side(at[e.a],e.from), q=side(at[e.b],e.to), dx=q[0]-p[0], dy=q[1]-p[1]; var L=Math.sqrt(dx*dx+dy*dy)||1, ex=q[0]-dx/L*2, ey=q[1]-dy/L*2;
      out+='<line class="gd-edge'+(e.kind==='event'?' is-event':'')+'" x1="'+p[0]+'" y1="'+p[1]+'" x2="'+(q[0]-dx/L*6)+'" y2="'+(q[1]-dy/L*6)+'"/>'+head(ex,ey,dx,dy);
      if(e.l){ var lx=e.lx!=null?e.lx:(p[0]+q[0])/2, ly=e.ly!=null?e.ly:(p[1]+q[1])/2; var vert=Math.abs(dy)>Math.abs(dx); out+=text(vert?lx+(e.anchor==='end'?-8:8):lx, vert?ly+4:ly-8, e.l,'gd-edge-t', e.anchor||(vert?'start':'middle')) } });
    return mount(el,'<div class="gd-fig">'+svg(W,H,out,spec.label)+'</div>') };

  /* ── tree: a question on the left, its answers as branches to the right, leaves say what to do ── */
  GD.tree=function(el,root,opts){
    opts=opts||{}; var bw=opts.bw||176, gap=opts.gap||40, pitch=60, pad=8;
    var leaves=0, depth=0; (function walk(nd,d){ depth=Math.max(depth,d); if(nd.kids) nd.kids.forEach(function(k){ walk(k.node,d+1) }); else leaves++ })(root,0);
    var W=pad*2+(depth+1)*bw+depth*gap, H=pad*2+leaves*pitch, row=0, out='';
    function boxH(s){ return 16*lines(s).length+12 }
    function place(nd,d){ if(!nd.kids){ nd.y=pad+row*pitch+pitch/2; row++ } else { nd.kids.forEach(function(k){ place(k.node,d+1) }); nd.y=(nd.kids[0].node.y+nd.kids[nd.kids.length-1].node.y)/2 } nd.x=pad+d*(bw+gap) }
    place(root,0);
    function draw(nd){ var h=boxH(nd.q||nd.leaf), y=nd.y-h/2;
      out+='<rect class="'+(nd.kids?'gd-q':'gd-leaf'+(nd.tone?' '+nd.tone:''))+'" x="'+nd.x+'" y="'+y+'" width="'+bw+'" height="'+h+'" rx="6"/>'+text(nd.x+bw/2,y+20,nd.q||nd.leaf,nd.kids?'gd-q-t':'gd-leaf-t'+(nd.tone?' '+nd.tone:''),'middle');
      if(nd.kids){ var x0=nd.x+bw, xm=x0+gap/2; nd.kids.forEach(function(k){ var c=k.node, ch=boxH(c.q||c.leaf); out+='<path class="gd-branch" d="M'+x0+' '+nd.y+' H'+xm+' V'+c.y+' H'+(c.x-6)+'"/>'+head(c.x-2,c.y,1,0)+text(c.x,c.y-ch/2-4,k.l,'gd-branch-t','start'); draw(c) }) } }
    draw(root);
    return mount(el,'<div class="gd-fig">'+svg(W,H,out,opts.label)+'</div>') };

  /* ── spans: rows on one clock, a bar from when to when ─────────────────────────────────────── */
  GD.spans=function(el,spec){
    var W=spec.w||640, lw=spec.lw||150, x0=lw+8, x1=W-8, max=spec.max, out='', row=36, H=spec.rows.length*row+40;
    var X=function(v){ return Math.round(x0+(x1-x0)*v/max) };
    spec.ticks.forEach(function(t){ out+='<line class="gd-tick" x1="'+X(t.v)+'" y1="0" x2="'+X(t.v)+'" y2="'+(H-24)+'"/>'+text(X(t.v),H-6,t.l,'gd-tick-t',t.v===max?'end':t.v===0?'start':'middle') });
    spec.rows.forEach(function(r,i){ var y=8+i*row; out+=text(0,y+18,r.n,'gd-span-t','start')+'<rect class="gd-span'+(r.tone?' '+r.tone:'')+'" x="'+X(r.from)+'" y="'+y+'" width="'+Math.max(4,X(r.to)-X(r.from))+'" height="24" rx="6"/>'+(r.l?text(X(r.from)+8,y+16,r.l,'gd-span-l','start'):'') });
    return mount(el,'<div class="gd-fig">'+svg(W,H,out,spec.label)+'</div>') };

  /* ── the certification cases, as the prototype's Developer Portal lists them: what is sent, who sends it, when it passes ── */
  GD.cert=[
    {n:'Authorization', who:'Your host sends all eight.', cases:[
      ['AUTH-01','Approve, card present','you','6011 3300 0000 0005, $58.20, contactless','00 approved'],
      ['AUTH-02','Approve, card not present','you','6011 3300 0000 0005, $58.20, ecommerce, AVS','00 approved, avs Y/Y'],
      ['AUTH-03','Partial approval','you','6011 3300 0000 0385, $120.00','10 partial, approved_amount 60.00'],
      ['AUTH-04','Soft decline 51','you','6011 3300 0000 0872, $58.20','51 insufficient funds'],
      ['AUTH-05','Hard decline 05','you','6011 3300 0000 0905, $58.20','05 do not honor'],
      ['AUTH-06','Stand-in on issuer timeout','you','6011 3300 0000 1010, $58.20','00 approved, answered_by network'],
      ['AUTH-07','Reversal, full','you','Reverse the AUTH-01 authorization in full','Reversal accepted'],
      ['AUTH-08','Reversal, partial','you','Reverse $20.00 of a $58.20 authorization','Reversal accepted, $38.20 still held']]},
    {n:'Connectivity', who:'The network opens two handshakes. Your host sends one request.', cases:[
      ['CONN-01','Mutual TLS, production chain','network','A handshake against your production chain','The full chain, leaf to root, read on the first handshake'],
      ['CONN-02','Mutual TLS, staging chain','network','A handshake against your staging chain','The full chain. A chain one link short is the usual first failure'],
      ['CONN-03','Allowlist, staging range','you','Any request from your allowlisted range','Accepted, no allowlist reject']]},
    {n:'Disputes', who:'The network delivers two. Your host submits evidence twice.', cases:[
      ['DISP-01','Retrieval request','network','A retrieval request to your endpoint','Delivered, answered with a 2xx'],
      ['DISP-02','Chargeback, evidence in time','you','Evidence on the case inside the window','Accepted'],
      ['DISP-03','Chargeback, evidence late','you','Evidence on a second case after the window','Rejected, window closed'],
      ['DISP-04','Arbitration','network','An arbitration decision to your endpoint','Delivered, answered with a 2xx']]},
    {n:'Settlement', who:'The network sends the file. Your host reports the totals.', cases:[
      ['SETL-01','Daily file, one cycle','network','The daily settlement file','Received and acknowledged'],
      ['SETL-02','Adjustments','network','Adjustment lines in the file','Reconciled'],
      ['SETL-03','Reconciliation totals','you','The totals for that cycle','Match the file to the cent']]},
    {n:'Tokens', who:'Your host provisions and charges. The network reissues.', cases:[
      ['TOK-01','Provision','you','Provision 6011 3300 0000 0005','A tok_ id returned'],
      ['TOK-02','Charge on token','you','$58.20 on the token','00 approved'],
      ['TOK-03','Issuer reissue, token survives','network','token.updated to your endpoint after an overnight reissue','Delivered, and the token still charges']]}
  ];
  /* one head row per group (the group name, who sends, the count), then the cases as a dense table */
  GD.certMatrix=function(el){
    var html=GD.cert.map(function(g){ return '<div class="gn-rows gd-mx-h"><div class="gn-row"><div class="gn-row-t"><b>'+esc(g.n)+'</b><span>'+esc(g.who)+'</span></div><div class="gn-row-r"><span class="gn-num">'+g.cases.length+' cases</span></div></div></div>'
      +'<div class="gn-table-wrap gd-mx"><table class="gn-table gn-table--dense"><thead><tr><th scope="col">Case</th><th scope="col">What is sent</th><th scope="col">Passes when the network sees</th></tr></thead><tbody>'
      +g.cases.map(function(c){ return '<tr><td><span class="gn-mono">'+esc(c[0])+'</span><em>'+esc(c[1])+'</em><em>'+(c[2]==='you'?'Sent by your host':'Sent by the network')+'</em></td><td>'+esc(c[3])+'</td><td>'+esc(c[4])+'</td></tr>' }).join('')+'</tbody></table></div>' }).join('');
    return mount(el,html) };
  GD.certCount=function(){ var t=0, y=0; GD.cert.forEach(function(g){ g.cases.forEach(function(c){ t++; if(c[2]==='you') y++ }) }); return {total:t, you:y, network:t-y} };

  /* ── a checklist the reader ticks in order: the first unticked step is the current one, ticks are kept on this browser ── */
  GD.checklist=function(el,key,items){
    el=typeof el==='string'?document.getElementById(el):el; if(!el) return;
    var done={}; try{ done=JSON.parse(localStorage.getItem(key)||'{}') }catch(x){}
    function paint(){ var n=items.filter(function(_,i){ return done[i] }).length, now=-1; items.forEach(function(_,i){ if(now<0&&!done[i]) now=i });
      el.innerHTML='<div class="gd-ck-h"><span class="gn-count">'+n+' of '+items.length+' done'+(n===items.length?'. Ready to submit for validation.':'')+'</span>'+(n?'<button type="button" class="gn-link gd-ck-reset">Clear the ticks</button>':'')+'</div>'
        +'<div class="gn-checklist gn-checklist--1">'+items.map(function(it,i){ return '<label class="gn-check-i gd-ck'+(done[i]?' is-done':'')+(i===now?' is-now':'')+'"><input type="checkbox" class="gn-check" data-i="'+i+'"'+(done[i]?' checked':'')+'><span><b>'+esc(it.t)+'</b><em>'+esc(it.d)+'</em></span><span class="gn-check-r">'+(it.share?'<button class="gn-link" type="button" data-share="certification">Share with the person who signs</button>':'')+(it.href?'<a class="gn-link" href="'+esc(it.href)+'">'+esc(it.a||'Where')+'</a>':'<span class="gn-num">'+esc(it.a||'')+'</span>')+'</span></label>' }).join('')+'</div>';
      el.querySelectorAll('input').forEach(function(c){ c.addEventListener('change',function(){ done[c.getAttribute('data-i')]=c.checked; if(!c.checked) delete done[c.getAttribute('data-i')]; try{ localStorage.setItem(key,JSON.stringify(done)) }catch(x){} paint() }) });
      var r=el.querySelector('.gd-ck-reset'); if(r) r.addEventListener('click',function(){ done={}; try{ localStorage.removeItem(key) }catch(x){} paint() }) }
    paint() };
})();
