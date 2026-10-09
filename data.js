
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
    Sh: "Sportovní hry"
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
    SION: "Ondřej Šídlák"
  };

  function L(subject, teacher) {
    return {
      subject: subjectNames[subject] || subject,
      shortSubject: subject,
      teacher: teacherNames[teacher] || teacher,
      shortTeacher: teacher
    };
  }

  const periods = ["1", "2", "3", "4", "5A", "5B", "6", "7"];
  const days = ["Po", "Út", "St", "Čt", "Pá"];

  const schedules = {
    "6": {
      Po: {
        "1": L("M", "MUSM"),
        "2": L("Vv", "LAVO"),
        "3": L("Čjl", "SION"),
        "4": [L("Pč", "BAFR"), L("Inf", "NOMA")],
        "5A": [L("Pč", "BAFR"), L("Inf", "NOMA")],
        "6": [L("Tv", "BALU"), L("Tv", "NEZD")],
        "7": [L("Tv", "BALU"), L("Tv", "NEZD")]
      },
      Út: {
        "1": L("M", "MUSM"),
        "2": L("F", "LAVO"),
        "3": L("D", "MUSR"),
        "4": L("Z", "MUSM"),
        "5A": L("Př", "SPNI"),
        "6": L("Aj", "SPNI")
      },
      St: {
        "1": L("Př", "SPNI"),
        "2": L("Hv", "BAFR"),
        "3": L("Ov", "LAVO"),
        "4": L("F", "LAVO"),
        "5A": L("Čjl", "SION")
      },
      Čt: {
        "1": L("Aj", "SPNI"),
        "2": L("M", "MUSM"),
        "3": L("D", "MUSR"),
        "4": L("Čjl", "SION"),
        "5A": [L("Ak", "MUIV"), L("Sh", "NEZD")]
      },
      Pá: {
        "1": L("Aj", "SPNI"),
        "2": L("Z", "MUSM"),
        "3": L("M", "MUSM"),
        "4": L("Čjl", "SION"),
        "5B": L("Vz", "SPNI")
      }
    },

    "7": {
      Po: {
        "1": L("F", "LAVO"),
        "2": L("Aj", "MUSM"),
        "3": L("M", "BAFR"),
        "4": L("Př", "SPNI"),
        "5A": L("Čjl", "SION"),
        "6": L("PnP", "MUSM")
      },
      Út: {
        "1": L("M", "BAFR"),
        "2": L("Hv", "BAFR"),
        "3": L("Čjl", "SION"),
        "4": [L("Pč", "BAFR"), L("Inf", "LAVO")],
        "5A": [L("Pč", "BAFR"), L("Inf", "LAVO")],
        "6": L("Z", "MUSR"),
        "7": [L("Nj", "MUSR"), L("Sj", "MUIV")]
      },
      St: {
        "1": L("D", "MUSR"),
        "2": L("Aj", "MUSM"),
        "3": L("M", "BAFR"),
        "4": L("Čjl", "SION"),
        "5A": L("F", "LAVO"),
        "6": [L("Tv", "SPNI"), L("Tv", "NEZD")],
        "7": [L("Tv", "SPNI"), L("Tv", "NEZD")]
      },
      Čt: {
        "1": L("Aj", "MUSM"),
        "2": L("Ov", "BAFR"),
        "3": L("M", "BAFR"),
        "4": L("Vv", "LAVO"),
        "5A": L("Vv", "LAVO"),
        "6": [L("Nj", "MUSR"), L("Sj", "MUIV")]
      },
      Pá: {
        "1": L("D", "MUSR"),
        "2": L("M", "BAFR"),
        "3": L("Čjl", "SION"),
        "4": L("Př", "SPNI"),
        "5A": L("Z", "MUSR")
      }
    },

    "8": {
      Po: {
        "1": L("Hv", "BAFR"),
        "2": L("Př", "SPNI"),
        "3": L("Aj", "SPNI"),
        "4": L("M", "MUSM"),
        "5B": L("F", "LAVO"),
        "6": L("Čjl", "SION")
      },
      Út: {
        "1": L("Aj", "SPNI"),
        "2": L("D", "MUSR"),
        "3": L("M", "MUSM"),
        "4": L("Čjl", "SION"),
        "5A": L("Z", "MUSM"),
        "6": [L("Nj", "MUSM"), L("Sj", "MUIV")]
      },
      St: {
        "1": L("Čjl", "SION"),
        "2": L("Aj", "SPNI"),
        "3": L("M", "MUSM"),
        "4": L("Př", "SPNI"),
        "5A": L("D", "MUSR"),
        "6": [L("Nj", "MUSR"), L("Sj", "MUIV")]
      },
      Čt: {
        "1": [L("Pč", "MUSR"), L("Inf", "NOMA")],
        "2": [L("Pč", "MUSR"), L("Inf", "NOMA")],
        "3": L("F", "LAVO"),
        "4": L("Ov", "SPNI"),
        "5B": L("M", "MUSM"),
        "6": [L("Tv", "BALU"), L("Tv", "NEZD")],
        "7": [L("Tv", "BALU"), L("Tv", "NEZD")]
      },
      Pá: {
        "1": L("M", "MUSM"),
        "2": L("Čjl", "SION"),
        "3": L("Vv", "LAVO"),
        "4": L("Vv", "LAVO"),
        "5A": L("Z", "MUSM")
      }
    },

    "9": {
      Po: {
        "1": L("Ov", "MUSR"),
        "2": L("M", "BAFR"),
        "3": L("Aj", "MUSM"),
        "4": L("Př", "BALU"),
        "5A": L("D", "MUSR"),
        "6": L("F", "LAVO"),
        "7": [L("PnP", "MUSM"), L("PnP", "BAFR")]
      },
      Út: {
        "1": [L("Pč", "MUSR"), L("M", "SION")],
        "2": L("Čjl", "SION"),
        "3": L("Hv", "BAFR"),
        "4": L("Z", "MUSR"),
        "5B": [L("Tv", "BALU"), L("Tv", "NEZD")],
        "6": [L("Tv", "BALU"), L("Tv", "NEZD")]
      },
      St: {
        "1": L("Vv", "LAVO"),
        "2": L("Vv", "LAVO"),
        "3": L("D", "MUSR"),
        "4": L("M", "BAFR"),
        "5A": L("Př", "SPNI"),
        "6": L("Čjl", "SION"),
        "7": [L("Nj", "MUSR"), L("Sj", "MUIV")]
      },
      Čt: {
        "1": L("Čjl", "SION"),
        "2": L("Čjl", "SION"),
        "3": L("Aj", "MUSM"),
        "4": [L("M", "BAFR"), L("Inf", "NOMA")],
        "5A": [L("M", "BAFR"), L("Inf", "NOMA")],
        "6": L("Vz", "SPNI")
      },
      Pá: {
        "1": L("M", "BAFR"),
        "2": L("F", "LAVO"),
        "3": L("Z", "MUSR"),
        "4": L("Aj", "MUSM"),
        "5A": L("Čjl", "SION"),
        "6": [L("Nj", "MUSR"), L("Sj", "MUIV")]
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
