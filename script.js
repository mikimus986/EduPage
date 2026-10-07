let data = loadData();

const periods = [
    "1",
    "2",
    "3",
    "4",
    "5A",
    "5B",
    "6",
    "7"
];

const days = [
    "Po",
    "Út",
    "St",
    "Čt",
    "Pá"
];

const pageTitles = {
    home: "Domů",
    schedule: "Rozvrh",
    substitutions: "Suplování",
    news: "Zprávy",
    calendar: "Kalendář",
    admin: "Administrace"
};

let selectedClass = "9. A";
let selectedView = "classic";
let dailyDate = new Date();


/* ==================================================
   START
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setToday();

    setupNavigation();
    setupSchedule();
    setupAdministration();
    setupSubstitutionFilter();
    setupMobileMenu();

    renderEverything();

});


/* ==================================================
   LOCAL STORAGE
================================================== */

function loadData() {

    try {

        const saved = localStorage.getItem("schoolSystemData");

        if (saved) {
            return JSON.parse(saved);
        }

    } catch (error) {

        console.error("Chyba při načítání dat:", error);

    }

    return structuredClone(DEFAULT_DATA);
}


function saveData() {

    localStorage.setItem(
        "schoolSystemData",
        JSON.stringify(data)
    );

}


/* ==================================================
   DATUM
================================================== */

function formatDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function setToday() {

    const today = new Date();

    const element =
        document.getElementById("todayText");

    if (!element) return;

    element.textContent =
        today.toLocaleDateString(
            "cs-CZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* ==================================================
   NAVIGACE
================================================== */

function setupNavigation() {

    document.querySelectorAll(".nav-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                showPage(button.dataset.page);

            });

        });


    document.querySelectorAll("[data-go]")
        .forEach(button => {

            button.addEventListener("click", () => {

                showPage(button.dataset.go);

            });

        });

}


function showPage(page) {

    document.querySelectorAll(".page")
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.id === page
            );

        });


    document.querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const title =
        document.getElementById("pageTitle");

    if (title && pageTitles[page]) {
        title.textContent = pageTitles[page];
    }


    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }


    if (page === "schedule") {

        renderSchedule();
        renderDaily();

    }


    if (page === "substitutions") {

        renderSubstitutions();

    }


    if (page === "news") {

        renderNews();

    }

}


/* ==================================================
   MOBILNÍ MENU
================================================== */

function setupMobileMenu() {

    const button =
        document.getElementById("mobileMenu");

    if (!button) return;


    button.addEventListener("click", () => {

        const sidebar =
            document.getElementById("sidebar");

        sidebar.classList.toggle("open");

    });

}


/* ==================================================
   ROZVRH
================================================== */

function setupSchedule() {

    const select =
        document.getElementById("classSelect");


    if (select) {

        select.addEventListener(
            "change",
            () => {

                selectedClass =
                    select.value;

                renderSchedule();
                renderDaily();
                renderHome();

            }
        );

    }


    document.querySelectorAll(".view-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedView =
                        button.dataset.view;


                    document
                        .querySelectorAll(".view-btn")
                        .forEach(btn =>
                            btn.classList.remove(
                                "active"
                            )
                        );


                    button.classList.add("active");

                    updateView();

                }
            );

        });


    const previous =
        document.getElementById(
            "previousDay"
        );

    if (previous) {

        previous.addEventListener(
            "click",
            () => {

                dailyDate.setDate(
                    dailyDate.getDate() - 1
                );

                renderDaily();

            }
        );

    }


    const next =
        document.getElementById(
            "nextDay"
        );

    if (next) {

        next.addEventListener(
            "click",
            () => {

                dailyDate.setDate(
                    dailyDate.getDate() + 1
                );

                renderDaily();

            }
        );

    }

}


/* ==================================================
   VÝBĚR TŘÍDY
================================================== */

function updateClassSelect() {

    const select =
        document.getElementById(
            "classSelect"
        );

    if (!select) return;


    select.innerHTML = "";


    data.classes.forEach(className => {

        const option =
            document.createElement("option");

        option.value = className;
        option.textContent = className;

        select.appendChild(option);

    });


    if (data.classes.includes(selectedClass)) {

        select.value = selectedClass;

    } else if (data.classes.length > 0) {

        selectedClass =
            data.classes[0];

        select.value =
            selectedClass;

    }

}


/* ==================================================
   PŘEPÍNÁNÍ KLASICKÝ / DENNÍ
================================================== */

function updateView() {

    const classic =
        document.getElementById(
            "classicView"
        );

    const daily =
        document.getElementById(
            "dailyView"
        );


    if (classic) {

        classic.classList.toggle(
            "hidden",
            selectedView !== "classic"
        );

    }


    if (daily) {

        daily.classList.toggle(
            "hidden",
            selectedView !== "daily"
        );

    }


    if (selectedView === "daily") {

        renderDaily();

    }

}


/* ==================================================
   KLASICKÝ ROZVRH
================================================== */

function renderSchedule() {

    const table =
        document.getElementById(
            "classicSchedule"
        );

    if (!table) return;


    const schedule =
        data.schedules[selectedClass];


    if (!schedule) {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty">
                        Rozvrh není k dispozici.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    let html = "";


    days.forEach(day => {

        html += `
            <tr>
                <td class="day-name">
                    ${day}
                </td>
        `;


        periods.forEach(period => {

            const lesson =
                schedule[day]?.[period];


            html +=
                renderClassicLesson(
                    lesson
                );

        });


        html += `
            </tr>
        `;

    });


    table.innerHTML = html;

}


function renderClassicLesson(lesson) {

    if (!lesson) {

        return `
            <td class="lesson-cell"></td>
        `;

    }


    /* Dvě skupiny */

    if (Array.isArray(lesson)) {

        return `
            <td class="lesson-cell">

                ${lesson.map(group => `

                    <div class="lesson-group">

                        <div class="lesson-subject">
                            ${escapeHTML(
                                group.shortSubject
                            )}
                        </div>

                        <div class="lesson-teacher">
                            ${escapeHTML(
                                group.shortTeacher
                            )}
                        </div>

                    </div>

                `).join("")}

            </td>
        `;

    }


    /* Jedna hodina */

    return `
        <td class="lesson-cell">

            <div class="lesson-single">

                <div class="lesson-subject">
                    ${escapeHTML(
                        lesson.shortSubject
                    )}
                </div>

                <div class="lesson-teacher">
                    ${escapeHTML(
                        lesson.shortTeacher
                    )}
                </div>

            </div>

        </td>
    `;

}


/* ==================================================
   DENNÍ ROZVRH
================================================== */

function renderDaily() {

    const dateText =
        document.getElementById(
            "dailyDate"
        );

    const dayText =
        document.getElementById(
            "dailyDay"
        );

    const container =
        document.getElementById(
            "dailySchedule"
        );


    if (!dateText || !dayText || !container) {
        return;
    }


    dateText.textContent =
        dailyDate.toLocaleDateString(
            "cs-CZ",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const dayIndex =
        dailyDate.getDay();


    if (
        dayIndex < 1 ||
        dayIndex > 5
    ) {

        dayText.textContent =
            "Víkend";

        container.innerHTML = `
            <div class="empty">
                Dnes není školní den.
            </div>
        `;

        return;

    }


    const day =
        days[dayIndex - 1];


    dayText.textContent =
        day;


    const schedule =
        data.schedules[selectedClass];


    if (!schedule || !schedule[day]) {

        container.innerHTML = `
            <div class="empty">
                Pro tento den není rozvrh.
            </div>
        `;

        return;

    }


    let html = "";


    periods.forEach(period => {

        const lesson =
            schedule[day][period];


        if (!lesson) {
            return;
        }


        html += `
            <div class="daily-lesson">

                <div class="daily-number">
                    ${period}. hod.
                </div>

                <div class="daily-content">
        `;


        if (Array.isArray(lesson)) {

            lesson.forEach(group => {

                html += `
                    <div class="daily-group">

                        <div class="daily-subject">
                            ${escapeHTML(
                                group.subject
                            )}
                        </div>

                        <div class="daily-teacher">
                            ${escapeHTML(
                                group.teacher
                            )}
                        </div>

                    </div>
                `;

            });

        } else {

            html += `
                <div class="daily-group">

                    <div class="daily-subject">
                        ${escapeHTML(
                            lesson.subject
                        )}
                    </div>

                    <div class="daily-teacher">
                        ${escapeHTML(
                            lesson.teacher
                        )}
                    </div>

                </div>
            `;

        }


        html += `
                </div>
            </div>
        `;

    });


    container.innerHTML =
        html ||
        `
            <div class="empty">
                Žádné hodiny.
            </div>
        `;

}


/* ==================================================
   SUPLOVÁNÍ - FILTR
================================================== */

function setupSubstitutionFilter() {

    const input =
        document.getElementById(
            "substitutionDate"
        );

    if (!input) return;


    input.value =
        formatDate(new Date());


    input.addEventListener(
        "change",
        renderSubstitutions
    );

}


/* ==================================================
   SUPLOVÁNÍ - ZOBRAZENÍ
================================================== */

function renderSubstitutions() {

    const input =
        document.getElementById(
            "substitutionDate"
        );

    const list =
        document.getElementById(
            "substitutionList"
        );


    if (!input || !list) return;


    const date =
        input.value ||
        formatDate(new Date());


    const substitutions =
        data.substitutions
            .map((item, index) => ({
                ...item,
                originalIndex: index
            }))
            .filter(
                item => item.date === date
            );


    if (substitutions.length === 0) {

        list.innerHTML = `
            <div class="empty">
                Na toto datum není žádné suplování.
            </div>
        `;

        return;

    }


    list.innerHTML =
        substitutions.map(item => `

            <div class="substitution">

                <strong>
                    ${escapeHTML(
                        item.lesson
                    )}. hod.
                </strong>

                <span>
                    ${escapeHTML(
                        item.className
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        item.subject
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        item.teacher
                    )}
                </span>

                <span class="substitution-change">
                    ${escapeHTML(
                        item.change
                    )}
                </span>

                <button
                    class="delete-btn"
                    onclick="deleteSubstitution(${item.originalIndex})"
                >
                    🗑 Smazat
                </button>

            </div>

        `).join("");

}


/* ==================================================
   SMAZÁNÍ SUPLOVÁNÍ
================================================== */

function deleteSubstitution(index) {

    if (
        index < 0 ||
        index >= data.substitutions.length
    ) {
        return;
    }


    const item =
        data.substitutions[index];


    const confirmed =
        confirm(
            `Opravdu chceš smazat suplování pro ${item.className}, ${item.lesson}. hodinu?`
        );


    if (!confirmed) {
        return;
    }


    data.substitutions.splice(
        index,
        1
    );


    saveData();

    renderEverything();

}


/* ==================================================
   ADMINISTRACE
================================================== */

function setupAdministration() {

    /* ----------------------------------------------
       NOVÁ ZPRÁVA
    ---------------------------------------------- */

    const newsForm =
        document.getElementById(
            "newsForm"
        );


    if (newsForm) {

        newsForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const title =
                    document.getElementById(
                        "newsTitle"
                    ).value.trim();


                const text =
                    document.getElementById(
                        "newsText"
                    ).value.trim();


                if (
                    !title ||
                    !text
                ) {

                    alert(
                        "Vyplň nadpis i text zprávy."
                    );

                    return;

                }


                data.news.unshift({

                    title: title,

                    text: text,

                    date:
                        new Date()
                            .toLocaleDateString(
                                "cs-CZ"
                            )

                });


                saveData();


                newsForm.reset();


                renderEverything();


                showPage("news");

            }
        );

    }


    /* ----------------------------------------------
       NOVÉ SUPLOVÁNÍ
    ---------------------------------------------- */

    const substitutionForm =
        document.getElementById(
            "substitutionForm"
        );


    if (substitutionForm) {

        substitutionForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const item = {

                    date:
                        document.getElementById(
                            "subDate"
                        ).value,

                    className:
                        document.getElementById(
                            "subClass"
                        ).value.trim(),

                    lesson:
                        document.getElementById(
                            "subLesson"
                        ).value,

                    subject:
                        document.getElementById(
                            "subSubject"
                        ).value.trim(),

                    teacher:
                        document.getElementById(
                            "subTeacher"
                        ).value.trim(),

                    change:
                        document.getElementById(
                            "subChange"
                        ).value.trim()

                };


                if (
                    !item.date ||
                    !item.className ||
                    !item.subject ||
                    !item.teacher ||
                    !item.change
                ) {

                    alert(
                        "Vyplň všechna pole suplování."
                    );

                    return;

                }


                data.substitutions.push(
                    item
                );


                saveData();


                substitutionForm.reset();


                const filter =
                    document.getElementById(
                        "substitutionDate"
                    );


                if (filter) {
                    filter.value =
                        item.date;
                }


                renderEverything();


                showPage(
                    "substitutions"
                );

            }
        );

    }

}


/* ==================================================
   ZPRÁVY
================================================== */

function renderNews() {

    const container =
        document.getElementById(
            "newsList"
        );


    if (!container) return;


    if (!data.news.length) {

        container.innerHTML = `
            <div class="empty">
                Zatím nejsou žádné zprávy.
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.news.map((item, index) => `

            <article class="news-card">

                <div class="news-card-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                item.title
                            )}
                        </h3>

                        <time>
                            ${escapeHTML(
                                item.date
                            )}
                        </time>

                    </div>


                    <button
                        class="delete-btn"
                        onclick="deleteNews(${index})"
                    >
                        🗑 Smazat
                    </button>

                </div>


                <p>
                    ${escapeHTML(
                        item.text
                    )}
                </p>

            </article>

        `).join("");

}


/* ==================================================
   SMAZÁNÍ ZPRÁVY
================================================== */

function deleteNews(index) {

    if (
        index < 0 ||
        index >= data.news.length
    ) {
        return;
    }


    const news =
        data.news[index];


    const confirmed =
        confirm(
            `Opravdu chceš smazat zprávu „${news.title}“?`
        );


    if (!confirmed) {
        return;
    }


    data.news.splice(
        index,
        1
    );


    saveData();

    renderEverything();

}


/* ==================================================
   KALENDÁŘ
================================================== */

function renderCalendar() {

    const container =
        document.getElementById(
            "calendarList"
        );


    if (!container) return;


    if (!data.calendar.length) {

        container.innerHTML = `
            <div class="empty">
                Zatím nejsou žádné události.
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.calendar.map(item => `

            <article class="calendar-item">

                <div class="calendar-date">

                    <strong>
                        ${escapeHTML(
                            item.day
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            item.month
                        )}
                    </span>

                </div>


                <div>

                    <strong>
                        ${escapeHTML(
                            item.title
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            item.text
                        )}
                    </p>

                </div>

            </article>

        `).join("");

}


/* ==================================================
   DOMŮ
================================================== */

function renderHome() {

    const lessonsElement =
        document.getElementById(
            "homeLessons"
        );

    const subsElement =
        document.getElementById(
            "homeSubs"
        );

    const newsElement =
        document.getElementById(
            "homeNews"
        );


    if (
        !lessonsElement ||
        !subsElement ||
        !newsElement
    ) {
        return;
    }


    let lessons = 0;


    const today =
        new Date();


    const dayIndex =
        today.getDay();


    if (
        dayIndex >= 1 &&
        dayIndex <= 5
    ) {

        const day =
            days[dayIndex - 1];


        const schedule =
            data.schedules[
                selectedClass
            ]?.[day];


        if (schedule) {

            lessons =
                Object.values(schedule)
                    .filter(Boolean)
                    .length;

        }

    }


    lessonsElement.textContent =
        lessons;


    const todayString =
        formatDate(today);


    subsElement.textContent =
        data.substitutions.filter(
            item =>
                item.date === todayString
        ).length;


    newsElement.textContent =
        data.news.length;


    renderHomeNews();

    renderHomeDaily();

}


/* ==================================================
   DOMŮ - ZPRÁVY
================================================== */

function renderHomeNews() {

    const container =
        document.getElementById(
            "homeNewsList"
        );


    if (!container) return;


    if (!data.news.length) {

        container.innerHTML = `
            <div class="empty">
                Zatím nejsou žádné zprávy.
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.news.slice(0, 3)
            .map(item => `

                <div class="news-card">

                    <h3>
                        ${escapeHTML(
                            item.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            item.text
                        )}
                    </p>

                    <time>
                        ${escapeHTML(
                            item.date
                        )}
                    </time>

                </div>

            `)
            .join("");

}


/* ==================================================
   DOMŮ - DNEŠNÍ ROZVRH
================================================== */

function renderHomeDaily() {

    const container =
        document.getElementById(
            "homeDailySchedule"
        );


    if (!container) return;


    const today =
        new Date();


    const dayIndex =
        today.getDay();


    if (
        dayIndex < 1 ||
        dayIndex > 5
    ) {

        container.innerHTML = `
            <div class="empty">
                Dnes není školní den.
            </div>
        `;

        return;

    }


    const day =
        days[dayIndex - 1];


    const schedule =
        data.schedules[
            selectedClass
        ]?.[day];


    if (!schedule) {

        container.innerHTML = `
            <div class="empty">
                Rozvrh není k dispozici.
            </div>
        `;

        return;

    }


    let html = "";


    periods.forEach(period => {

        const lesson =
            schedule[period];


        if (!lesson) {
            return;
        }


        if (Array.isArray(lesson)) {

            html += `
                <div class="substitution">

                    <strong>
                        ${period}.
                    </strong>

                    <span>
                        ${escapeHTML(
                            lesson[0].subject
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            lesson[0].teacher
                        )}
                    </span>

                </div>
            `;

        } else {

            html += `
                <div class="substitution">

                    <strong>
                        ${period}.
                    </strong>

                    <span>
                        ${escapeHTML(
                            lesson.subject
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            lesson.teacher
                        )}
                    </span>

                </div>
            `;

        }

    });


    container.innerHTML =
        html ||
        `
            <div class="empty">
                Žádné hodiny.
            </div>
        `;

}


/* ==================================================
   VŠE
================================================== */

function renderEverything() {

    updateClassSelect();

    renderSchedule();

    renderDaily();

    renderSubstitutions();

    renderNews();

    renderCalendar();

    renderHome();

    updateView();

}


/* ==================================================
   OCHRANA TEXTU
================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
