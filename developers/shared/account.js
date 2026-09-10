/* the free account: what the site's own table already promises, made real. Reading the reference, the
   events and the guides needs nothing, and the shared demo sandbox answers one request at a time without
   an account. Your own sandbox key, your own webhook endpoint and the log of what you sent need one.
   The account is session-local — no backend, nothing sent anywhere — and it is also the moment the
   network first learns a company is looking, which the account page says plainly rather than leaving
   the reader to find out later. Loaded before site.js so the header can read the account. */
(function(){
  var K='dv-account';
  var esc=function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') };
  function get(){ try{ return JSON.parse(sessionStorage.getItem(K)||'null') }catch(x){ return null } }
  function set(v){ try{ sessionStorage.setItem(K, JSON.stringify(v)) }catch(x){} }

  /* a key that looks like the ones the reference shows, derived from the company so it is stable for a session */
  function keyFor(co, kind){
    var h=2166136261, s=String(co||'')+'|'+kind;
    for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0 }
    var a='0123456789abcdef', out='';
    for(var j=0;j<16;j++){ h^=h<<13; h>>>=0; h^=h>>>17; h^=h<<5; h>>>=0; out+=a[h&15] }
    return (kind==='secret'?'sk_sandbox_':'pk_sandbox_')+out;
  }
  window.dvAccount=get;
  window.dvSignUp=function(f){
    var a={ email:f.email, company:f.company, domain:(String(f.email).split('@')[1]||''),
            created:'March 5, 3:55 PM',
            pk:keyFor(f.company,'pub'), sk:keyFor(f.company,'secret') };
    set(a); return a;
  };
  window.dvSignOut=function(){ try{ sessionStorage.removeItem(K) }catch(x){} };

  /* what an account changes, said once and reused: the page that offers keys and the account page itself */
  window.dvAccountGrants=[
    ['The reference, the events and the guides','Public','Public'],
    ['The test cards, and every request shown as code','Public','Public'],
    ['The demo console, sending against the sandbox','Needs an account','Yours'],
    ['Your own sandbox key and webhook endpoint','Needs an account','Yours'],
    ['The log of what you sent','Needs an account','Yours'],
    ['Certification and production','With a participation agreement','With a participation agreement']
  ];

  /* the sandbox needs an account. The button that sends is disabled until there is one, and the reason
     stands next to it rather than in a tooltip, because a control that does nothing without saying why
     is the worst of both. Creating the account signs her in and returns her here, so there is no second
     step and nothing to go back to. */
  var GATES=[];
  window.dvGateSend=function(btn, note){
    if(!btn) return;
    if(GATES.indexOf(btn)<0){ GATES.push(btn); GATES.push(note) }
    var a=get();
    if(a){ btn.disabled=false; btn.removeAttribute('aria-describedby'); if(note) note.innerHTML=''; return }
    btn.disabled=true; btn.setAttribute('aria-describedby','dvGateWhy');
    if(!note) return;
    var d=(location.pathname.split('/').slice(-2,-1)[0]);
    var root=(d==='docs'||d==='api')?'../':'';
    var back=(d==='docs'||d==='api'?d+'/':'')+(location.pathname.split('/').pop()||'index.html')+(location.hash||'');
    note.innerHTML='<span id="dvGateWhy" class="dv-gate">'
      +'<a class="gn-link" href="'+root+'support.html?next='+encodeURIComponent(back)+'#signup" data-account-open>Create a preview account to use the sandbox</a>'
      +'<span>A sandbox key in a minute. No agreement, no card, nothing to cancel.</span></span>';
  };
  /* every gate on the page re-reads the account, so signing up in the dialog leaves the reader exactly
     where they were with the control live */
  function refresh(){ for(var i=0;i<GATES.length;i+=2) window.dvGateSend(GATES[i], GATES[i+1]);
    document.querySelectorAll('[data-account-strip]').forEach(function(el){ el.innerHTML=get()?window.dvAccountStrip():'' });
    var r=document.querySelector('.gn-topnav-r'); if(r && window.dvTopRight) r.innerHTML=window.dvTopRight(); }

  /* the sign-up as a dialog: the reader asked for the sandbox, not for a different page */
  window.dvAccountDialog=function(){
    if(get()) return;
    var wrap=document.createElement('div');
    wrap.innerHTML='<div class="gn-scrim is-on" data-account-close></div>'
      +'<div class="gn-dialog gn-dialog--fixed" role="dialog" aria-modal="true" aria-labelledby="acDlgH">'
      +'<h2 id="acDlgH">Create a preview account</h2>'
      +'<p>It gives you your own sandbox key. No agreement, no card, nothing to cancel.</p>'
      +'<form novalidate>'
      +'<label class="gn-field" style="margin-top:20px"><span class="gn-field-l">Work email</span><input class="gn-in" id="acDlgEmail" placeholder="you@acquirer.example" autocomplete="email"></label>'
      +'<label class="gn-field" style="margin-top:16px"><span class="gn-field-l">Company</span><input class="gn-in" id="acDlgCo" autocomplete="organization"></label>'
      +'<div class="gn-actions"><button class="gn-btn" type="button" data-account-close>Cancel</button><button class="gn-btn gn-btn--primary" type="submit">Create the account</button></div>'
      +'</form>'
      +'<p class="gn-help" style="margin-top:16px">The network holds what you type here and nothing else. An agent may reach out about certification or production.</p>'
      +'</div>';
    var nodes=[].slice.call(wrap.childNodes); nodes.forEach(function(n){ document.body.appendChild(n) });
    var dlg=nodes[1], email=dlg.querySelector('#acDlgEmail'), co=dlg.querySelector('#acDlgCo'), was=document.activeElement;
    function close(){ nodes.forEach(function(n){ n.remove() }); document.removeEventListener('keydown', onKey); if(was&&was.focus) was.focus() }
    function onKey(e){
      if(e.key==='Escape'){ e.preventDefault(); close(); return }
      if(e.key!=='Tab') return;
      var f=dlg.querySelectorAll('input,button'); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus() }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey);
    document.body.addEventListener('click', function onClick(e){ if(e.target.closest('[data-account-close]')){ document.body.removeEventListener('click', onClick); close() } });
    dlg.querySelector('form').addEventListener('submit', function(e){
      e.preventDefault();
      var okE = window.dvErr ? dvErr(email, !email.value.trim()?'Enter your work email.':!dvEmail(email.value)?'Enter an email address, like you@acquirer.example.':'') : !!email.value.trim();
      var okC = window.dvErr ? dvErr(co, co.value.trim()?'':'Enter your company name.') : !!co.value.trim();
      if(!(okE&&okC)){ (email.value.trim()?co:email).focus(); return }
      window.dvSignUp({email:email.value.trim(), company:co.value.trim()});
      close(); refresh();
      if(window.dvToast) dvToast('Preview account created. Your sandbox key is ready.');
    });
    email.focus();
  };
  /* the call to action opens the dialog; the href stays a real page so it works without scripting */
  document.addEventListener('click', function(e){
    var a=e.target.closest && e.target.closest('[data-account-open]');
    if(!a) return; e.preventDefault(); window.dvAccountDialog();
  });

  /* the strip a page shows where an account is the difference between reading and doing */
  window.dvAccountStrip=function(where){
    var a=get(); var root=(location.pathname.split('/').slice(-2,-1)[0]==='docs'||location.pathname.split('/').slice(-2,-1)[0]==='api')?'../':'';
    if(a) return '<div class="dv-acct is-on"><b>'+esc(a.company)+'</b><span>Your sandbox key is <span class="gn-mono">'+esc(a.pk)+'</span></span><a class="gn-link" href="'+root+'account.html">Your account</a></div>';
    return '<div class="dv-acct"><b>'+esc(where||'This needs a free account')+'</b><span>A sandbox key in a minute. No agreement, no card, nothing to cancel.</span><a class="gn-link" href="'+root+'support.html#signup">Create a free account</a></div>';
  };
})();
