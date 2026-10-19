'use strict';
const app = document.getElementById('app');
const avatar = './assets/estrelinha.svg';
const state = { screen: 'inicio', route: '', history: [], breathTimer: null, breathPhase: 0, missionChecks: new Set(), lastFeedback: '', draft: '' };
const supportive = [
  'Você merece ser tratado com respeito e carinho.',
  'Pedir ajuda também é um gesto de coragem.',
  'Seus sentimentos importam. Você não precisa enfrentar tudo sozinho.',
  'Ser diferente é uma das coisas que tornam cada pessoa especial.',
  'Há pessoas na escola que podem ouvir você com atenção.',
  'Uma situação difícil não define quem você é.'
];
const starters = ['Você é importante!', 'Sua presença faz diferença!', 'Estou torcendo por você!', 'Vamos fazer algo juntos?', 'Você merece respeito!', 'Gosto de ter você por perto!'];
const missions = ['Convide alguém para participar de uma atividade.', 'Ouça um colega sem interromper.', 'Elogie uma atitude gentil que você observou.', 'Se alguém estiver sozinho, ofereça companhia com respeito.'];
const moods = [
  ['feliz','😊','Feliz'],['tranquilo','😌','Tranquilo'],['animado','🤩','Animado'],
  ['triste','😢','Triste'],['preocupado','😟','Preocupado'],['com-raiva','😠','Com raiva'],
  ['preciso-de-ajuda','💛','Ainda preciso de ajuda']
];
const icon = (name) => ({home:'⌂', back:'←', star:'⭐'}[name] || name);
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function logo(big=false) {return `<span class="${big?'brand-large':''}">Empa<span>Tech</span></span>`;}
function mascot(cls='mascot-side') {return `<img class="mascot ${cls}" src="${avatar}" alt="Estrelinha dourada com luvinhas, meias coloridas e tênis roxos">`;}
function header(back=true) { return `<header class="topbar"><div>${back ? `<button class="circle-btn" data-action="back" aria-label="Voltar">${icon('back')}</button>` : `<button class="brand" data-go="inicio" aria-label="Voltar ao início">Empa<span>Tech</span></button>`}</div><nav class="nav" aria-label="Navegação"><button class="circle-btn" data-go="inicio" aria-label="Início">${icon('home')}</button></nav></header>`; }
function shell(inner, {back=true, home=false}={}) {return `<div class="shell">${home?'':header(back)}${inner}<footer class="footer">EmpaTech · Empatia se aprende. Cuidado se pratica.</footer></div>`;}
function head(title, sub, eyebrow='Juntos por uma escola mais gentil') {return `<div class="header-block center"><div class="eyebrow">✦ ${eyebrow} ✦</div><h1 class="title">${title}</h1><p class="subtitle">${sub}</p></div>`;}
function card(label, desc, emoji, go, color='') {return `<button class="card click-card ${color}" data-go="${go}"><div class="icon">${emoji}</div><h3>${label}</h3><p>${desc}</p></button>`;}
function actions(primary='Como estou me sentindo?', route='emocoes', secondary='Voltar às opções', back='escolha') {return `<div class="actions"><button class="btn btn-gold" data-go="${route}">${primary} →</button><button class="btn btn-outline" data-go="${back}">${secondary}</button></div>`;}
const screens = {
  inicio: () => shell(`<main class="home-hero"><div class="eyebrow">✦ Uma escola mais gentil começa com você ✦</div>${logo(true)}<p class="tagline">Empatia se aprende.<br>Cuidado se pratica.</p>${mascot('mascot-home')}<button class="btn btn-gold btn-main" data-go="escolha">COMEÇAR ➜</button><p class="tiny-note">Um espaço de escuta, respeito e amizade 💛</p></main>`, {home:true}),
  escolha: () => shell(`<main class="content">${head('O que você precisa hoje?','A Estrelinha está aqui para caminhar com você. Escolha uma opção.')}<div class="grid grid-2"><button class="choice help" data-action="select-help"><div class="choice-icon">💙</div><div><h2>Preciso de ajuda</h2><p>Encontre um espaço de acolhimento, atividades e apoio.</p></div><span class="arr">›</span></button><button class="choice give" data-action="select-give"><div class="choice-icon">💛</div><div><h2>Quero ajudar</h2><p>Espalhe gentileza e faça a diferença na escola.</p></div><span class="arr">›</span></button></div><div class="info-line">Se algo está machucando você ou outra pessoa, procure um adulto de confiança na escola. Este aplicativo não substitui esse cuidado.</div><div class="center">${mascot('mascot-mini')}</div></main>`),
  ajuda: () => shell(`<main class="content">${head('Ei, você não está sozinho!','Aqui você pode encontrar apoio, se expressar e se sentir melhor.','Cantinho do acolhimento')}<div class="two-pane"><div class="grid grid-2">${card('Palavras que acolhem','Mensagens positivas para o seu dia.','💜','palavras')}${card('Vamos respirar?','Um momento de calma, no seu ritmo.','🫧','respirar','blue')}${card('Missões da amizade','Atividades de cuidado e colaboração.','🤝','missoes','gold')}${card('Conversar com alguém','Saiba como pedir ajuda a um adulto.','🗣️','adulto','lilac')}</div><div class="aside-card">${mascot()}<p>Seus sentimentos importam 💛</p></div></div>${actions()}</main>`),
  ajudar: () => shell(`<main class="content">${head('Quero espalhar gentileza!','Pequenos gestos de cuidado podem fazer uma grande diferença.','Juntos somos mais fortes')}<div class="two-pane"><div class="grid grid-2">${card('Correio da amizade','Escreva uma mensagem gentil para o mural.','💌','correio')}${card('Mural de mensagens','Leia mensagens aprovadas pela escola.','✨','mural','lilac')}${card('Gestos de carinho','Descubra formas de oferecer apoio com respeito.','🫶','gestos','gold')}${card('Missões da amizade','Escolha uma boa ação para colocar em prática.','⭐','missoes','blue')}</div><div class="aside-card">${mascot()}<p>Uma gentileza pode iluminar o dia de alguém!</p></div></div>${actions()}</main>`),
  palavras: () => shell(`<main class="content">${head('Palavras que acolhem','A Estrelinha separou uma mensagem especial para você.','Você importa')}<div class="light-panel" style="max-width:750px;margin:0 auto"><div class="center" style="font-size:38px">💛 ✨ 💜</div><p class="quote" id="supportive-quote">${esc(supportive[0])}</p><div class="center"><button class="btn btn-purple" data-action="next-quote">Outra mensagem ✨</button></div></div>${actions('Terminar com carinho','emocoes','Voltar ao acolhimento','ajuda')}</main>`),
  respirar: () => shell(`<main class="content">${head('Vamos respirar juntos?','Inspire devagar, segure um instante e solte o ar. Faça no seu ritmo.','Momento de calma')}<div class="light-panel center" style="max-width:700px;margin:0 auto"><div class="breath-orb" id="breath-orb">Respire 💛</div><div class="timer" id="breath-instruction" aria-live="polite">Toque em começar quando estiver pronto.</div><p class="kicker" id="breath-count">3 ciclos tranquilos · você pode parar quando quiser.</p><button class="btn btn-purple" id="breath-button" data-action="breath-start">Começar exercício</button></div>${actions('Terminar e continuar','emocoes','Voltar ao acolhimento','ajuda')}</main>`),
  missoes: () => shell(`<main class="content">${head('Missões da amizade','Escolha uma ação de empatia para praticar na escola.','Pequenos gestos, grandes diferenças')}<div class="light-panel" style="max-width:760px;margin:0 auto"><h2>Desafio da gentileza ⭐</h2><p>Marque as missões que pretende realizar. Vale convidar um amigo!</p><div class="m-list">${missions.map((m,i)=>`<label class="mission ${state.missionChecks.has(i)?'done':''}"><input type="checkbox" data-mission="${i}" ${state.missionChecks.has(i)?'checked':''}><span>${esc(m)}</span></label>`).join('')}</div><p class="kicker" style="margin-top:17px">Cada gesto conta. Não precisa fazer tudo de uma vez.</p></div>${actions('Concluir atividade','emocoes','Voltar às atividades',state.route==='ajudar'?'ajudar':'ajuda')}</main>`),
  adulto: () => shell(`<main class="content">${head('Pedir ajuda é um ato de coragem','Você merece ser ouvido com respeito e atenção.','Você não está sozinho')}<div class="two-pane"><div class="light-panel"><h2>Com quem posso conversar?</h2><p>Procure um(a) professor(a), a coordenação, a orientação escolar ou outro adulto em quem confie.</p><p>Você pode dizer: <strong>“Estou passando por uma situação difícil e preciso conversar com você.”</strong></p><div class="alert-card"><strong>Importante:</strong> o EmpaTech não envia um pedido de ajuda automaticamente para a escola. Se algo estiver acontecendo, converse diretamente com um adulto responsável, especialmente se você não se sente seguro.</div></div><div class="aside-card">${mascot()}<p>Você não precisa resolver tudo sozinho.</p></div></div>${actions('Como estou me sentindo?','emocoes','Voltar ao acolhimento','ajuda')}</main>`),
  gestos: () => shell(`<main class="content">${head('Gestos de carinho','Você pode ajudar alguém respeitando os sentimentos e os limites dessa pessoa.','Empatia em ação')}<div class="grid grid-3">${card('Ofereça companhia','Pergunte: “Quer ficar comigo no recreio?”','👫','missoes','lilac')}${card('Escute de verdade','Ouvir sem julgar é um jeito de acolher.','👂','missoes','blue')}${card('Pergunte antes do abraço','“Posso te dar um abraço?” Tudo bem se a pessoa disser não.','🤗','missoes','gold')}</div>${actions('Quero registrar como me sinto','emocoes','Voltar às formas de ajudar','ajudar')}</main>`),
  correio: () => shell(`<main class="content">${head('Correio da amizade','Escreva uma mensagem gentil para iluminar o dia de alguém.','Palavras também acolhem')}<div class="light-panel" style="max-width:790px;margin:0 auto"><h2>Deixe uma mensagem positiva 💌</h2><p>Não escreva nomes, telefones ou informações pessoais. Todas as mensagens passam por revisão de um adulto.</p><label for="letter" class="kicker">Minha mensagem:</label><textarea maxlength="140" id="letter" class="text-field" placeholder="Escreva uma mensagem de carinho e respeito..."></textarea><div class="form-foot"><span class="counter" id="count">0/140 caracteres</span><button class="btn btn-purple" data-action="send-message">Enviar para revisão ➜</button></div><h3>Ou inspire-se com uma frase:</h3><div class="pills">${starters.map(s=>`<button class="pill" data-preset="${esc(s)}">${esc(s)}</button>`).join('')}</div><div id="form-feedback" aria-live="polite"></div></div>${actions('Ver o mural de mensagens','mural','Voltar às formas de ajudar','ajudar')}</main>`),
  mural: () => shell(`<main class="content">${head('Mural de gentileza','Aqui aparecem apenas mensagens aprovadas pela equipe escolar.','Palavras que fazem bem')}<div class="light-panel"><div class="message-grid" id="mural-list"><p>Carregando mensagens...</p></div></div>${actions('Escrever uma mensagem','correio','Voltar às formas de ajudar','ajudar')}</main>`),
  emocoes: () => shell(`<main class="content">${head('Como estou me sentindo?','Todas as emoções merecem atenção. Escolha a que mais combina com você agora.','Seu sentimento importa')}<div style="max-width:775px;margin:0 auto"><div class="mood-grid">${moods.map(([id,emoji,label],i)=>`<button class="mood ${i===6?'big':''}" data-mood="${id}"><span class="face">${emoji}</span><span>${label}</span></button>`).join('')}</div><p class="info-line">A escola recebe apenas quantidades totais de cada emoção neste protótipo. Não é necessário informar seu nome.</p></div></main>`),
  final: () => shell(`<main class="home-hero" style="min-height:calc(100vh - 115px)"><div class="eyebrow">✦ Você chegou até aqui! ✦</div><h1 class="title">Seu brilho faz a diferença!</h1><p class="subtitle">Lembre-se: você importa e sempre pode procurar alguém de confiança para conversar.</p>${mascot('mascot-end')}<button class="btn btn-gold btn-main" data-action="restart">⌂ Voltar ao início</button><p class="tiny-note">Obrigado por espalhar respeito e empatia. 💜</p></main>`),
  adminLogin: () => shell(`<main class="content">${head('Painel da escola','Acesso exclusivo para a equipe responsável.','Área administrativa')}<form id="admin-login" class="light-panel" style="max-width:500px;margin:auto"><label for="pin"><strong>PIN de acesso</strong></label><input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off" minlength="6" maxlength="12" required style="width:100%;padding:17px;border:2px solid #a4a8eb;border-radius:16px;margin:13px 0 20px;font-size:20px" placeholder="Digite o PIN"><button class="btn btn-purple full" type="submit">Entrar no painel</button><div id="login-feedback" aria-live="polite"></div></form><p class="info-line">Para o protótipo, veja o PIN no terminal do VS Code onde o servidor está rodando.</p></main>`),
  admin: () => shell(`<main class="content">${head('Painel da escola','Visão geral das interações e mensagens do EmpaTech.','Área restrita')}<div id="admin-content" class="light-panel">Carregando informações...</div><div class="actions"><button class="btn btn-outline" data-action="refresh-admin">Atualizar</button><button class="btn btn-purple" data-action="logout">Sair do painel</button></div><p class="info-line">Indicadores agregados não identificam pessoas ou comprovam, isoladamente, a ocorrência de bullying.</p></main>`)
};

function clearTimer() { if (state.breathTimer) clearTimeout(state.breathTimer); state.breathTimer = null; }

function go(screen, record=true) {
  if (!screens[screen]) return;
  clearTimer();
  if (record && state.screen !== screen) state.history.push(state.screen);
  state.screen=screen; app.innerHTML=screens[screen](); window.scrollTo(0,0);
  if (screen==='mural') fetchMural();
  if (screen==='admin') fetchAdmin();
}

// Mantido apenas para simular o painel de admin, o resto usa dados estáticos
async function request(path, opts={}) {
  let res;
  try { res=await fetch(path,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...opts}); }
  catch { throw new Error('Não foi possível conectar ao servidor. No GitHub Pages, isto é apenas uma demonstração visual.'); }
  let data={}; try {data=await res.json();} catch {}
  if (!res.ok) throw new Error(data.error || `Ocorreu um problema (${res.status}).`);
  return data;
}

async function choose(route) {
  state.route=route;
  state.missionChecks.clear();
  // Simulação: Navega direto sem dar erro de servidor (404)
  go(route==='ajuda'?'ajuda':'ajudar');
}

function showFeedback(target,msg,type='error') {
  const el=document.getElementById(target);
  if(el) el.innerHTML=`<div class="feedback ${type}">${esc(msg)}</div>`;
}

async function sendMessage() {
  const area=document.getElementById('letter'); if (!area) return;
  const val=area.value.trim();
  if(val.length<8) return showFeedback('form-feedback','Escreva uma mensagem com pelo menos 8 caracteres.');
  
  // Simulação: Mostra mensagem de sucesso sem tentar contactar o servidor
  showFeedback('form-feedback','Mensagem enviada com sucesso para revisão! 💛','success'); 
  area.value=''; document.getElementById('count').textContent='0/140 caracteres';
}

async function fetchMural() {
  const el=document.getElementById('mural-list');
  if(state.screen!=='mural') return;
  
  // Simulação: Lista fixa de mensagens em vez de ir buscar à base de dados
  const mensagensDemonstracao = [
    "Acredite em si mesmo. Um passo de cada vez.",
    "A gentileza muda o mundo. Espalhe coisas boas!",
    "Você é especial e a sua presença faz a diferença!",
    "O respeito é a base de todas as grandes amizades.",
    "Sua voz e os seus sentimentos importam."
  ];
  
  el.innerHTML=mensagensDemonstracao.map(m=>`<div class="message">💛 ${esc(m)}</div>`).join('');
}

let breathSteps=[];
function runBreath() {
  const orb=document.getElementById('breath-orb');const instruction=document.getElementById('breath-instruction');const count=document.getElementById('breath-count'); const btn=document.getElementById('breath-button');
  if(!orb||!instruction||!count||!btn) return;
  const step=breathSteps.shift();
  if(!step){orb.classList.remove('expand');orb.textContent='Muito bem! ✨';instruction.textContent='Exercício concluído. Você pode continuar quando quiser.';count.textContent='Você reservou um momento para se cuidar.';btn.textContent='Recomeçar';btn.disabled=false;clearTimer();return;}
  instruction.textContent=step.text;orb.textContent=step.word;orb.classList.toggle('expand',step.expand);count.textContent=`Ciclo ${step.cycle} de 3`;
  state.breathTimer=setTimeout(runBreath,step.seconds*1000);
}

function startBreath() {
  clearTimer();breathSteps=[];
  for(let cycle=1;cycle<=3;cycle++) breathSteps.push(
    {cycle,seconds:4,text:'Inspire devagar pelo nariz...',word:'Inspire',expand:true},
    {cycle,seconds:2,text:'Segure um instante, se estiver confortável...',word:'Pausa',expand:true},
    {cycle,seconds:5,text:'Solte o ar lentamente...',word:'Solte',expand:false});
  document.getElementById('breath-button').disabled=true;
  runBreath();
}

async function moodSelected(id) {
  // Simulação: Vai direto para o próximo ecrã sem dar erro de servidor (404)
  if(id==='preciso-de-ajuda') go('adulto'); else go('final');
}

function statsLine(name,val,max) {return `<div class="stat-row" style="color:#202658"><span style="min-width:105px">${esc(name)}</span><div class="bar-track"><div class="bar" style="width:${max?Math.round(val/max*100):0}%"></div></div><strong>${val}</strong></div>`;}

async function fetchAdmin() {
  const el=document.getElementById('admin-content'); if(!el) return;
  try {
    const data=await request('/api/admin/summary'); if(state.screen!=='admin')return;
    const s=data.stats;const c=data.counts;
    const mapped=moods.map(([key,,label])=>({label,value:s.emotions[key]||0}));
    const mx=Math.max(1,...mapped.map(e=>e.value));
    el.innerHTML=`<div class="grid grid-4"><div class="metric"><strong>${s.interactions||0}</strong><span>Interações iniciadas</span></div><div class="metric"><strong>${s.help||0}</strong><span>Escolheram receber ajuda</span></div><div class="metric"><strong>${s.give||0}</strong><span>Escolheram oferecer ajuda</span></div><div class="metric"><strong>${s.completed||0}</strong><span>Registros de emoções</span></div></div>
      <h2>Emoções registradas</h2>${mapped.map(item=>statsLine(item.label,item.value,mx)).join('')}
      <div class="divider" style="background:#aaa7cf"></div>
      <h2>Moderação de mensagens</h2><div class="grid grid-3"><div class="metric"><strong>${c.pending}</strong><span>Aguardando revisão</span></div><div class="metric"><strong>${c.approved}</strong><span>Aprovadas</span></div><div class="metric"><strong>${c.rejected}</strong><span>Rejeitadas</span></div></div>
      <h2>Mensagens aguardando avaliação</h2><div class="admin-table">${data.pending.length?data.pending.map(m=>`<div class="admin-item"><p>${esc(m.text)}</p><div class="admin-buttons"><button class="small-btn approve" data-review="${m.id}" data-status="approved">Aprovar</button><button class="small-btn reject" data-review="${m.id}" data-status="rejected">Rejeitar</button></div></div>`).join(''):'<p>Nenhuma mensagem aguardando revisão.</p>'}</div>
      <p class="kicker">Atenção: o filtro automático não garante a detecção de toda mensagem inadequada. Leia cada mensagem antes de aprovar.</p>`;
  } catch(e) {if(e.message.includes('Acesso restrito'))go('adminLogin'); else el.textContent=e.message;}
}

async function login(form) {
  const pin=String(new FormData(form).get('pin')||'');
  try {await request('/api/admin/login',{method:'POST',body:JSON.stringify({pin})});go('admin');}
  catch(e) {showFeedback('login-feedback',e.message);}
}

async function review(id,status) {
  try {await request(`/api/admin/messages/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status})});await fetchAdmin();}
  catch(e) {alert(e.message);}
}

app.addEventListener('click',async e=>{
  const item=e.target.closest('[data-action],[data-go],[data-mood],[data-preset],[data-review]');if(!item)return;
  if(item.dataset.go){go(item.dataset.go);return;}
  if(item.dataset.mood){await moodSelected(item.dataset.mood);return;}
  if(item.dataset.preset){const area=document.getElementById('letter');if(area){area.value=item.dataset.preset;document.getElementById('count').textContent=`${area.value.length}/140 caracteres`;area.focus();}return;}
  if(item.dataset.review){await review(item.dataset.review,item.dataset.status);return;}
  switch(item.dataset.action){
    case 'back': go(state.history.pop()||'inicio',false);break;
    case 'select-help': await choose('ajuda');break;
    case 'select-give': await choose('ajudar');break;
    case 'next-quote': document.getElementById('supportive-quote').textContent=supportive[Math.floor(Math.random()*supportive.length)];break;
    case 'breath-start':startBreath();break;
    case 'send-message':await sendMessage();break;
    case 'restart':state.history=[];state.route='';go('inicio',false);break;
    case 'refresh-admin':await fetchAdmin();break;
    case 'logout':await request('/api/admin/logout',{method:'POST'});go('inicio');break;
  }
});

app.addEventListener('input',e=>{
 if(e.target.id==='letter')document.getElementById('count').textContent=`${e.target.value.length}/140 caracteres`;
});

app.addEventListener('change',e=>{
 if(e.target.dataset.mission!==undefined){const id=Number(e.target.dataset.mission);if(e.target.checked)state.missionChecks.add(id);else state.missionChecks.delete(id);e.target.closest('.mission').classList.toggle('done',e.target.checked);}
});

app.addEventListener('submit',e=>{
 if(e.target.id==='admin-login'){e.preventDefault();login(e.target);}
});

// A equipe acessa o painel digitando /#painel na barra de endereço do navegador.
if(location.hash==='#painel'){go('adminLogin',false);}else go('inicio',false);
window.addEventListener('hashchange',()=>{if(location.hash==='#painel')go('adminLogin');});
