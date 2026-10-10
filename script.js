(() => {
"use strict";

const data = window.schoolData;
if (!data) {
alert("Chybí data.js nebo se nepodařilo načíst rozvrhy.");
return;
}

const $ = selector => document.querySelector(selector);
const DAYS = data.days;
const PERIODS = data.periods;

const STORAGE_SUBS = "school_substitutions_v2";
const STORAGE_MSGS = "school_messages_v1";

function readStorage(key) {
try {
const result = JSON.parse(localStorage.getItem(key) || "[]");
return Array.isArray(result) ? result : [];
} catch {
return [];
}
}

let substitutions = readStorage(STORAGE_SUBS);
let messages = readStorage(STORAGE_MSGS);

function saveSubs() {
localStorage.setItem(STORAGE_SUBS, JSON.stringify(substitutions));
}

function saveMessages() {
localStorage.setItem(STORAGE_MSGS, JSON.stringify(messages));
}

function esc(value) {
return String(value ?? "").replace(/[&<>"']/g, c => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
})[c]);
}

function makeId() {
return window.crypto?.randomUUID
? window.crypto.randomUUID()
: Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function today() {
const d = new Date();
return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(value) {
if (!value) return "";
const [y, m, d] = value.split("-").map(Number);
return new Date(y, m - 1, d).toLocaleDateString("cs-CZ", {
day: "numeric",
month: "long",
year: "numeric"
});
}

function dayFromDate(value) {
if (!value) return null;
const [y, m, d] = value.split("-").map(Number);
const index = new Date(y, m - 1, d).getDay();
return index >= 1 && index <= 5 ? DAYS[index - 1] : null;
}

function getItems(classId, day, period) {
const value = data.schedules[classId]?.[day]?.[period];
if (!value) return [];
return Array.isArray(value) ? value : [value];
}

function groupLabel(item, index) {
return `${index + 1}. skupina – ${item.shortSubject || item.subject}`;
}

/*

* groupIndex === null znamená celou hodinu.
* groupIndex === 0 znamená první skupinu, 1 druhou atd.
  */
  function findSub(date, classId, period, groupIndex) {
  const matches = substitutions.filter(sub =>
  sub.date === date &&
  String(sub.classId) === String(classId) &&
  String(sub.period) === String(period)
  );

```
return matches.find(sub => sub.groupIndex === groupIndex) ||
```

```
  matches.find(sub => sub.groupIndex === null || sub.groupIndex === undefined);
```

}

// NAVIGACE
document.querySelectorAll(".nav-button").forEach(button => {
button.addEventListener("click", () => {
document.querySelectorAll(".nav-button").forEach(b =>
b.classList.toggle("active", b === button)
);

```
  document.querySelectorAll(".page").forEach(page =>
    page.classList.toggle("active", page.id === `page-${button.dataset.page}`)
  );

  renderTimetable();
  renderSubstitutions();
  renderMessages();
});
```

});

$("#weeklyButton").addEventListener("click", () => setView("weekly"));
$("#dailyButton").addEventListener("click", () => setView("daily"));

function setView(view) {
const weekly = view === "weekly";
$("#weeklyButton").classList.toggle("active", weekly);
$("#dailyButton").classList.toggle("active", !weekly);
$("#weeklyView").classList.toggle("hidden", !weekly);
$("#dailyView").classList.toggle("hidden", weekly);
renderTimetable();
}

$("#classSelect").addEventListener("change", renderTimetable);
$("#dateSelect").addEventListener("change", renderTimetable);

// TÝDENNÍ ROZVRH
// Jeden předmět vyplní celé políčko.
// Více skupin se zobrazí vedle sebe.
function renderWeekly() {
const classId = $("#classSelect").value;

```
let html = `
  <thead>
    <tr>
      <th>Den</th>
      ${PERIODS.map(p => `<th>${esc(p)}</th>`).join("")}
    </tr>
  </thead>
  <tbody>
`;

DAYS.forEach(day => {
  html += `<tr><th>${esc(day)}</th>`;

  PERIODS.forEach(period => {
    const items = getItems(classId, day, period);
    html += "<td>";

    if (items.length === 1) {
      const item = items[0];

      html += `
        <div class="lesson-entry lesson-single">
          <span class="lesson-subject">${esc(item.shortSubject || item.subject)}</span>
          <span class="lesson-teacher">${esc(item.shortTeacher || item.teacher)}</span>
        </div>
      `;
    } else if (items.length > 1) {
      html += '<div class="lesson-groups">';

      items.forEach(item => {
        html += `
          <div class="lesson-entry lesson-group">
            <span class="lesson-subject">${esc(item.shortSubject || item.subject)}</span>
            <span class="lesson-teacher">${esc(item.shortTeacher || item.teacher)}</span>
          </div>
        `;
      });

      html += "</div>";
    }

    html += "</td>";
  });

  html += "</tr>";
});

html += "</tbody>";
$("#weeklyTable").innerHTML = html;
```

}

// DENNÍ ROZVRH
function renderDaily() {
const classId = $("#classSelect").value;
const date = $("#dateSelect").value;
const day = dayFromDate(date);
const container = $("#dailyLessons");

```
$("#dailyTitle").textContent = `Denní rozvrh – ${classId}. třída`;
$("#dailyDate").textContent = formatDate(date);

if (!date) {
  container.innerHTML = '<div class="empty-state">Vyber datum.</div>';
  return;
}

if (!day) {
  container.innerHTML = '<div class="empty-state">Na víkend není v tomto rozvrhu zadaná výuka.</div>';
  return;
}

let html = "";

PERIODS.forEach(period => {
  const items = getItems(classId, day, period);

  const allSub = substitutions.find(sub =>
    sub.date === date &&
    String(sub.classId) === String(classId) &&
    String(sub.period) === String(period) &&
    (sub.groupIndex === null || sub.groupIndex === undefined)
  );

  const specificSubs = substitutions.filter(sub =>
    sub.date === date &&
    String(sub.classId) === String(classId) &&
    String(sub.period) === String(period) &&
    sub.groupIndex !== null &&
    sub.groupIndex !== undefined
  );

  if (!items.length && !allSub && !specificSubs.length) return;

  html += `
    <article class="daily-lesson">
      <div class="period-number">${esc(period)}</div>
      <div class="daily-lesson-content">
  `;

  if (!items.length && allSub) {
    html += `
      <div class="daily-subject">${esc(allSub.subject || "Suplovaná hodina")}</div>
      ${allSub.teacher ? `<div class="daily-teacher">Učitel: ${esc(allSub.teacher)}</div>` : ""}
      <div class="substitution-highlight">
        <strong>Suplování celé hodiny</strong>
        ${allSub.originalSubject && allSub.subject ? `
          <span class="old-value">${esc(allSub.originalSubject)}</span>
          →
          <span class="new-value">${esc(allSub.subject)}</span><br>
        ` : ""}
        ${allSub.teacher ? `
          ${allSub.originalTeacher ? `<span class="old-value">${esc(allSub.originalTeacher)}</span> → ` : ""}
          <span class="new-value">${esc(allSub.teacher)}</span>
        ` : "Učitel se nemění."}
      </div>
    `;
  }

  items.forEach((item, index) => {
    const sub = findSub(date, classId, period, index);

    const subject = sub?.subject?.trim() || item.subject;
    const teacher = sub?.teacher?.trim() || item.teacher;
    const room = sub?.room?.trim() || "";
    const note = sub?.note?.trim() || "";

    html += `
      <div class="daily-group">
        <div class="daily-subject">${esc(subject)}</div>
        <div class="daily-teacher">Učitel: ${esc(teacher || "Neuveden")}</div>
        ${room ? `<div class="daily-room">Učebna: ${esc(room)}</div>` : ""}
        ${note ? `<div class="daily-note">${esc(note)}</div>` : ""}
    `;

    if (sub) {
      const originalTeacher = sub.originalTeacher || item.teacher || "Neuveden";
      const originalSubject = sub.originalSubject || item.subject || "Neuveden";

      const changedSubject = Boolean(
        sub.subject?.trim() &&
        sub.subject.trim() !== originalSubject
      );

      const changedTeacher = Boolean(sub.teacher?.trim());

      html += `
        <div class="substitution-highlight">
          <strong>
            Suplování${sub.groupIndex == null
              ? " celé hodiny"
              : ` – ${esc(groupLabel(item, index))}`}
          </strong>

          ${changedSubject ? `
            Předmět:
            <span class="old-value">${esc(originalSubject)}</span>
            →
            <span class="new-value">${esc(sub.subject)}</span><br>
          ` : ""}

          ${changedTeacher ? `
            Učitel:
            <span class="old-value">${esc(originalTeacher)}</span>
            →
            <span class="new-value">${esc(sub.teacher)}</span>
          ` : "Učitel se nemění."}
        </div>
      `;
    }

    html += "</div>";
  });

  html += "</div></article>";
});

container.innerHTML = html ||
  '<div class="empty-state">Na tento den nejsou zadané žádné hodiny.</div>';
```

}

function renderTimetable() {
renderWeekly();
renderDaily();
}

// VÝBĚR SKUPINY
function updateGroupOptions(preferredValue = "all") {
const classId = $("#subClass").value;
const date = $("#subDate").value;
const period = $("#subLesson").value;
const day = dayFromDate(date);
const items = day ? getItems(classId, day, period) : [];
const select = $("#subGroup");

```
select.innerHTML =
  '<option value="all">Všechny skupiny / celá hodina</option>';

if (items.length > 1) {
  items.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = groupLabel(item, index);
    select.appendChild(option);
  });

  $("#groupHelp").textContent =
    "Hodina má více skupin. Vyber, zda suplování platí pro všechny, nebo jen pro konkrétní skupinu.";
} else if (items.length === 1) {
  $("#groupHelp").textContent =
    "Hodina má jednu skupinu. Suplování se vztahuje na celou hodinu.";
} else {
  $("#groupHelp").textContent =
    "Pro toto datum nebyla nalezena běžná hodina. Suplování můžeš zadat ručně.";
}

const valid = [...select.options].some(
  option => option.value === String(preferredValue)
);

select.value = valid ? String(preferredValue) : "all";

const selectedIndex = select.value === "all"
  ? null
  : Number(select.value);

const item = selectedIndex === null ? null : items[selectedIndex];

if (!$("#substitutionId").value) {
  if (item) {
    $("#subOriginalSubject").value = item.subject || "";
    $("#subOriginalTeacher").value = item.teacher || "";
  } else if (items.length === 1) {
    $("#subOriginalSubject").value = items[0].subject || "";
    $("#subOriginalTeacher").value = items[0].teacher || "";
  } else {
    $("#subOriginalSubject").value = "";
    $("#subOriginalTeacher").value = "";
  }
}
```

}

["subDate", "subClass", "subLesson"].forEach(id => {
$("#" + id).addEventListener("change", () => {
$("#substitutionId").value = "";
updateGroupOptions();
});
});

$("#subGroup").addEventListener("change", () => {
$("#substitutionId").value = "";
updateGroupOptions($("#subGroup").value);
});

// FORMULÁŘ SUPLOVÁNÍ
$("#substitutionForm").addEventListener("submit", event => {
event.preventDefault();

```
const id = $("#substitutionId").value;
const date = $("#subDate").value;
const classId = $("#subClass").value;
const period = $("#subLesson").value;
const groupValue = $("#subGroup").value;
const groupIndex = groupValue === "all" ? null : Number(groupValue);

const teacher = $("#subTeacher").value.trim();
const subject = $("#subSubject").value.trim();
const originalSubject = $("#subOriginalSubject").value.trim();
const originalTeacher = $("#subOriginalTeacher").value.trim();

if (!date) {
  alert("Vyber datum suplování.");
  return;
}

if (!subject && !teacher && !$("#subRoom").value.trim() && !$("#subNote").value.trim()) {
  alert("Změň alespoň předmět, učitele, učebnu nebo poznámku.");
  return;
}

const entry = {
  id: id || makeId(),
  date,
  classId,
  period,
  groupIndex,
  originalSubject,
  subject,
  originalTeacher,
  // Prázdný učitel znamená, že učitel zůstává beze změny.
  teacher,
  room: $("#subRoom").value.trim(),
  note: $("#subNote").value.trim(),
  createdAt: new Date().toISOString()
};

const duplicate = substitutions.find(sub =>
  sub.date === date &&
  String(sub.classId) === String(classId) &&
  String(sub.period) === String(period) &&
  (sub.groupIndex ?? null) === groupIndex &&
  sub.id !== id
);

if (duplicate) {
  if (!confirm("Pro tuto skupinu už suplování existuje. Chceš ho nahradit?")) {
    return;
  }

  substitutions = substitutions.filter(sub => sub.id !== duplicate.id);
}

const oldIndex = substitutions.findIndex(sub => sub.id === id);

if (oldIndex >= 0) {
  substitutions[oldIndex] = entry;
} else {
  substitutions.push(entry);
}

saveSubs();
resetSubForm();
renderSubstitutions();
renderTimetable();
alert("Suplování bylo uloženo.");
```

});

function resetSubForm() {
$("#substitutionForm").reset();
$("#substitutionId").value = "";
$("#subFormTitle").textContent = "Přidat suplování";
$("#saveSubButton").textContent = "Uložit suplování";
$("#cancelSubEdit").classList.add("hidden");
$("#subDate").value = today();
updateGroupOptions();
}

$("#cancelSubEdit").addEventListener("click", resetSubForm);

function editSub(id) {
const sub = substitutions.find(item => item.id === id);
if (!sub) return;

```
$("#substitutionId").value = sub.id;
$("#subDate").value = sub.date;
$("#subClass").value = String(sub.classId);
$("#subLesson").value = String(sub.period);

updateGroupOptions(sub.groupIndex == null ? "all" : String(sub.groupIndex));

$("#subOriginalSubject").value = sub.originalSubject || "";
$("#subSubject").value = sub.subject || "";
$("#subOriginalTeacher").value = sub.originalTeacher || "";
$("#subTeacher").value = sub.teacher || "";
$("#subRoom").value = sub.room || "";
$("#subNote").value = sub.note || "";

$("#subFormTitle").textContent = "Upravit suplování";
$("#saveSubButton").textContent = "Uložit změny";
$("#cancelSubEdit").classList.remove("hidden");

window.scrollTo({ top: 0, behavior: "smooth" });
```

}

function deleteSub(id) {
if (!confirm("Opravdu chceš toto suplování smazat?")) return;

```
substitutions = substitutions.filter(sub => sub.id !== id);
saveSubs();
renderSubstitutions();
renderTimetable();
```

}

$("#filterSubDate").addEventListener("change", renderSubstitutions);
$("#filterSubClass").addEventListener("change", renderSubstitutions);

// PŘEHLED SUPLOVÁNÍ
function renderSubstitutions() {
const list = $("#substitutionList");
const dateFilter = $("#filterSubDate").value;
const classFilter = $("#filterSubClass").value;

```
const filtered = substitutions.filter(sub =>
  (!dateFilter || sub.date === dateFilter) &&
  (classFilter === "all" || String(sub.classId) === classFilter)
).sort((a, b) =>
  a.date.localeCompare(b.date) ||
  String(a.classId).localeCompare(String(b.classId), "cs", { numeric: true }) ||
  PERIODS.indexOf(String(a.period)) - PERIODS.indexOf(String(b.period))
);

if (!filtered.length) {
  list.innerHTML =
    '<div class="empty-state">Pro vybrané filtry tu žádné suplování není.</div>';
  return;
}

let lastClass = null;
let html = "";

filtered.forEach(sub => {
  if (String(sub.classId) !== lastClass) {
    lastClass = String(sub.classId);
    html += `<h3 class="substitution-class-heading">${esc(lastClass)}. třída</h3>`;
  }

  const day = dayFromDate(sub.date);
  const items = day ? getItems(sub.classId, day, sub.period) : [];
  const groupIndex = sub.groupIndex == null ? null : Number(sub.groupIndex);
  const selectedItem = groupIndex == null ? null : items[groupIndex];

  const groupText = groupIndex == null
    ? "Celá hodina / všechny skupiny"
    : selectedItem
      ? groupLabel(selectedItem, groupIndex)
      : `${groupIndex + 1}. skupina`;

  html += `
    <article class="item-card">
      <div class="item-meta">
        ${esc(formatDate(sub.date))} · ${esc(sub.period)}. hodina
      </div>

      <h4>${esc(sub.subject || sub.originalSubject || "Suplovaná hodina")}</h4>
      <p><strong>Platnost:</strong> ${esc(groupText)}</p>

      ${sub.originalSubject && sub.subject ? `
        <p>
          <strong>Předmět:</strong>
          <span class="old-value">${esc(sub.originalSubject)}</span>
          →
          <span class="new-value">${esc(sub.subject)}</span>
        </p>
      ` : ""}

      ${sub.teacher ? `
        <p>
          <strong>Učitel:</strong>
          <span class="old-value">${esc(sub.originalTeacher || "Neuveden")}</span>
          →
          <span class="new-value">${esc(sub.teacher)}</span>
        </p>
      ` : `<p><strong>Učitel:</strong> beze změny</p>`}

      ${sub.room ? `<p><strong>Učebna:</strong> ${esc(sub.room)}</p>` : ""}
      ${sub.note ? `<p>${esc(sub.note)}</p>` : ""}

      <div class="item-actions">
        <button class="secondary-button" data-action="edit-sub" data-id="${esc(sub.id)}">Upravit</button>
        <button class="danger-button" data-action="delete-sub" data-id="${esc(sub.id)}">Smazat</button>
      </div>
    </article>
  `;
});

list.innerHTML = html;
```

}

$("#substitutionList").addEventListener("click", event => {
const button = event.target.closest("button[data-action]");
if (!button) return;

```
if (button.dataset.action === "edit-sub") editSub(button.dataset.id);
if (button.dataset.action === "delete-sub") deleteSub(button.dataset.id);
```

});

// ZPRÁVY
$("#messageForm").addEventListener("submit", event => {
event.preventDefault();

```
const title = $("#messageTitle").value.trim();
const text = $("#messageText").value.trim();

if (!title || !text) return;

messages.unshift({
  id: makeId(),
  title,
  text,
  createdAt: new Date().toISOString()
});

saveMessages();
$("#messageForm").reset();
renderMessages();
```

});

function renderMessages() {
const list = $("#messageList");

```
const sorted = [...messages].sort((a, b) =>
  String(b.createdAt).localeCompare(String(a.createdAt))
);

if (!sorted.length) {
  list.innerHTML =
    '<div class="empty-state">Zatím tu nejsou žádné zprávy.</div>';
  return;
}

list.innerHTML = sorted.map(message => `
  <article class="message-card">
    <div class="item-meta">
      ${esc(message.createdAt ? new Date(message.createdAt).toLocaleString("cs-CZ") : "")}
    </div>

    <h4>${esc(message.title)}</h4>
    <p>${esc(message.text).replace(/\n/g, "<br>")}</p>

    <div class="item-actions">
      <button class="danger-button" data-action="delete-message" data-id="${esc(message.id)}">
        Smazat zprávu
      </button>
    </div>
  </article>
`).join("");
```

}

$("#messageList").addEventListener("click", event => {
const button = event.target.closest('[data-action="delete-message"]');
if (!button) return;
if (!confirm("Opravdu chceš zprávu smazat?")) return;

```
messages = messages.filter(message => message.id !== button.dataset.id);
saveMessages();
renderMessages();
```

});

// START
function initialize() {
$("#dateSelect").value = today();
$("#subDate").value = today();
$("#filterSubDate").value = today();

```
$("#todayLabel").textContent = new Date().toLocaleDateString("cs-CZ", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

updateGroupOptions();
renderTimetable();
renderSubstitutions();
renderMessages();
```

}

initialize();
})();
