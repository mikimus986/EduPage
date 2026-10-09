
(() => {
  "use strict";

  const data = window.schoolData;

  if (!data || !data.schedules) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:16px;color:#b91c1c">Chyba: Nepodařilo se načíst data.js. Zkontroluj pořadí souborů v index.html.</p>'
    );
    return;
  }

  const $ = (selector) => document.querySelector(selector);

  const STORAGE = {
    substitutions: "skolniSystem_substitutions_v1",
    messages: "skolniSystem_messages_v1"
  };

  const weekdays = [
    { key: "Po", name: "Pondělí" },
    { key: "Út", name: "Úterý" },
    { key: "St", name: "Středa" },
    { key: "Čt", name: "Čtvrtek" },
    { key: "Pá", name: "Pátek" }
  ];

  const periods = ["1", "2", "3", "4", "5A", "5B", "6", "7"];

  function loadArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  let substitutions = loadArray(STORAGE.substitutions);
  let messages = loadArray(STORAGE.messages);

  function saveSubstitutions() {
    localStorage.setItem(STORAGE.substitutions, JSON.stringify(substitutions));
  }

  function saveMessages() {
    localStorage.setItem(STORAGE.messages, JSON.stringify(messages));
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function todayISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "";

    const parts = dateString.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return dateString;

    return new Date(parts[0], parts[1] - 1, parts[2])
      .toLocaleDateString("cs-CZ");
  }

  function weekdayKey(dateString) {
    if (!dateString) return null;

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayNumber = date.getDay();

    if (dayNumber === 0 || dayNumber === 6) return null;

    return weekdays[dayNumber - 1].key;
  }

  function getLesson(classId, day, period) {
    return data.schedules?.[String(classId)]?.[day]?.[String(period)] ?? null;
  }

  function lessonItems(lesson) {
    if (!lesson) return [];
    return Array.isArray(lesson) ? lesson : [lesson];
  }

  function shortSubject(item) {
    return item?.shortSubject ||
      Object.keys(data.subjectNames || {}).find(
        key => data.subjectNames[key] === item?.subject
      ) ||
      item?.subject ||
      "";
  }

  function fullSubject(item) {
    const subject = item?.subject || "";
    return data.subjectNames?.[subject] || subject;
  }

  function fullTeacher(item) {
    const teacher = item?.teacher || "";
    return data.teacherNames?.[teacher] || teacher;
  }

  function getSubstitutions(date, classId, period) {
    return substitutions.filter(sub =>
      sub.date === date &&
      String(sub.classId) === String(classId) &&
      String(sub.lesson) === String(period)
    );
  }

  function getSubstitutionForItem(date, classId, period, itemIndex) {
    const matching = getSubstitutions(date, classId, period);

    return matching.find(sub =>
      sub.groupIndex === itemIndex
    ) || matching.find(sub =>
      sub.groupIndex == null
    ) || null;
  }

  function showPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
      page.classList.toggle("active", page.id === `page-${pageName}`);
    });

    document.querySelectorAll(".nav-button").forEach(button => {
      button.classList.toggle("active", button.dataset.page === pageName);
    });

    if (pageName === "weekly") renderWeekly();
    if (pageName === "daily") renderDaily();
    if (pageName === "substitutions") renderSubstitutions();
    if (pageName === "messages") renderMessages();
  }

  // Navigace mezi stránkami
  document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  // Hodiny a datum v záhlaví
  function updateClock() {
    const now = new Date();

    $("#currentDate").textContent = now.toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    $("#currentTime").textContent = now.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  updateClock();
  setInterval(updateClock, 1000);

  // TÝDENNÍ ROZVRH
  function renderWeekly() {
    const classId = $("#weeklyClass").value;
    const body = $("#weeklyBody");

    body.innerHTML = periods.map(period => {
      const cells = weekdays.map(day => {
        const items = lessonItems(getLesson(classId, day.key, period));

        const content = items.length
          ? items.map(item => `
              <div class="lesson-cell">
                <strong>${escapeHTML(shortSubject(item))}</strong>
                <span>${escapeHTML(item.shortTeacher || "")}</span>
              </div>
            `).join("")
          : '<span class="empty-cell">—</span>';

        return `<td>${content}</td>`;
      }).join("");

      return `
        <tr>
          <th scope="row">${escapeHTML(period)}</th>
          ${cells}
        </tr>
      `;
    }).join("");
  }

  $("#weeklyClass").addEventListener("change", renderWeekly);

  // DENNÍ ROZVRH
  function renderDaily() {
    const date = $("#dailyDate").value || todayISO();
    const classId = $("#dailyClass").value;
    const day = weekdayKey(date);
    const container = $("#dailyContent");

    if (!day) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>V tento den není běžné vyučování</h3>
          <p>Vyber pracovní den od pondělí do pátku.</p>
        </div>
      `;
      return;
    }

    const cards = periods.map(period => {
      const items = lessonItems(getLesson(classId, day, period));
      const substitutionsForLesson = getSubstitutions(date, classId, period);

      if (!items.length && !substitutionsForLesson.length) {
        return "";
      }

      let content = items.map((item, index) => {
        const sub = getSubstitutionForItem(date, classId, period, index);

        const originalSubject = sub?.originalSubject || fullSubject(item);
        const displayedSubject = sub?.subject || fullSubject(item);
        const originalTeacher = sub?.originalTeacher || fullTeacher(item);
        const displayedTeacher = sub?.teacher || fullTeacher(item);

        const room = sub?.room
          ? `<div class="lesson-room">Učebna: ${escapeHTML(sub.room)}</div>`
          : "";

        const note = sub?.note
          ? `<div class="lesson-note">${escapeHTML(sub.note)}</div>`
          : "";

        if (sub) {
          return `
            <div class="daily-lesson substituted-lesson">
              <div class="daily-subject">${escapeHTML(displayedSubject)}</div>
              <div class="substitution-highlight">
                <strong>Suplování:</strong>
                <span class="original-teacher">${escapeHTML(originalTeacher)}</span>
                <span class="substitution-arrow">→</span>
                <strong>${escapeHTML(displayedTeacher)}</strong>
              </div>
              ${originalSubject !== displayedSubject
                ? `<div class="original-subject">Původní předmět: ${escapeHTML(originalSubject)}</div>`
                : ""}
              ${room}
              ${note}
            </div>
          `;
        }

        return `
          <div class="daily-lesson">
            <div class="daily-subject">${escapeHTML(displayedSubject)}</div>
            <div class="daily-teacher">${escapeHTML(displayedTeacher)}</div>
            ${room}
          </div>
        `;
      }).join("");

      // Umožní zobrazit suplování i tehdy, když původní hodina v rozvrhu chybí.
      const unassignedSubs = substitutionsForLesson.filter(sub =>
        sub.groupIndex != null && sub.groupIndex >= items.length
      );

      content += unassignedSubs.map(sub => `
        <div class="daily-lesson substituted-lesson">
          <div class="daily-subject">
            ${escapeHTML(sub.subject || sub.originalSubject || "Změna vyučování")}
          </div>
          <div class="substitution-highlight">
            <strong>Suplování:</strong>
            <span class="original-teacher">${escapeHTML(sub.originalTeacher || "Neuvedený učitel")}</span>
            <span class="substitution-arrow">→</span>
            <strong>${escapeHTML(sub.teacher)}</strong>
          </div>
          ${sub.room ? `<div class="lesson-room">Učebna: ${escapeHTML(sub.room)}</div>` : ""}
          ${sub.note ? `<div class="lesson-note">${escapeHTML(sub.note)}</div>` : ""}
        </div>
      `).join("");

      if (!content) return "";

      return `
        <article class="daily-card">
          <div class="period-number">${escapeHTML(period)}</div>
          <div class="period-content">${content}</div>
        </article>
      `;
    }).join("");

    container.innerHTML = cards || `
      <div class="empty-state">
        <h3>Žádné hodiny</h3>
        <p>Pro vybranou třídu a den není v rozvrhu žádná hodina.</p>
      </div>
    `;

    const heading = document.createElement("p");
    heading.className = "daily-date-heading";
    heading.textContent = `${formatDate(date)} · ${classId}. třída`;
    container.prepend(heading);
  }

  $("#dailyDate").value = todayISO();
  $("#dailyClass").value = $("#weeklyClass").value;

  $("#dailyDate").addEventListener("change", renderDaily);
  $("#dailyClass").addEventListener("change", renderDaily);

  // SUPLOVÁNÍ: formulář
  const substitutionForm = $("#substitutionForm");

  $("#showSubForm").addEventListener("click", () => {
    substitutionForm.classList.remove("hidden");
    $("#subDate").value = $("#subFilterDate").value || todayISO();
    $("#subClass").value = $("#subFilterClass").value || $("#dailyClass").value;
    $("#subLesson").value = "1";
    substitutionForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#cancelSubForm").addEventListener("click", () => {
    substitutionForm.reset();
    substitutionForm.classList.add("hidden");
  });

  substitutionForm.addEventListener("submit", event => {
    event.preventDefault();

    const date = $("#subDate").value;
    const classId = $("#subClass").value;
    const lesson = $("#subLesson").value;

    const existingItems = lessonItems(
      getLesson(classId, weekdayKey(date), lesson)
    );

    const originalSubjectInput = $("#subOriginalSubject").value.trim();
    const subjectInput = $("#subSubject").value.trim();
    const originalTeacherInput = $("#subOriginalTeacher").value.trim();
    const teacherInput = $("#subTeacher").value.trim();

    const originalItem = existingItems[0] || null;

    const substitution = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date,
      classId,
      lesson,
      originalSubject: originalSubjectInput ||
        (originalItem ? fullSubject(originalItem) : ""),
      subject: subjectInput || originalSubjectInput ||
        (originalItem ? fullSubject(originalItem) : ""),
      originalTeacher: originalTeacherInput ||
        (originalItem ? fullTeacher(originalItem) : ""),
      teacher: teacherInput,
      room: $("#subRoom").value.trim(),
      note: $("#subNote").value.trim(),
      createdAt: new Date().toISOString()
    };

    if (!date || !teacherInput) {
      alert("Vyplň datum a jméno zastupujícího učitele.");
      return;
    }

    substitutions.push(substitution);
    saveSubstitutions();

    substitutionForm.reset();
    substitutionForm.classList.add("hidden");

    $("#subFilterDate").value = date;
    $("#subFilterClass").value = classId;

    renderSubstitutions();
    renderDaily();
  });

  // SUPLOVÁNÍ: seznam a filtry
  function renderSubstitutions() {
    const container = $("#substitutionList");
    const filterDate = $("#subFilterDate").value;
    const filterClass = $("#subFilterClass").value;

    const filtered = substitutions
      .filter(sub => !filterDate || sub.date === filterDate)
      .filter(sub => !filterClass || String(sub.classId) === filterClass)
      .sort((a, b) =>
        a.date.localeCompare(b.date) ||
        String(a.classId).localeCompare(String(b.classId), "cs", { numeric: true }) ||
        periods.indexOf(String(a.lesson)) - periods.indexOf(String(b.lesson))
      );

    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Žádné suplování</h3>
          <p>Pro zvolené filtry nebyly nalezeny žádné záznamy.</p>
        </div>
      `;
      return;
    }

    const groups = new Map();

    filtered.forEach(sub => {
      const key = `${sub.date}|${sub.classId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(sub);
    });

    container.innerHTML = [...groups.entries()].map(([key, items]) => {
      const [date, classId] = key.split("|");

      const cards = items.map(sub => `
        <article class="substitution-card">
          <div class="substitution-card-top">
            <strong>${escapeHTML(sub.lesson)}. hodina</strong>
            <button class="delete-button"
                    type="button"
                    data-delete-sub="${escapeHTML(sub.id)}"
                    aria-label="Smazat suplování">Smazat</button>
          </div>

          <h4>${escapeHTML(sub.subject || sub.originalSubject || "Změna vyučování")}</h4>

          <div class="substitution-highlight">
            <strong>Suplování:</strong>
            <span class="original-teacher">${escapeHTML(sub.originalTeacher || "Neuvedený učitel")}</span>
            <span class="substitution-arrow">→</span>
            <strong>${escapeHTML(sub.teacher)}</strong>
          </div>

          ${sub.originalSubject && sub.subject &&
            sub.originalSubject !== sub.subject
            ? `<p>Původní předmět: ${escapeHTML(sub.originalSubject)}</p>`
            : ""}

          ${sub.room ? `<p><strong>Učebna:</strong> ${escapeHTML(sub.room)}</p>` : ""}
          ${sub.note ? `<p>${escapeHTML(sub.note)}</p>` : ""}
        </article>
      `).join("");

      return `
        <section class="substitution-group">
          <h3>${escapeHTML(classId)}. třída · ${escapeHTML(formatDate(date))}</h3>
          <div class="card-list">${cards}</div>
        </section>
      `;
    }).join("");
  }

  $("#subFilterDate").addEventListener("change", renderSubstitutions);
  $("#subFilterClass").addEventListener("change", renderSubstitutions);

  $("#clearSubFilters").addEventListener("click", () => {
    $("#subFilterDate").value = "";
    $("#subFilterClass").value = "";
    renderSubstitutions();
  });

  $("#substitutionList").addEventListener("click", event => {
    const button = event.target.closest("[data-delete-sub]");
    if (!button) return;

    const id = button.dataset.deleteSub;

    if (!confirm("Opravdu chceš toto suplování smazat?")) return;

    substitutions = substitutions.filter(sub => String(sub.id) !== String(id));
    saveSubstitutions();
    renderSubstitutions();
    renderDaily();
  });

  // ZPRÁVY
  const messageForm = $("#messageForm");

  $("#showMessageForm").addEventListener("click", () => {
    messageForm.classList.remove("hidden");
    messageForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#cancelMessageForm").addEventListener("click", () => {
    messageForm.reset();
    messageForm.classList.add("hidden");
  });

  messageForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = $("#messageTitle").value.trim();
    const text = $("#messageText").value.trim();

    if (!title || !text) {
      alert("Vyplň nadpis a text zprávy.");
      return;
    }

    messages.unshift({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      text,
      createdAt: new Date().toISOString()
    });

    saveMessages();
    messageForm.reset();
    messageForm.classList.add("hidden");
    renderMessages();
  });

  function renderMessages() {
    const container = $("#messageList");

    const sorted = [...messages].sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
    );

    if (!sorted.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Zatím žádné zprávy</h3>
          <p>Nová oznámení se zobrazí zde.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = sorted.map(message => `
      <article class="message-card">
        <div class="message-card-top">
          <div>
            <h3>${escapeHTML(message.title)}</h3>
            <time>${escapeHTML(
              message.createdAt
                ? new Date(message.createdAt).toLocaleString("cs-CZ", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })
                : ""
            )}</time>
          </div>

          <button class="delete-button"
                  type="button"
                  data-delete-message="${escapeHTML(message.id)}">
            Smazat
          </button>
        </div>

        <p class="message-body">${escapeHTML(message.text)}</p>
      </article>
    `).join("");
  }

  $("#messageList").addEventListener("click", event => {
    const button = event.target.closest("[data-delete-message]");
    if (!button) return;

    const id = button.dataset.deleteMessage;

    if (!confirm("Opravdu chceš tuto zprávu smazat?")) return;

    messages = messages.filter(message => String(message.id) !== String(id));
    saveMessages();
    renderMessages();
  });

  // Inicializace
  renderWeekly();
  renderDaily();
  renderSubstitutions();
  renderMessages();
})();
