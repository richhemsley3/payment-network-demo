/* the share: when a reader reaches for what the sandbox cannot give (certification, production), the site names the
   agreement and offers to bring in the person who signs. No account, no backend: the confirmation is local to the
   session. Loaded by the reference and the certification guide (the ask), and by the pages that send a request to the
   demo sandbox (the record of what was sent, so the share can carry proof). Needs site.js for dvErr, dvEmail,
   dvFirstErr, dvOffline and dvToast at click time. */
(function(){
  var esc=function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') };
  var K='dv-sent', S='dv-shared';
  function get(k){ try{ return JSON.parse(sessionStorage.getItem(k)||'null') }catch(x){ return null } }
  function set(k,v){ try{ sessionStorage.setItem(k,JSON.stringify(v)) }catch(x){} }

  /* every request the demo sandbox answers is counted for the session, with its last answer */
  window.dvSent=function(r){ r=r||{}; var s=get(K)||{n:0}; s.n++; s.last={decision:r.decision||'', code:r.response_code||'', ms:r.round_trip_ms||r.ms||0}; set(K,s); return s };
  function word(l){ return l.decision==='approved'||l.decision==='stand_in'?'approved':l.decision==='partial'?'partly approved':l.decision==='declined'?'declined '+l.code:'answered' }
  function sentLine(s){ if(!s||!s.n) return 'Nothing sent yet.'; return s.n+(s.n===1?' request':' requests')+', the last '+word(s.last)+' in '+s.last.ms+' ms.' }

  /* what the page says once a share has gone: the state word beside the button */
  function paintState(el){ var r=get(S); el.textContent=r?'Sent. '+r.name+' has been introduced.':'' }
  window.dvShareState=function(){ document.querySelectorAll('[data-share-state]').forEach(paintState) };

  var box=null, scrim=null, opener=null;
  function focusables(){ return [].slice.call(box.querySelectorAll('input,textarea,button,a[href]')).filter(function(x){ return !x.disabled&&x.offsetParent!==null }) }
  function onKey(e){ if(!box) return; if(e.key==='Escape'){ e.preventDefault(); close(); return } if(e.key!=='Tab') return; var f=focusables(); if(!f.length) return; var i=f.indexOf(document.activeElement); if(e.shiftKey&&i<=0){ e.preventDefault(); f[f.length-1].focus() } else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus() } }
  function close(){ if(!box) return; box.remove(); box=null; if(scrim) scrim.classList.remove('is-on'); document.removeEventListener('keydown',onKey); if(opener&&opener.focus) opener.focus(); opener=null }
  function copyLink(from){ /* the link goes to a person outside the demo, so it carries no panel state */ var url=location.href.split('#')[0].replace(/[?&]story=\d+/,'').replace(/\?$/,'')+(from==='certification'?'#checklist':'#share'); var done=function(){ dvToast('Link copied') }, fail=function(){ dvToast('Could not copy. Copy the address bar instead.') }; if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(done,fail) } else fail() }
  function sentCopy(r){ var what=r.note&&r.inc?'Your note and your '+r.inc+' sandbox '+(r.inc===1?'request':'requests')+' go with it.':r.note?'Your note goes with it.':r.inc?'Your '+r.inc+' sandbox '+(r.inc===1?'request goes':'requests go')+' with it.':''; return '<div class="dv-share-sent" tabindex="-1"><b>'+esc(r.name)+' has been introduced.</b><p>Our team reaches out to '+esc(r.email)+' with a deal page prepared for your company, alongside '+(r.from==='certification'?'this guide':'this reference')+' and the two-page overview.'+(what?' '+what:'')+' You keep your sandbox key either way.</p></div>' }

  /* the dialog: their name, their email, a note, and the sandbox record if there is one */
  window.dvShare=function(from,btn){ if(window.RF&&RF.tryClose) RF.tryClose(); opener=btn||document.activeElement; if(box) close(); if(!scrim){ scrim=document.createElement('div'); scrim.className='gn-scrim'; scrim.addEventListener('click',close); document.body.appendChild(scrim) }
    var s=get(K), sent=!!(s&&s.n);
    box=document.createElement('div'); box.className='gn-float gn-modal gn-modal--fixed dv-share'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-labelledby','shTitle');
    box.innerHTML='<div class="gn-modal-h"><h2 id="shTitle">Connect with our team</h2><button class="gn-panel-x" type="button" aria-label="Close" data-sh-close>×</button></div>'
     +'<div class="gn-modal-b"><p>Name whoever decides this at your company. We reach out to them, not to you again, and they get a deal page prepared for your company alongside '+(from==='certification'?'this guide':from==='reference'?'this reference':'the sandbox and the reference')+'. No account is created for either of you.</p>'
     +'<form id="shForm" novalidate><label class="gn-field"><span class="gn-field-l">Their name</span><input class="gn-in" id="shName" autocomplete="off"></label>'
     +'<label class="gn-field"><span class="gn-field-l">Their role</span><input class="gn-in" id="shRole" placeholder="Head of payments" autocomplete="off"></label>'
     +'<label class="gn-field"><span class="gn-field-l">Their work email</span><input class="gn-in" id="shEmail" placeholder="name@acquirer.example" autocomplete="off" inputmode="email"></label>'
     +'<label class="gn-field"><span class="gn-field-l">What you are evaluating <small>Optional</small></span><textarea class="gn-in" id="shNote" rows="3" placeholder="Card-present acceptance, and whether tokens come with it."></textarea></label>'
     +'<label class="gn-check-l dv-share-inc"><input type="checkbox" class="gn-check" id="shInc"'+(sent?'':' disabled')+'><span>Include what I sent in the sandbox<small>'+esc(sentLine(s))+'</small></span></label></form></div>'
     +'<div class="gn-modal-f"><button class="gn-link" type="button" data-sh-copy>Copy a link instead</button><button class="gn-btn" type="button" data-sh-close>Cancel</button><button class="gn-btn gn-btn--primary" type="submit" form="shForm">Send</button></div>';
    document.body.appendChild(box); scrim.classList.add('is-on'); document.addEventListener('keydown',onKey);
    box.addEventListener('click',function(e){ if(e.target.closest('[data-sh-close]')) close(); if(e.target.closest('[data-sh-copy]')) copyLink(from) });
    box.querySelector('#shForm').addEventListener('submit',function(e){ e.preventDefault(); var n=box.querySelector('#shName'), m=box.querySelector('#shEmail'); if(dvOffline(m)) return;
      var ro=box.querySelector('#shRole');
      var a=dvErr(n, n.value.trim()?'':'Enter their name.'); var c2=dvErr(ro, ro.value.trim()?'':'Enter their role, so we reach the right person.'); var b=dvErr(m, !m.value.trim()?'Enter their work email.':!dvEmail(m.value)?'Enter an email address, like name@acquirer.example.':''); if(!(a&&b&&c2)){ dvFirstErr(box); return }
      var r={name:n.value.trim(), role:ro.value.trim(), email:m.value.trim(), note:!!box.querySelector('#shNote').value.trim(), inc:box.querySelector('#shInc').checked&&s?s.n:0, from:from}; set(S,r);
      box.querySelector('.gn-modal-b').innerHTML=sentCopy(r); box.querySelector('.gn-modal-f').innerHTML='<button class="gn-btn gn-btn--primary" type="button" data-sh-close>Done</button>'; box.querySelector('.dv-share-sent').focus();
      dvToast(r.name+' has been introduced'); window.dvShareState() });
    [].forEach.call(box.querySelectorAll('#shName,#shEmail'),function(i){ i.addEventListener('input',function(){ if(i.classList.contains('is-err')) dvErr(i,'') }) });
    box.querySelector('#shName').focus() };

  /* the hook after a successful test: the strip under the console that just answered. from names the page for the dialog's copy. */
  window.dvWon=function(el, from){ if(!el) return; var c=el.closest('.gn-console')||el.parentNode, s=c.parentNode.querySelector('.dv-won'); if(!s){ s=document.createElement('div'); s.className='gn-strip dv-gate dv-won'; s.setAttribute('role','status'); s.innerHTML='<b>It worked in the sandbox.</b><span>Certification and production need a participation agreement, which is signed in the Partner Portal by whoever decides this at your company. Name them and we will take it from here.</span><div class="gn-actions"><button class="gn-btn" type="button" data-share="'+from+'">Connect with our team</button><span class="gn-num" data-share-state></span></div>'; c.parentNode.insertBefore(s, c.nextSibling) } s.hidden=false; window.dvShareState() };
  document.addEventListener('click',function(e){ var b=e.target.closest('[data-share]'); if(b){ e.preventDefault(); dvShare(b.getAttribute('data-share'), b) } });
  document.addEventListener('DOMContentLoaded',function(){ window.dvShareState() });
})();
