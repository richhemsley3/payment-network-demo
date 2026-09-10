/* invented content for the public developer site, consistent with the story prototype */
window.DV={
 base:{sandbox:'https://sandbox.api.dgn.com',cert:'https://cert.api.dgn.com',prod:'https://api.dgn.com'},
 cards:[
  ['6011 3300 0000 0005','Approved','00','Approved. avs.street and avs.postal both Y.'],
  ['6011 3300 0000 0385','Partial approval','10','Approves half the requested amount. approved_amount in the response.'],
  ['6011 3300 0000 0872','Insufficient funds','51','A soft decline. Retry rules are yours to set.'],
  ['6011 3300 0000 0905','Do not honor','05','A hard decline. Do not retry the same message.'],
  ['6011 3300 0000 1010','Stand-in','00','Issuer unavailable. Stand-in approval, answered_by is network.'],
  ['6011 3300 0000 2027','Approved and disputed','00','Approved. dispute.opened follows after four minutes.'],
  ['6011 3300 0000 3504','Approved on a reissued card','00','Approved. Card reissued overnight, token.updated follows.'],
  ['6011 3300 0000 4040','Expired card','54','A hard decline. Ask for another card.']
 ],
 events:[
  ['authorization.decisioned','Every authorization, approved or declined, within a second of the answer.'],
  ['dispute.opened','A cardholder disputed a transaction. Carries the reason code and your clock.'],
  ['settlement.posted','Settlement is final. Wire reference included.'],
  ['token.updated','The issuer reissued the card. Your token keeps working.'],
  ['merchant.risk_changed','A merchant’s behavior moved outside its own baseline.'],
  ['certificate.expiring','Read from your handshake, 30 days ahead. Sent once at 30 days and again at 7.']
 ],
 codes:[
  ['00','Approved','The issuer approved the full amount.','Capture within 7 days.'],
  ['10','Partial approval','The issuer approved less than requested.','Capture approved_amount or reverse.'],
  ['05','Do not honor','The issuer declined without a reason it will share.','Do not retry the same message. Ask for another card.'],
  ['51','Insufficient funds','A soft decline.','Retry on your own schedule. Not within 60 seconds.'],
  ['54','Expired card','The card has expired.','Ask for another card. If tokenized, token.updated may follow.'],
  ['14','Invalid card number','The number failed the issuer’s check.','Do not retry.'],
  ['91','Issuer unavailable','The issuer did not answer in time.','Stand-in rules apply if you set them. Otherwise retry once after 30 seconds.'],
  ['96','System error','The network could not process the request.','Retry with the same Idempotency-Key.']
 ],
 errors:[
  ['invalid_request','400','A field is missing or malformed. The message names it.','Fix the request. Do not retry unchanged.'],
  ['unauthorized','401','The token is missing, expired or for another environment.','Refresh the token. Check the base URL matches the key.'],
  ['forbidden','403','The key does not carry the permission the endpoint needs.','Use a key with the permission, or add it on API keys in the Developer Portal.'],
  ['not_found','404','No object with that id in this environment.','Check the id and the environment.'],
  ['conflict','409','The Idempotency-Key is in flight from an earlier request.','Wait for the first response. Do not retry during it.'],
  ['rate_limited','429','More than 5,000 requests a minute from one key, 500 in the sandbox.','Back off and retry after Retry-After seconds.'],
  ['network_error','5xx','The network could not process the request.','Retry with the same Idempotency-Key, backing off from one second.']
 ],
 changelog:[
  ['2026-06-01','v4.2','Added','authorization.decisioned carries issuer_ms.','Nothing changes for you. A new field on an event you already receive.','api/index.html#events','Events'],
  ['2026-05-14','v4.2','Added','captures accept a batch of up to 5,000 ids.','Fewer calls at end of day. Single captures still work.','api/index.html#capture','Capture'],
  ['2026-04-02','v4.1','Changed','Idempotency window is 24 hours, from 12.','A repeated key within a day returns the original response.','docs/errors.html#idempotency','Idempotency'],
  ['2026-03-10','v4.1','Deprecated','v3 retires February 28, 2028.','Calls to /v3 return 410 after that date, 24 months after v4 shipped. v4 is a superset.','changelog.html#versioning','Versioning'],
  ['2026-02-20','v4.0','Added','Network risk score on every authorization response.','score and score_reasons on the Authorization object. Optional to read.','api/index.html#authorization','The Authorization object'],
  ['2026-01-15','v4.0','Changed','Webhook signatures carry a timestamp.','Verify t and v1. Reject anything older than five minutes.','docs/webhooks.html#verify','Verify the signature']
 ],
 status:{
  products:[['Acceptance','Operational'],['Tokens','Operational'],['Disputes','Operational'],['Webhooks','Operational'],['Settlement reports','Operational'],['Sandbox','Maintenance Sunday, June 7, 2:00 to 4:00 AM ET']],
  incidents:[['May 22','Issuer responses slow for one BIN range','6:12 to 7:40 AM ET','Stand-in rules answered. No authorization was lost.'],['April 30','Sandbox unavailable','2:00 to 2:40 AM ET','Scheduled maintenance ran long. Production was not affected.'],['March 18','Webhook deliveries delayed','8:10 to 8:52 AM ET','Up to 12 minutes late for 3% of endpoints. No delivery was lost.']]
 },
 /* the request builder: entry modes from the Authorize endpoint, one body, one sample per language, one answer per card. The answers are
    the shapes the prototype's sandbox returns (TESTRES), with round_trip_ms as the Authorization object carries it. */
 entry:['contactless','chip','magstripe','ecommerce','keyed'],
 body:function(i,amt,entry){ return {amount:amt,currency:'USD',merchant_id:'mch_demo',pan_token:DV.cards[i][0].replace(/ /g,''),entry_mode:entry||'contactless'} },
 sample:function(b){ var j='{ "amount": '+b.amount+', "currency": "USD", "merchant_id": "'+b.merchant_id+'", "pan_token": "'+b.pan_token+'", "entry_mode": "'+b.entry_mode+'" }'; return {
  curl:'curl -X POST '+DV.base.sandbox+'/acceptance/v1/authorizations \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Idempotency-Key: $(uuidgen)" \\\n  -d \''+j+'\'',
  node:'const auth = await dgn.authorizations.create({\n  amount: '+b.amount+', currency: "USD", merchantId: "'+b.merchant_id+'",\n  panToken: "'+b.pan_token+'", entryMode: "'+b.entry_mode+'"\n});',
  python:'auth = client.authorizations.create(\n  amount='+b.amount+', currency="USD", merchant_id="'+b.merchant_id+'",\n  pan_token="'+b.pan_token+'", entry_mode="'+b.entry_mode+'")' } },
 respond:function(i,amt){ var c=DV.cards[i], code=c[2], last=c[0].slice(-4); var M={'0005':['auth_71ab3c',41],'0385':['auth_71ab40',44],'0872':['auth_71ab52',39],'0905':['auth_71ab5e',38],'1010':['auth_71ab68',502],'2027':['auth_71ab73',43],'3504':['auth_71ab88',40],'4040':['auth_71ab9a',37]}[last]; var r={id:M[0]};
  if(code==='10'){ r.decision='partial'; r.response_code='10'; r.requested_amount=amt; r.approved_amount=Math.round(amt/2) }
  else if(last==='1010'){ r.decision='stand_in'; r.response_code='00'; r.approved_amount=amt; r.answered_by='network' }
  else if(code==='00'){ r.decision='approved'; r.response_code='00'; r.approved_amount=amt; if(last==='0005') r.avs={street:'Y',postal:'Y'}; if(last==='2027') r.callback_queued='dispute.opened +4m'; if(last==='3504') r.token_lifecycle='issuer_managed' }
  else { r.decision='declined'; r.response_code=code; r.reason={'51':'insufficient_funds','05':'do_not_honor','54':'expired_card'}[code] }
  r.round_trip_ms=M[1]; return r },
 /* the decision table: what your code does with each card's answer, and what follows it. Same order as cards. */
 after:[
  ['Capture within 7 days.','authorization.decisioned within a second.'],
  ['Capture approved_amount, or reverse the hold.','authorization.decisioned within a second.'],
  ['Retry on your own schedule, not within 60 seconds.','authorization.decisioned within a second.'],
  ['Do not retry the same message. Ask for another card.','authorization.decisioned within a second.'],
  ['Capture as an approval. answered_by says the network answered.','authorization.decisioned within a second.'],
  ['Capture. Then answer the case on the Disputes endpoint.','dispute.opened after four minutes, with reason 4837 and your deadline.'],
  ['Capture. Keep using the token.','token.updated after two minutes. The token keeps working.'],
  ['Ask for another card.','authorization.decisioned within a second.']
 ],
 envs:[
  ['Sandbox','https://sandbox.api.dgn.com','The your own sandbox key, from a free account.','Test cards. Nothing is charged.'],
  ['Certification','https://cert.api.dgn.com','The same credentials, promoted by the network.','Your certification cases, sent by your host.'],
  ['Production','https://api.dgn.com','The same credentials, promoted at activation.','Live cards. A test card is declined with 14.']
 ],
 /* one code, one tone, everywhere a code is shown: approved is good, a soft decline or a network answer is warning, a hard decline is bad */
 /* en-US dates, the year only outside the site's year (June 2, 2026) */
 date:function(iso){ var p=iso.split('-'), m=['January','February','March','April','May','June','July','August','September','October','November','December'][+p[1]-1]; return m+' '+(+p[2])+(p[0]==='2026'?'':', '+p[0]) },
 tone:function(code){ return code==='00'?'is-good':(code==='10'||code==='51'||code==='91'||code==='96')?'is-warn':'is-bad' }
};
