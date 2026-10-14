"use strict";
/* Incrementos funcionais de demonstração, sem backend compartilhado. */
const celesteBlocksKey="celeste_demo_time_blocks_v2";
const celesteMembersKey="celeste_demo_members_v2";
const celesteParse=(key)=>{try{const value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?value:[]}catch{return []}};
let celesteBlocks=celesteParse(celesteBlocksKey);
let celesteMembers=celesteParse(celesteMembersKey);
let celesteCategory="Todos",celestePanelTab="agenda",celesteEditorMode=null,celesteEditorSelectedService=null;
const celesteSaveBlocks=()=>{localStorage.setItem(celesteBlocksKey,JSON.stringify(celesteBlocks))};
const celesteSaveMembers=()=>{localStorage.setItem(celesteMembersKey,JSON.stringify(celesteMembers))};
const celesteOwnPro=(pId=proFilter)=>professionals.find(p=>p.id===pId);
const celesteOpDay=(d,off)=>{const x=dateFromISO(d);x.setDate(x.getDate()+off);return localISO(x)};
const celesteIsCurrent=(iso)=>iso>=today();
const celesteRangeOverlap=(a,b,c,d)=>a<d&&c<b;
const celesteRawIsBlocked=isBlocked;
isBlocked=function(pid,date,start,duration){
return celesteRawIsBlocked(pid,date,start,duration)||celesteBlocks.some(b=>b.professionalId===pid&&b.date===date&&celesteRangeOverlap(start,start+duration,minutes(b.time),minutes(b.time)+Number(b.duration)));
};
window.addEventListener("storage",e=>{
 if(e.key===celesteBlocksKey){celesteBlocks=celesteParse(celesteBlocksKey);if($("#pro-overlay").classList.contains("open"))renderPro();if($("#booking-overlay").classList.contains("open")&&booking.step===3)renderBooking()}
 if(e.key===celesteMembersKey){celesteMembers=celesteParse(celesteMembersKey);if($("#pro-overlay").classList.contains("open"))renderPro();if($("#client-overlay").classList.contains("open"))renderClient()}
});
function celesteLaunchPro(){celestePanelTab="agenda";celesteEditorMode=null;proFilter="junior";proDate=nextOpenDate();renderPro();openModal("pro")}
["header-pro","hero-pro","owner-panel-cta"].forEach(id=>document.getElementById(id)?.addEventListener("click",celesteLaunchPro));
const celesteRawServices=renderServices;
renderServices=function(query=""){
 celesteRawServices(query);
 const cards=[...document.querySelectorAll("#service-grid .service-card")];
 let visible=0;
 for(const c of cards){
 const id=c.querySelector("[data-book-service]")?.dataset.bookService,s=service(id);
 const allowed=celesteCategory==="Todos"||s?.category===celesteCategory||(celesteCategory==="Unhas"&&s?.category==="Pés");
 c.style.display=allowed?"":"none";
 if(!allowed)continue;
 visible++;
 c.setAttribute("role","button");c.tabIndex=0;c.setAttribute("aria-label","Agendar "+s.name);
 c.querySelector(".service-card-bottom")?.insertAdjacentHTML("afterbegin",'<span class="service-action-label">Agendar</span>');
 c.addEventListener("click",e=>{if(e.target.closest("button"))return;startBooking(s.id)});
 c.addEventListener("keydown",e=>{if(e.target===c&&(e.key==="Enter"||e.key===" ")){e.preventDefault();startBooking(s.id)}});
 }
 let empty=$("#catalog-empty");
 if(!empty){empty=document.createElement("p");empty.id="catalog-empty";empty.style.color="#648392";empty.style.fontSize="13px";$("#service-grid").insertAdjacentElement("afterend",empty)}
 empty.textContent=visible===0?"Nenhum serviço nesta categoria. Tente outra opção.":"";
};
document.getElementById("catalog-filters")?.addEventListener("click",e=>{
 const b=e.target.closest("[data-category]");if(!b)return;
 celesteCategory=b.dataset.category;
 document.querySelectorAll(".cat-filter").forEach(x=>x.classList.toggle("selected",x===b));
 renderServices($("#service-search").value);
});
renderServices();
const celesteRawPro=renderPro;
renderPro=function(){celesteRawPro();celesteDecoratePro()};
function celesteAvailableEditorTimes(sid=null,durationOverride=null){
 const d=durationOverride||service(sid)?.duration||30;
 let times=[];
 for(let m=540;m+d<=1080;m+=30){
 if(!isBlocked(proFilter,proDate,m,d)&&!isPastSlot(proDate,m)&&celesteIsCurrent(proDate))times.push(fmtTime(m));
 }
 return times;
}
function celesteDecoratePro(){
 const root=$("#pro-body"),controls=root.querySelector(".pro-controls"),stats=root.querySelector(".pro-stats"),agenda=root.querySelector(".pro-agenda");
 if(!controls||!agenda)return;
 controls.insertAdjacentHTML("beforebegin",'<div class="pro-intro">✳ <strong>Ambiente demonstrativo:</strong> experimente a agenda, bloqueie um horário ou crie um encaixe. As alterações ficam apenas neste navegador; ainda não representam reservas reais do salão.</div>');
 const toolbar=document.createElement("div");
 toolbar.className="pro-toolbars";
 toolbar.innerHTML='<div class="pro-view-tabs"><button class="pro-tab '+(celestePanelTab==="agenda"?"active":"")+'" data-celeste-tab="agenda">Agenda do dia</button><button class="pro-tab '+(celestePanelTab==="semana"?"active":"")+'" data-celeste-tab="semana">Visão semanal</button><button class="pro-tab '+(celestePanelTab==="clube"?"active":"")+'" data-celeste-tab="clube">Clube Celeste</button></div><div class="pro-tool-actions"><button class="pro-mini-button primary-mini" data-celeste-editor="manual">+ Encaixe</button><button class="pro-mini-button" data-celeste-editor="block">⊘ Bloquear horário</button><button class="pro-mini-button" data-celeste-reset="true" title="Limpa os dados demonstrativos salvos neste navegador">↻ Reiniciar demo</button></div>';
 controls.insertAdjacentElement("afterend",toolbar);
 if(celesteEditorMode)toolbar.insertAdjacentHTML("afterend",celesteEditorMarkup());
 const [heading]=agenda.querySelectorAll(".agenda-heading");
 const entries=bookings.filter(b=>b.professionalId===proFilter&&b.date===proDate).map(b=>({type:"booking",time:b.time,data:b}))
 .concat(celesteBlocks.filter(b=>b.professionalId===proFilter&&b.date===proDate).map(b=>({type:"block",time:b.time,data:b})))
 .sort((a,b)=>a.time.localeCompare(b.time));
 agenda.innerHTML='<div class="agenda-heading"><span>'+celesteOwnPro()?.name+' · '+dateFromISO(proDate).toLocaleDateString("pt-BR",{day:"numeric",month:"long"})+'</span><span class="pro-day-switch"><button type="button" data-day-step="-1">← Dia anterior</button><button type="button" data-day-step="1">Dia seguinte →</button></span></div>'+
 (entries.length?entries.map(item=>{
 const b=item.data;
 if(item.type==="block")return '<div class="agenda-item blocked-item"><div class="agenda-time">'+escapeHtml(b.time)+'</div><span class="agenda-mark"></span><div><h4>Horário bloqueado</h4><p>'+escapeHtml(b.note||"Pausa / indisponibilidade")+' · '+b.duration+' min</p></div><div class="agenda-ops"><button data-celeste-unblock="'+escapeHtml(b.id)+'">Liberar</button></div></div>';
 let s=service(b.serviceId);if(!s)return "";
 const member=celesteMemberFor(b.phone,b.professionalId,b.serviceId);
 return '<div class="agenda-item"><div class="agenda-time">'+b.time+'</div><span class="agenda-mark" style="background:'+(b.status==="cancelled"?"#bac9cf":b.status==="completed"?"#79b8a1":"#129dbf")+'"></span><div><h4>'+escapeHtml(b.name)+(member?' <span class="agenda-badge">✳ Clube</span>':'')+'</h4><p>'+escapeHtml(s.name)+' · '+s.duration+' min · '+money(s.price)+' · '+(b.status==="cancelled"?"Cancelado":b.status==="completed"?"Concluído":"Confirmado")+'</p></div><div class="agenda-ops">'+(b.status==="confirmed"?'<button data-pro-done="'+b.id+'">✓ Concluir</button><button data-pro-cancel="'+b.id+'">Cancelar</button>':"")+'</div></div>';
 }).join(""):'<div class="agenda-empty">Agenda livre neste dia. Você pode criar um encaixe ou bloquear um horário. ✳</div>');
 if(celestePanelTab==="semana"){stats.style.display="none";agenda.style.display="none";const week=document.createElement("div");week.className="pro-week-panel";let summary=[];
 for(let d=0;d<7;d++){const iso=celesteOpDay(proDate,d);const isBusinessDay=isOpen(dateFromISO(iso));const br=bookings.filter(x=>x.professionalId===proFilter&&x.date===iso&&x.status!=="cancelled");const mins=br.reduce((acc,x)=>acc+(service(x.serviceId)?.duration||0),0)+celesteBlocks.filter(x=>x.professionalId===proFilter&&x.date===iso).reduce((acc,x)=>acc+Number(x.duration),0);summary.push({iso,isBusinessDay,br,rate:isBusinessDay?Math.min(100,Math.round(100*mins/540)):0})}
 week.innerHTML='<h3 class="pro-week-title">Os próximos 7 dias de '+escapeHtml(celesteOwnPro().name)+'</h3><p class="pro-week-sub">Visão de ocupação para planejar horários e atendimento. Dados demonstrativos, não sincronizados.</p>'+summary.map(d=>'<div class="pro-week-row"><span>'+dateFromISO(d.iso).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit"})+'</span><div class="pro-progress"><i style="width:'+d.rate+'%"></i></div><strong>'+(d.isBusinessDay?d.br.length+" reserva"+(d.br.length===1?"":"s"):"Fechado")+'</strong></div>').join("");
 toolbar.insertAdjacentElement("afterend",week);
 }
 if(celestePanelTab==="clube"){stats.style.display="none";agenda.style.display="none";const club=document.createElement("div");club.className="pro-club-panel";const entries=celesteMembers.filter(m=>m.professionalId===proFilter);
 club.innerHTML='<h3 class="pro-week-title">Assinaturas demonstrativas</h3><p>Imagine consultar quais clientes têm cortes incluídos no plano e acompanhar quantas vezes utilizaram o serviço no mês. Nesta prévia, nenhuma cobrança é efetuada.</p>'+(entries.length?entries.map(m=>'<div class="member-list-item"><div><strong>'+escapeHtml(m.name)+' · '+(m.plan==="corte"?"Clube Corte":"Clube Completo")+'</strong><small>'+escapeHtml(m.phone)+' · '+celesteMonthlyUses(m)+' atendimento(s) neste mês</small></div><button data-celeste-remove-member="'+escapeHtml(m.phone)+'">Encerrar simulação</button></div>').join(""):'<div class="agenda-empty">Sem assinaturas simuladas. Experimente os planos na página inicial para ativar uma conta de teste.</div>');
 toolbar.insertAdjacentElement("afterend",club);
 }
 if(celesteEditorMode)celesteSetEditorSlots();
}
function celesteEditorMarkup(){
 const isManual=celesteEditorMode==="manual";
 const options=isManual?services.filter(s=>s.people.includes(proFilter)):[];
 return '<form id="celeste-pro-form" class="pro-editor"><div class="pro-editor-header"><h3>'+(isManual?"Novo encaixe manual":"Bloquear um horário")+'</h3><button type="button" data-celeste-close-editor aria-label="Fechar formulário">×</button></div><div class="pro-editor-grid">'+(isManual?'<div><label for="editor-service">Serviço</label><select id="editor-service">'+options.map(s=>'<option value="'+s.id+'" '+(celesteEditorSelectedService===s.id?"selected":"")+'>'+escapeHtml(s.name)+' · '+s.duration+' min</option>').join("")+'</select></div><div><label for="editor-time">Horário disponível</label><select id="editor-time" required></select></div><div><label for="editor-name">Nome do cliente</label><input id="editor-name" minlength="2" maxlength="70" placeholder="Nome completo" required></div><div><label for="editor-phone">Celular com DDD</label><input id="editor-phone" type="tel" placeholder="(21) 99999-9999" required></div>':'<div><label for="editor-duration">Duração da indisponibilidade</label><select id="editor-duration"><option value="30">30 minutos</option><option value="60">1 hora</option><option value="90">1h30</option><option value="120">2 horas</option></select></div><div><label for="editor-time">Horário a bloquear</label><select id="editor-time" required></select></div><div style="grid-column:1/-1"><label for="editor-note">Motivo (opcional)</label><input id="editor-note" maxlength="60" placeholder="Ex.: almoço, reunião, pausa"></div>')+'</div><div class="pro-editor-action"><small>Profissional: '+escapeHtml(celesteOwnPro().name)+' · '+displayDate(proDate)+'<br>Os horários ocupados não podem ser selecionados.</small><button class="primary" type="submit">'+(isManual?"Salvar encaixe":"Bloquear horário")+' →</button></div></form>';
}
function celesteSetEditorSlots(){
 const sel=$("#editor-time");if(!sel)return;
 const s=service($("#editor-service")?.value);
 const duration=celesteEditorMode==="block"?Number($("#editor-duration")?.value)||30:s?.duration||30;
 const values=celesteAvailableEditorTimes(s?.id||null,duration);
 sel.innerHTML=values.length?values.map(t=>'<option value="'+t+'">'+t+'</option>').join(""):'<option value="">Sem horários disponíveis</option>';
}
function celesteMemberFor(phone,pid,sid){
 const m=celesteMembers.find(x=>digits(x.phone)===digits(phone)&&x.professionalId===pid);
 if(!m)return null;
 if(m.plan==="corte"&&sid!=="corte")return null;
 if(m.plan==="completo"&&!["corte","barba","combo"].includes(sid))return null;
 return m;
}
function celesteMonthlyUses(m){
 const month=localISO(new Date()).slice(0,7);
 return bookings.filter(b=>b.status!=="cancelled"&&b.date.startsWith(month)&&celesteMemberFor(m.phone,b.professionalId,b.serviceId)&&digits(b.phone)===digits(m.phone)).length;
}
$("#pro-body").addEventListener("click",e=>{
 const tab=e.target.closest("[data-celeste-tab]");
 if(tab){celestePanelTab=tab.dataset.celesteTab;celesteEditorMode=null;renderPro();return}
 const editor=e.target.closest("[data-celeste-editor]");
 if(editor){celestePanelTab="agenda";celesteEditorMode=editor.dataset.celesteEditor;celesteEditorSelectedService=null;renderPro();return}
 if(e.target.closest("[data-celeste-close-editor]")){celesteEditorMode=null;renderPro();return}
 const jump=e.target.closest("[data-day-step]");if(jump){proDate=celesteOpDay(proDate,Number(jump.dataset.dayStep));if(!isOpen(dateFromISO(proDate)))proDate=celesteOpDay(proDate,Number(jump.dataset.dayStep));celesteEditorMode=null;renderPro();return}
 const unblock=e.target.closest("[data-celeste-unblock]");
 if(unblock){celesteBlocks=celesteBlocks.filter(b=>b.id!==unblock.dataset.celesteUnblock);celesteSaveBlocks();renderPro();toast("Horário liberado nesta demonstração.");return}
 const removem=e.target.closest("[data-celeste-remove-member]");
 if(removem){celesteMembers=celesteMembers.filter(m=>digits(m.phone)!==digits(removem.dataset.celesteRemoveMember));celesteSaveMembers();renderPro();toast("Assinatura demonstrativa encerrada.");return}
 const reset=e.target.closest("[data-celeste-reset]");
 if(reset&&window.confirm("Reiniciar a demonstração? As reservas, bloqueios e assinaturas simuladas deste navegador serão apagados.")){
 localStorage.removeItem(KEY);localStorage.removeItem(celesteBlocksKey);localStorage.removeItem(celesteMembersKey);localStorage.removeItem(USER_KEY);
 celesteBlocks=[];celesteMembers=[];customer=null;seed();bookings=loadBookings();celestePanelTab="agenda";celesteEditorMode=null;proDate=nextOpenDate(1);renderPro();toast("Dados demonstrativos reiniciados.");return
 }
});
$("#pro-body").addEventListener("change",e=>{if(e.target.matches("#editor-service,#editor-duration"))celesteSetEditorSlots()});
$("#pro-body").addEventListener("submit",e=>{
 if(!e.target.matches("#celeste-pro-form"))return;
 e.preventDefault();
 const time=$("#editor-time")?.value;
 const isManual=celesteEditorMode==="manual";
 const srv=service($("#editor-service")?.value);
 const duration=isManual?srv?.duration:Number($("#editor-duration")?.value);
 if(!time||!duration||isBlocked(proFilter,proDate,minutes(time),duration)||isPastSlot(proDate,minutes(time))){toast("Escolha um horário disponível.");celesteSetEditorSlots();return}
 if(isManual){
 const name=$("#editor-name").value.trim(),phone=digits($("#editor-phone").value);
 if(name.length<2||phone.length<10||phone.length>11){toast("Preencha nome e telefone com DDD.");return}
 bookings=loadBookings();
 if(isBlocked(proFilter,proDate,minutes(time),duration)){toast("Horário ocupado, escolha outro.");return}
 bookings.push({id:"manual-"+Date.now(),serviceId:srv.id,professionalId:proFilter,date:proDate,time,name,phone,status:"confirmed",demo:true,createdAt:new Date().toISOString()});
 saveBookings(bookings);toast("Encaixe criado nesta demonstração.");
 }else{
 celesteBlocks.push({id:"block-"+Date.now(),professionalId:proFilter,date:proDate,time,duration,note:$("#editor-note").value.trim()});
 celesteSaveBlocks();toast("Horário bloqueado nesta demonstração.");
 }
 celesteEditorMode=null;renderPro();
});

/* Assinaturas simuladas: cadastro de teste e visibilidade no cliente/profissional. */
const celesteRawShowPlan=showPlan;
showPlan=function(plan){
 celesteRawShowPlan(plan);
 const body=$("#plan-body");
 const existing=celesteMembers.find(m=>digits(m.phone)===digits(customer?.phone||""));
 body.insertAdjacentHTML("beforeend",'<div class="plan-banner" style="background:#edf9fb"><strong>Experimente o clube de verdade nesta prévia</strong><p>Simule uma adesão, depois abra Minhas reservas para visualizar o cartão do plano. Sem pagamento, sem assinatura real e sem compartilhamento de dados.</p></div><form id="celeste-member-form"><div class="member-demo-form"><div><label for="club-client-name">Nome do cliente</label><input id="club-client-name" required minlength="2" maxlength="70" value="'+escapeHtml(customer?.name||"")+'" placeholder="Nome"></div><div><label for="club-client-phone">Celular com DDD</label><input id="club-client-phone" type="tel" required value="'+escapeHtml(customer?.phone||"")+'" placeholder="(21) 99999-9999"></div><div style="grid-column:1/-1"><label for="club-professional">Barbeiro do plano</label><select id="club-professional">'+professionals.filter(p=>p.category==="Barbearia").map(p=>'<option value="'+p.id+'" '+(existing?.professionalId===p.id?"selected":"")+'>'+escapeHtml(p.name)+'</option>').join("")+'</select></div></div><button type="submit" class="primary full">Simular adesão ao '+(plan==="corte"?"Clube Corte":"Clube Completo")+' ↗</button></form><p class="plan-preview-footnote">A versão comercial deverá validar regras de uso, recorrência, autenticação e pagamentos. Esta demonstração não cobra nem garante atendimento.</p>');
};
$("#plan-body").addEventListener("submit",e=>{
 if(!e.target.matches("#celeste-member-form"))return;
 e.preventDefault();
 const name=$("#club-client-name").value.trim(),phone=digits($("#club-client-phone").value),pid=$("#club-professional").value;
 if(name.length<2||phone.length<10||phone.length>11){toast("Informe nome e celular válido com DDD.");return}
 celesteMembers=celesteMembers.filter(m=>digits(m.phone)!==phone);
 celesteMembers.push({name,phone,professionalId:pid,plan:currentPlan,createdAt:new Date().toISOString(),demo:true});
 celesteSaveMembers();
 customer={name,phone};localStorage.setItem(USER_KEY,JSON.stringify(customer));
 closeModal("plan");renderClient();openModal("client");
 toast("Seu plano demonstrativo está ativo. Nenhuma cobrança foi realizada.");
});
const celesteRawClient=renderClient;
renderClient=function(){
 celesteRawClient();
 if(!customer)return;
 const mine=celesteMembers.find(m=>digits(m.phone)===digits(customer.phone));
 if(!mine)return;
 const toolbar=$("#client-body .bookings-toolbar");if(!toolbar)return;
 toolbar.insertAdjacentHTML("afterend",'<div class="member-banner"><div><span>✳ ASSINATURA DEMONSTRATIVA</span><h3>'+(mine.plan==="corte"?"Clube Corte":"Clube Completo")+'</h3><small>Profissional: '+escapeHtml(professional(mine.professionalId)?.name||"Barbeiro")+' · '+celesteMonthlyUses(mine)+' atendimento(s) este mês · sem cobrança</small></div><span class="member-icon">✳</span></div>');
};
const celesteRawBooking=renderBooking;
renderBooking=function(){
 celesteRawBooking();
 if(booking.step!==4)return;
 const receipt=$("#booking-body .receipt");if(!receipt)return;
 const updateBadge=()=>{
 let badge=$("#booking-body .member-preview-in-booking");
 badge?.remove();
 const phone=digits($("#customer-phone")?.value||customer?.phone||"");
 const member=celesteMemberFor(phone,booking.professionalId,booking.serviceId);
 if(member)receipt.insertAdjacentHTML("afterend",'<div class="member-preview-in-booking">✳ <strong>'+(member.plan==="corte"?"Clube Corte":"Clube Completo")+'</strong> detectado. Este serviço estaria incluído no plano mensal com '+escapeHtml(professional(member.professionalId)?.name||"o barbeiro")+'. Simulação, sem cobrança.</div>');
 };
 $("#customer-phone")?.addEventListener("input",updateBadge);
 updateBadge();
};
