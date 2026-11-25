/* Little Logic Lab: shared helpers. Load in <head> (not deferred) so dim mode applies before paint. */
(function(){
  const KEY='lll.v1';
  let st=null;
  try{st=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!st||typeof st!=='object')st={};
  st.sound=st.sound===0?0:1; st.voice=st.voice===0?0:1; st.dim=st.dim?1:0; st.games=st.games||{};
  // logic tracker data (see "logic tracker" below): per-move evidence, solved puzzles, play time, moments
  st.skills=st.skills||{}; st.plog=st.plog||[]; st.play=st.play||{}; st.moments=st.moments||[];
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
  const applyDim=()=>document.documentElement.classList.toggle('dim',!!st.dim);
  applyDim();

  // ---- sound: only after the child has tapped something ----
  let AC=null,touched=false;
  function ctx(){if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
    if(AC&&AC.state==='suspended')AC.resume();return AC}
  addEventListener('pointerdown',()=>{touched=true;if(st.sound)ctx()},{capture:true});
  addEventListener('keydown',()=>{touched=true},{capture:true});
  const live=()=>st.sound&&touched&&ctx();
  // one note; `to` slides the pitch (for pops, boings and swishes)
  function beep(f,d=.15,type='triangle',v=.15,delay=0,to){
    const a=live();if(!a)return;
    const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d*.8);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
  // a short burst of filtered noise: the "pop" of a party popper
  function pop(delay=0,v=.25){const a=live();if(!a)return;const t=a.currentTime+delay,n=a.sampleRate*.18,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
    const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='bandpass';f.frequency.value=1800;f.Q.value=.8;g.gain.value=v;
    s.buffer=b;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t)}
  // The Lab's sound set, the same in every game. Wrong moves stay silent on purpose.
  const PENTA=[0,2,4,7,9];
  const SFX={
    tap:()=>beep(620,.08,'sine',.08,0,380),                                   // any button: a soft pop
    place:()=>{beep(330,.12,'triangle',.12,0,700);beep(990,.08,'sine',.06,.06)}, // a piece goes in: a bubbly bloop
    turn:()=>{beep(660,.07,'triangle',.09,0,880);beep(880,.07,'triangle',.08,.06,1180)}, // a piece turns: a quick swish-chirp
    mark:()=>beep(300,.05,'sine',.06),                                       // a ✖ mark: a tiny tick
    undo:()=>beep(520,.1,'sine',.08,0,300),                                  // take back: a falling boop
    hint:()=>[1319,1568,2093].forEach((f,i)=>beep(f,.14,'sine',.07,i*.06)),  // a hint: sparkle
    good:()=>{beep(1047,.3,'triangle',.08);beep(1568,.3,'sine',.05,.04)},    // a bulb lights / a part is done: a bright chime
    step:i=>beep(262*Math.pow(2,(PENTA[i%5]+12*Math.floor(i/5)%24)/12),.18,'triangle',.11) // Star Trails: notes climb as the trail grows
  };
  const sfx=(name,arg)=>{const f=SFX[name];if(f)f(arg)};
  // the win fanfare: ta-ta-ta-DAA with a little chord, then twinkles (about 1.6 s)
  function jingle(){pop(0,.22);
    [523,659,784].forEach((f,i)=>{beep(f,.16,'triangle',.15,.05+i*.1);beep(f*2,.12,'sine',.04,.05+i*.1)});
    [1047,784,659].forEach(f=>beep(f,.7,'triangle',.11,.38));beep(1047,.6,'square',.03,.38);
    [1568,2093,1760,2349].forEach((f,i)=>beep(f,.18,'sine',.05,.9+i*.13))}
  // a cheerful spoken word or two ("Great job!"), using the device's own voice
  let voice=null;
  function pickVoice(){const vs=(window.speechSynthesis&&speechSynthesis.getVoices())||[],en=vs.filter(v=>/^en/i.test(v.lang));
    voice=en.find(v=>/samantha|aria|jenny|google us english|zira|karen|moira|tessa|libby|sonia|female/i.test(v.name))||en[0]||null}
  if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
  function say(text,delay=0){if(!st.sound||!st.voice||!touched||!window.speechSynthesis)return;
    setTimeout(()=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);if(voice)u.voice=voice;
      u.rate=1.02;u.pitch=1.45;u.volume=1;speechSynthesis.speak(u)}catch(e){}},delay)}
  const PRAISE=['Great job!','You did it!','Awesome!','Hooray!','Super star!','Way to go!','Fantastic!'];
  // every button in every game gives the same soft pop
  addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.btn,.round,.home-btn,.tile'))sfx('tap')},{capture:true});

  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const game=id=>st.games[id]||(st.games[id]={level:0,stars:0});
  const setLevel=(id,l)=>{game(id).level=l;save()};

  function msg(t){const m=document.getElementById('msg');if(m)m.textContent=t||''}
  function wobble(el){if(!el||reduced())return;el.classList.remove('wobble');void el.offsetWidth;el.classList.add('wobble');
    setTimeout(()=>el.classList.remove('wobble'),400)}

  // Calls cb(width,height) whenever the element's size changes.
  function fit(el,cb){const run=()=>cb(el.clientWidth,el.clientHeight);
    if(window.ResizeObserver)new ResizeObserver(run).observe(el);else addEventListener('resize',run);run()}

  const ACCENTS=['#F2A7C6','#F3CF6B','#8FC3E6','#B9A6E3','#F5B97F','#7CCDB3'];
  // Confetti: two party poppers fire from the bottom corners, then a gentle shower falls from the top.
  // Pieces are ribbons, dots, squares and stars in the Lab's six colours.
  function piece(host,i){const e=document.createElement('span'),k=i%4,col=ACCENTS[i%6];e.className='conf';
    if(k==3){e.textContent='★';e.style.color=col;e.style.fontSize=(14+Math.random()*10)+'px';e.style.lineHeight='1'}
    else{const s=8+Math.random()*7;e.style.width=(k==0?s*.5:s)+'px';e.style.height=(k==0?s*1.8:s)+'px';e.style.background=col;e.style.borderRadius=k==1?'50%':'2px'}
    host.appendChild(e);return e}
  function confetti(host){if(reduced())return;host=host||document.body;const W=innerWidth,H=innerHeight;
    // the two poppers
    for(let side=0;side<2;side++)for(let i=0;i<45;i++){const e=piece(host,i+side),x0=side?W-10:10,y0=H-10,
      dir=side?-1:1,vx=dir*(W*.15+Math.random()*W*.45),up=H*(.45+Math.random()*.45),spin=(Math.random()*2-1)*900,dur=2200+Math.random()*1400;
      const a=e.animate([{transform:`translate(${x0}px,${y0}px) rotate(0deg)`,opacity:1,easing:'cubic-bezier(.15,.7,.35,1)'},
        {transform:`translate(${x0+vx*.7}px,${y0-up}px) rotate(${spin*.4}deg)`,opacity:1,offset:.35,easing:'cubic-bezier(.45,0,.9,.6)'},
        {transform:`translate(${x0+vx}px,${H+40}px) rotate(${spin}deg)`,opacity:.9}],{duration:dur,delay:Math.random()*120,fill:'both'});
      a.onfinish=()=>e.remove()}
    // the shower from the top
    for(let i=0;i<36;i++){const e=piece(host,i),x=Math.random()*W,dur=2600+Math.random()*1600,sway=(Math.random()*2-1)*60;
      const a=e.animate([{transform:`translate(${x}px,-30px) rotate(0deg)`},{transform:`translate(${x+sway}px,${H*.5}px) rotate(${sway*4}deg)`,offset:.5},
        {transform:`translate(${x-sway}px,${H+40}px) rotate(${sway*8}deg)`}],{duration:dur,delay:500+Math.random()*900,fill:'both',easing:'linear'});
      a.onfinish=()=>e.remove()}}

  // ---------- the same game frame everywhere: ❓ help + 🔊 sound in the header, a sticker row under it ----------
  // cfg = {id, help:[[icon,text],...], stickers:[emoji...], extraHelp:fn(cardEl)?}
  let G=null;
  function setupGame(cfg){G=cfg;const hdr=document.querySelector('.hdr');
    if(hdr&&!hdr.querySelector('#helpBtn')){
      hdr.insertAdjacentHTML('beforeend','<button class="round small" id="helpBtn" aria-label="How to play">❓</button><button class="round small" id="sndBtn" aria-label="Sound"></button>');
      const sb=hdr.querySelector('#sndBtn'),paint=()=>{sb.textContent=st.sound?'🔊':'🔇';sb.setAttribute('aria-pressed',!!st.sound)};
      sb.onclick=()=>{st.sound=st.sound?0:1;save();paint();if(!st.sound&&window.speechSynthesis)speechSynthesis.cancel();sfx('good')};paint();
      hdr.querySelector('#helpBtn').onclick=()=>help()}
    if(!document.getElementById('stk'))hdr.insertAdjacentHTML('afterend','<div class="caption stk" id="stk" aria-label="Your stickers"></div>');
    showStickers();
    // first visit to this game: show how to play once
    const g=game(cfg.id);if(!g.seenHelp){g.seenHelp=1;save();setTimeout(help,350)}}
  // ---------- how-to-play scenes: a 👆 finger plays one tiny round, looping (styles in lab.css) ----------
  const at=(x,y,extra='')=>'style="transform:translate('+x+'px,'+y+'px);'+extra+'"';
  const FIN='<span class="fin" aria-hidden="true">👆</span>';
  const wire=(x1,x2,cls='')=>'<svg viewBox="0 0 100 100" width="60" height="60" style="position:absolute;inset:0" class="'+cls+'"><line x1="'+x1+'" y1="50" x2="'+x2+'" y2="50"/></svg>';
  const DEMO={
    bulbs:()=>'<div class="demo d-lb" aria-hidden="true">'+
      '<div class="tl" '+at(20,45)+'>'+wire(50,100)+'<span style="position:relative;font-size:26px">🔋</span></div>'+
      '<div class="tl" '+at(90,45)+'>'+wire(0,100,'rot')+'</div>'+
      '<div class="tl t3" '+at(160,45)+'>'+wire(0,50)+'<span class="bulb" style="position:relative">💡</span></div>'+FIN+'</div>',
    chips:()=>'<div class="demo d-nc" aria-hidden="true">'+
      '<div '+at(56,4,'width:128px;height:68px;border:3px solid var(--text);border-radius:14px;background:var(--sky-t)')+'></div>'+
      '<div '+at(119,7,'width:2px;height:62px;background:var(--line)')+'></div>'+
      '<div class="tl" '+at(60,8,'background:transparent;color:var(--given);align-items:flex-end;padding-bottom:4px')+'>1</div>'+
      '<div class="tl pick" '+at(122,8,'background:transparent;align-items:flex-end;padding-bottom:4px')+'><span class="num">2</span></div>'+
      '<div class="lab" '+at(63,10,'font:800 13px var(--font);padding:0 5px;border-radius:6px;line-height:19px')+'>3+</div>'+
      '<div class="ch" '+at(58,96)+'>1</div><div class="ch c2" '+at(102,96)+'>2</div><div class="ch" '+at(146,96)+'>3</div>'+FIN+'</div>',
    sudoku:()=>{const ch=(x,n,c,cls='')=>'<div class="ch '+cls+'" '+at(x,96,'background:var(--'+c+');color:var(--on-'+c+')')+'>'+n+'</div>';
      return '<div class="demo d-sd" aria-hidden="true">'+
      '<div class="tl" '+at(52,8,'background:var(--sun-t);color:var(--given)')+'>1</div>'+
      '<div class="tl pick" '+at(116,8,'color:var(--on-sky)')+'><span class="num">2</span></div>'+
      '<div class="tl" '+at(180,8,'background:var(--pink-t);color:var(--given)')+'>3</div>'+
      ch(58,1,'sun')+ch(102,2,'sky','c2')+ch(146,3,'pink')+FIN+'</div>'},
    rovers:g=>{const box=(x,y,t,cls='',w=52,h=52,bg='')=>'<div class="'+cls+'" '+at(x,y,'width:'+w+'px;height:'+h+'px;border-radius:12px;display:flex;align-items:center;justify-content:center;font:800 22px var(--font);'+bg)+'>'+t+'</div>';
      // one row of 4 boxes: drag a rover onto the right two (its parking space appears beside it),
      // then tap the far-left box to cross it out
      const mint='background:var(--mint);color:var(--on-mint)',X=[48,96,144,192];
      return '<div class="demo d-lr" aria-hidden="true">'+
      box(48,0,'0','',44,34,mint)+box(96,0,'0','',44,34,mint)+box(144,0,'1','ok',44,34)+box(192,0,'1','ok',44,34)+box(4,40,'2','ok',36,44)+
      X.map((x,i)=>box(x,40,i==0?'<span class="x">✖</span>':'',i==1?'zone':'',44,44,'background:var(--panel);color:var(--text-soft)')).join('')+
      '<div '+at(0,92,'width:240px;height:58px;border-radius:14px;background:var(--page)')+'></div>'+
      '<div class="rov" style="width:92px;height:44px;border-radius:14px;background:rgba(143,195,230,.3)">'+(g.art?g.art():'🤖')+'</div>'+FIN+'</div>'},
    trails:()=>{const P=[[40,35],[120,35],[200,35],[200,110],[120,110],[40,110]],C=['#5BBF9F','#6FB0DE','#A38FDB','#EC92B8','#F2A766'];
      return '<div class="demo d-st" aria-hidden="true"><svg width="240" height="150" viewBox="0 0 240 150">'+
      P.map(([x,y])=>'<rect x="'+(x-28)+'" y="'+(y-28)+'" width="56" height="56" rx="12" fill="var(--panel)"/>').join('')+
      P.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="6" fill="var(--text)"/>').join('')+
      P.slice(1).map(([x,y],i)=>'<line class="s'+i+'" pathLength="1" x1="'+P[i][0]+'" y1="'+P[i][1]+'" x2="'+x+'" y2="'+y+'" stroke="'+C[i]+'"/>').join('')+
      '</svg><span class="rk">🚀</span></div>'}};
  let hv=null;
  function help(){if(!G)return;
    if(!hv){hv=document.createElement('div');hv.className='win-ov help-ov';hv.setAttribute('role','dialog');hv.setAttribute('aria-modal','true');document.body.appendChild(hv)}
    const scene=DEMO[G.demo]?DEMO[G.demo](G):'';
    hv.innerHTML='<div class="win-card help-card"><h2>How to play</h2>'+scene+'<p class="demo-cap">'+(G.caption||'')+'</p>'+
      '<div class="win-btns"><button class="btn main" id="helpOk">Got it</button></div><div class="help-extra"></div></div>';
    hv.querySelector('#helpOk').onclick=()=>hv.classList.remove('on');
    if(G.extraHelp)G.extraHelp(hv.querySelector('.help-extra'),()=>hv.classList.remove('on'));
    hv.onclick=e=>{if(e.target===hv)hv.classList.remove('on')};
    hv.classList.add('on');setTimeout(()=>hv.querySelector('#helpOk').focus({preventScroll:true}),50)}
  // sticker book: every win adds one sticker from the game's own set; the newest ones show under the title
  function addSticker(id,s){const g=game(id);g.stk=(g.stk||[]).concat(s).slice(-300);save()}
  function showStickers(){const el=document.getElementById('stk');if(!el||!G)return;const s=game(G.id).stk||[];
    el.textContent=s.length?s.slice(-10).join(' '):'Win a puzzle to get a sticker.';el.classList.toggle('none',!s.length)}

  // ---------- logic tracker ----------
  // Games call Lab.puzzleStart() for each new puzzle, Lab.logic(move,outcome,info) for each step they can explain,
  // and Lab.hintUsed() for each hint. outcome: 'used' (a correct step this rule made certain),
  // 'missed' (a wrong step in a box this rule had already decided) or 'hint' (a hint where this rule applied).
  // Everything stays in this browser.
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  let cur=null;
  function puzzleStart(gid){cur={g:gid||(G&&G.id),t0:Date.now(),hints:0,miss:0,id:(gid||(G&&G.id))+'-'+Date.now()}}
  function logic(move,outcome,info={}){
    if(!cur)puzzleStart();
    const s=st.skills[move]||(st.skills[move]={used:0,missed:0,hint:0,recent:'',puz:0,lastPuz:'',first:Date.now(),games:{},days:{}});
    if(outcome=='used')s.used++;else if(outcome=='missed'){s.missed++;cur.miss++}else s.hint++;
    s.recent=(s.recent+(outcome=='used'?'1':'0')).slice(-20);         // the last 20 chances: 1 used, 0 missed or hinted
    if(s.lastPuz!==cur.id){s.puz++;s.lastPuz=cur.id}
    s.games[cur.g]=(s.games[cur.g]||0)+1;
    const d=today(),day=s.days[d]||(s.days[d]=[0,0]);day[outcome=='used'?0:1]++;
    Object.keys(s.days).sort().slice(0,-60).forEach(k=>delete s.days[k]);  // keep 60 days
    // keep a few "moments" (a small picture of the board) to show grown-ups real examples
    // keep the first two of each move, then about 1 in 12, so the report shows a mix of moves
    if(outcome=='used'&&info.snap&&(s.used<=2||Math.random()<.08)){
      st.moments.push({move,g:cur.g,ts:Date.now(),cap:info.cap||'',snap:info.snap});st.moments=st.moments.slice(-30)}
    save()}
  function hintUsed(){if(!cur)puzzleStart();cur.hints++}
  // play time: count 15-second slices while the page is visible and the child has touched something in the last minute
  let lastAct=0;addEventListener('pointerdown',()=>lastAct=Date.now(),{capture:true});
  setInterval(()=>{if(!document.hidden&&Date.now()-lastAct<60000){const d=today();st.play[d]=(st.play[d]||0)+15;
    Object.keys(st.play).sort().slice(0,-90).forEach(k=>delete st.play[k]);save()}},15000);

  // Shared win card. o = {game, hero, title, lesson, sticker, next:fn|null, nextLabel, again:fn|null, againLabel}
  let ov=null;
  function win(o){
    const g=game(o.game);g.stars++;
    st.plog.push({g:o.game,ts:Date.now(),dur:cur?Date.now()-cur.t0:0,hints:cur?cur.hints:0,miss:cur?cur.miss:0});st.plog=st.plog.slice(-400);cur=null;
    save();
    const pool=(G&&G.stickers)||['⭐'],sticker=o.sticker||pool[Math.random()*pool.length|0];addSticker(o.game,sticker);
    if(!ov){ov=document.createElement('div');ov.className='win-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');document.body.appendChild(ov)}
    ov.innerHTML='<div class="win-card"><div class="win-hero"></div><h2></h2><div class="win-stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>'+
      '<p class="win-lesson"></p><p class="win-sticker">New sticker <span class="ws"></span></p><div class="win-btns"></div></div>';
    ov.querySelector('.ws').textContent=sticker;
    ov.querySelector('.win-hero').textContent=o.hero||'⭐';
    // every win gets a cheer; the same words are shown on the card and spoken aloud
    const cheer=o.title||PRAISE[Math.random()*PRAISE.length|0];
    ov.querySelector('h2').textContent=cheer;
    ov.querySelector('.win-lesson').textContent=o.lesson||'';
    const bx=ov.querySelector('.win-btns');
    const add=(label,fn,main)=>{const b=document.createElement('button');b.className='btn'+(main?' main':'');b.textContent=label;
      b.onclick=()=>{hideWin();fn()};bx.appendChild(b)};
    // no next level (the last one): offer Home, and Keep playing for a fresh puzzle at the top level
    if(!o.next)add('🏠 Home',()=>location.href='../index.html',!o.again);
    if(o.again)add(o.next?(o.againLabel||'Play again'):'Keep playing',o.again,!o.next);
    if(o.next)add(o.nextLabel||'Next level',o.next,true);
    ov.classList.add('on');
    const first=bx.querySelector('.main')||bx.firstChild;if(first)setTimeout(()=>first.focus({preventScroll:true}),50);
    showStickers();confetti(ov);jingle();say(cheer,700)}
  function hideWin(){if(ov)ov.classList.remove('on')}

  window.Lab={get state(){return st},save,game,setLevel,beep,sfx,jingle,say,msg,wobble,fit,win,hideWin,reduced,setupGame,help,showStickers,
    puzzleStart,logic,hintUsed,today,
    get sound(){return!!st.sound},setSound(v){st.sound=v?1:0;save()},
    get voice(){return!!st.voice},setVoice(v){st.voice=v?1:0;save()},
    get dim(){return!!st.dim},setDim(v){st.dim=v?1:0;save();applyDim()}};
})();
