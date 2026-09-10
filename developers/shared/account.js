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
    ['The shared demo sandbox, one request at a time','Public','Public'],
    ['Your own sandbox key and webhook endpoint','Needs an account','Yours'],
    ['The log of what you sent','Needs an account','Yours'],
    ['Certification and production','With a participation agreement','With a participation agreement']
  ];

  /* the strip a page shows where an account is the difference between reading and doing */
  window.dvAccountStrip=function(where){
    var a=get(); var root=(location.pathname.split('/').slice(-2,-1)[0]==='docs'||location.pathname.split('/').slice(-2,-1)[0]==='api')?'../':'';
    if(a) return '<div class="dv-acct is-on"><b>'+esc(a.company)+'</b><span>Your sandbox key is <span class="gn-mono">'+esc(a.pk)+'</span></span><a class="gn-link" href="'+root+'account.html">Your account</a></div>';
    return '<div class="dv-acct"><b>'+esc(where||'This needs a free account')+'</b><span>A sandbox key in a minute. No agreement, no card, nothing to cancel.</span><a class="gn-link" href="'+root+'support.html#signup">Create a free account</a></div>';
  };
})();
