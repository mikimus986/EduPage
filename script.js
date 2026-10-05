let data = loadData();
let selectedDay = "Po";
const days = ["Po","Út","St","Čt","Pá"];

const pageTitles = {
  home:"Domů", schedule:"Rozvrh", substitutions:"Suplování",
  news:"Informace", calendar:"Kalendář", admin:"Administrace"
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("todayText").textContent =
    new Date().toLocaleDateString("cs-CZ",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click",()=>showPage(btn.dataset.page));
  });
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click",()=>showPage(btn.dataset.go));
  });

  document.getElementById("mobileMenu").addEventListener("click",()=>{
    document.querySelector(".sidebar").classList.toggle("open");
  });

  document.getElementById("classSelect").addEventListener("change",renderSchedule);

  document.getElementById("newsForm").addEventListener("submit",e=>{
    e.preventDefault();
    data.news.unshift({
      title:document.getElementById("newsTitle").value.trim(),
      body:document.getElementById("newsBody").value.trim(),
      date:new Date().toLocaleDateString("cs-CZ")
    });
    saveData(data); e.target.reset(); renderAll(); showPage("news");
  });

  document.getElementById("subForm").addEventListener("submit",e=>{
    e.preventDefault();
    data.substitutions.push({
      lesson:Number(document.getElementById("subLesson").value),
      className:document.getElementById("subClass").value.trim(),
      subject:document.getElementById("subSubject").value.trim(),
      change:document.getElementById("subChange").value.trim(),
      room:""
    });
    saveData(data); e.target.reset(); renderAll(); showPage("substitutions");
  });

  document.getElementById("resetData").addEventListener("click",()=>{
    if(confirm("Opravdu obnovit původní demo data?")){
      data=structuredClone(DEFAULT_DATA); saveData(data); renderAll();
    }
  });

  renderAll();
});

function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  document.getElementById("pageTitle").textContent=pageTitles[page]||"Školní systém";
  document.querySelector(".sidebar").classList.remove("open");
  if(page==="schedule") renderSchedule();
}

function renderAll(){
  document.getElementById("homeLessons").textContent = getTodayLessons().length;
  document.getElementById("homeSubs").textContent = data.substitutions.length;
  document.getElementById("homeNews").textContent = data.news.length;
  renderHome();
  renderClassSelect();
  renderDayTabs();
  renderSchedule();
  renderSubstitutions();
  renderNews();
  renderCalendar();
}

function getTodayLessons(){
  const d=new Date().getDay();
  const day=days[d===0?0:d-1] || "Po";
  const cls=data.classes[0];
  return (data.schedule[cls]&&data.schedule[cls][day]) || [];
}

function renderHome(){
  const news=data.news.slice(0,3);
  document.getElementById("homeNewsList").innerHTML = news.length
    ? news.map(n=>`<div class="news-card"><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p><time>${esc(n.date)}</time></div>`).join("")
    : `<div class="empty">Žádné informace.</div>`;

  const lessons=getTodayLessons();
  document.getElementById("homeSchedule").innerHTML=lessons.length
    ? lessons.slice(0,5).map(l=>`<div class="sub-row"><strong>${esc(l[0])}</strong><span>${esc(l[1])}</span><span>${esc(l[2])} · ${esc(l[3])}</span></div>`).join("")
    : `<div class="empty">Pro dnešek není rozvrh.</div>`;
}

function renderClassSelect(){
  const select=document.getElementById("classSelect");
  const current=select.value;
  select.innerHTML=data.classes.map(c=>`<option>${esc(c)}</option>`).join("");
  if(data.classes.includes(current)) select.value=current;
}

function renderDayTabs(){
  document.getElementById("dayTabs").innerHTML=days.map(d=>
    `<button class="day-tab ${d===selectedDay?"active":""}" data-day="${d}">${d}</button>`
  ).join("");
  document.querySelectorAll(".day-tab").forEach(b=>b.addEventListener("click",()=>{
    selectedDay=b.dataset.day; renderDayTabs(); renderSchedule();
  }));
}

function renderSchedule(){
  const cls=document.getElementById("classSelect").value || data.classes[0];
  const lessons=(data.schedule[cls]&&data.schedule[cls][selectedDay])||[];
  const grid=document.getElementById("scheduleGrid");
  const header=`<div class="schedule-cell schedule-head">Čas</div><div class="schedule-cell schedule-head">${selectedDay}</div>`;
  grid.innerHTML=header + lessons.map(l=>
    `<div class="schedule-cell time-cell">${esc(l[0])}</div>
     <div class="schedule-cell lesson"><strong>${esc(l[1])}</strong><span>${esc(l[2])} · uč. ${esc(l[3])}</span></div>`
  ).join("");
}

function renderSubstitutions(){
  const list=document.getElementById("substitutionList");
  document.getElementById("subDate").textContent=new Date().toLocaleDateString("cs-CZ");
  list.innerHTML=data.substitutions.length ? data.substitutions.map(s=>
    `<div class="sub-row"><strong>${esc(s.lesson)}.</strong><span>${esc(s.className)}</span><span>${esc(s.subject)}</span><span class="sub-change">${esc(s.change)}${s.room?" · "+esc(s.room):""}</span></div>`
  ).join("") : `<div class="empty">Dnes nejsou žádné změny.</div>`;
}

function renderNews(){
  document.getElementById("newsList").innerHTML=data.news.length ? data.news.map(n=>
    `<article class="news-card"><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p><time>${esc(n.date)}</time></article>`
  ).join("") : `<div class="empty">Žádné informace.</div>`;
}

function renderCalendar(){
  document.getElementById("calendarList").innerHTML=data.events.map(e=>
    `<article class="calendar-item"><div class="calendar-date"><strong>${esc(e.day)}</strong><span>${esc(e.month)}</span></div><div><strong>${esc(e.title)}</strong><p>${esc(e.detail)}</p></div></article>`
  ).join("");
}

function esc(value){
  return String(value??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
