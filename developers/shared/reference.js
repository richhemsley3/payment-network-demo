/* The reference pages: data and renderers for the API reference, the events reference, the error catalogue,
   the SDK panels, the changelog diffs, the status history and the incident sequences.
   Loads before site.js so the sample blocks it renders get their language tabs and Copy from the site's chrome.
   Every figure, id, name and endpoint is invented, consistent with the story prototype's API, OBJECTS,
   EVENT_FIELDS, ERRS and TESTS. Nothing here is a real network. */
(function(){
 var esc=function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') };
 var mono=function(s){ return '<span class="gn-mono">'+esc(s)+'</span>' };
 var J=function(o){ return JSON.stringify(o,null,2) };
 var hex=function(n){ return Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0').slice(0,n||6) };

 /* ── the objects, their fields, and the endpoints under each ─────────────────────────────
    field rows: [name, type, example, one line]   send rows: [name, type, required, example, one line] */
 var RF=window.RF={};
 RF.objects=[
  {id:'authorization', g:'Acceptance', t:'The Authorization object',
   d:'The issuer\'s answer to an authorization request. Carries the decision, the response code, the score and timing. Every decision, approved or declined, is a 200 with one of these.',
   fields:[
    ['id','string','auth_71ab3c','Prefixed auth_. Quote it to support.'],
    ['decision','enum','approved','approved, partial, declined, stand_in.'],
    ['response_code','string','00','The issuer\'s two-digit code. 00 is approved.'],
    ['requested_amount','integer','5820','Minor units you asked for.'],
    ['approved_amount','integer','5820','Minor units approved. Less than requested on a partial.'],
    ['avs','object','{ "street": "Y", "postal": "Y" }','street and postal, each Y, N or U.'],
    ['score','integer','22','Network risk signal, 0 to 100. score_reasons lists what moved it.'],
    ['answered_by','enum','issuer','issuer, or network on a stand-in.'],
    ['issuer_ms','integer','41','How long the issuer took.'],
    ['round_trip_ms','integer','44','The answer time as the network measured it.'],
    ['created','timestamp','2026-06-02T06:04:12Z','RFC 3339, UTC.']],
   sample:{id:'auth_71ab3c',object:'authorization',decision:'approved',response_code:'00',requested_amount:5820,approved_amount:5820,avs:{street:'Y',postal:'Y'},score:22,score_reasons:['token_scope_match','merchant_history_180d'],answered_by:'issuer',issuer_ms:41,round_trip_ms:44,created:'2026-06-02T06:04:12Z'},
   endpoints:[
    {id:'authorize', m:'POST', p:'/acceptance/v1/authorizations', t:'Authorize a transaction',
     d:'Request authorization from the issuer. Answered within 500 ms, or by stand-in rules you set.',
     send:[
      ['amount','integer',true,'5820','Minor units. 5820 is $58.20.'],
      ['currency','string',true,'"USD"','ISO 4217. Settlement currency is set on your account.'],
      ['merchant_id','string',true,'"mch_demo"','Your identifier for the merchant, as registered.'],
      ['pan_token','string',false,'"tok_9d1b4e"','A network token, or pan if you hold the data yourself. One of the two.'],
      ['entry_mode','enum',false,'"contactless"','contactless, chip, magstripe, ecommerce, keyed.'],
      ['avs','object',false,'{ "postal": "60601" }','street and postal to verify.']],
     back:'An Authorization object. 200 for any decision. 4xx when the request could not be processed.',
     req:{curl:'curl -X POST https://sandbox.api.dgn.com/acceptance/v1/authorizations \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Idempotency-Key: 7c9e6679-…" \\\n  -d \'{ "amount": 5820, "currency": "USD", "merchant_id": "mch_demo", "pan_token": "tok_9d1b4e", "entry_mode": "contactless" }\'',
          node:'const auth = await dgn.authorizations.create({\n  amount: 5820, currency: "USD", merchantId: "mch_demo",\n  panToken: "tok_9d1b4e", entryMode: "contactless"\n});',
          python:'auth = client.authorizations.create(\n  amount=5820, currency="USD", merchant_id="mch_demo",\n  pan_token="tok_9d1b4e", entry_mode="contactless")'},
     res:{id:'auth_71ab3c',decision:'approved',response_code:'00',approved_amount:5820,avs:{street:'Y',postal:'Y'},score:22,answered_by:'issuer',issuer_ms:41,request_id:'req_71ab00',round_trip_ms:44},
     try:[{k:'amount',t:'int',v:'5820'},{k:'currency',t:'text',v:'USD'},{k:'merchant_id',t:'text',v:'mch_demo'},{k:'pan',t:'card',l:'pan (a test card)'},{k:'entry_mode',t:'select',v:'contactless',o:['contactless','chip','magstripe','ecommerce','keyed']}],
     respond:function(b,f){ var c=DV.cards[f.card], ok=c[2]==='00'||c[2]==='10', ms=c[0].indexOf('1010')>-1?502:38+Math.round(Math.random()*12); var r={id:'auth_'+hex(),decision:c[2]==='10'?'partial':c[0].indexOf('1010')>-1?'stand_in':ok?'approved':'declined',response_code:c[2],requested_amount:b.amount}; if(ok) r.approved_amount=c[2]==='10'?Math.round(b.amount/2):b.amount; if(c[2]==='00') r.avs={street:'Y',postal:'Y'}; r.score=ok?22:61; r.answered_by=c[0].indexOf('1010')>-1?'network':'issuer'; r.issuer_ms=ms; r.request_id='req_'+hex(); r.round_trip_ms=ms+3; return {status:200,ms:ms+3,json:r} }},
    {id:'reverse', m:'POST', p:'/acceptance/v1/authorizations/{id}/reverse', t:'Reverse an authorization',
     d:'Release a hold you no longer need, in full or in part. The issuer sees it immediately.',
     send:[
      ['id','string',true,'"auth_71ab3c"','The authorization, in the path.'],
      ['amount','integer',false,'5820','Minor units. Omit to reverse the full hold.'],
      ['reason','enum',false,'"canceled"','canceled, timeout, duplicate, corrected.']],
     back:'A Reversal: the authorization, what was released and what remains on hold.',
     req:{curl:'curl -X POST https://sandbox.api.dgn.com/acceptance/v1/authorizations/auth_71ab3c/reverse \\\n  -H "Authorization: Bearer $TOKEN" -H "Idempotency-Key: …" \\\n  -d \'{ "amount": 5820, "reason": "canceled" }\'',
          node:'await dgn.authorizations.reverse("auth_71ab3c", { amount: 5820, reason: "canceled" });',
          python:'client.authorizations.reverse("auth_71ab3c", amount=5820, reason="canceled")'},
     res:{id:'rev_88f2',authorization:'auth_71ab3c',reversed_amount:5820,remaining_hold:0,reason:'canceled',created:'2026-06-02T06:06:20Z'},
     try:[{k:'id',t:'text',v:'auth_71ab3c',path:true},{k:'amount',t:'int',v:'5820',opt:true},{k:'reason',t:'select',v:'canceled',o:['canceled','timeout','duplicate','corrected']}],
     respond:function(b,f){ if(!/^auth_[0-9a-f]{6}$/.test(f.id)) return {status:404,ms:21,json:{type:'not_found',message:'No authorization with id '+f.id+' in the sandbox',request_id:'req_'+hex()}}; return {status:200,ms:24,json:{id:'rev_'+hex(4),authorization:f.id,reversed_amount:b.amount||5820,remaining_hold:0,reason:b.reason,request_id:'req_'+hex()}} }},
    {id:'capture', m:'POST', p:'/acceptance/v1/captures', t:'Capture',
     d:'Move an approved hold into the day\'s clearing file. Within 7 days. Accepts a batch of up to 5,000 ids.',
     send:[
      ['authorization_id','string',true,'"auth_71ab3c"','Or authorization_ids, an array of up to 5,000 ids, for a batch.'],
      ['amount','integer',false,'5820','Minor units. Up to approved_amount. Omit for the full hold.'],
      ['settlement_date','string',false,'"2026-06-03"','YYYY-MM-DD. Defaults to the next cycle.']],
     back:'A Capture: the authorization, the amount, the cycle it joins and the clearing file.',
     req:{curl:'curl -X POST https://sandbox.api.dgn.com/acceptance/v1/captures \\\n  -H "Authorization: Bearer $TOKEN" -H "Idempotency-Key: …" \\\n  -d \'{ "authorization_id": "auth_71ab3c", "amount": 5820 }\'',
          node:'await dgn.captures.create({ authorizationId: "auth_71ab3c", amount: 5820 });',
          python:'client.captures.create(authorization_id="auth_71ab3c", amount=5820)'},
     res:{id:'cap_5c10',authorization_id:'auth_71ab3c',amount:5820,settlement_date:'2026-06-03',file:'clr_20260603_001',status:'queued'},
     try:[{k:'authorization_id',t:'text',v:'auth_71ab3c'},{k:'amount',t:'int',v:'5820',opt:true}],
     respond:function(b,f){ if(!/^auth_[0-9a-f]{6}$/.test(f.authorization_id)) return {status:404,ms:19,json:{type:'not_found',message:'No authorization with id '+f.authorization_id+' in the sandbox',request_id:'req_'+hex()}}; return {status:200,ms:27,json:{id:'cap_'+hex(4),authorization_id:f.authorization_id,amount:b.amount||5820,settlement_date:'2026-06-03',file:'clr_20260603_001',status:'queued',request_id:'req_'+hex()}} }},
    {id:'refund', m:'POST', p:'/acceptance/v1/refunds', t:'Refund',
     d:'Return captured money to the cardholder. Full or partial. Reaches the cardholder in 3 to 5 days.',
     send:[
      ['authorization_id','string',true,'"auth_71ab3c"','The captured authorization.'],
      ['amount','integer',false,'2000','Minor units. Omit for the full capture.'],
      ['reason','enum',false,'"requested_by_customer"','requested_by_customer, duplicate, fraudulent.']],
     back:'A Refund: the authorization, the amount, and sent once the network has handed it to the issuer.',
     req:{curl:'curl -X POST https://sandbox.api.dgn.com/acceptance/v1/refunds \\\n  -H "Authorization: Bearer $TOKEN" -H "Idempotency-Key: …" \\\n  -d \'{ "authorization_id": "auth_71ab3c", "amount": 2000, "reason": "requested_by_customer" }\'',
          node:'await dgn.refunds.create({ authorizationId: "auth_71ab3c", amount: 2000, reason: "requested_by_customer" });',
          python:'client.refunds.create(authorization_id="auth_71ab3c", amount=2000, reason="requested_by_customer")'},
     res:{id:'rfd_2c41',authorization_id:'auth_71ab3c',amount:2000,reason:'requested_by_customer',status:'sent',created:'2026-06-02T06:09:02Z'},
     try:[{k:'authorization_id',t:'text',v:'auth_71ab3c'},{k:'amount',t:'int',v:'2000',opt:true},{k:'reason',t:'select',v:'requested_by_customer',o:['requested_by_customer','duplicate','fraudulent']}],
     respond:function(b,f){ if(!/^auth_[0-9a-f]{6}$/.test(f.authorization_id)) return {status:404,ms:19,json:{type:'not_found',message:'No authorization with id '+f.authorization_id+' in the sandbox',request_id:'req_'+hex()}}; return {status:200,ms:31,json:{id:'rfd_'+hex(4),authorization_id:f.authorization_id,amount:b.amount||5820,reason:b.reason,status:'sent',request_id:'req_'+hex()}} }}
   ]},
  {id:'tokens', g:'Tokens', t:'The Token object',
   d:'A card number replaced with a token scoped to one merchant. Kept current when the card is reissued, and token.updated says so.',
   fields:[
    ['id','string','tok_9d1b4e','Prefixed tok_. Use it wherever pan_token is accepted.'],
    ['merchant_id','string','mch_demo','The merchant the token is scoped to. Useless at any other.'],
    ['last4','string','0005','Last four digits of the card at issue.'],
    ['expiry','string','2028-04','YYYY-MM of the token, not the card.'],
    ['status','enum','active','active, suspended, deleted.'],
    ['lifecycle','enum','issuer_managed','issuer_managed. The issuer updates the token when the card changes.']],
   sample:{id:'tok_9d1b4e',object:'token',merchant_id:'mch_demo',last4:'0005',expiry:'2028-04',status:'active',lifecycle:'issuer_managed',created:'2026-04-02T09:14:55Z'},
   endpoints:[
    {id:'token-create', m:'POST', p:'/tokens/v1/tokens', t:'Create a token',
     d:'Replace a card number with a merchant-scoped token. A token stolen from one merchant is useless at another.',
     send:[
      ['pan','string',true,'"6011330000000005"','The card number. Sent once, never returned, never stored beyond tokenization.'],
      ['merchant_id','string',true,'"mch_demo"','Scopes the token.'],
      ['expiry','string',true,'"2028-04"','YYYY-MM.'],
      ['use','enum',false,'"card_on_file"','card_on_file, recurring, wallet.']],
     back:'A Token object. The pan is gone; the id stands in for it.',
     req:{curl:'curl -X POST https://sandbox.api.dgn.com/tokens/v1/tokens \\\n  -H "Authorization: Bearer $TOKEN" -H "Idempotency-Key: …" \\\n  -d \'{ "pan": "6011330000000005", "expiry": "2028-04", "merchant_id": "mch_demo" }\'',
          node:'const tok = await dgn.tokens.create({ pan, expiry: "2028-04", merchantId: "mch_demo" });',
          python:'tok = client.tokens.create(pan=pan, expiry="2028-04", merchant_id="mch_demo")'},
     res:{id:'tok_9d1b4e',merchant_id:'mch_demo',last4:'0005',expiry:'2028-04',status:'active',lifecycle:'issuer_managed'},
     try:[{k:'pan',t:'card',l:'pan (a test card)'},{k:'merchant_id',t:'text',v:'mch_demo'},{k:'expiry',t:'text',v:'2028-04'},{k:'use',t:'select',v:'card_on_file',o:['card_on_file','recurring','wallet']}],
     respond:function(b,f){ var c=DV.cards[f.card]; if(!/^\d{4}-\d{2}$/.test(f.expiry)) return {status:400,ms:12,json:{type:'invalid_request',message:'expiry must be YYYY-MM',param:'expiry',request_id:'req_'+hex()}}; return {status:200,ms:33,json:{id:'tok_'+hex(),merchant_id:f.merchant_id,last4:c[0].slice(-4),expiry:f.expiry,status:'active',lifecycle:'issuer_managed',use:b.use,request_id:'req_'+hex()}} }}
   ]},
  {id:'disputes', g:'Disputes', t:'The Case object',
   d:'A retrieval, chargeback or arbitration against one authorization. Carries the reason code and the response deadline.',
   fields:[
    ['id','string','dsp_41e','Prefixed dsp_.'],
    ['authorization','string','auth_6e02a1','The authorization it is against.'],
    ['stage','enum','chargeback','retrieval, chargeback, representment, arbitration.'],
    ['reason_code','string','4837','4837 not authorized, 4853 not as described, 4855 not received, 4860 credit not processed.'],
    ['amount','integer','31000','Minor units in dispute.'],
    ['respond_by','date','2026-06-11','The evidence deadline. Missing it loses the case.'],
    ['status','enum','needs_response','needs_response, under_review, won, lost, accepted.']],
   sample:{id:'dsp_41e',object:'case',authorization:'auth_6e02a1',stage:'chargeback',reason_code:'4837',amount:31000,respond_by:'2026-06-11',status:'needs_response',opened:'2026-05-27T14:02:11Z'},
   endpoints:[
    {id:'evidence', m:'POST', p:'/disputes/v1/cases/{id}/evidence', t:'Submit evidence',
     d:'Upload the merchant\'s evidence. The network formats it for the issuer and tracks the clock. One file per evidence type; links and media are not reviewed.',
     send:[
      ['id','string',true,'"dsp_41e"','The case, in the path.'],
      ['product_type','enum',true,'"physical"','physical, digital, subscription. Sets which evidence is asked for.'],
      ['files','array',true,'[{ "type": "proof_of_delivery", … }]','Each with a type (proof_of_delivery, order_page, correspondence, terms) and a PDF or image up to 10 MB.'],
      ['note','string',false,'"Signed for at the door."','Shown to the issuer, not the cardholder. Up to 4,000 characters.']],
     back:'The Case object, now under_review, with how many files were accepted.',
     req:{curl:'curl -X POST https://sandbox.api.dgn.com/disputes/v1/cases/dsp_41e/evidence \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -F product_type=physical -F "files[]=@delivery.pdf;type=proof_of_delivery"',
          node:'await dgn.disputes.submitEvidence("dsp_41e", { productType: "physical", files: [{ type: "proof_of_delivery", path: "delivery.pdf" }] });',
          python:'client.disputes.submit_evidence("dsp_41e", product_type="physical", files=[("proof_of_delivery", open("delivery.pdf","rb"))])'},
     res:{id:'dsp_41e',status:'under_review',files_accepted:1,respond_by:'2026-06-11',submitted:'2026-06-02T06:12:40Z'},
     try:[{k:'id',t:'text',v:'dsp_41e',path:true},{k:'product_type',t:'select',v:'physical',o:['physical','digital','subscription']},{k:'file_type',t:'select',v:'proof_of_delivery',o:['proof_of_delivery','order_page','correspondence','terms'],l:'files[0].type'},{k:'note',t:'text',v:'',opt:true}],
     respond:function(b,f){ if(!/^dsp_[0-9a-f]{3}$/.test(f.id)) return {status:404,ms:18,json:{type:'not_found',message:'No case with id '+f.id+' in the sandbox',request_id:'req_'+hex()}}; return {status:200,ms:140,json:{id:f.id,status:'under_review',files_accepted:1,respond_by:'2026-06-11',request_id:'req_'+hex()}} },
     body:function(f){ return {product_type:f.product_type,files:[{type:f.file_type,file:'delivery.pdf'}],note:f.note||undefined} }}
   ]},
  {id:'settlements', g:'Settlement reports', t:'The Settlement object',
   d:'One day\'s cycle, from gross to the wire. Published by 5:00 AM local. Minor units, settled before fees.',
   fields:[
    ['id','string','stl_0602','stl_ plus the cycle date.'],
    ['date','date','2026-06-02','The cycle date.'],
    ['gross','integer','16421000','Minor units settled before fees.'],
    ['fees','integer','180600','Assessment, authorization and dispute fees for the cycle.'],
    ['adjustments','integer','-129000','Chargebacks, reversals and corrections. May be negative.'],
    ['net','integer','15890400','What was wired.'],
    ['wire','string','FW-2026-0602-4471','Bank reference to reconcile against.'],
    ['status','enum','posted','pending, posted.']],
   sample:{id:'stl_0602',object:'settlement',date:'2026-06-02',gross:16421000,fees:180600,adjustments:-129000,net:15890400,wire:'FW-2026-0602-4471',status:'posted',posted:'2026-06-02T10:00:00Z'},
   endpoints:[
    {id:'settlement-get', m:'GET', p:'/money/v1/settlements/{date}', t:'A day\'s cycle',
     d:'Gross, fees, adjustments, net, and the wire that carried it. Read it after settlement.posted, or on your own clock.',
     send:[
      ['date','string',true,'"2026-06-02"','YYYY-MM-DD, in the path.'],
      ['expand','enum',false,'"by_merchant"','totals, by_merchant, line_items. Adds the breakdown to the response.']],
     back:'A Settlement object. 404 before the cycle exists.',
     req:{curl:'curl https://sandbox.api.dgn.com/money/v1/settlements/2026-06-02 -H "Authorization: Bearer $TOKEN"',
          node:'const cycle = await dgn.settlements.retrieve("2026-06-02");',
          python:'cycle = client.settlements.retrieve("2026-06-02")'},
     res:{id:'stl_0602',date:'2026-06-02',gross:16421000,fees:180600,adjustments:-129000,net:15890400,wire:'FW-2026-0602-4471',status:'posted'},
     try:[{k:'date',t:'text',v:'2026-06-02',path:true},{k:'expand',t:'select',v:'totals',o:['totals','by_merchant','line_items']}],
     respond:function(b,f){ if(!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return {status:400,ms:11,json:{type:'invalid_request',message:'date must be YYYY-MM-DD',param:'date',request_id:'req_'+hex()}}; if(f.date>'2026-06-02') return {status:404,ms:14,json:{type:'not_found',message:'No cycle for '+f.date+' yet',request_id:'req_'+hex()}}; var r={id:'stl_'+f.date.slice(5).replace('-',''),date:f.date,gross:16421000,fees:180600,adjustments:-129000,net:15890400,wire:'FW-'+f.date.slice(0,4)+'-'+f.date.slice(5).replace('-','')+'-4471',status:'posted'}; if(f.expand==='by_merchant') r.by_merchant=[{merchant_id:'mch_demo',gross:16421000,net:15890400}]; if(f.expand==='line_items') r.line_items=[{kind:'interchange',amount:-164210},{kind:'assessment',amount:-16390}]; r.request_id='req_'+hex(); return {status:200,ms:36,json:r} },
     body:function(){ return null }}
   ]},
  {id:'decisioning', g:'Decisioning', t:'The Decision object',
   d:'The network\'s risk score on one authorization and the factors that moved it. The score and its reasons also ride on the Authorization object; this is the long form.',
   fields:[
    ['authorization','string','auth_71ab3c','The authorization it explains.'],
    ['score','integer','22','0 to 100. Higher is riskier.'],
    ['band','enum','low','low, elevated, high.'],
    ['factors','array','[{ "name": "cross_border", "effect": 3 }]','Each factor with its effect on the score, strongest first.'],
    ['model','string','dgn-risk-4','The model that scored it.']],
   sample:{object:'decision',authorization:'auth_71ab3c',score:22,band:'low',factors:[{name:'token_scope_match',effect:-9},{name:'merchant_history_180d',effect:-6},{name:'cross_border',effect:3}],model:'dgn-risk-4'},
   endpoints:[
    {id:'decision-get', m:'GET', p:'/decisioning/v1/decisions/{id}', t:'Explain a decision',
     d:'Every factor behind the score on one authorization, with its effect. Read it or ignore it; nothing you send changes.',
     send:[['id','string',true,'"auth_71ab3c"','An authorization id, in the path.']],
     back:'A Decision object. score is 0 to 100, band is low, elevated or high, and each factor carries its effect.',
     req:{curl:'curl https://sandbox.api.dgn.com/decisioning/v1/decisions/auth_71ab3c -H "Authorization: Bearer $TOKEN"',
          node:'const decision = await dgn.decisions.retrieve("auth_71ab3c");',
          python:'decision = client.decisions.retrieve("auth_71ab3c")'},
     res:{authorization:'auth_71ab3c',score:22,band:'low',factors:[{name:'token_scope_match',effect:-9},{name:'merchant_history_180d',effect:-6},{name:'cross_border',effect:3}],model:'dgn-risk-4'},
     try:[{k:'id',t:'text',v:'auth_71ab3c',path:true}],
     respond:function(b,f){ if(!/^auth_[0-9a-f]{6}$/.test(f.id)) return {status:404,ms:16,json:{type:'not_found',message:'No authorization with id '+f.id+' in the sandbox',request_id:'req_'+hex()}}; return {status:200,ms:29,json:{authorization:f.id,score:22,band:'low',factors:[{name:'token_scope_match',effect:-9},{name:'merchant_history_180d',effect:-6},{name:'cross_border',effect:3}],model:'dgn-risk-4',request_id:'req_'+hex()}} },
     body:function(){ return null }}
   ]}
 ];

 /* ── the events: when each fires, what it carries, a sample delivery ─────────────────── */
 RF.events=[
  {k:'authorization.decisioned', obj:'authorization', objLink:'#authorization', when:'Within a second of the issuer\'s answer, or of stand-in.',
   fields:[['id','string','evt_8a1e77','The event id, prefixed evt_. De-duplicate on it.'],['type','string','authorization.decisioned','The event name.'],['created','timestamp','2026-06-02T06:04:13Z','When the event was generated.'],['api_version','string','v4','The version the payload follows.'],['data','object','The Authorization object','As it stood at the decision.'],['data.decision','enum','approved','approved, partial, declined, stand_in.'],['data.response_code','string','00','The issuer\'s two-digit code.'],['data.issuer_ms','integer','41','How long the issuer took.']],
   sample:{id:'evt_8a1e77',type:'authorization.decisioned',created:'2026-06-02T06:04:13Z',api_version:'v4',data:{id:'auth_71ab3c',decision:'approved',response_code:'00',amount:5820,currency:'USD',merchant_id:'mch_demo',issuer_ms:41,round_trip_ms:44}}},
  {k:'dispute.opened', obj:'case', objLink:'#disputes', when:'When a cardholder\'s bank opens a retrieval or chargeback.',
   fields:[['id','string','evt_8a0c12','The event id.'],['type','string','dispute.opened','The event name.'],['data','object','The Case object','With the stage and the reason.'],['data.reason_code','string','4853','Network reason code, four digits.'],['data.respond_by','date','2026-06-21','Your deadline for evidence.'],['data.amount','integer','12400','Minor units in dispute.']],
   sample:{id:'evt_8a0c12',type:'dispute.opened',created:'2026-06-01T19:14:02Z',api_version:'v4',data:{id:'dsp_41c',authorization:'auth_6f20a1',stage:'chargeback',reason_code:'4853',amount:12400,respond_by:'2026-06-21',status:'needs_response'}}},
  {k:'settlement.posted', obj:'settlement', objLink:'#settlements', when:'When the day\'s cycle is final, by 5:00 AM local.',
   fields:[['id','string','evt_8a1f03','The event id.'],['type','string','settlement.posted','The event name.'],['data','object','The Settlement object','From gross to the wire.'],['data.net','integer','15890400','What was wired.'],['data.wire','string','FW-2026-0602-4471','Bank reference to reconcile against.']],
   sample:{id:'evt_8a1f03',type:'settlement.posted',created:'2026-06-02T10:02:11Z',api_version:'v4',data:{id:'stl_0602',date:'2026-06-02',gross:16421000,fees:180600,adjustments:-129000,net:15890400,wire:'FW-2026-0602-4471',status:'posted'}}},
  {k:'token.updated', obj:'token', objLink:'#tokens', when:'When the issuer changes the card behind a token, usually a reissue.',
   fields:[['id','string','evt_89e2c4','The event id.'],['type','string','token.updated','The event name.'],['data','object','The Token object','After the change. The id does not change.'],['data.reason','enum','card_reissued','card_reissued, card_expired, card_closed.'],['data.last4','string','3504','The new last four.'],['data.expiry','string','2029-05','The new expiry, YYYY-MM.']],
   sample:{id:'evt_89e2c4',type:'token.updated',created:'2026-06-01T06:10:33Z',api_version:'v4',data:{id:'tok_9d1b4e',merchant_id:'mch_demo',reason:'card_reissued',last4:'3504',expiry:'2029-05',status:'active'}}},
  {k:'merchant.risk_changed', obj:null, objLink:'#decisioning', when:'When a merchant\'s behaviour moves outside its own fourteen-day baseline.',
   fields:[['id','string','evt_89b0aa','The event id.'],['type','string','merchant.risk_changed','The event name.'],['data.merchant_id','string','mch_demo','Your identifier for the merchant.'],['data.from','enum','normal','normal, elevated, high.'],['data.to','enum','elevated','normal, elevated, high.'],['data.signal','string','cnp_approval_drop','The signal that moved it.'],['data.baseline','number','0.94','The merchant\'s own baseline for the signal.'],['data.value','number','0.81','Where it is now.']],
   sample:{id:'evt_89b0aa',type:'merchant.risk_changed',created:'2026-06-02T10:12:00Z',api_version:'v4',data:{merchant_id:'mch_demo',from:'normal',to:'elevated',signal:'cnp_approval_drop',baseline:0.94,value:0.81}}},
  {k:'certificate.expiring', obj:null, objLink:'', when:'30 days before a certificate the network reads on your handshake expires, and again at 7.',
   fields:[['id','string','evt_7c1d90','The event id.'],['type','string','certificate.expiring','The event name.'],['data.subject','string','CN=api.acquirer.example','The certificate subject, as read from your handshake.'],['data.environment','enum','production','sandbox, cert, production.'],['data.expires','date','2027-04-02','Expiry date.'],['data.days_left','integer','30','Days remaining.']],
   sample:{id:'evt_7c1d90',type:'certificate.expiring',created:'2027-03-03T06:00:00Z',api_version:'v4',data:{subject:'CN=api.acquirer.example',environment:'production',expires:'2027-04-02',days_left:30}}}
 ];

 /* ── the changelog: what changed in the payload, before and after ─────────────────────
    keyed by the entry's title; lines carry a prefix: ' ' unchanged, '-' before only, '+' after only */
 RF.diffs={
  'authorization.decisioned carries issuer_ms.':{what:'The delivery',lines:[' { "id": "evt_8a1e77", "type": "authorization.decisioned",',' "data": {','   "id": "auth_71ab3c",','   "decision": "approved",','   "response_code": "00",','+   "issuer_ms": 41,','   "round_trip_ms": 44',' } }']},
  'captures accept a batch of up to 5,000 ids.':{what:'The request',lines:[' POST /acceptance/v1/captures','-{ "authorization_id": "auth_71ab3c" }','+{ "authorization_ids": ["auth_71ab3c", "auth_71ab40", "auth_71ab52"] }',' ','+// a single authorization_id still works']},
  'Idempotency window is 24 hours, from 12.':{what:'The request',lines:[' POST /acceptance/v1/authorizations',' Idempotency-Key: 7c9e6679-…','-// the same key within 12 hours returns the original response','+// the same key within 24 hours returns the original response']},
  'v3 retires February 28, 2028.':{what:'Any v3 call, from that date',lines:[' GET /acceptance/v3/authorizations/auth_71ab3c','-200 { "id": "auth_71ab3c", "decision": "approved", … }','+410 { "type": "version_retired",','+      "message": "v3 retired February 28, 2028. Call /acceptance/v1 on v4." }']},
  'Network risk score on every authorization response.':{what:'The response',lines:[' { "id": "auth_71ab3c",','   "decision": "approved",','   "response_code": "00",','   "approved_amount": 5820,','+   "score": 22,','+   "score_reasons": ["token_scope_match", "merchant_history_180d"],','   "round_trip_ms": 44 }']},
  'Webhook signatures carry a timestamp.':{what:'The delivery headers',lines:[' POST https://api.acquirer.example/dgn/events',' Content-Type: application/json','-DGN-Signature: v1=c17172315351a1c5e9…','+DGN-Signature: t=1717315452,v1=c17172315351a1c5e9…','+// reject anything older than five minutes']}
 };

 /* ── versions, as spans on a time axis (months from January 2022) ────────────────────── */
 RF.versions=[
  {v:'v4',state:'Current',from:[2026,2],to:null},
  {v:'v3',state:'Retiring',from:[2023,6],to:[2028,2]},
  {v:'v2',state:'Retired',from:[2022,3],to:[2025,6]}
 ];

 /* ── the SDKs: install and first call per language ────────────────────────────────────── */
 RF.sdks=[
  {k:'node',n:'Node',v:'4.2.1',req:'Node 18 or later',pkg:'@dgn/node',
   code:'npm install @dgn/node\n\n// first call\nimport { Network } from "@dgn/node";\nconst dgn = new Network({ clientId: process.env.DGN_ID, clientSecret: process.env.DGN_SECRET, env: "sandbox" });\nconst auth = await dgn.authorizations.create({\n  amount: 5820, currency: "USD", merchantId: "mch_demo",\n  panToken: "tok_9d1b4e", entryMode: "contactless"\n});\nconsole.log(auth.decision, auth.responseCode);   // approved 00'},
  {k:'python',n:'Python',v:'4.2.0',req:'Python 3.9 or later',pkg:'dgn',
   code:'pip install dgn\n\n# first call\nimport os, dgn\nclient = dgn.Network(client_id=os.environ["DGN_ID"], client_secret=os.environ["DGN_SECRET"], env="sandbox")\nauth = client.authorizations.create(\n  amount=5820, currency="USD", merchant_id="mch_demo",\n  pan_token="tok_9d1b4e", entry_mode="contactless")\nprint(auth.decision, auth.response_code)   # approved 00'},
  {k:'java',n:'Java',v:'4.2.0',req:'Java 17 or later',pkg:'com.dgn:dgn-java',
   code:'// build.gradle\nimplementation "com.dgn:dgn-java:4.2.0"\n\n// first call\nNetwork dgn = Network.builder().clientId(System.getenv("DGN_ID")).clientSecret(System.getenv("DGN_SECRET")).env(Env.SANDBOX).build();\nAuthorization auth = dgn.authorizations().create(AuthorizationParams.builder()\n  .amount(5820L).currency("USD").merchantId("mch_demo")\n  .panToken("tok_9d1b4e").entryMode(EntryMode.CONTACTLESS).build());\nSystem.out.println(auth.getDecision() + " " + auth.getResponseCode());   // approved 00'},
  {k:'dotnet',n:'.NET',v:'4.2.0',req:'.NET 8 or later',pkg:'Dgn',
   code:'dotnet add package Dgn\n\n// first call\nvar dgn = new DgnClient(Environment.GetEnvironmentVariable("DGN_ID"), Environment.GetEnvironmentVariable("DGN_SECRET"), DgnEnv.Sandbox);\nvar auth = await dgn.Authorizations.CreateAsync(new AuthorizationCreate {\n  Amount = 5820, Currency = "USD", MerchantId = "mch_demo",\n  PanToken = "tok_9d1b4e", EntryMode = EntryMode.Contactless\n});\nConsole.WriteLine($"{auth.Decision} {auth.ResponseCode}");   // approved 00'},
  {k:'go',n:'Go',v:'4.1.3',req:'Go 1.21 or later',pkg:'github.com/dgn/dgn-go',
   code:'go get github.com/dgn/dgn-go\n\n// first call\nimport dgn "github.com/dgn/dgn-go"\nclient := dgn.New(os.Getenv("DGN_ID"), os.Getenv("DGN_SECRET"), dgn.Sandbox)\nauth, err := client.Authorizations.Create(ctx, &dgn.AuthorizationParams{\n  Amount: 5820, Currency: "USD", MerchantID: "mch_demo",\n  PanToken: "tok_9d1b4e", EntryMode: dgn.Contactless,\n})\nfmt.Println(auth.Decision, auth.ResponseCode)   // approved 00'}
 ];
 RF.cli=[
  ['Install','npm install -g @dgn/cli','One binary. Node 18 or later.'],
  ['Log in','dgn login','Opens the portal to grant a sandbox key. The key stays on your machine.'],
  ['Send a request','dgn authorizations create --amount 5820 --currency USD --card 6011330000000005','Prints the Authorization object and its request id.'],
  ['Listen for events','dgn events listen --forward-to localhost:4000/dgn/events','Forwards signed deliveries to your handler without a registered URL, and prints the session\'s signing secret.']
 ];
 RF.samples=[
  ['Acquirer host','Node','Authorize, capture and reverse against the sandbox, with a webhook handler that verifies signatures.',[1,1,1,0]],
  ['ISO 8583 bridge','Java','Maps a 1987-variant message onto the Authorization object, field by field.',[1,1,0,0]],
  ['Disputes evidence','Python','Lists open cases, uploads evidence per type, submits before the deadline.',[0,0,1,1]]
 ];
 RF.sampleCols=['Authorize','Capture','Events','Disputes'];

 /* ── status: the products, their surfaces, 90 days, and each incident as a sequence ──── */
 RF.status={
  clock:'June 2', /* the site's clock; the history runs 90 days back from it */
  products:[
   ['Acceptance','/acceptance/v1','99.99%'],
   ['Tokens','/tokens/v1','100%'],
   ['Disputes','/disputes/v1','100%'],
   ['Webhooks','Deliveries to your endpoint','99.98%'],
   ['Settlement reports','/money/v1','100%'],
   ['Sandbox','sandbox.api.dgn.com','99.97%']
  ],
  maintenance:{product:'Sandbox',when:'Sunday, June 7, 2:00 to 4:00 AM ET',t:'Sandbox unavailable while the test issuer is upgraded',d:'Requests to sandbox.api.dgn.com are refused with 503 for the window. Certification and production are not affected. Deliveries queued in the window are sent when it closes.'},
  incidents:[
   {date:'May 22',product:'Acceptance',kind:'w',t:'Issuer responses slow for one BIN range',span:'6:12 to 7:40 AM ET',mins:88,sum:'Stand-in rules answered. No authorization was lost.',
    steps:[['6:12 AM ET','Investigating','Issuer answer times over 500 ms for one BIN range. Stand-in rules are answering for partners who set them.'],['6:31 AM ET','Identified','The issuer confirmed a failover on its side. Answer times are falling.'],['7:15 AM ET','Monitoring','Answer times under 60 ms for 30 minutes. Watching for another 25.'],['7:40 AM ET','Resolved','1,212 authorizations were answered by stand-in. None was lost.']]},
   {date:'April 30',product:'Sandbox',kind:'b',t:'Sandbox unavailable',span:'2:00 to 2:40 AM ET',mins:40,sum:'Scheduled maintenance ran long. Production was not affected.',
    steps:[['2:00 AM ET','Maintenance','The sandbox is down for the scheduled window, until 2:30 AM ET.'],['2:30 AM ET','Investigating','The window closed and the test issuer did not come back. Requests return 503.'],['2:40 AM ET','Resolved','The test issuer is answering. Deliveries queued in the window were sent.']]},
   {date:'March 18',product:'Webhooks',kind:'w',t:'Webhook deliveries delayed',span:'8:10 to 8:52 AM ET',mins:42,sum:'Up to 12 minutes late for 3% of endpoints. No delivery was lost.',
    steps:[['8:10 AM ET','Investigating','Deliveries to one region are queueing. Events are generated on time and signed on send.'],['8:26 AM ET','Identified','A delivery worker pool in that region is saturated. Capacity added.'],['8:52 AM ET','Resolved','The queue is empty. The latest delivery was 12 minutes late; 3% of endpoints were affected.']]}
  ]
 };

 /* ── helpers ─────────────────────────────────────────────────────────────────────────── */
 var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'], DAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
 /* the 90 days ending on the clock, as "Month D" labels, without a Date object */
 RF.days=function(){ var m=MONTHS.indexOf(RF.status.clock.split(' ')[0]), d=+RF.status.clock.split(' ')[1]; var out=[]; for(var i=0;i<90;i++){ out.unshift(MONTHS[m]+' '+d); d--; if(d<1){ m=(m+11)%12; d=DAYS[m] } } return out };
 function fieldTable(rows,send){ return '<div class="gn-table-wrap rf-fields"><table class="gn-table"><thead><tr><th scope="col">Field</th><th scope="col">Type</th>'+(send?'<th scope="col">Required</th>':'')+'<th scope="col">Example</th></tr></thead><tbody>'+rows.map(function(r){ var i=send?1:0; return '<tr><td>'+mono(r[0])+'<em>'+esc(r[3+i])+'</em></td><td class="rf-type">'+esc(r[1])+'</td>'+(send?'<td><span class="gn-status '+(r[2]?'is-warn">Required':'is-quiet">Optional')+'</span></td>':'')+'<td>'+mono(r[2+i])+'</td></tr>' }).join('')+'</tbody></table></div>' }
 function code(s,ink){ return '<pre class="gn-code'+(ink?' gn-code--ink':'')+'">'+esc(s)+'</pre>' }
 function langs(req){ return '<div class="dv-code" style="margin-top:8px"><pre class="gn-code gn-code--ink" data-lang="curl" data-name="cURL">'+esc(req.curl)+'</pre><pre class="gn-code gn-code--ink" data-lang="node" data-name="Node">'+esc(req.node)+'</pre><pre class="gn-code gn-code--ink" data-lang="python" data-name="Python">'+esc(req.python)+'</pre></div>' }
 RF.endpoint=function(id){ var out=null; RF.objects.forEach(function(o){ o.endpoints.forEach(function(e){ if(e.id===id) out=e }) }); return out };

 /* ── the reference page ──────────────────────────────────────────────────────────────── */
 function paintObjects(){ RF.objects.forEach(function(o){ var host=document.getElementById('rf-'+o.id); if(!host) return;
  host.innerHTML='<div class="dv-ep rf-obj"><div><h3>'+esc(o.t)+'</h3><p>'+esc(o.d)+'</p>'+fieldTable(o.fields,false)+'</div><div class="gn-ref-c"><span class="gn-label">The object</span>'+code(J(o.sample),true)+'</div></div>'+
   o.endpoints.map(function(e){ return '<div class="dv-ep rf-ep" id="'+e.id+'"><div><div class="gn-endpoint"><span class="gn-method">'+e.m+'</span><span class="gn-mono">'+esc(e.p)+'</span></div><h3>'+esc(e.t)+'</h3><p>'+esc(e.d)+'</p><div class="gn-section gn-section--h3"><h3>What you send</h3></div>'+fieldTable(e.send,true)+'<div class="gn-section gn-section--h3"><h3>What comes back</h3></div><p>'+esc(e.back)+'</p></div><div class="gn-ref-c" id="rfc-'+e.id+'"><span class="gn-label">Request</span>'+langs(e.req)+'<span class="gn-label" style="display:block;margin-top:16px">Response</span>'+code(J(e.res),true)+'<div class="gn-actions" style="margin-top:12px"><button class="gn-link gn-link--go" type="button" data-try="'+e.id+'" aria-expanded="false">Try it '+gnIcon('go','gn-icon--sm')+'</button></div><div class="rf-try-host"></div></div></div>' }).join('') }) }

 /* try it: the fields fill the request; Send answers from the demo sandbox's rules */
 var trying=null;
 RF.tryOpen=function(id){ var e=RF.endpoint(id); if(!e) return; if(trying) RF.tryClose(); var host=document.querySelector('#rfc-'+id+' .rf-try-host'); if(!host) return; trying=id;
  var col=host.closest('.gn-ref-c'); col.classList.add('is-trying'); document.querySelector('[data-try="'+id+'"]').setAttribute('aria-expanded','true');
  host.innerHTML='<div class="gn-ask gn-ask--wide rf-try"><div class="gn-ask-h"><b>Try '+esc(e.t.toLowerCase())+'</b><span>Sends to the shared demo sandbox with the demo credentials. Edit a field and the request follows.</span></div><div class="rf-try-f">'+e.try.map(function(f){ var id='try-'+e.id+'-'+f.k, lab=esc(f.l||f.k); if(f.t==='card') return '<label class="gn-field"><span class="gn-field-l">'+lab+'</span><select class="gn-in gn-in--mono" data-k="card" id="'+id+'">'+DV.cards.map(function(c,i){ return '<option value="'+i+'">'+c[0]+' · '+c[1]+'</option>' }).join('')+'</select></label>'; if(f.t==='select') return '<label class="gn-field"><span class="gn-field-l">'+lab+'</span><select class="gn-in gn-in--mono" data-k="'+f.k+'" id="'+id+'">'+f.o.map(function(o){ return '<option'+(o===f.v?' selected':'')+'>'+o+'</option>' }).join('')+'</select></label>'; return '<label class="gn-field"><span class="gn-field-l">'+lab+(f.opt?' <small>Optional</small>':'')+'</span><input class="gn-in gn-in--mono" data-k="'+f.k+'" id="'+id+'" value="'+esc(f.v)+'"'+(f.t==='int'?' inputmode="numeric"':'')+'></label>' }).join('')+'</div><div class="gn-console"><div class="gn-console-bar"><span class="gn-mono" id="tryPath"></span><span class="gn-rs" id="tryRs"></span></div><pre id="tryOut" aria-live="polite"></pre></div><div class="gn-actions" style="margin-top:16px"><button class="gn-btn gn-btn--primary" type="button" data-send="'+e.id+'">Send</button><button class="gn-link" type="button" data-try-close>Close</button></div></div>';
  host.addEventListener('input',function(){ RF.tryPreview(e) }); host.addEventListener('change',function(){ RF.tryPreview(e) }); RF.tryPreview(e); var first=host.querySelector('.gn-in'); if(first) first.focus() };
 RF.tryClose=function(){ if(!trying) return; var host=document.querySelector('#rfc-'+trying+' .rf-try-host'); var b=document.querySelector('[data-try="'+trying+'"]'); if(host){ host.innerHTML=''; host.closest('.gn-ref-c').classList.remove('is-trying') } if(b){ b.setAttribute('aria-expanded','false'); b.focus() } trying=null };
 function tryValues(e){ var f={}; document.querySelectorAll('#rfc-'+e.id+' .rf-try [data-k]').forEach(function(i){ f[i.getAttribute('data-k')]=i.value.trim() }); return f }
 function tryBody(e,f){ if(e.body) return e.body(f); var b={}; e.try.forEach(function(t){ if(t.path||t.t==='card') return; var v=f[t.k]; if(v==='') return; b[t.k]=t.t==='int'?(+v):v }); if(f.card!==undefined) b.pan=DV.cards[+f.card][0].replace(/ /g,''); return b }
 function tryPath(e,f){ return e.p.replace(/\{(\w+)\}/g,function(_,k){ return f[k]||'{'+k+'}' }) }
 RF.tryPreview=function(e){ var f=tryValues(e), b=tryBody(e,f); var path=document.getElementById('tryPath'), out=document.getElementById('tryOut'); if(!path) return; path.textContent=e.m+' '+tryPath(e,f); out.textContent=b?J(b):'<span class="gn-console-wait">No body. Press Send.</span>'; if(!b) out.innerHTML='<span class="gn-console-wait">No body. Press Send.</span>'; document.getElementById('tryRs').innerHTML='' };
 RF.trySend=function(id){ var e=RF.endpoint(id); var host=document.querySelector('#rfc-'+id+' .rf-try'); var bad=null; e.try.forEach(function(t){ var i=host.querySelector('[data-k="'+t.k+'"]'); if(!i||t.t==='card'||t.t==='select') return; var v=i.value.trim(); var msg=''; if(t.t==='int'){ if(v===''&&!t.opt) msg='Enter minor units, like 5820.'; else if(v!==''&&!/^\d+$/.test(v)) msg='Enter minor units, like 5820.'; else if(v!==''&&+v<1) msg='Enter minor units, like 5820.' } else if(!t.opt&&v==='') msg='Enter '+(t.l||t.k)+'.'; if(!dvErr(i,msg)&&!bad) bad=i }); if(bad){ bad.focus(); return } var out=document.getElementById('tryOut'), rs=document.getElementById('tryRs'); if(dvOffline()){ rs.innerHTML=''; out.textContent='You\'re offline. The request was not sent; the sandbox needs a connection.'; return } var f=tryValues(e), b=tryBody(e,f), r=e.respond(b||{},f); rs.innerHTML='<b'+(r.status<300?'':' class="is-slow"')+'>'+r.status+'</b> · '+r.ms+' ms'; out.textContent=(b?J(b)+'\n\n':'')+'// response\n'+J(r.json) };

 /* the events reference: a picker across the six, one panel each, the delivery sequence drawn once */
 function seqSvg(){ var m='<defs><marker id="rfArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs>';
  var lane=function(y,t){ return '<text class="t" x="0" y="'+(y+4)+'">'+t+'</text><line class="lane" x1="120" x2="800" y1="'+y+'" y2="'+y+'"/>' };
  var down=function(x,l){ return '<line class="arr" x1="'+x+'" x2="'+x+'" y1="66" y2="146" marker-end="url(#rfArr)"/><text class="lbl" x="'+(x+8)+'" y="100">'+l+'</text>' };
  var up=function(x,l,c){ return '<line class="arr '+c+'" x1="'+x+'" x2="'+x+'" y1="154" y2="74" marker-end="url(#rfArr)"/><text class="lbl '+c+'" x="'+(x+8)+'" y="128">'+l+'</text>' };
  return '<svg viewBox="0 0 800 200" role="img" aria-label="Delivery sequence: the network posts a signed event, your endpoint answers 2xx within 10 seconds, and anything else is retried from one minute to one hour for three days">'+m+lane(60,'Network')+lane(150,'Your endpoint')+
   down(140,'POST, signed')+up(236,'2xx in 10 s','ok')+'<text class="lbl" x="140" y="46">Delivered once</text>'+
   down(340,'+1 min')+up(436,'503','no')+down(500,'+5 min')+up(596,'timeout','no')+down(660,'+1 h')+up(756,'2xx','ok')+'<text class="lbl" x="340" y="46">Retried with the same event id, backing off, for three days</text>'+
   '<text class="lbl" x="140" y="192">0</text><text class="lbl" x="340" y="192">first retry</text><text class="lbl" x="600" y="192">then hourly</text><text class="lbl" x="800" y="192" text-anchor="end">3 days: failing</text></svg>' }
 function paintEvents(){ var el=document.getElementById('rfEvents'); if(!el) return; var seq=document.getElementById('rfSeq'); if(seq) seq.innerHTML=seqSvg();
  el.innerHTML='<div class="gn-tabs rf-evtabs" role="tablist" aria-label="Event">'+RF.events.map(function(e,i){ var id='ev-'+e.k.replace('.','-'); return '<button role="tab" id="tab-'+id+'" aria-controls="'+id+'" aria-selected="'+(i===0)+'" tabindex="'+(i===0?0:-1)+'" data-ev="'+e.k+'">'+e.k+'</button>' }).join('')+'</div>'+
   RF.events.map(function(e,i){ var id='ev-'+e.k.replace('.','-'); return '<div class="rf-evpanel dv-ep" role="tabpanel" id="'+id+'" aria-labelledby="tab-'+id+'"'+(i?' hidden':'')+'><div><div class="gn-doc gn-doc--2 rf-evwhen"><div class="gn-doc-r"><span class="gn-doc-l">When</span><span class="gn-doc-v">'+esc(e.when)+'</span></div><div class="gn-doc-r"><span class="gn-doc-l">Carries</span><span class="gn-doc-v">'+(e.obj?'<a href="'+e.objLink+'">The '+e.obj.charAt(0).toUpperCase()+e.obj.slice(1)+' object</a>':'Its own fields')+'</span></div></div>'+fieldTable(e.fields,false)+'</div><div class="gn-ref-c"><span class="gn-label">A delivery</span>'+code('POST https://api.acquirer.example/dgn/events\nDGN-Signature: t=1717315452,v1=c17172315351a1c5e9…\n\n'+J(e.sample),true)+'<div class="gn-actions" style="margin-top:12px"><a class="gn-link" href="../docs/webhooks.html#verify">Verify the signature</a></div></div></div>' }).join('');
  var tabs=[].slice.call(el.querySelectorAll('[role=tab]')); function show(k,focus){ tabs.forEach(function(t){ var on=t.getAttribute('data-ev')===k; t.setAttribute('aria-selected',on); t.setAttribute('tabindex',on?'0':'-1'); document.getElementById(t.getAttribute('aria-controls')).hidden=!on; if(on&&focus) t.focus() }) }
  el.addEventListener('click',function(ev){ var t=ev.target.closest('[role=tab]'); if(t) show(t.getAttribute('data-ev')) });
  el.addEventListener('keydown',function(ev){ var t=ev.target.closest('[role=tab]'); if(!t||!/^Arrow(Left|Right)|Home|End$/.test(ev.key)) return; var i=tabs.indexOf(t), n=/Left/.test(ev.key)?(i+tabs.length-1)%tabs.length:/Right/.test(ev.key)?(i+1)%tabs.length:ev.key==='Home'?0:tabs.length-1; ev.preventDefault(); show(tabs[n].getAttribute('data-ev'),true) });
  /* a map link or a deep link to one event opens its panel */
  function landEv(){ var h=location.hash.slice(1); if(/^ev-/.test(h)){ var k=h.slice(3).replace('-','.'); if(RF.events.some(function(e){ return e.k===k })) show(k) } } window.addEventListener('hashchange',landEv); landEv();
  RF.showEvent=show }

 /* the error catalogue: one table, a lookup that filters it, the two answer shapes beside */
 function paintErrors(){ var el=document.getElementById('rfErrors'); if(!el) return;
  var tone=function(s){ return s==='5xx'||s==='429'||s==='409'?'is-warn':'is-bad' };
  var rows=DV.codes.map(function(c){ return {k:'code',code:c[0],tone:DV.tone(c[0]),name:c[1],what:c[2],doit:c[3]} }).concat(DV.errors.map(function(e){ return {k:'type',code:e[1],tone:tone(e[1]),name:e[0],what:e[2],doit:e[3],mono:true} }));
  el.innerHTML='<div class="dv-ep rf-err"><div><label class="gn-search--field rf-lookup">'+gnIcon('search')+'<input class="gn-in gn-in--sm" id="rfLookup" placeholder="A code, a status or a type, like 51, 409 or rate_limited" aria-label="Look up a code, a status or a type"></label><div class="gn-table-wrap rf-fields"><table class="gn-table"><thead><tr><th scope="col">Code</th><th scope="col">Meaning</th><th scope="col">What to do</th></tr></thead><tbody id="rfErrBody">'+rows.map(function(r){ return '<tr data-q="'+esc((r.code+' '+r.name+' '+r.what+' '+(r.k==='code'?'response code decline':'http status type error')).toLowerCase())+'"><td><span class="gn-status '+r.tone+'">'+r.code+'</span><em>'+(r.k==='code'?'Response code':'HTTP status')+'</em></td><td>'+(r.mono?mono(r.name):esc(r.name))+'<em>'+esc(r.what)+'</em></td><td>'+esc(r.doit)+'</td></tr>' }).join('')+'</tbody></table></div><div class="gn-empty" id="rfErrNone" hidden></div></div><div class="gn-ref-c"><span class="gn-label">A decline is a 200</span>'+code('HTTP/1.1 200 OK\n'+J({id:'auth_71ab52',decision:'declined',response_code:'51',reason:'insufficient_funds',request_id:'req_71ab52'}),true)+'<span class="gn-label" style="display:block;margin-top:16px">A request the network could not process</span>'+code('HTTP/1.1 400 Bad Request\n'+J({type:'invalid_request',message:'amount must be a positive integer in minor units',param:'amount',request_id:'req_71ab00'}),true)+'<div class="gn-actions" style="margin-top:12px"><a class="gn-link" href="../docs/errors.html#retry">When to retry</a></div></div></div>';
  var q=document.getElementById('rfLookup'), body=document.getElementById('rfErrBody'), none=document.getElementById('rfErrNone');
  var run=function(){ var v=q.value.trim().toLowerCase(), n=0; body.querySelectorAll('tr').forEach(function(tr){ var on=!v||tr.getAttribute('data-q').indexOf(v)>-1; tr.hidden=!on; if(on) n++ }); none.hidden=n>0; if(!n) none.innerHTML='<b>No code matches '+esc(q.value.trim())+'.</b><span>Try the two-digit response code, the HTTP status, or the type from the body.</span>' };
  q.addEventListener('input',run); q.addEventListener('dv-restored',run); run() }

 /* ── the changelog: the timeline with a diff under each entry that changed a payload ── */
 window.clFilter='all'; var clShown=12;
 function diff(d){ var side=function(keep,cls){ return '<pre class="gn-code">'+d.lines.filter(function(l){ return l[0]===' '||l[0]===keep }).map(function(l){ return l[0]===keep?'<span class="'+cls+'">'+esc(keep+l.slice(1))+'</span>':esc(' '+l.slice(1)) }).join('\n')+'</pre>' }; return '<div class="rf-diff"><div><span class="gn-label">'+esc(d.what)+' before</span>'+side('-','rf-del')+'</div><div><span class="gn-label">'+esc(d.what)+' after</span>'+side('+','rf-add')+'</div></div>' }
 window.paintCl=function(f,more){ if(f!==window.clFilter){ window.clFilter=f; clShown=12 } if(more) clShown+=12; var all=DV.changelog.filter(function(c){ return f==='all'||c[2]===f }), list=all.slice(0,clShown), g={}; list.forEach(function(c){ (g[c[0]]=g[c[0]]||[]).push(c) });
  document.getElementById('cl').innerHTML=(all.length?'':'<div class="gn-empty"><b>No '+f.toLowerCase()+' entries.</b><span>Every change since v4.0 is under All.</span></div>')+Object.keys(g).map(function(d){ return '<div class="gn-tl-day"><div class="gn-eyebrow gn-tl-h">'+DV.date(d)+'</div>'+g[d].map(function(c){ var df=RF.diffs[c[3]]; return '<div class="gn-tl-i"><span class="gn-tl-t">'+c[1]+'</span><div class="gn-tl-b"><b>'+c[3]+'</b><p><span class="gn-label" style="display:block;margin-bottom:2px">What changes for you</span>'+c[4]+(c[5]?' <a href="'+c[5]+'">'+c[6]+'</a>':'')+'</p></div><div class="gn-tl-r"><span class="gn-status'+(c[2]==='Deprecated'?' is-warn':c[2]==='Changed'?'':' is-good')+'">'+c[2]+'</span></div>'+(df?diff(df):'')+'</div>' }).join('')+'</div>' }).join('')+(all.length>list.length?'<div class="gn-pager"><span>'+list.length+' of '+all.length+'</span><button class="gn-link" type="button" onclick="paintCl(clFilter,true)">Show '+Math.min(12,all.length-list.length)+' more</button></div>':all.length>12?'<div class="gn-pager"><span>'+all.length+' of '+all.length+'</span></div>':'');
  var seg=document.getElementById('clSeg'); if(seg) seg.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-k')===f)) }) };
 function paintLife(){ var el=document.getElementById('rfLife'); if(!el) return; var x0=120, w=600, y0=[2022,1], span=7*12; var X=function(y,m){ return x0+((y-y0[0])*12+(m-y0[1]))/span*w }; var today=X(2026,6);
  el.innerHTML='<svg viewBox="0 0 760 140" role="img" aria-label="Version lifecycle: v2 March 2022 to June 2025, v3 June 2023 to February 2028, v4 from February 2026">'+[2022,2023,2024,2025,2026,2027,2028].map(function(y){ var x=X(y,1); return '<line class="g" x1="'+x+'" x2="'+x+'" y1="8" y2="104"/><text class="xl" x="'+x+'" y="124" text-anchor="middle">'+y+'</text>' }).join('')+
   RF.versions.map(function(v,i){ var y=20+i*28, a=X(v.from[0],v.from[1]), b=v.to?X(v.to[0],v.to[1]):x0+w; return '<text class="xl v" x="0" y="'+(y+14)+'">'+v.v+'</text><text class="xl s" x="40" y="'+(y+14)+'">'+v.state+'</text><rect class="'+(v.state==='Current'?'cur':v.state==='Retiring'?'ret':'old')+'" x="'+a+'" y="'+y+'" width="'+(b-a)+'" height="20" rx="3"/>'+(v.to?'':'<text class="xl" x="'+(b+4)+'" y="'+(y+14)+'">→</text>') }).join('')+
   '<line class="hl" x1="'+today+'" x2="'+today+'" y1="8" y2="104"/><text class="xl" x="'+(today+6)+'" y="16">Today</text></svg>' }

 /* ── SDKs: one panel per language, the CLI as steps, samples as a matrix ─────────────── */
 function paintSdks(){ var el=document.getElementById('rfSdks'); if(!el) return; var cur='node'; try{ var l=localStorage.getItem('rf-sdk')||localStorage.getItem('dv-lang'); if(RF.sdks.some(function(s){ return s.k===l })) cur=l }catch(x){}
  el.innerHTML='<div class="gn-tabs" role="tablist" aria-label="Library language">'+RF.sdks.map(function(s){ return '<button role="tab" id="sdk-tab-'+s.k+'" aria-controls="sdk-'+s.k+'" data-lang="'+s.k+'">'+s.n+'</button>' }).join('')+'</div>'+
   RF.sdks.map(function(s){ return '<div class="rf-sdk" role="tabpanel" id="sdk-'+s.k+'" aria-labelledby="sdk-tab-'+s.k+'" hidden><div class="gn-doc"><div class="gn-doc-r"><span class="gn-doc-l">Package</span><span class="gn-doc-v gn-mono">'+esc(s.pkg)+'</span></div><div class="gn-doc-r"><span class="gn-doc-l">Version</span><span class="gn-doc-v">'+s.v+'</span></div><div class="gn-doc-r"><span class="gn-doc-l">Requires</span><span class="gn-doc-v">'+esc(s.req)+'</span></div><div class="gn-doc-r"><span class="gn-doc-l">Token</span><span class="gn-doc-v">Exchanged and refreshed for you</span></div><div class="gn-doc-r"><span class="gn-doc-l">Idempotency</span><span class="gn-doc-v">A key per call, or the one you pass</span></div><div class="gn-doc-r"><span class="gn-doc-l">Retries</span><span class="gn-doc-v">5xx and 429 with the same key, from one second</span></div></div></div>' }).join('')+
   '<div class="dv-code-wrap rf-code"><div class="dv-code-h"><span class="gn-label" id="rfSdkLabel">Install and first call</span><button class="gn-link" type="button" data-copy-code>Copy</button></div>'+RF.sdks.map(function(s){ return '<pre class="gn-code" data-lang="'+s.k+'" data-name="'+s.n+'">'+esc(s.code)+'</pre>' }).join('')+'</div>';
  var tabs=[].slice.call(el.querySelectorAll('[role=tab]'));
  function show(k,focus){ tabs.forEach(function(t){ var on=t.getAttribute('data-lang')===k; t.setAttribute('aria-selected',on); t.setAttribute('tabindex',on?'0':'-1'); document.getElementById(t.getAttribute('aria-controls')).hidden=!on; if(on&&focus) t.focus() }); el.querySelectorAll('.rf-code pre').forEach(function(p){ p.classList.toggle('is-on',p.getAttribute('data-lang')===k) }); var s=RF.sdks.filter(function(s){ return s.k===k })[0]; document.getElementById('rfSdkLabel').textContent='Install and first call, '+s.n; try{ localStorage.setItem('rf-sdk',k) }catch(x){} }
  el.addEventListener('click',function(ev){ var t=ev.target.closest('[role=tab]'); if(t) show(t.getAttribute('data-lang')) });
  el.addEventListener('keydown',function(ev){ var t=ev.target.closest('[role=tab]'); if(!t||!/^Arrow(Left|Right)|Home|End$/.test(ev.key)) return; var i=tabs.indexOf(t), n=/Left/.test(ev.key)?(i+tabs.length-1)%tabs.length:/Right/.test(ev.key)?(i+1)%tabs.length:ev.key==='Home'?0:tabs.length-1; ev.preventDefault(); show(tabs[n].getAttribute('data-lang'),true) });
  show(cur);
  var cli=document.getElementById('rfCli'); if(cli) cli.innerHTML='<ol class="gn-stepper gn-stepper--v" style="--n:4">'+RF.cli.map(function(s,i){ return '<li><i>'+(i+1)+'</i><div><b>'+esc(s[0])+'</b><span><span class="gn-key">'+esc(s[1])+'</span></span><em>'+esc(s[2])+'</em></div></li>' }).join('')+'</ol>';
  var sm=document.getElementById('rfSamples'); if(sm) sm.innerHTML='<div class="gn-matrix rf-matrix" style="--cols:'+RF.sampleCols.length+'"><div class="gn-matrix-r is-head"><span>Sample</span>'+RF.sampleCols.map(function(c){ return '<span>'+c+'</span>' }).join('')+'</div>'+RF.samples.map(function(s){ return '<div class="gn-matrix-r"><span>'+esc(s[0])+', '+s[1]+'<small>'+esc(s[2])+'</small></span>'+s[3].map(function(on,i){ return '<span class="rf-cell">'+(on?gnIcon('check','gn-icon--sm')+'<span class="dv-sr">'+RF.sampleCols[i]+'</span>':'<span class="gn-mute" aria-label="Not covered">—</span>')+'</span>' }).join('')+'</div>' }).join('')+'</div>' }

 /* ── status: products with a 90-day history each, the maintenance notice, incidents as sequences */
 function paintStatus(){ var now=document.getElementById('rfNow'); if(!now) return; var days=RF.days(); var byDay={}; RF.status.incidents.forEach(function(i){ byDay[i.product+'|'+i.date]=i });
  now.innerHTML=RF.status.products.map(function(p){ var ok=!(p[0]===RF.status.maintenance.product); return '<div class="rf-prod"><div class="rf-prod-h"><div><b>'+p[0]+'</b><span class="gn-mono">'+esc(p[1])+'</span></div><span class="gn-num">'+p[2]+' over 90 days</span><span class="gn-status '+(ok?'is-good':'is-warn')+'">'+(ok?'Operational':'Maintenance scheduled')+'</span></div><div class="dv-hist rf-hist" role="img" aria-label="'+p[0]+', 90 days: '+p[2]+' available">'+days.map(function(d){ var i=byDay[p[0]+'|'+d]; return '<i class="gn-tip'+(i?' '+i.kind:'')+'" data-tip="'+esc(d+(i?' · '+i.t+', '+i.mins+' minutes':' · Operational'))+'"></i>' }).join('')+'</div></div>' }).join('')+'<div class="gn-chart-ax rf-hist-ax"><span><span class="rf-90">'+days[0]+'</span><span class="rf-30">'+days[60]+'</span></span><span>'+days[89]+', today</span></div>';
  var mt=document.getElementById('rfMaint'); if(mt){ var m=RF.status.maintenance; mt.innerHTML='<div class="gn-notice"><div class="gn-notice-h"><span class="gn-status is-warn">Scheduled</span><span>'+m.when+'</span></div><h3>'+esc(m.t)+'</h3><p>'+esc(m.d)+'</p><div class="gn-notice-f"><span>'+m.product+'</span></div></div>' }
  var inc=document.getElementById('rfInc'); if(inc) inc.innerHTML=RF.status.incidents.map(function(i){ return '<div class="gn-alert is-fixed rf-inc"><div class="gn-alert-h"><div><b>'+esc(i.t)+'</b><span>'+i.date+' · '+i.product+' · '+i.span+' · '+i.mins+' minutes</span></div><span class="gn-status is-good">Resolved</span></div><p>'+esc(i.sum)+'</p><div class="gn-alert-s">'+i.steps.map(function(s){ var tone=s[1]==='Resolved'?'is-good':s[1]==='Monitoring'?'is-quiet':'is-warn'; return '<div><b>'+s[0]+'</b><span><span class="gn-status '+tone+'">'+s[1]+'</span> '+esc(s[2])+'</span></div>' }).join('')+'</div></div>' }).join('') }

 /* ── wire ─────────────────────────────────────────────────────────────────────────────── */
 paintObjects(); paintEvents(); paintErrors(); paintLife(); paintSdks(); paintStatus(); if(document.getElementById('cl')) paintCl('all');
 document.addEventListener('click',function(ev){ var t=ev.target.closest('[data-try]'); if(t){ if(trying===t.getAttribute('data-try')) RF.tryClose(); else RF.tryOpen(t.getAttribute('data-try')); return } if(ev.target.closest('[data-try-close]')){ RF.tryClose(); return } var s=ev.target.closest('[data-send]'); if(s) RF.trySend(s.getAttribute('data-send')); var ml=ev.target.closest('#rfMap a[data-ev]'); if(ml&&RF.showEvent) RF.showEvent(ml.getAttribute('data-ev')) });
 document.addEventListener('keydown',function(ev){ if(ev.key==='Escape'&&trying&&ev.target.closest('.rf-try')) RF.tryClose() });
})();
