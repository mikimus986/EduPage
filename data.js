const DEFAULT_DATA = {
  classes: ["7.A", "7.B", "8.A"],
  schedule: {
    "7.A": {
      "Po": [
        ["8:00","Český jazyk","Novák","101"],["8:55","Matematika","Svobodová","203"],
        ["9:50","Angličtina","Dvořák","105"],["10:55","Fyzika","Král","204"],
        ["11:50","Tělesná výchova","Černá","TĚL"]
      ],
      "Út": [
        ["8:00","Matematika","Svobodová","203"],["8:55","Dějepis","Procházka","102"],
        ["9:50","Český jazyk","Novák","101"],["10:55","Biologie","Černá","206"],
        ["11:50","Angličtina","Dvořák","105"]
      ],
      "St": [
        ["8:00","Fyzika","Král","204"],["8:55","Český jazyk","Novák","101"],
        ["9:50","Matematika","Svobodová","203"],["10:55","Angličtina","Dvořák","105"],
        ["11:50","Výtvarná výchova","Malá","107"]
      ],
      "Čt": [
        ["8:00","Angličtina","Dvořák","105"],["8:55","Matematika","Svobodová","203"],
        ["9:50","Zeměpis","Procházka","102"],["10:55","Český jazyk","Novák","101"],
        ["11:50","Tělesná výchova","Černá","TĚL"]
      ],
      "Pá": [
        ["8:00","Dějepis","Procházka","102"],["8:55","Biologie","Černá","206"],
        ["9:50","Matematika","Svobodová","203"],["10:55","Český jazyk","Novák","101"]
      ]
    },
    "7.B": {},
    "8.A": {}
  },
  substitutions: [
    {lesson:3, className:"7.A", subject:"Angličtina", change:"Zastupuje Mgr. Malá", room:"105"},
    {lesson:5, className:"8.A", subject:"Matematika", change:"Hodina odpadá", room:"203"}
  ],
  news: [
    {title:"Schůzka rodičů", body:"Schůzka rodičů se uskuteční ve čtvrtek od 17:00 v budově školy.", date:"5. 10. 2026"},
    {title:"Projektový den", body:"V pátek proběhne projektový den. Podrobnosti dostanou žáci od třídních učitelů.", date:"4. 10. 2026"},
    {title:"Knihovna", body:"Školní knihovna je od tohoto týdne otevřena také ve středu odpoledne.", date:"2. 10. 2026"}
  ],
  events: [
    {day:"8", month:"ŘÍJ", title:"Schůzka rodičů", detail:"17:00 · Aula školy"},
    {day:"9", month:"ŘÍJ", title:"Projektový den", detail:"Celý den · Škola"},
    {day:"15", month:"ŘÍJ", title:"Pedagogická rada", detail:"14:30 · Sborovna"}
  ]
};

function loadData(){
  try{
    const saved = localStorage.getItem("schoolSystemData");
    return saved ? JSON.parse(saved) : structuredClone(DEFAULT_DATA);
  }catch(e){ return structuredClone(DEFAULT_DATA); }
}
function saveData(data){ localStorage.setItem("schoolSystemData", JSON.stringify(data)); }
