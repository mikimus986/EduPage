
"use strict";

/* =========================================================
   ŠKOLNÍ WEB – SCRIPT.JS
   Týdenní rozvrh, denní rozvrh, suplování a zprávy
   ========================================================= */

const SCHOOL = window.schoolData || window.data || {};

const CLASS_LIST = SCHOOL.classes || ["6", "7", "8", "9"];
const DAYS = SCHOOL.days || ["Po", "Út", "St", "Čt", "Pá"];
const PERIODS = SCHOOL.periods || ["1", "2", "3", "4", "5A", "5B", "6", "7"];
const SUBJECT_NAMES = SCHOOL.subjectNames || {};
const TEACHER_NAMES = SCHOOL.teacherNames || {};
const SCHEDULES = SCHOOL.schedules || {};

const STORAGE_KEYS = {
  substitutions: "skolniWeb_substitutions_v1",
  messages: "skolniWeb_messages_v1"
};

let selectedClass = String(CLASS_LIST[0] || "9");
let selectedDay = getTodayDay();
let selectedDate = getTodayISO();
let currentPage = "weekly";

let substitutions = loadArray(STORAGE_KEYS.substitutions);
let messages = loadArray(STORAGE_KEYS.messages);

/* =========================================================
   ZÁKLADNÍ POMOCNÉ FUNKCE
   ========================================================= */

function loadArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn("Nepodařilo se načíst uložená data:", key, error);
    return [];
  }
}

function saveArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    alert("Data se nepodařilo uložit. Zkontroluj dostupné místo v prohlížeči.");
    console.error(error);
  }
}

function saveSubstitutions() {
  saveArray(STORAGE_KEYS.substitutions, substitutions);
}

function saveMessages() {
  saveArray(STORAGE_KEYS.messages, messages);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function getTodayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDay() {
  const weekday = new Date().getDay();
  const map = {
    1: "Po",
    2: "Út",
    3: "St",
    4: "Čt",
    5: "Pá"
  };
  return map[weekday] || "Po";
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${Number(parts[2])}. ${Number(parts[1])}. ${parts[0]}`;
}

function createId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getElement(...ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) return element;
  }
  return null;
}

function setHTML(element, html) {
  if (element) element.innerHTML = html;
}

function getFullSubject(subject) {
  return SUBJECT_NAMES[subject] || subject || "Neurčený předmět";
}

function getFullTeacher(teacher) {
  return TEACHER_NAMES[teacher] || teacher || "Neurčený učitel";
}

function normalizeLesson(lesson) {
  if (!lesson) return [];
  return Array.isArray(lesson) ? lesson.filter(Boolean) : [lesson];
}

function getLesson(classId, day, period) {
  const classSchedule = SCHEDULES[String(classId)] || {};
  const daySchedule = classSchedule[day] || {};
  return normalizeLesson(daySchedule[String(period)]);
}

function getPeriodNumber(period) {
  const number = parseInt(String(period).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(number) ? 0 : number;
}

function getSubstitutionFor(date, classId, day, period, groupIndex) {
  return substitutions.find(sub => {
    if (sub.date !== date) return false;
    if (String(sub.classId) !== String(classId)) return false;
    if (sub.day && sub.day !== day) return false;
    if (String(sub.period) !== String(period)) return false;

    return sub.groupIndex == null ||
      Number(sub.groupIndex) === Number(groupIndex);
  });
}

function getSubstitutionsFor(date, classId) {
  return substitutions
    .filter(sub => {
      const sameDate = !date || sub.date === date;
      const sameClass = !classId || String(sub.classId) === String(classId);
      return sameDate && sameClass;
    })
    .sort((a, b) => {
      const classCompare = String(a.classId).localeCompare(
        String(b.classId),
        "cs",
        { numeric: true }
      );
      if (classCompare !== 0) return classCompare;

      return getPeriodNumber(a.period) - getPeriodNumber(b.period);
    });
}

function getOriginalLesson(classId, day, period, groupIndex) {
  const lesson = getLesson(classId, day, period);
  return lesson[groupIndex] || lesson[0] || null;
}

/* =========================================================
   NAVIGACE
   ========================================================= */

function showPage(page) {
  currentPage = page;

  const pageMap = {
    weekly: ["weeklyPage", "weekly", "timetablePage"],
    daily: ["dailyPage", "daily"],
    substitutions: ["substitutionsPage", "substitutions"],
    messages: ["messagesPage", "messages"]
  };

  Object.entries(pageMap).forEach(([key, ids]) => {
    const element = getElement(...ids);
    if (!element) return;

    const visible = key === page;
    element.hidden = !visible;
    element.style.display = visible ? "" : "none";
  });

  document.querySelectorAll("[data-page]").forEach(button => {
    const active = button.dataset.page === page;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });

  if (page === "weekly") renderWeeklyTimetable();
  if (page === "daily") renderDailyTimetable();
  if (page === "substitutions") renderSubstitutions();
  if (page === "messages") renderMessages();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  const navigationMap = [
    [["weeklyButton", "navWeekly"], "weekly"],
    [["dailyButton", "navDaily"], "daily"],
    [["substitutionsButton", "navSubstitutions"], "substitutions"],
    [["messagesButton", "navMessages"], "messages"]
  ];

  navigationMap.forEach(([ids, page]) => {
    const button = getElement(...ids);
    if (button) {
      button.addEventListener("click", () => showPage(page));
    }
  });
}

/* =========================================================
   VÝBĚR TŘÍDY A DNE
   ========================================================= */

function initializeClassSelectors() {
  const selectors = [
    getElement("classSelect", "weeklyClass", "dailyClass", "substitutionClass"),
    ...document.querySelectorAll("[data-class-selector]")
  ].filter(Boolean);

  selectors.forEach(select => {
    if (select.tagName !== "SELECT") return;

    if (!select.options.length) {
      select.innerHTML = CLASS_LIST.map(classId =>
        `<option value="${escapeHTML(classId)}">${escapeHTML(classId)}. třída</option>`
      ).join("");
    }

    select.value = selectedClass;

    select.addEventListener("change", () => {
      selectedClass = select.value;
      syncClassSelectors();

      renderWeeklyTimetable();
      renderDailyTimetable();
      renderSubstitutions();
    });
  });
}

function syncClassSelectors() {
  document.querySelectorAll(
    "#classSelect, #weeklyClass, #dailyClass, #substitutionClass, [data-class-selector]"
  ).forEach(select => {
    if (select.tagName === "SELECT") select.value = selectedClass;
  });
}

function initializeDaySelectors() {
  const daySelectors = [
    getElement("daySelect", "dailyDay"),
    ...document.querySelectorAll("[data-day-selector]")
  ].filter(Boolean);

  daySelectors.forEach(select => {
    if (select.tagName !== "SELECT") return;

    if (!select.options.length) {
      select.innerHTML = DAYS.map(day =>
        `<option value="${escapeHTML(day)}">${escapeHTML(day)}</option>`
      ).join("");
    }

    select.value = selectedDay;

    select.addEventListener("change", () => {
      selectedDay = select.value;
      renderDailyTimetable();
    });
  });

  const dateInput = getElement("dailyDate", "selectedDate");
  if (dateInput) {
    dateInput.value = selectedDate;

    dateInput.addEventListener("change", () => {
      selectedDate = dateInput.value || getTodayISO();

      const weekday = new Date(`${selectedDate}T12:00:00`).getDay();
      const map = {
        1: "Po",
        2: "Út",
        3: "St",
        4: "Čt",
        5: "Pá"
      };

      if (map[weekday]) selectedDay = map[weekday];

      syncDaySelectors();
      renderDailyTimetable();
    });
  }

  const substitutionDate = getElement("filterDate", "substitutionDateFilter");
  if (substitutionDate) {
    substitutionDate.value = selectedDate;
    substitutionDate.addEventListener("change", renderSubstitutions);
  }
}

function syncDaySelectors() {
  document.querySelectorAll(
    "#daySelect, #dailyDay, [data-day-selector]"
  ).forEach(select => {
    if (select.tagName === "SELECT") select.value = selectedDay;
  });
}

/* =========================================================
   TÝDENNÍ ROZVRH
   ========================================================= */

function renderWeeklyTimetable() {
  const container = getElement(
    "weeklyTimetable",
    "weeklyTable",
    "timetable",
    "timetableContainer"
  );

  if (!container) return;

  let html = `
    <div class="table-wrapper">
      <table class="weekly-timetable">
        <thead>
          <tr>
            <th>Hodina</th>
            ${DAYS.map(day => `<th>${escapeHTML(day)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
  `;

  PERIODS.forEach(period => {
    html += `<tr><th>${escapeHTML(period)}</th>`;

    DAYS.forEach(day => {
      const lessons = getLesson(selectedClass, day, period);

      if (!lessons.length) {
        html += `<td class="empty-lesson"></td>`;
        return;
      }

      const content = lessons.map(lesson => `
        <div class="weekly-lesson">
          <strong>${escapeHTML(lesson.shortSubject || lesson.subject)}</strong>
          <span>${escapeHTML(lesson.shortTeacher || lesson.teacher || "")}</span>
        </div>
      `).join("");

      html += `<td>${content}</td>`;
    });

    html += "</tr>";
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  setHTML(container, html);
}

/* =========================================================
   DENNÍ ROZVRH
   ========================================================= */

function renderDailyTimetable() {
  const container = getElement(
    "dailyTimetable",
    "dailyTable",
    "dailySchedule",
    "dailyTimetableContainer"
  );

  if (!container) return;

  const title = getElement("dailyTitle", "dailyHeading");
  if (title) {
    title.textContent =
      `${selectedClass}. třída – ${selectedDay}, ${formatDate(selectedDate)}`;
  }

  let html = `<div class="daily-timetable">`;

  PERIODS.forEach(period => {
    const lessons = getLesson(selectedClass, selectedDay, period);

    html += `
      <section class="daily-period">
        <div class="daily-period-number">${escapeHTML(period)}</div>
        <div class="daily-period-content">
    `;

    if (!lessons.length) {
      html += `<div class="daily-empty">Volná hodina</div>`;
    } else {
      lessons.forEach((lesson, groupIndex) => {
        const sub = getSubstitutionFor(
          selectedDate,
          selectedClass,
          selectedDay,
          period,
          groupIndex
        );

        const subject = sub?.subject || getFullSubject(lesson.subject);
        const teacher = sub?.teacher || lesson.teacher || "";
        const room = sub?.room || lesson.room || "";

        html += `
          <div class="daily-lesson ${sub ? "is-substituted" : ""}">
            <div class="daily-lesson-main">
              <strong>${escapeHTML(subject)}</strong>
              <span>${escapeHTML(getFullTeacher(teacher))}</span>
              ${room ? `<span class="daily-room">Učebna: ${escapeHTML(room)}</span>` : ""}
            </div>
        `;

        if (sub) {
          const originalTeacher =
            sub.originalTeacher || lesson.teacher || "";

          html += `
            <div class="substitution-highlight">
              <strong>Suplování:</strong>
              <span class="old-teacher">${escapeHTML(getFullTeacher(originalTeacher))}</span>
              <span aria-hidden="true"> → </span>
              <strong>${escapeHTML(getFullTeacher(sub.teacher || ""))}</strong>
              ${sub.note ? `<div class="substitution-note">${escapeHTML(sub.note)}</div>` : ""}
            </div>
          `;
        }

        html += `</div>`;
      });
    }

    html += `</div></section>`;
  });

  html += `</div>`;
  setHTML(container, html);
}

/* =========================================================
   FORMULÁŘ PRO PŘIDÁNÍ SUPLOVÁNÍ
   ========================================================= */

function initializeSubstitutionForm() {
  const form = getElement("substitutionForm", "addSubstitutionForm");
  if (!form) return;

  const dateInput = form.querySelector('[name="date"]');
  const classInput = form.querySelector('[name="classId"]');
  const dayInput = form.querySelector('[name="day"]');
  const periodInput = form.querySelector('[name="period"]');
  const groupInput = form.querySelector('[name="groupIndex"]');
  const subjectInput = form.querySelector('[name="subject"]');
  const originalSubjectInput = form.querySelector('[name="originalSubject"]');
  const originalTeacherInput = form.querySelector('[name="originalTeacher"]');
  const teacherInput = form.querySelector('[name="teacher"]');
  const roomInput = form.querySelector('[name="room"]');
  const noteInput = form.querySelector('[name="note"]');

  if (dateInput && !dateInput.value) dateInput.value = selectedDate;

  if (classInput && classInput.tagName === "SELECT" && !classInput.options.length) {
    classInput.innerHTML = CLASS_LIST.map(classId =>
      `<option value="${escapeHTML(classId)}">${escapeHTML(classId)}. třída</option>`
    ).join("");
  }

  if (classInput) classInput.value = selectedClass;
  if (dayInput) dayInput.value = selectedDay;

  if (dayInput && dayInput.tagName === "SELECT" && !dayInput.options.length) {
    dayInput.innerHTML = DAYS.map(day =>
      `<option value="${escapeHTML(day)}">${escapeHTML(day)}</option>`
    ).join("");
    dayInput.value = selectedDay;
  }

  if (periodInput && periodInput.tagName === "SELECT" && !periodInput.options.length) {
    periodInput.innerHTML = PERIODS.map(period =>
      `<option value="${escapeHTML(period)}">${escapeHTML(period)}</option>`
    ).join("");
  }

  function fillOriginalFields() {
    const classId = classInput?.value || selectedClass;
    const day = dayInput?.value || selectedDay;
    const period = periodInput?.value || PERIODS[0];
    const groupIndex = groupInput ? Number(groupInput.value || 0) : 0;

    const lesson = getOriginalLesson(classId, day, period, groupIndex);
    if (!lesson) return;

    if (originalSubjectInput && !originalSubjectInput.dataset.edited) {
      originalSubjectInput.value = getFullSubject(lesson.subject);
    }

    if (originalTeacherInput && !originalTeacherInput.dataset.edited) {
      originalTeacherInput.value = getFullTeacher(lesson.teacher);
    }

    if (subjectInput && !subjectInput.dataset.edited) {
      subjectInput.value = getFullSubject(lesson.subject);
    }
  }

  [classInput, dayInput, periodInput, groupInput].forEach(input => {
    input?.addEventListener("change", fillOriginalFields);
  });

  [subjectInput, originalSubjectInput, originalTeacherInput].forEach(input => {
    input?.addEventListener("input", () => {
      input.dataset.edited = "true";
    });
  });

  const resetEditedFields = () => {
    [subjectInput, originalSubjectInput, originalTeacherInput].forEach(input => {
      if (input) delete input.dataset.edited;
    });
    fillOriginalFields();
  };

  form.addEventListener("reset", () => {
    setTimeout(resetEditedFields, 0);
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    const date = dateInput?.value || selectedDate;
    const classId = classInput?.value || selectedClass;
    const day = dayInput?.value || selectedDay;
    const period = periodInput?.value || PERIODS[0];
    const groupIndex = groupInput && groupInput.value !== ""
      ? Number(groupInput.value)
      : null;

    const originalLesson = getOriginalLesson(
      classId,
      day,
      period,
      groupIndex == null ? 0 : groupIndex
    );

    const originalSubject = originalSubjectInput?.value.trim() ||
      (originalLesson ? getFullSubject(originalLesson.subject) : "");

    const originalTeacher = originalTeacherInput?.value.trim() ||
      (originalLesson ? getFullTeacher(originalLesson.teacher) : "");

    const subject = subjectInput?.value.trim() || originalSubject;
    const teacher = teacherInput?.value.trim() || originalTeacher;
    const room = roomInput?.value.trim() || "";
    const note = noteInput?.value.trim() || "";

    if (!date || !classId || !day || !period) {
      alert("Vyplň datum, třídu, den a hodinu.");
      return;
    }

    if (!subject && !teacher) {
      alert("Vyplň nový předmět nebo zastupujícího učitele.");
      return;
    }

    const substitution = {
      id: createId(),
      date,
      classId: String(classId),
      day,
      period: String(period),
      groupIndex,
      originalSubject,
      subject,
      originalTeacher,
      teacher,
      room,
      note,
      createdAt: new Date().toISOString()
    };

    substitutions.push(substitution);
    saveSubstitutions();

    selectedDate = date;
    selectedClass = String(classId);
    selectedDay = day;

    syncClassSelectors();
    syncDaySelectors();

    renderSubstitutions();
    renderDailyTimetable();

    form.reset();

    if (dateInput) dateInput.value = selectedDate;
    if (classInput) classInput.value = selectedClass;
    if (dayInput) dayInput.value = selectedDay;

    resetEditedFields();

    alert("Suplování bylo uloženo.");
  });
}

/* =========================================================
   VÝPIS SUPLOVÁNÍ
   ========================================================= */

function renderSubstitutions() {
  const container = getElement(
    "substitutionsList",
    "substitutionList",
    "substitutionsContainer"
  );

  if (!container) return;

  const dateFilter = getElement("filterDate", "substitutionDateFilter");
  const classFilter = getElement("filterClass", "substitutionClassFilter");

  const date = dateFilter ? dateFilter.value : selectedDate;
  const classId = classFilter ? classFilter.value : "";

  const filtered = getSubstitutionsFor(date, classId);

  if (!filtered.length) {
    setHTML(container, `
      <div class="empty-state">
        <strong>Žádné suplování</strong>
        <p>Pro vybrané datum a třídu zatím není zadané žádné suplování.</p>
      </div>
    `);
    return;
  }

  const grouped = {};

  filtered.forEach(sub => {
    const key = String(sub.classId);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(sub);
  });

  let html = "";

  Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, "cs", { numeric: true }))
    .forEach(classIdKey => {
      html += `
        <section class="substitution-class-group">
          <h3>${escapeHTML(classIdKey)}. třída</h3>
      `;

      grouped[classIdKey].forEach(sub => {
        html += `
          <article class="substitution-card">
            <div class="substitution-card-header">
              <strong>${escapeHTML(sub.period)}. hodina – ${escapeHTML(sub.day || "")}</strong>
              <span>${escapeHTML(formatDate(sub.date))}</span>
            </div>

            <div class="substitution-card-body">
              <div><strong>Předmět:</strong> ${escapeHTML(sub.subject || sub.originalSubject || "Beze změny")}</div>
              ${sub.originalSubject && sub.subject && sub.originalSubject !== sub.subject
                ? `<div><strong>Původní předmět:</strong> ${escapeHTML(sub.originalSubject)}</div>`
                : ""}
              <div class="substitution-teachers">
                <strong>Suplování:</strong>
                <span class="old-teacher">${escapeHTML(sub.originalTeacher || "Neuvedeno")}</span>
                <span aria-hidden="true"> → </span>
                <strong>${escapeHTML(sub.teacher || "Neuvedeno")}</strong>
              </div>
              ${sub.room ? `<div><strong>Učebna:</strong> ${escapeHTML(sub.room)}</div>` : ""}
              ${sub.note ? `<p>${escapeHTML(sub.note)}</p>` : ""}
            </div>

            <button type="button" class="delete-substitution" data-delete-substitution="${escapeHTML(sub.id)}">
              Smazat suplování
            </button>
          </article>
        `;
      });

      html += `</section>`;
    });

  setHTML(container, html);

  container.querySelectorAll("[data-delete-substitution]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteSubstitution;
      if (!confirm("Opravdu chceš toto suplování smazat?")) return;

      substitutions = substitutions.filter(sub => String(sub.id) !== String(id));
      saveSubstitutions();
      renderSubstitutions();
      renderDailyTimetable();
    });
  });
}

function initializeSubstitutionFilters() {
  const dateFilter = getElement("filterDate", "substitutionDateFilter");
  const classFilter = getElement("filterClass", "substitutionClassFilter");

  if (dateFilter && !dateFilter.value) dateFilter.value = selectedDate;

  if (classFilter && classFilter.tagName === "SELECT" && !classFilter.options.length) {
    classFilter.innerHTML = `
      <option value="">Všechny třídy</option>
      ${CLASS_LIST.map(classId =>
        `<option value="${escapeHTML(classId)}">${escapeHTML(classId)}. třída</option>`
      ).join("")}
    `;
  }

  dateFilter?.addEventListener("change", renderSubstitutions);
  classFilter?.addEventListener("change", renderSubstitutions);
}

/* =========================================================
   ZPRÁVY
   ========================================================= */

function initializeMessageForm() {
  const form = getElement("messageForm", "addMessageForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const titleInput = form.querySelector('[name="title"]');
    const textInput = form.querySelector('[name="message"]') ||
      form.querySelector('[name="text"]');
    const dateInput = form.querySelector('[name="date"]');

    const title = titleInput?.value.trim() || "";
    const text = textInput?.value.trim() || "";
    const date = dateInput?.value || getTodayISO();

    if (!title || !text) {
      alert("Vyplň nadpis i text zprávy.");
      return;
    }

    messages.unshift({
      id: createId(),
      title,
      text,
      date,
      createdAt: new Date().toISOString()
    });

    saveMessages();
    renderMessages();
    form.reset();

    if (dateInput) dateInput.value = getTodayISO();

    alert("Zpráva byla zveřejněna.");
  });
}

function renderMessages() {
  const container = getElement(
    "messagesList",
    "messageList",
    "messagesContainer"
  );

  if (!container) return;

  if (!messages.length) {
    setHTML(container, `
      <div class="empty-state">
        <strong>Zatím žádné zprávy</strong>
        <p>Nové zprávy se objeví zde.</p>
      </div>
    `);
    return;
  }

  const sortedMessages = [...messages].sort((a, b) =>
    String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
  );

  setHTML(container, sortedMessages.map(message => `
    <article class="message-card">
      <div class="message-card-header">
        <h3>${escapeHTML(message.title)}</h3>
        <time>${escapeHTML(formatDate(message.date))}</time>
      </div>

      <p>${escapeHTML(message.text).replace(/\n/g, "<br>")}</p>

      <button
        type="button"
        class="delete-message"
        data-delete-message="${escapeHTML(message.id)}"
      >
        Smazat zprávu
      </button>
    </article>
  `).join(""));

  container.querySelectorAll("[data-delete-message]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteMessage;

      if (!confirm("Opravdu chceš tuto zprávu smazat?")) return;

      messages = messages.filter(message => String(message.id) !== String(id));
      saveMessages();
      renderMessages();
    });
  });
}

/* =========================================================
   TLAČÍTKA PRO AKTUALIZACI
   ========================================================= */

function initializeRefreshButtons() {
  getElement("refreshWeekly", "refreshTimetable")?.addEventListener(
    "click",
    renderWeeklyTimetable
  );

  getElement("refreshDaily", "refreshDailyTimetable")?.addEventListener(
    "click",
    renderDailyTimetable
  );

  getElement("refreshSubstitutions")?.addEventListener(
    "click",
    renderSubstitutions
  );

  getElement("refreshMessages")?.addEventListener(
    "click",
    renderMessages
  );
}

/* =========================================================
   STYLY PRO PRVKY GENEROVANÉ TÍMTO SKRIPTEM
   ========================================================= */

function addGeneratedStyles() {
  if (document.getElementById("generatedSchoolStyles")) return;

  const style = document.createElement("style");
  style.id = "generatedSchoolStyles";

  style.textContent = `
    [hidden] {
      display: none !important;
    }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .weekly-timetable {
      width: 100%;
      min-width: 650px;
      border-collapse: collapse;
      background: white;
    }

    .weekly-timetable th,
    .weekly-timetable td {
      border: 1px solid #d8dee8;
      padding: 8px;
      text-align: center;
      vertical-align: middle;
    }

    .weekly-timetable thead th {
      background: #173b70;
      color: white;
    }

    .weekly-timetable tbody th {
      background: #edf2f8;
      white-space: nowrap;
    }

    .weekly-lesson {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin: 2px 0;
      padding: 5px;
      border-radius: 5px;
      background: #f2f6fc;
      font-size: 13px;
    }

    .weekly-lesson strong {
      color: #173b70;
    }

    .weekly-lesson span {
      color: #566274;
      font-size: 11px;
    }

    .empty-lesson,
    .daily-empty {
      color: #9aa3b1;
    }

    .daily-timetable {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .daily-period {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
      overflow: hidden;
      border: 1px solid #d8dee8;
      border-radius: 9px;
      background: white;
    }

    .daily-period-number {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 6px;
      background: #173b70;
      color: white;
      font-size: 18px;
      font-weight: bold;
    }

    .daily-period-content {
      min-width: 0;
    }

    .daily-lesson {
      padding: 12px;
      border-bottom: 1px solid #e7ebf1;
    }

    .daily-lesson:last-child {
      border-bottom: 0;
    }

    .daily-lesson-main {
      display: flex;
      flex-wrap: wrap;
      gap: 5px 12px;
      align-items: baseline;
    }

    .daily-lesson-main strong {
      color: #173b70;
      font-size: 16px;
    }

    .daily-lesson-main span {
      color: #414b5b;
    }

    .daily-room {
      font-size: 13px;
      color: #687386 !important;
    }

    .substitution-highlight {
      margin-top: 9px;
      padding: 9px 11px;
      border-left: 4px solid #e0a100;
      border-radius: 4px;
      background: #fff2bf;
      color: #473600;
      line-height: 1.5;
    }

    .old-teacher {
      text-decoration: line-through;
      color: #8a4a4a;
    }

    .substitution-note {
      margin-top: 5px;
      font-size: 13px;
    }

    .substitution-class-group {
      margin: 18px 0;
    }

    .substitution-card,
    .message-card {
      margin: 10px 0;
      padding: 15px;
      border: 1px solid #d8dee8;
      border-radius: 10px;
      background: white;
      overflow-wrap: anywhere;
    }

    .substitution-card-header,
    .message-card-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
    }

    .substitution-card-body > div {
      margin: 6px 0;
    }

    .substitution-teachers {
      padding: 8px;
      background: #fff2bf;
      border-radius: 5px;
    }

    .delete-substitution,
    .delete-message {
      margin-top: 12px;
      padding: 9px 12px;
      border: 0;
      border-radius: 6px;
      background: #b42332;
      color: white;
      cursor: pointer;
    }

    .empty-state {
      padding: 24px;
      border: 1px dashed #c6cfdd;
      border-radius: 10px;
      text-align: center;
      color: #657185;
    }

    .message-card-header h3 {
      margin: 0;
    }

    .message-card p {
      white-space: normal;
      line-height: 1.6;
    }

    @media (max-width: 600px) {
      .daily-period {
        grid-template-columns: 48px minmax(0, 1fr);
      }

      .daily-lesson {
        padding: 10px;
      }

      .daily-lesson-main {
        flex-direction: column;
        gap: 4px;
      }

      .substitution-card,
      .message-card {
        padding: 12px;
      }
    }
  `;

  document.head.appendChild(style);
}

/* =========================================================
   INICIALIZACE
   ========================================================= */

function initializeSchoolWebsite() {
  addGeneratedStyles();

  initializeNavigation();
  initializeClassSelectors();
  initializeDaySelectors();
  initializeSubstitutionFilters();

  initializeSubstitutionForm();
  initializeMessageForm();
  initializeRefreshButtons();

  syncClassSelectors();
  syncDaySelectors();

  renderWeeklyTimetable();
  renderDailyTimetable();
  renderSubstitutions();
  renderMessages();

  const todayLabel = getElement("todayDate", "currentDate");
  if (todayLabel) todayLabel.textContent = formatDate(getTodayISO());

  const initialPage = document.querySelector("[data-page].active");
  if (initialPage?.dataset.page) {
    showPage(initialPage.dataset.page);
  } else {
    showPage("weekly");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSchoolWebsite);
} else {
  initializeSchoolWebsite();
}
