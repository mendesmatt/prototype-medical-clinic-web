const SPECS_TOP = ['Clínica Geral','Cardiologia','Ginecologia','Pediatria','Dermatologia','Ortopedia','Endocrinologia','Oftalmologia'];
const SPECS_ALL = SPECS_TOP.concat(['Cirurgia Vascular','Angiologia','Gastroenterologia','Geriatria','Mastologia','Nutrição','Nutrologia','Otorrinolaringologia','Pneumologia','Psiquiatria','Terapia Holística']);
const SPEC_ICONS = {'Clínica Geral':'fa-user-doctor','Cardiologia':'fa-heart-pulse','Ginecologia':'fa-venus','Pediatria':'fa-baby','Dermatologia':'fa-hand-dots','Ortopedia':'fa-bone','Endocrinologia':'fa-droplet','Oftalmologia':'fa-eye'};

const state = { step:1, spec:null, day:null, time:null, pay:'Particular' };

function renderChips(all=false){
  const list = all ? SPECS_ALL : SPECS_TOP;
  document.getElementById('specChips').innerHTML = list.map(s =>
    `<button class="chip rounded-xl px-4 py-2.5 text-[13.5px] font-semibold" onclick="pickSpec('${s}')">${s}</button>`
  ).join('');
  document.getElementById('moreSpecs').style.display = all ? 'none' : '';
}
function showAllSpecs(){ renderChips(true); }

document.getElementById('specGrid').innerHTML = SPECS_TOP.map((s,i) =>
  `<button class="card-line bg-white rounded-2xl p-5 text-left reveal" style="transition-delay:${i*0.04}s" onclick="prefillSpec('${s}')">
     <i class="fa-solid ${SPEC_ICONS[s]||'fa-stethoscope'} text-mv-green text-[20px]"></i>
     <div class="font-display font-bold text-[15.5px] text-mv-navy mt-3">${s}</div>
     <div class="text-mv-blue text-[12.5px] font-bold mt-1.5">Agendar <i class="fa-solid fa-arrow-right text-[10px]"></i></div>
   </button>`
).join('');

const TITLES = {
  1:['Agende sua consulta','Escolha a especialidade para começar'],
  2:['Quando fica melhor?','Escolha o dia e o horário'],
  3:['Quase lá','Só precisamos saber quem é você'],
  4:['Tudo certo','']
};
function goStep(n){
  state.step = n;
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  document.getElementById('step'+n).classList.add('active');
  document.getElementById('wTitle').textContent = TITLES[n][0];
  document.getElementById('wSub').textContent = TITLES[n][1];
  document.getElementById('wBack').classList.toggle('hidden', n===1 || n===4);
  for(let i=1;i<=3;i++) document.getElementById('p'+i).classList.toggle('done', i<=Math.min(n,3));
}
function wPrev(){ if(state.step>1) goStep(state.step-1); }
function wReset(){ state.spec=state.day=state.time=null; renderChips(false); goStep(1); }

function pickSpec(s){
  state.spec = s;
  renderDays();
  goStep(2);
}
function prefillSpec(s){
  pickSpec(s);
  document.getElementById('agendar').scrollIntoView({behavior:'smooth'});
}

const DIAS = ['dom','seg','ter','qua','qui','sex','sáb'];
const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
function nextDays(){
  const out=[]; let d=new Date();
  while(out.length<6){
    d = new Date(d.getTime()+86400000);
    if(d.getDay()!==0) out.push(new Date(d));
  }
  return out;
}
function renderDays(){
  const days = nextDays();
  document.getElementById('dayStrip').innerHTML = days.map((d,i)=>
    `<button class="daycard rounded-xl px-3 py-2.5 text-center ${i===0?'sel':''}" data-i="${i}" onclick="pickDay(this,'${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}',${d.getDay()})">
       <div class="text-[11px] font-bold uppercase opacity-70">${DIAS[d.getDay()]}</div>
       <div class="font-display font-extrabold text-[18px] leading-none mt-0.5">${d.getDate()}</div>
       <div class="text-[10.5px] font-semibold opacity-70">${MESES[d.getMonth()]}</div>
     </button>`
  ).join('');
  const f = days[0];
  state.day = `${DIAS[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]}`;
  renderSlots(f.getDay());
}
function pickDay(el,label,dow){
  document.querySelectorAll('.daycard').forEach(x=>x.classList.remove('sel'));
  el.classList.add('sel');
  state.day = label;
  renderSlots(dow);
}
function renderSlots(dow){
  const base = ['07:30','08:20','09:10','10:00','10:50','11:40','14:00','14:50','15:40','16:30','17:20'];
  const slots = dow===6 ? base.slice(0,6) : base;
  const busy = new Set([1,4,7].map(i=>slots[i]));
  document.getElementById('slotGrid').innerHTML = slots.map(t=>
    `<button class="slot rounded-lg py-2 text-[13.5px] font-bold ${busy.has(t)?'off':''}" onclick="pickTime(this,'${t}')">${t}</button>`
  ).join('');
}
function pickTime(el,t){
  document.querySelectorAll('.slot').forEach(x=>x.classList.remove('sel'));
  el.classList.add('sel');
  state.time = t;
  document.getElementById('summaryTxt').innerHTML =
    `<strong>${state.spec}</strong> · ${state.day} às <strong>${state.time}</strong> · <span class="text-mv-slate">${state.pay}</span>`;
  setTimeout(()=>goStep(3), 180);
}
function setPay(p){
  state.pay = p;
  document.getElementById('optPart').classList.toggle('sel', p==='Particular');
  document.getElementById('optConv').classList.toggle('sel', p==='Convênio');
  document.getElementById('summaryTxt').innerHTML =
    `<strong>${state.spec}</strong> · ${state.day} às <strong>${state.time}</strong> · <span class="text-mv-slate">${state.pay}</span>`;
}
function confirmBooking(){
  const name = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();
  if(!name || !phone){
    [['fName',name],['fPhone',phone]].forEach(([id,v])=>{
      const el=document.getElementById(id);
      el.style.borderColor = v ? '#D7E0E7' : '#DC2626';
    });
    return;
  }
  const msg = encodeURIComponent(
    `Olá! Quero agendar uma consulta pelo site.\n\n`+
    `• Especialidade: ${state.spec}\n• Dia: ${state.day}\n• Horário: ${state.time}\n`+
    `• Atendimento: ${state.pay}\n• Nome: ${name}\n• WhatsApp: ${phone}`
  );
  document.getElementById('waLink').href = `https://api.whatsapp.com/send/?phone=5511943142721&text=${msg}`;
  document.getElementById('doneTxt').innerHTML =
    `Recebemos seu pedido de <strong>${state.spec}</strong> para <strong>${state.day} às ${state.time}</strong>.<br>A recepção confirma seu horário pelo WhatsApp.`;
  goStep(4);
}

document.getElementById('fPhone').addEventListener('input', e=>{
  let v = e.target.value.replace(/\D/g,'').slice(0,11);
  if(v.length>6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  else if(v.length>2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  e.target.value = v;
});

const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

renderChips(false);
