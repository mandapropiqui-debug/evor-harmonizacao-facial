/* Évor biolink — a régua de proporção */
const CONFIG={
  whatsapp:'5586994361010',            // (86) 99436-1010 — confirmar com o cliente
  utm:'utm_source=instagram_bio&utm_medium=biolink&utm_campaign=evor_conversa',
  pixelId:'', ga4Id:''                 // preencher quando o cliente tiver os IDs
};
const REGIONS=[
  {id:'testa',label:'Testa',x:.60,y:.20},
  {id:'olhar',label:'Olhar e olheiras',x:.65,y:.385},
  {id:'macas',label:'Maçãs do rosto',x:.52,y:.50},
  {id:'nariz',label:'Nariz',x:.90,y:.52},
  {id:'labios',label:'Lábios',x:.82,y:.63},
  {id:'contorno',label:'Contorno da mandíbula',x:.66,y:.77}
];
const HOPES=['Naturalidade','Aparência descansada','Definição','Prevenir','Ainda não sei'];
const NOTS=['Parecer "feito"','Exagero','Perder minha expressão','Mudar meus traços','Inchaço visível','Ficar parecida com a internet'];
const EVENTS=['Festa','Formatura','Casamento','Nenhum por enquanto'];

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const body=document.body;
window.dataLayer=window.dataLayer||[];
function track(ev,data={}){window.dataLayer.push({event:ev,...data});if(window.fbq)try{fbq('trackCustom',ev,data)}catch(e){}if(window.gtag)try{gtag('event',ev,data)}catch(e){}}
function waLink(msg){return 'https://wa.me/'+CONFIG.whatsapp+'?text='+encodeURIComponent(msg+'\n\n['+CONFIG.utm+']')}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2400)}
$$('[data-wa]').forEach(a=>{a.href=waLink(a.dataset.wa);a.target='_blank';a.rel='noopener';a.addEventListener('click',()=>track('clique_whatsapp',{origem:a.dataset.wa.slice(0,30)}))});
$$('[data-ev]').forEach(a=>a.addEventListener('click',()=>track(a.dataset.ev)));

/* palavras que nascem */
$$('[data-split]').forEach(el=>{let n=0;const walk=node=>{[...node.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.append(' ');return}const s=document.createElement('span');s.className='w';s.style.setProperty('--n',n++);s.textContent=t;f.append(s)});c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};walk(el)});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
$$('[data-in],[data-split]').forEach(el=>io.observe(el));

/* ===== ABERTURA ===== */
const intro=$('#intro'),faceDraw=$('#faceDraw'),pen=$('#pen'),rls=$$('.rl');
rls.forEach(p=>{p.setAttribute('pathLength','1');p.style.strokeDasharray='1';p.style.strokeDashoffset='1'});
let prog=0,lastInput=performance.now(),done=false,dragging=false,lx=0,ly=0;
const SP=$$('#faceStrokes path'),SL=SP.map(p=>p.getTotalLength()),STOT=SL.reduce((x,y)=>x+y,0);
function paint(){
  let acc=0,target=prog*STOT,penp=null;
  SP.forEach((p,i)=>{const f=Math.max(0,Math.min(1,(target-acc)/SL[i]));p.style.strokeDasharray='1 2';p.style.strokeDashoffset=String(1-f);p.style.opacity=f>0.002?1:0;if(f>0&&f<1)penp=[p,f,SL[i]];acc+=SL[i]});
  if(penp){const q=penp[0].getPointAtLength(penp[1]*penp[2]);pen.setAttribute('cx',q.x);pen.setAttribute('cy',q.y);pen.style.opacity=1}
  else if(prog<=0)pen.style.opacity=0;
  const r=Math.min(1,prog*1.25);rls.forEach((p,i)=>p.style.strokeDashoffset=1-Math.max(0,Math.min(1,r*1.3-i*.03)));
}
function finish(fast){
  if(done)return;done=true;prog=1;paint();
  track('abertura_concluida',{fast:!!fast});
  pen.style.opacity=0;$('#hint').style.opacity=0;
  setTimeout(()=>{intro.classList.add('out');body.classList.remove('lock');startAll()},fast?0:800);
  setTimeout(()=>intro.remove(),fast?900:1900);
}
intro.addEventListener('pointerdown',e=>{dragging=true;lx=e.clientX;ly=e.clientY;lastInput=performance.now();$('#hint').style.opacity=0});
addEventListener('pointermove',e=>{if(!dragging||done)return;const d=Math.hypot(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY;prog=Math.min(1,prog+d/1100);lastInput=performance.now();paint();if(prog>=1)finish()});
addEventListener('pointerup',()=>dragging=false);
let tPrev=performance.now();
(function loop(t){if(done)return;const dt=t-tPrev;tPrev=t;if(!dragging&&t-lastInput>1500){prog=Math.min(1,prog+dt/3500);paint();if(prog>=1){finish();return}}requestAnimationFrame(loop)})(performance.now());
paint();
$('#skip').addEventListener('click',()=>{track('entrar_direto');finish(true)});
if(reduce){body.classList.remove('lock');intro.remove();$('#skip').remove();}

/* ===== tudo que roda depois da abertura ===== */
let started=false;
function startAll(){if(started)return;started=true;0}
if(reduce)started=true;

/* dock + progresso */
const secs=$$('main section'),links=$$('.dock a');
const secIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('on',l.dataset.s===e.target.id));current=e.target}}),{rootMargin:'-45% 0px -50% 0px'});
let current=secs[0];secs.forEach(s=>secIO.observe(s));
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;$('#dock').style.setProperty('--p',Math.min(1,scrollY/h));
  const p=$('#portrait');if(p){const r=p.parentNode.getBoundingClientRect();const k=(r.top+r.height/2-innerHeight/2)/innerHeight;p.style.transform=`translateY(${(-k*18).toFixed(1)}px) scale(1.06)`}},{passive:true});

/* vídeos: carrega perto, toca visível */
const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){if(!v.src&&v.dataset.src){v.src=v.dataset.src;v.preload='auto'}v.play&&v.play().catch(()=>{})}else v.pause&&v.pause()}),{threshold:.35,rootMargin:'200px'});
$$('video[data-auto]').forEach(v=>vio.observe(v));
const snd=$('#snd');if(snd)snd.addEventListener('click',()=>{const v=$('#drav');v.muted=!v.muted;snd.innerHTML='<i class="ic" style="--i:url(icons/'+(v.muted?'speaker-slash':'speaker-high')+'.svg)"></i>';snd.setAttribute('aria-label',v.muted?'Ligar o som':'Desligar o som');track('video_dra_som',{on:!v.muted})});

/* contador */
$$('[data-count]').forEach(el=>{new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();const to=+el.dataset.count;let t0=null;const f=t=>{t0=t0||t;const k=Math.min(1,(t-t0)/1300);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}}).observe(el)});

/* linha do tempo "cuidar cedo" */
const tl=$('#tl3'),tlis=$$('li',tl);
tlis.forEach((li,i)=>new IntersectionObserver(es=>{if(es[0].isIntersecting){li.classList.add('on');tl.style.setProperty('--fill',(i+1)/tlis.length)}},{rootMargin:'-35% 0px -35% 0px'}).observe(li));

/* o espelho dourado */
const lens=$('#lens');let lensTouched=false,lt0=performance.now();
function lensSet(x,y){lens.style.setProperty('--x',x+'px');lens.style.setProperty('--y',y+'px')}
lens.addEventListener('pointerdown',e=>{lensTouched=true;$('#lenscap').style.opacity=0;mv(e);track('espelho_tocado')});
lens.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons||e.pressure>0){lensTouched=true;mv(e)}});
function mv(e){const r=lens.getBoundingClientRect();lensSet(Math.max(0,Math.min(r.width,e.clientX-r.left)),Math.max(0,Math.min(r.height,e.clientY-r.top)))}
(function wander(t){if(!lensTouched&&!reduce){const r=lens.getBoundingClientRect(),k=(t-lt0)/1000;lensSet(r.width*(.5+.3*Math.sin(k*.7)),r.height*(.42+.28*Math.sin(k*.93+1)))}requestAnimationFrame(wander)})(performance.now());

/* cartões do pedido: arrastar com mouse */
const cmp=$('#cmp');let cd=false,cx=0,cs=0;
cmp.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){cd=true;cx=e.clientX;cs=cmp.scrollLeft;cmp.style.scrollSnapType='none'}});
addEventListener('pointermove',e=>{if(cd)cmp.scrollLeft=cs-(e.clientX-cx)});
addEventListener('pointerup',()=>{if(cd){cd=false;cmp.style.scrollSnapType='x mandatory'}});
const marq=$('#marq');let md=1,mpause=false;['pointerdown','touchstart','wheel'].forEach(ev=>marq.addEventListener(ev,()=>{mpause=true;clearTimeout(marq.t);marq.t=setTimeout(()=>mpause=false,4000)},{passive:true}));(function mk(){if(!mpause&&!reduce){marq.scrollLeft+=md*.5;if(marq.scrollLeft+marq.clientWidth>=marq.scrollWidth-1)md=-1;if(marq.scrollLeft<=0)md=1}requestAnimationFrame(mk)})();

/* protocolos */
$$('.pc>button').forEach(b=>b.addEventListener('click',()=>{const c=b.parentNode,o=!c.classList.contains('open');$$('.pc').forEach(x=>{x.classList.remove('open');$('button',x).setAttribute('aria-expanded','false')});if(o){c.classList.add('open');b.setAttribute('aria-expanded','true');track('protocolo_aberto',{p:c.id})}}));

/* FAQ em conversa */
const typed=new Set();
function typeAnswer(btn){
  const ab=btn.nextElementSibling,txt=ab.dataset.full;
  if(btn.getAttribute('aria-expanded')==='true'){btn.setAttribute('aria-expanded','false');ab.classList.remove('show');return}
  btn.setAttribute('aria-expanded','true');ab.classList.add('show');
  if(typed.has(ab)||reduce){ab.querySelector('.tx').textContent=txt;return}
  typed.add(ab);const tx=ab.querySelector('.tx');tx.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';
  setTimeout(()=>{tx.textContent='';let i=0;const step=()=>{i+=2;tx.textContent=txt.slice(0,i);if(i<txt.length)setTimeout(step,16)};step()},650);
  track('faq_aberta',{q:btn.textContent.slice(0,40)});
}
$$('.qb').forEach(b=>b.addEventListener('click',()=>typeAnswer(b)));
new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();setTimeout(()=>typeAnswer($('.qb')),500)}},{threshold:.35}).observe($('#chat'));

/* ===== A PRIMEIRA CONVERSA ===== */
const S={regioes:[],espera:[],nao:[],evento:'',data:'',primeira:'',nome:'',wpp:''};
let step=0,started1=false;const TOTAL=6;
const stepsEl=$('#steps'),progEl=$$('#prog i');
stepsEl.addEventListener('click',()=>setTimeout(()=>{if(typeof live==='function')live()},0));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chips=(arr,key,multi=true)=>'<div class="chips">'+arr.map(a=>`<button class="chip" data-k="${key}" data-v="${esc(a)}" aria-pressed="${(multi?S[key].includes(a):S[key]===a)}">${esc(a)}</button>`).join('')+'</div>';
const nav=(back,next='Continuar')=>`<div class="row">${back?'<button class="btn ghost" data-back>Voltar</button>':''}<button class="btn main" data-next>${next}</button></div><a class="skiplink" href="${waLink('Olá, vim pelo link do Instagram e quero falar direto com a Évor.')}" target="_blank" rel="noopener" data-direct>Pular e falar direto no WhatsApp</a>`;
function daysTo(d){if(!d)return null;const t=new Date(d+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);return Math.round((t-n)/864e5)}
function view(){
  progEl.forEach((p,i)=>p.classList.toggle('on',i<=step));
  let h='';
  if(step===0){
    h=`<h3>Onde o seu rosto te incomoda?</h3><p class="q">Toque nos pontos. Cada toque diz à Dra. o que você quer olhar: o que você marcar entra na sua ficha, e é sobre isso que ela vai conversar com você.</p>
    <div class="map"><svg class="f" style="color:#BFA986" aria-hidden="true"><use href="#logo"/></svg><svg class="lines" id="mlines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
    ${REGIONS.map(r=>`<button class="hot${S.regioes.includes(r.label)?' on':''}" data-r="${r.id}" style="left:${r.x*100}%;top:${r.y*100}%" aria-label="${r.label}" aria-pressed="${S.regioes.includes(r.label)}"></button>`).join('')}</div>
    <p class="maptxt" id="maptxt" aria-live="polite">&nbsp;</p>
    <div class="pelechip">${chips(['Qualidade da pele'],'regioes')}</div>${nav(false)}`;
  }else if(step===1){h=`<h3>O que você quer sentir ao se olhar no espelho?</h3><p class="q">Pode marcar mais de uma. Sua escolha vira o objetivo da sua conversa com a Dra.</p>${chips(HOPES,'espera')}${nav(true)}`}
  else if(step===2){h=`<h3>O que você <em class="s">não</em> quer de jeito nenhum?</h3><p class="q">A pergunta que a Dra. faz primeiro. Tudo o que você marcar aqui ela vai respeitar na avaliação.</p>${chips(NOTS,'nao')}${nav(true)}`}
  else if(step===3){h=`<h3>Tem um evento chegando?</h3><p class="q">Festa, formatura, casamento? Planejar com antecedência dá mais calma.</p>${chips(EVENTS,'evento',false)}
    <label class="field" id="datef" style="display:${S.evento&&S.evento!==EVENTS[3]?'block':'none'}"><span>Data do evento</span><input type="date" id="evdate" value="${S.data}"></label>
    <div class="timeline-evt" id="evtl" style="display:none"><div class="tl"><i id="tlfill"></i></div><div class="dot" style="left:8px"></div><span class="lb" style="left:8px">hoje</span><div class="dot" id="evdot" style="left:calc(100% - 8px)"></div><span class="lb b" id="evlb" style="left:calc(100% - 8px)"></span></div>
    <p class="evtmsg" id="evmsg"></p>${nav(true)}`}
  else if(step===4){h=`<h3>É a sua primeira consulta de estética?</h3><p class="q">Só para a Dra. saber por onde começar a conversa.</p>${chips(['Sim','Não'],'primeira',false)}${nav(true)}`}
  else if(step===5){h=`<h3>Como a Évor te chama?</h3><p class="q">Só nome e WhatsApp. Nenhum dado de saúde.</p>
    <label class="field"><span>Seu nome</span><input id="fnome" autocomplete="given-name" value="${esc(S.nome)}" placeholder="Seu nome"></label>
    <label class="field"><span>Seu WhatsApp</span><input id="fwpp" inputmode="tel" autocomplete="tel" value="${esc(S.wpp)}" placeholder="(86) 90000-0000"></label>${nav(true,'Montar minha ficha')}`}
  else{
    const reg=S.regioes.length?S.regioes.join(', '):'ainda não sei apontar';
    const ev=!S.evento||S.evento===EVENTS[3]?'nenhum por enquanto':S.evento.toLowerCase()+(S.data?' em '+S.data.split('-').reverse().join('/'):'');
    h=`<div class="ficha" id="ficha"><div class="stamp"><svg style="color:#402D26" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#402D26" stroke-width="3"/><svg x="30" y="14" width="40" height="72" viewBox="488 127 1181 1904"><use href="#logo"/></svg></svg></div>
    <h3>Ficha da sua avaliação</h3><dl><dt>Nome</dt><dd>${esc(S.nome||'a combinar')}</dd><dt>Regiões</dt><dd>${esc(reg)}</dd><dt>Espero</dt><dd>${esc(S.espera.join(', ')||'ainda não sei')}</dd><dt>Não quero</dt><dd>${esc(S.nao.join(', ')||'a conversar')}</dd><dt>Evento</dt><dd>${esc(ev)}</dd><dt>1ª vez</dt><dd>${esc(S.primeira||'não informado')}</dd></dl></div>
    <div class="row" style="flex-direction:column"><a class="btn main" id="sendwa" target="_blank" rel="noopener"><i class="ic" style="--i:url(icons/paper-plane-tilt.svg)"></i>Enviar para a Évor no WhatsApp</a><button class="btn" id="copy"><i class="ic" style="--i:url(icons/copy.svg)"></i>Copiar resumo</button></div>
    <p class="note" style="color:#F0EADA">Esta ficha só adianta a conversa. A indicação é feita pela Dra. na avaliação.</p><button class="skiplink" data-redo>Refazer a ficha</button>`;
  }
  stepsEl.innerHTML=`<div class="step show">${step<5?'<p class="live" id="live" aria-live="polite"></p>':''}${h}</div>`;
  bind();live();
}
function live(){const el=$('#live');if(!el)return;const parts=[...S.regioes,...S.espera,...S.nao.map(x=>'sem: '+x)];el.innerHTML=parts.length?'<b>Na sua ficha:</b> '+esc(parts.join(' · ')):'Sua ficha está em branco. O que você tocar aparece aqui.';el.classList.toggle('has',!!parts.length)}
function summary(){
  const reg=S.regioes.length?S.regioes.join(', '):'ainda não sei apontar';
  const ev=!S.evento||S.evento===EVENTS[3]?'nenhum por enquanto':S.evento.toLowerCase()+(S.data?' em '+S.data.split('-').reverse().join('/'):'');
  return `Olá! Fiz a ficha da primeira conversa no link da Évor.\nRegiões: ${reg}\nO que espero: ${S.espera.join(', ')||'ainda não sei'}\nO que NÃO quero de jeito nenhum: ${S.nao.join(', ')||'quero conversar sobre isso'}\nEvento: ${ev}\nPrimeira consulta de estética: ${S.primeira||'não informado'}\nNome: ${S.nome||'-'}\nWhatsApp: ${S.wpp||'-'}\n(Ficha só adianta a conversa; a indicação é feita pela Dra. na avaliação.)`;
}
function first(){if(!started1){started1=true;track('iniciar_conversa')}}
function bind(){
  $$('.chip',stepsEl).forEach(c=>c.addEventListener('click',()=>{first();const k=c.dataset.k,v=c.dataset.v;
    if(Array.isArray(S[k])){const i=S[k].indexOf(v);i>-1?S[k].splice(i,1):S[k].push(v);c.setAttribute('aria-pressed',i===-1)}
    else{S[k]=v;$$(`.chip[data-k="${k}"]`,stepsEl).forEach(x=>x.setAttribute('aria-pressed',x===c));if(k==='evento'){$('#datef').style.display=v===EVENTS[3]?'none':'block';evtl()}}}));
  $$('.hot',stepsEl).forEach(h=>h.addEventListener('click',()=>{first();const r=REGIONS.find(x=>x.id===h.dataset.r),i=S.regioes.indexOf(r.label);
    const ln=$('#mlines');
    if(i>-1){S.regioes.splice(i,1);h.classList.remove('on');h.setAttribute('aria-pressed','false');const o=$(`[data-l="${r.id}"]`,ln);o&&o.remove();$('#maptxt').innerHTML=`<b>${r.label}</b> saiu da sua ficha.`}
    else{S.regioes.push(r.label);h.classList.add('on');h.setAttribute('aria-pressed','true');
      const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.dataset.l=r.id;l.setAttribute('x1',r.x*100);l.setAttribute('y1',r.y*100);l.setAttribute('x2',-34);l.setAttribute('y2',r.y*100);l.setAttribute('pathLength','1');l.style.setProperty('--len',1);l.style.strokeDasharray=1;l.setAttribute('vector-effect','non-scaling-stroke');ln.append(l);
      $('#maptxt').innerHTML=`<b>${r.label}</b> entrou na sua ficha. É isso que você quer conversar com a Dra.`;track('regiao_tocada',{regiao:r.id})}}));
  const d=$('#evdate');if(d){d.addEventListener('change',()=>{S.data=d.value;evtl()});evtl()}
  const nx=$('[data-next]',stepsEl);nx&&nx.addEventListener('click',()=>{
    if(step===5){S.nome=$('#fnome').value.trim();S.wpp=$('#fwpp').value.trim();if(!S.nome){$('#fnome').focus();toast('Pode colocar só o primeiro nome');return}}
    first();track('passo_'+(step+1));step++;if(step===6)track('conversa_concluida');view();if(step===6)setTimeout(()=>{$('#wiz').scrollIntoView({block:'start',behavior:'smooth'})},50)});
  const bk=$('[data-back]',stepsEl);bk&&bk.addEventListener('click',()=>{step--;view()});
  const dr=$('[data-direct]',stepsEl);dr&&dr.addEventListener('click',()=>track('clique_whatsapp',{origem:'pular_conversa'}));
  const sw=$('#sendwa');if(sw){sw.href=waLink(summary());sw.addEventListener('click',()=>track('clique_whatsapp',{origem:'ficha'}))}
  const cp=$('#copy');if(cp)cp.addEventListener('click',()=>{const t=summary();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Resumo copiado')).catch(()=>{const ta=document.createElement('textarea');ta.value=t;document.body.append(ta);ta.select();try{document.execCommand('copy');toast('Resumo copiado')}catch(e){toast('Não consegui copiar')}ta.remove()})});
  const rd=$('[data-redo]',stepsEl);rd&&rd.addEventListener('click',()=>{Object.assign(S,{regioes:[],espera:[],nao:[],evento:'',data:'',primeira:'',nome:'',wpp:''});step=0;view()});
  $$('video[data-auto]',stepsEl).forEach(v=>vio.observe(v));
}
function evtl(){
  const tlE=$('#evtl'),msg=$('#evmsg');if(!tlE)return;
  const n=daysTo(S.data);
  if(!S.evento||S.evento===EVENTS[3]){tlE.style.display='none';msg.textContent=S.evento?'Sem pressa. Quando quiser, a Dra. conversa com você.':'';return}
  if(n===null){tlE.style.display='none';msg.textContent='Escolha a data para ver a linha do tempo.';return}
  tlE.style.display='block';$('#tlfill').style.width='0';setTimeout(()=>$('#tlfill').style.width='calc(100% - 0px)',60);
  $('#evlb').textContent=n<0?'data passada':(n===0?'hoje':n+(n===1?' dia':' dias'));
  msg.textContent=n<0?'Essa data já passou. Escolha outra.':'Quanto antes você chega, mais calmo fica o planejamento.';
}
view();

/* ===== partículas de luz nas seções escuras ===== */
const cv=$('#sparks'),cx2=cv.getContext('2d');let P=[];
function rs(){cv.width=innerWidth;cv.height=innerHeight}rs();addEventListener('resize',rs);
function emit(x,y){const s=document.elementFromPoint(x,y);const sec=s&&s.closest&&s.closest('section');if(!sec||sec.classList.contains('light'))return;for(let i=0;i<2;i++)P.push({x,y,vx:(Math.random()-.5)*1.2,vy:-Math.random()*1.1-.2,l:1,r:Math.random()*2.2+.8})}
addEventListener('pointermove',e=>{if(!reduce&&!body.classList.contains('lock'))emit(e.clientX,e.clientY)},{passive:true});
(function draw(){cx2.clearRect(0,0,cv.width,cv.height);P=P.filter(p=>p.l>0);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.l-=.018;cx2.globalAlpha=p.l;cx2.fillStyle='#F6EBD0';cx2.shadowColor='#E1CB98';cx2.shadowBlur=10;cx2.beginPath();cx2.arc(p.x,p.y,p.r,0,6.3);cx2.fill()}requestAnimationFrame(draw)})();


