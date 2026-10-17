(function () {
  const subjectNames = {
    Ov: "Občanská výchova",
    M: "Matematika",
    Aj: "Anglický jazyk",
    Př: "Přírodopis",
    D: "Dějepis",
    F: "Fyzika",
    PnP: "Příprava na přijímací zkoušky",
    Pč: "Pracovní činnosti",
    Čjl: "Český jazyk a literatura",
    ČjL: "Český jazyk a literatura",
    Hv: "Hudební výchova",
    Z: "Zeměpis",
    Tv: "Tělesná výchova",
    Vv: "Výtvarná výchova",
    Nj: "Německý jazyk",
    Sj: "Španělský jazyk",
    Inf: "Informatika",
    Vz: "Výchova ke zdraví",
    Ak: "Anglická konverzace",
    Sh: "Sportovní hry",
    Ch: "Chemie"
  };

  const teacherNames = {
    MUSM: "Mikuláš Musialek",
    MUSR: "Robert Musialek",
    LAVO: "Vojtěch Laichman",
    MUIV: "Iva Musialková",
    BALU: "Lucie Balzerová",
    SPNI: "Nina Špalková",
    BAFR: "František Bartl",
    NEZD: "Zdeněk Nečas",
    NOMA: "Martin Novotný",
    SION: "Ondřej Šídlák",
    RYHA: "Hana Rybáková"
  };

  // Pořadí parametrů: předmět, učitel, učebna.
  // Třetí parametr "" nahraď číslem nebo názvem učebny.
  function L(subject, teacher, room = "") {
    return {
      subject: subjectNames[subject] || subject,
      shortSubject: subject,
      teacher: teacherNames[teacher] || teacher,
      shortTeacher: teacher,
      room: room
    };
  }

  const days = ["Po", "Út", "St", "Čt", "Pá"];
  const periods = ["1", "2", "3", "4", "5A", "5B", "6", "7"];

  const schedules = {
    "6": {
      Po: {
        "1": L("M", "MUSM", "205"),
        "2": L("Vv", "LAVO", "205"),
        "3": L("Čjl", "SION", "205"),
        "4": [L("Pč", "BAFR", "Dílna"), L("Inf", "NOMA", "201")],
        "5A": [L("Pč", "BAFR", "Dílna"), L("Inf", "NOMA", "201")],
        "6": [L("Tv", "BALU", "TV1"), L("Tv", "NEZD", "TV2")],
        "7": [L("Tv", "BALU", "TV1"), L("Tv", "NEZD", "TV2")]
      },
      Út: {
        "1": L("M", "MUSM", "205"),
        "2": L("F", "LAVO", "205"),
        "3": L("D", "MUSR", "205"),
        "4": L("Z", "MUSM", "205"),
        "5A": L("Př", "SPNI", "205"),
        "6": L("Aj", "SPNI", "205")
      },
      St: {
        "1": L("Př", "SPNI", "205"),
        "2": L("Hv", "BAFR", "202"),
        "3": L("Ov", "LAVO", "205"),
        "4": L("F", "LAVO", "205"),
        "5A": L("Čjl", "SION", "205")
      },
      Čt: {
        "1": L("Aj", "SPNI", "205"),
        "2": L("M", "MUSM", "205"),
        "3": L("D", "MUSR", "205"),
        "4": L("Čjl", "SION", "205"),
        "5A": [L("Ak", "MUIV", "205"), L("Sh", "NEZD", "TV1")]
      },
      Pá: {
        "1": L("Aj", "SPNI", "201"),
        "2": L("Z", "MUSM", "205"),
        "3": L("M", "MUSM", "205"),
        "4": L("Čjl", "SION", "205"),
        "5B": L("Vz", "SPNI", "205")
      }
    },

    "7": {
      Po: {
        "1": L("F", "LAVO", "203"),
        "2": L("Aj", "MUSM", "203"),
        "3": L("M", "BAFR", "203"),
        "4": L("Př", "SPNI", "203"),
        "5A": L("Čjl", "SION", "203"),
        "6": L("PnP", "MUSM", "203")
      },
      Út: {
        "1": L("M", "BAFR", "203"),
        "2": L("Hv", "BAFR", "202"),
        "3": L("Čjl", "SION", "203"),
        "4": [L("Pč", "BAFR", "Dílna"), L("Inf", "LAVO", "201")],
        "5A": [L("Pč", "BAFR", "Dílna"), L("Inf", "LAVO", "201")],
        "6": L("Z", "MUSR", "203"),
        "7": [L("Nj", "MUSR", "203"), L("Sj", "MUIV", "201")]
      },
      St: {
        "1": L("D", "MUSR", "203"),
        "2": L("Aj", "MUSM", "201"),
        "3": L("M", "BAFR", "203"),
        "4": L("Čjl", "SION", "203"),
        "5A": L("F", "LAVO", "203"),
        "6": [L("Tv", "SPNI", "TV1"), L("Tv", "NEZD", "TV2")],
        "7": [L("Tv", "SPNI", "TV1"), L("Tv", "NEZD", "TV2")]
      },
      Čt: {
        "1": L("Aj", "MUSM", "203"),
        "2": L("Ov", "BAFR", "203"),
        "3": L("M", "BAFR", "203"),
        "4": L("Vv", "LAVO", "203"),
        "5A": L("Vv", "LAVO", "203"),
        "6": [L("Nj", "MUSR", "201"), L("Sj", "MUIV", "203")]
      },
      Pá: {
        "1": L("D", "MUSR", "203"),
        "2": L("M", "BAFR", "203"),
        "3": L("Čjl", "SION", "203"),
        "4": L("Př", "SPNI", "203"),
        "5A": L("Z", "MUSR", "203")
      }
    },

    "8": {
      Po: {
        "1": L("Hv", "BAFR", "202"),
        "2": L("Př", "SPNI", "202"),
        "3": L("Aj", "SPNI", "201"),
        "4": L("M", "MUSM", "202"),
        "5B": L("F", "LAVO", "202"),
        "6": L("Čjl", "SION", "202")
      },
      Út: {
        "1": L("Aj", "SPNI", "202"),
        "2": L("D", "MUSR", "203"),
        "3": L("M", "MUSM", "204"),
        "4": L("Čjl", "SION", "202"),
        "5A": L("Z", "MUSM", "202"),
        "6": [L("Nj", "MUSM", "201"), L("Sj", "MUIV", "202")],
        "7": [L("Ch", "RYHA", "204")
      },
      St: {
        "1": L("Čjl", "SION", "202"),
        "2": L("Aj", "SPNI", "205"),
        "3": L("M", "MUSM", "202"),
        "4": L("Př", "SPNI", "202"),
        "5A": L("D", "MUSR", "202"),
        "6": [L("Nj", "MUSM", "201"), L("Sj", "MUIV", "202")]
      },
      Čt: {
        "1": [L("Pč", "MUSR", "Dílna"), L("Inf", "NOMA", "201")],
        "2": [L("Pč", "MUSR", "Dílna"), L("Inf", "NOMA", "201")],
        "3": L("F", "LAVO", "202"),
        "4": L("Ov", "SPNI", "202"),
        "5B": L("M", "MUSM", "202"),
        "6": [L("Tv", "BALU", "TV1"), L("Tv", "NEZD", "TV2")],
        "7": [L("Tv", "BALU", "TV1"), L("Tv", "NEZD", "TV2")]
      },
      Pá: {
        "1": L("M", "MUSM", "202"),
        "2": L("Čjl", "SION", "202"),
        "3": L("Vv", "LAVO", "202"),
        "4": L("Vv", "LAVO", "202"),
        "5A": L("Z", "MUSM", "202"),
        "6": L("Ch", "RYHA", "204")
      }
    },

    "9": {
      Po: {
        "1": L("Ov", "MUSR", "204"),
        "2": L("M", "BAFR", "204"),
        "3": L("Aj", "MUSM", "204"),
        "4": L("Př", "BALU", "204"),
        "5A": L("D", "MUSR", "204"),
        "6": L("F", "LAVO", "204"),
        "7": [L("PnP", "MUSM", "201"), L("PnP", "BAFR", "204")]
      },
      Út: {
        "1": [L("Ch", "RYHA", "204")],
        "2": L("Čjl", "SION", "204"),
        "3": L("Hv", "BAFR", "202"),
        "4": L("Z", "MUSR", "204"),
        "5B": [L("Tv", "BALU", "TV1"), L("Tv", "NEZD", "TV2")],
        "6": [L("Tv", "BALU", "TV1"), L("Tv", "NEZD", "TV2")]
      },
      St: {
        "1": L("Vv", "LAVO", "204"),
        "2": L("Vv", "LAVO", "204"),
        "3": L("D", "MUSR", "204"),
        "4": L("M", "BAFR", "204"),
        "5A": L("Př", "SPNI", "204"),
        "6": L("Čjl", "SION", "204"),
        "7": [L("Nj", "MUSR", "204"), L("Sj", "MUIV", "201")]
      },
      Čt: {
        "1": [L("M", "BAFR", "204"), L("Čjl", "SION", "202")],
        "2": L("Čjl", "SION", "204"),
        "3": L("Aj", "MUSM", "201"),
        "4": [L("M", "BAFR", "204"), L("Inf", "NOMA", "201")],
        "5A": [L("M", "BAFR", "204"), L("Inf", "NOMA", "201")],
        "6": L("Vz", "SPNI", "204"),
        "7": L("Ch", "RYHA", "204")
      },
      Pá: {
        "1": L("M", "BAFR", "204"),
        "2": L("F", "LAVO", "204"),
        "3": L("Z", "MUSR", "204"),
        "4": L("Aj", "MUSM", "204"),
        "5A": L("Čjl", "SION", "204"),
        "6": [L("Nj", "MUSR", "204"), L("Sj", "MUIV", "201")]
      }
    }
  };

  window.schoolData = {
    classes: ["6", "7", "8", "9"],
    days,
    periods,
    subjectNames,
    teacherNames,
    schedules
  };
})();
