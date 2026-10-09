
(() => {
  "use strict";

  const data = window.schoolData;

  if (!data) {
    alert("Nepodařilo se načíst data.js. Zkontroluj názvy souborů.");
    return;
  }

  const $ = (selector) => document.querySelector(selector);

  const DAYS = data.days;
  const PERIODS = data.periods;

  const STORAGE = {
    substitutions: "school_substitutions_v1",
    messages: "school_messages_v1"
  };

  function loadList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  let substitutions = loadList(STORAGE.substitutions);
  let messages = loadList(STORAGE.messages);

  function saveSubstitutions() {
    localStorage.setItem(STORAGE.substitutions, JSON.stringify(substitutions));
  }

  function saveMessages() {
    localStorage.setItem(STORAGE.messages, JSON.stringify(messages));
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(value) {
    if (!value) return "";
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return value;

    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function dayForDate(value) {
    if (!value) return null;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const index = date.getDay();

    // Sobota a neděle nemají běžný rozvrh.
    if (index === 0 || index === 6) return null;

    return DAYS[index - 1];
  }

  function getSelectedClass() {
    return $("#classSelect").value;
  }

  function getSelectedDate() {
    return $("#dateSelect").value;
  }

  function lessonItems(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function getLesson(classId, day, period) {
    return data.schedules[classId]?.[day]?.[period] || null;
  }

  function getSubstitution(date, classId, period) {
    return substitutions.find((sub) =>
      sub.date === date &&
      String(sub.classId) === String(classId) &&
      String(sub.period) === String(period)
    );
  }

  function defaultDate() {
    const date = localDateString();
    $("#dateSelect").value = date;
    $("#subDate").value = date;
    $("#filterSubDate").value = date;
  }

  // -------------------------------
  // Navigace mezi stránkami
  // -------------------------------

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-button").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      document.querySelectorAll(".page").forEach((page) => {
        page.classList.toggle(
          "active",
          page.id === `page-${button.dataset.page}`
        );
      });

      if (button.dataset.page === "substitutions") {
        renderSubstitutions();
      }

      if (button.dataset.page === "messages") {
        renderMessages();
      }

      renderTimetable();
    });
  });

  // -------------------------------
  // Týdenní / denní rozvrh
  // -------------------------------

  $("#weeklyButton").addEventListener("click", () => {
    $("#weeklyButton").classList.add("active");
    $("#dailyButton").classList.remove("active");
    $("#weeklyView").classList.remove("hidden");
    $("#dailyView").classList.add("hidden");
    renderTimetable();
  });

  $("#dailyButton").addEventListener("click", () => {
    $("#dailyButton").classList.add("active");
    $("#weeklyButton").classList.remove("active");
    $("#dailyView").classList.remove("hidden");
    $("#weeklyView").classList.add("hidden");
    renderTimetable();
  });

  $("#classSelect").addEventListener("change", renderTimetable);
  $("#dateSelect").addEventListener("change", renderTimetable);

  function renderTimetable() {
    renderWeekly();
    renderDaily();
  }

  function renderWeekly() {
    const classId = getSelectedClass();
    const table = $("#weeklyTable");

    let html = `
      <thead>
        <tr>
          <th>Hodina</th>
          ${DAYS.map((day) => `<th>${escapeHTML(day)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
    `;

    PERIODS.forEach((period) => {
      html += `<tr><th>${escapeHTML(period)}</th>`;

      DAYS.forEach((day) => {
        const items = lessonItems(getLesson(classId, day, period));

        html += "<td>";

        items.forEach((item) => {
          html += `
            <div class="lesson-entry">
              <span class="lesson-subject">
                ${escapeHTML(item.shortSubject || item.subject)}
              </span>
              <span class="lesson-teacher">
                ${escapeHTML(item.shortTeacher || item.teacher)}
              </span>
            </div>
          `;
        });

        html += "</td>";
      });

      html += "</tr>";
    });

    html += "</tbody>";
    table.innerHTML = html;
  }

  function renderDaily() {
    const classId = getSelectedClass();
    const date = getSelectedDate();
    const day = dayForDate(date);

    $("#dailyTitle").textContent = `Denní rozvrh – ${classId}. třída`;
    $("#dailyDate").textContent = formatDate(date);

    const container = $("#dailyLessons");

    if (!date) {
      container.innerHTML =
        '<div class="empty-state">Vyber datum.</div>';
      return;
    }

    if (!day) {
      container.innerHTML =
        '<div class="empty-state">Na víkend není v tomto rozvrhu zadána výuka.</div>';
      return;
    }

    let html = "";

    PERIODS.forEach((period) => {
      const items = lessonItems(getLesson(classId, day, period));
      const sub = getSubstitution(date, classId, period);

      // Zobrazíme i hodinu, která má suplování, ale nemá běžný předmět.
      if (!items.length && !sub) return;

      html += `
        <article class="daily-lesson">
          <div class="period-number">${escapeHTML(period)}</div>
          <div class="daily-lesson-content">
      `;

      if (items.length) {
        items.forEach((item, index) => {
          const subject = sub?.subject || item.subject;
          const teacher = sub?.teacher || item.teacher;
          const room = sub?.room || "";
          const note = sub?.note || "";

          html += `
            <div class="daily-group">
              <div class="daily-subject">${escapeHTML(subject)}</div>
              <div class="daily-teacher">
                Učitel: ${escapeHTML(teacher || "Neuveden")}
              </div>
              ${
                room
                  ? `<div class="daily-room">Učebna: ${escapeHTML(room)}</div>`
                  : ""
              }
              ${
                note
                  ? `<div class="daily-note">${escapeHTML(note)}</div>`
                  : ""
              }
          `;

          if (sub) {
            const originalTeacher =
              sub.originalTeacher || item.teacher || "Neuveden";

            const originalSubject =
              sub.originalSubject || item.subject || "Neuveden";

            const subjectChanged =
              sub.subject &&
              sub.subject.trim() &&
              sub.subject.trim() !== originalSubject;

            html += `
              <div class="substitution-highlight">
                <strong>Suplování</strong>
                ${
                  subjectChanged
                    ? `Předmět:
                       <span class="old-value">${escapeHTML(originalSubject)}</span>
                       →
                       <span class="new-value">${escapeHTML(sub.subject)}</span><br>`
                    : ""
                }
                Učitel:
                <span class="old-value">${escapeHTML(originalTeacher)}</span>
                →
                <span class="new-value">${escapeHTML(sub.teacher)}</span>
              </div>
            `;
          }

          html += "</div>";
        });
      } else if (sub) {
        html += `
          <div class="daily-subject">
            ${escapeHTML(sub.subject || "Suplovaná hodina")}
          </div>
          <div class="daily-teacher">
            Učitel: ${escapeHTML(sub.teacher)}
          </div>
          <div class="substitution-highlight">
            <strong>Suplování</strong>
            Učitel:
            <span class="old-value">
              ${escapeHTML(sub.originalTeacher || "Neuveden")}
            </span>
            →
            <span class="new-value">${escapeHTML(sub.teacher)}</span>
          </div>
        `;
      }

      html += "</div></article>";
    });

    container.innerHTML = html ||
      '<div class="empty-state">Na tento den nejsou zadané žádné hodiny.</div>';
  }

  // -------------------------------
  // Formulář suplování
  // -------------------------------

  const substitutionForm = $("#substitutionForm");

  substitutionForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = $("#substitutionId").value;
    const classId = $("#subClass").value;
    const period = $("#subLesson").value;
    const date = $("#subDate").value;

    if (!date) {
      alert("Vyber datum suplování.");
      return;
    }

    const originalSubject = $("#subOriginalSubject").value.trim();
    const subject = $("#subSubject").value.trim();
    const originalTeacher = $("#subOriginalTeacher").value.trim();
    const teacher = $("#subTeacher").value.trim();

    if (!teacher) {
      alert("Vyplň jméno zastupujícího učitele.");
      return;
    }

    const existing = id
      ? substitutions.find((item) => item.id === id)
      : null;

    const entry = {
      id: id || makeId(),
      date,
      classId,
      period,
      originalSubject,
      subject,
      originalTeacher,
      teacher,
      room: $("#subRoom").value.trim(),
      note: $("#subNote").value.trim(),
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    // Jedno suplování pro jednu třídu, datum a hodinu.
    const duplicate = substitutions.find((item) =>
      item.date === date &&
      String(item.classId) === String(classId) &&
      String(item.period) === String(period) &&
      item.id !== entry.id
    );

    if (duplicate) {
      const replace = confirm(
        "Pro tuto třídu, datum a hodinu už suplování existuje. Chceš ho nahradit?"
      );

      if (!replace) return;

      substitutions = substitutions.filter(
        (item) => item.id !== duplicate.id
      );
    }

    if (id) {
      const index = substitutions.findIndex((item) => item.id === id);

      if (index !== -1) {
        substitutions[index] = entry;
      } else {
        substitutions.push(entry);
      }
    } else {
      substitutions.push(entry);
    }

    saveSubstitutions();
    resetSubstitutionForm();
    renderSubstitutions();
    renderTimetable();

    alert("Suplování bylo uloženo.");
  });

  function resetSubstitutionForm() {
    substitutionForm.reset();
    $("#substitutionId").value = "";
    $("#subFormTitle").textContent = "Přidat suplování";
    $("#saveSubButton").textContent = "Uložit suplování";
    $("#cancelSubEdit").classList.add("hidden");
    $("#subDate").value = localDateString();
  }

  $("#cancelSubEdit").addEventListener("click", resetSubstitutionForm);

  function editSubstitution(id) {
    const sub = substitutions.find((item) => item.id === id);
    if (!sub) return;

    $("#substitutionId").value = sub.id;
    $("#subDate").value = sub.date;
    $("#subClass").value = String(sub.classId);
    $("#subLesson").value = String(sub.period);
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
  }

  function deleteSubstitution(id) {
    if (!confirm("Opravdu chceš toto suplování smazat?")) return;

    substitutions = substitutions.filter((item) => item.id !== id);
    saveSubstitutions();
    renderSubstitutions();
    renderTimetable();
  }

  $("#filterSubDate").addEventListener("change", renderSubstitutions);
  $("#filterSubClass").addEventListener("change", renderSubstitutions);

  function renderSubstitutions() {
    const list = $("#substitutionList");
    const dateFilter = $("#filterSubDate").value;
    const classFilter = $("#filterSubClass").value;

    let filtered = substitutions.filter((sub) => {
      const dateMatches = !dateFilter || sub.date === dateFilter;
      const classMatches =
        classFilter === "all" ||
        String(sub.classId) === String(classFilter);

      return dateMatches && classMatches;
    });

    filtered.sort((a, b) =>
      a.date.localeCompare(b.date) ||
      String(a.classId).localeCompare(String(b.classId), "cs", {
        numeric: true
      }) ||
      PERIODS.indexOf(String(a.period)) - PERIODS.indexOf(String(b.period))
    );

    if (!filtered.length) {
      list.innerHTML =
        '<div class="empty-state">Pro zvolené filtry tu žádné suplování není.</div>';
      return;
    }

    let lastClass = null;
    let html = "";

    filtered.forEach((sub) => {
      if (String(sub.classId) !== lastClass) {
        lastClass = String(sub.classId);

        html += `
          <h3 class="substitution-class-heading">
            ${escapeHTML(lastClass)}. třída
          </h3>
        `;
      }

      html += `
        <article class="item-card">
          <div class="item-meta">
            ${escapeHTML(formatDate(sub.date))}
            · ${escapeHTML(sub.period)}. hodina
          </div>

          <h4>
            ${escapeHTML(sub.subject || sub.originalSubject || "Suplovaná hodina")}
          </h4>

          ${
            sub.originalSubject
              ? `<p>Původní předmět: ${escapeHTML(sub.originalSubject)}</p>`
              : ""
          }

          <p>
            <strong>Učitel:</strong>
            <span class="old-value">
              ${escapeHTML(sub.originalTeacher || "Neuveden")}
            </span>
            →
            <strong>${escapeHTML(sub.teacher)}</strong>
          </p>

          ${
            sub.room
              ? `<p><strong>Učebna:</strong> ${escapeHTML(sub.room)}</p>`
              : ""
          }

          ${
            sub.note
              ? `<p>${escapeHTML(sub.note)}</p>`
              : ""
          }

          <div class="item-actions">
            <button class="secondary-button"
                    data-action="edit-sub"
                    data-id="${escapeHTML(sub.id)}">
              Upravit
            </button>

            <button class="danger-button"
                    data-action="delete-sub"
                    data-id="${escapeHTML(sub.id)}">
              Smazat
            </button>
          </div>
        </article>
      `;
    });

    list.innerHTML = html;
  }

  $("#substitutionList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit-sub") {
      editSubstitution(id);
    }

    if (button.dataset.action === "delete-sub") {
      deleteSubstitution(id);
    }
  });

  // -------------------------------
  // Školní zprávy
  // -------------------------------

  $("#messageForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const title = $("#messageTitle").value.trim();
    const text = $("#messageText").value.trim();

    if (!title || !text) {
      alert("Vyplň nadpis i text zprávy.");
      return;
    }

    messages.unshift({
      id: makeId(),
      title,
      text,
      createdAt: new Date().toISOString()
    });

    saveMessages();
    $("#messageForm").reset();
    renderMessages();
  });

  function renderMessages() {
    const list = $("#messageList");

    const sorted = [...messages].sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );

    if (!sorted.length) {
      list.innerHTML =
        '<div class="empty-state">Zatím nebyly zveřejněny žádné zprávy.</div>';
      return;
    }

    list.innerHTML = sorted.map((message) => {
      const date = message.createdAt
        ? new Date(message.createdAt).toLocaleString("cs-CZ")
        : "";

      return `
        <article class="message-card">
          <div class="item-meta">${escapeHTML(date)}</div>
          <h4>${escapeHTML(message.title)}</h4>
          <p>${escapeHTML(message.text).replace(/\n/g, "<br>")}</p>

          <div class="item-actions">
            <button class="danger-button"
                    data-action="delete-message"
                    data-id="${escapeHTML(message.id)}">
              Smazat zprávu
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  $("#messageList").addEventListener("click", (event) => {
    const button = event.target.closest(
      'button[data-action="delete-message"]'
    );

    if (!button) return;

    if (!confirm("Opravdu chceš tuto zprávu smazat?")) return;

    messages = messages.filter(
      (message) => message.id !== button.dataset.id
    );

    saveMessages();
    renderMessages();
  });

  // -------------------------------
  // Inicializace
  // -------------------------------

  function initialize() {
    defaultDate();

    $("#todayLabel").textContent = new Date().toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    renderTimetable();
    renderSubstitutions();
    renderMessages();
  }

  initialize();
})();
