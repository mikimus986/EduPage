
const DAYS = ["Po", "Út", "St", "Čt", "Pá"];
const LESSONS = ["1", "2", "3", "4", "5A", "5B", "6", "7"];
const STORAGE_KEY = "skolniSystemDataV6";

let state;

const $ = id => document.getElementById(id);

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatDate(date) {
  if (!date) return "";
  const [y,m,d] = date.split("-");
  return `${d}.${m}.${y}`;
}

function weekday(date) {
  const n = new Date(date + "T12:00:00").getDay();
  return ({1:"Po",2:"Út",3:"St",4:"Čt",5:"Pá"})[n] || null;
}

function fullSubject(subject) {
  return state.subjectNames[subject] || subject || "—";
}

function teacherName(teacher) {
  return state.teachers[teacher] || teacher || "—";
}

function loadState() {
  const base = cloneData(window.schoolData);
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      base.substitutions = saved.substitutions || [];
      base.messages = saved.messages || [];
    }
  } catch (error) {
    console.warn("Uložená data se nepodařilo načíst.", error);
  }
  return base;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    substitutions: state.substitutions,
    messages: state.messages
  }));
}

function init() {
  state = loadState();

  $("dailyDate").value = todayString();
  $("substitutionDate").value = todayString();
  $("subDate").value = todayString();
  $("messageDate").value = todayString();

  fillClassSelectors();
  setupNavigation();
  setupForms();

  $("timetableClass").addEventListener("change", renderTimetable);
  $("dailyClass").addEventListener("change", renderDaily);
  $("dailyDate").addEventListener("change", renderDaily);
  $("substitutionDate").addEventListener("change", renderSubstitutions);
  $("substitutionClassFilter").addEventListener("change", renderSubstitutions);

  $("menuToggle").addEventListener("click", () => {
    $("navigation").classList.toggle("open");
  });

  renderTimetable();
  renderDaily();
  renderSubstitutions();
  renderMessages();
}

function setupNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => openPage(button.dataset.page));
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => openPage(button.dataset.go));
  });
}

function openPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === id);
  });

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === id);
  });

  $("navigation").classList.remove("open");
}

function fillClassSelectors() {
  const classes = Object.keys(state.classes).sort(
    (a,b) => Number(a) - Number(b)
  );

  const ids = ["timetableClass", "dailyClass", "subClass"];
  ids.forEach(id => {
    $(id).innerHTML = "";
    classes.forEach(classId => {
      const option = document.createElement("option");
      option.value = classId;
      option.textContent = state.classes[classId].name;
      $(id).appendChild(option);
    });
  });

  $("substitutionClassFilter").innerHTML =
    '<option value="all">Všechny třídy</option>';

  classes.forEach(classId => {
    const option = document.createElement("option");
    option.value = classId;
    option.textContent = state.classes[classId].name;
    $("substitutionClassFilter").appendChild(option);
  });
}

function renderTimetable() {
  const classId = $("timetableClass").value;
  const cls = state.classes[classId];
  const table = $("timetableTable");

  if (!cls) return;

  let html = "<thead><tr><th>Den</th>";
  LESSONS.forEach(lesson => {
    html += `<th>${lesson}</th>`;
  });
  html += "</tr></thead><tbody>";

  DAYS.forEach(day => {
    html += `<tr><td class="day-name">${day}</td>`;

    LESSONS.forEach(lesson => {
      const items = cls.timetable?.[day]?.[lesson] || [];
      html += "<td>";

      items.forEach(item => {
        html += `
          <div class="lesson">
            <div class="lesson-subject">${escapeHTML(item.subject)}</div>
            <div class="lesson-teacher">${escapeHTML(item.teacher)}</div>
          </div>`;
      });

      html += "</td>";
    });

    html += "</tr>";
  });

  table.innerHTML = html + "</tbody>";

  const hasLessons = DAYS.some(day =>
    LESSONS.some(lesson =>
      (cls.timetable?.[day]?.[lesson] || []).length > 0
    )
  );

  $("timetableStatus").textContent = hasLessons
    ? "Rozvrh třídy " + cls.name
    : "Rozvrh této třídy zatím není doplněný. Nahraj PDF dané třídy a doplníme jej.";
}

function findSubstitution(date, classId, lesson, groupIndex) {
  return state.substitutions.find(sub =>
    sub.date === date &&
    sub.classId === classId &&
    sub.lesson === lesson &&
    (sub.groupIndex == null || sub.groupIndex === groupIndex)
  );
}

function renderDaily() {
  const classId = $("dailyClass").value;
  const date = $("dailyDate").value;
  const cls = state.classes[classId];
  const list = $("dailyList");

  if (!cls || !date) return;

  const day = weekday(date);
  $("dailyHeading").innerHTML = `
    <div class="panel">
      <strong>Třída ${escapeHTML(cls.name)}</strong>
      <span> · ${formatDate(date)}${day ? " · " + day : ""}</span>
    </div>`;

  list.innerHTML = "";

  if (!day) {
    list.innerHTML = '<div class="empty">O víkendu není v tomto rozvrhu vyučování.</div>';
    return;
  }

  const dayData = cls.timetable?.[day] || {};
  let count = 0;

  LESSONS.forEach(lesson => {
    const items = dayData[lesson] || [];
    if (!items.length) return;

    count++;
    let rows = "";

    items.forEach((item, index) => {
      const sub = findSubstitution(date, classId, lesson, index);
      const subject = sub?.subject || item.subject;
      const originalTeacher = sub?.originalTeacher || teacherName(item.teacher);

      rows += `
        <div class="daily-lesson-row">
          <div class="daily-lesson-main">
            <div class="daily-subject">${escapeHTML(fullSubject(subject))}</div>
            ${
              sub
                ? `<div class="daily-substitution-line">
                     Suplování:
                     <span class="original-crossed">${escapeHTML(originalTeacher)}</span>
                     <span class="sub-arrow">→</span>
                     <span>${escapeHTML(sub.teacher || teacherName(item.teacher))}</span>
                   </div>
                   ${sub.originalSubject ? `<div class="daily-note">Původní předmět: ${escapeHTML(fullSubject(sub.originalSubject))}</div>` : ""}
                   ${sub.note ? `<div class="daily-note">${escapeHTML(sub.note)}</div>` : ""}`
                : `<div class="daily-teacher">${escapeHTML(teacherName(item.teacher))}</div>`
            }
          </div>
          ${sub?.room ? `<div class="daily-note">Učebna: ${escapeHTML(sub.room)}</div>` : ""}
        </div>`;
    });

    list.insertAdjacentHTML("beforeend", `
      <article class="daily-card">
        <div class="daily-period">${lesson}</div>
        <div class="daily-lesson-stack">${rows}</div>
      </article>`);
  });

  if (!count) {
    list.innerHTML = '<div class="empty">Pro tento den nejsou v rozvrhu žádné hodiny.</div>';
  }
}

function renderSubstitutions() {
  const date = $("substitutionDate").value;
  const filter = $("substitutionClassFilter").value;
  const list = $("substitutionList");

  let subs = state.substitutions.filter(sub => sub.date === date);

  if (filter !== "all") {
    subs = subs.filter(sub => sub.classId === filter);
  }

  subs.sort((a,b) =>
    Number(a.classId) - Number(b.classId) ||
    LESSONS.indexOf(a.lesson) - LESSONS.indexOf(b.lesson)
  );

  if (!subs.length) {
    list.innerHTML = `<div class="empty">Pro ${formatDate(date)} není zadáno žádné suplování.</div>`;
    return;
  }

  const groups = {};
  subs.forEach(sub => {
    if (!groups[sub.classId]) groups[sub.classId] = [];
    groups[sub.classId].push(sub);
  });

  list.innerHTML = "";

  Object.keys(groups).sort((a,b) => Number(a)-Number(b)).forEach(classId => {
    const section = document.createElement("section");
    section.className = "class-substitution";

    section.innerHTML = `
      <div class="class-substitution-header">
        <span>Třída ${escapeHTML(state.classes[classId]?.name || classId)}</span>
        <span>${groups[classId].length} změn</span>
      </div>
      <div class="class-substitution-body"></div>`;

    const body = section.querySelector(".class-substitution-body");

    groups[classId].forEach(sub => {
      const card = document.createElement("article");
      card.className = "substitution-card";

      card.innerHTML = `
        <div class="sub-period">${escapeHTML(sub.lesson)}</div>
        <div class="sub-main">
          <strong>${escapeHTML(fullSubject(sub.subject || sub.originalSubject || "—"))}</strong>
          <small>
            ${escapeHTML(sub.originalTeacher || "Původní učitel neuveden")}
            → ${escapeHTML(sub.teacher || "Učitel neuveden")}
          </small>
          ${sub.originalSubject ? `<small>Původní předmět: ${escapeHTML(fullSubject(sub.originalSubject))}</small>` : ""}
          ${sub.room ? `<small>Učebna: ${escapeHTML(sub.room)}</small>` : ""}
          ${sub.note ? `<div class="sub-change">${escapeHTML(sub.note)}</div>` : ""}
        </div>
        <button class="delete-btn" type="button">Smazat</button>`;

      card.querySelector("button").addEventListener("click", () => {
        if (!confirm("Opravdu chceš toto suplování smazat?")) return;
        state.substitutions = state.substitutions.filter(item => item.id !== sub.id);
        saveState();
        renderSubstitutions();
        renderDaily();
      });

      body.appendChild(card);
    });

    list.appendChild(section);
  });
}

function setupForms() {
  $("substitutionForm").addEventListener("submit", event => {
    event.preventDefault();

    const classId = $("subClass").value;
    const lesson = $("subLesson").value;
    const date = $("subDate").value;
    const originalSubject = $("subOriginalSubject").value.trim();
    const newSubject = $("subSubject").value.trim();

    if (!date || !classId || !lesson) return;

    state.substitutions.push({
      id: "sub-" + Date.now(),
      date,
      classId,
      lesson,
      originalSubject,
      subject: newSubject || originalSubject,
      originalTeacher: $("subOriginalTeacher").value.trim(),
      teacher: $("subTeacher").value.trim(),
      room: $("subRoom").value.trim(),
      note: $("subNote").value.trim()
    });

    saveState();
    event.target.reset();
    $("subDate").value = todayString();

    renderSubstitutions();
    renderDaily();
    alert("Suplování bylo přidáno.");
  });

  $("messageForm").addEventListener("submit", event => {
    event.preventDefault();

    state.messages.unshift({
      id: "msg-" + Date.now(),
      title: $("messageTitle").value.trim(),
      text: $("messageText").value.trim(),
      date: $("messageDate").value
    });

    saveState();
    event.target.reset();
    $("messageDate").value = todayString();
    renderMessages();

    alert("Zpráva byla přidána.");
  });
}

function renderMessages() {
  const list = $("messagesList");
  const messages = [...state.messages].sort((a,b) => b.date.localeCompare(a.date));

  if (!messages.length) {
    list.innerHTML = '<div class="empty">Zatím nejsou žádné zprávy.</div>';
    return;
  }

  list.innerHTML = "";

  messages.forEach(message => {
    const card = document.createElement("article");
    card.className = "message-card";

    card.innerHTML = `
      <div class="message-heading">
        <div class="message-title">${escapeHTML(message.title)}</div>
        <div class="message-date">${formatDate(message.date)}</div>
      </div>
      <div class="message-text">${escapeHTML(message.text)}</div>
      <button class="delete-btn" type="button">Smazat zprávu</button>`;

    card.querySelector("button").addEventListener("click", () => {
      if (!confirm("Opravdu chceš tuto zprávu smazat?")) return;
      state.messages = state.messages.filter(item => item.id !== message.id);
      saveState();
      renderMessages();
    });

    list.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", init);
