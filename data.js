/*
====================================================
DATA ŠKOLNÍHO SYSTÉMU
====================================================

Klasický rozvrh používá:
shortSubject
shortTeacher

Denní rozvrh používá:
subject
teacher

114 UJ I. zde není.
*/


const DEFAULT_DATA = {

    classes: [
        "9. A",
        "9. B"
    ],


    /*
    ==================================================
    ROZVRH TŘÍDY 9. A
    Podle obrázku
    ==================================================
    */

    schedules: {

        "9. A": {

            "Po": {

                "1": {
                    subject: "Občanská výchova",
                    shortSubject: "Ov",
                    teacher: "Musil Roman",
                    shortTeacher: "MUSR"
                },

                "2": {
                    subject: "Matematika",
                    shortSubject: "M",
                    teacher: "Bauer František",
                    shortTeacher: "BAFR"
                },

                "3": {
                    subject: "Anglický jazyk",
                    shortSubject: "Aj",
                    teacher: "Musil Martin",
                    shortTeacher: "MUSM"
                },

                "4": {
                    subject: "Přírodopis",
                    shortSubject: "Př",
                    teacher: "Baloun",
                    shortTeacher: "BALU"
                },

                "5A": {
                    subject: "Dějepis",
                    shortSubject: "D",
                    teacher: "Musil Roman",
                    shortTeacher: "MUSR"
                },

                "5B": null,

                "6": {
                    subject: "Fyzika",
                    shortSubject: "F",
                    teacher: "Lavo",
                    shortTeacher: "LAVO"
                },

                "7": [
                    {
                        subject: "Přírodopis",
                        shortSubject: "PnP",
                        teacher: "Musil Martin",
                        shortTeacher: "MUSM"
                    },
                    {
                        subject: "Přírodopis",
                        shortSubject: "PnP",
                        teacher: "Bauer František",
                        shortTeacher: "BAFR"
                    }
                ]
            },


            "Út": {

                "1": [
                    {
                        subject: "Počítače",
                        shortSubject: "Pč",
                        teacher: "Musil Roman",
                        shortTeacher: "MUSR"
                    },
                    {
                        subject: "Matematika",
                        shortSubject: "M",
                        teacher: "Sion",
                        shortTeacher: "SION"
                    }
                ],

                "2": {
                    subject: "Český jazyk",
                    shortSubject: "ČjL",
                    teacher: "Sion",
                    shortTeacher: "SION"
                },

                "3": {
                    subject: "Hudební výchova",
                    shortSubject: "Hv",
                    teacher: "Bauer František",
                    shortTeacher: "BAFR"
                },

                "4": {
                    subject: "Zeměpis",
                    shortSubject: "Z",
                    teacher: "Musil Roman",
                    shortTeacher: "MUSR"
                },

                "5A": null,

                "5B": [
                    {
                        subject: "Tělesná výchova",
                        shortSubject: "Tv",
                        teacher: "Baloun",
                        shortTeacher: "BALU"
                    },
                    {
                        subject: "Tělesná výchova",
                        shortSubject: "Tv",
                        teacher: "Nezda",
                        shortTeacher: "NEZD"
                    }
                ],

                "6": [
                    {
                        subject: "Tělesná výchova",
                        shortSubject: "Tv",
                        teacher: "Baloun",
                        shortTeacher: "BALU"
                    },
                    {
                        subject: "Tělesná výchova",
                        shortSubject: "Tv",
                        teacher: "Nezda",
                        shortTeacher: "NEZD"
                    }
                ],

                "7": null
            },


            "St": {

                "1": {
                    subject: "Výtvarná výchova",
                    shortSubject: "Vv",
                    teacher: "Lavo",
                    shortTeacher: "LAVO"
                },

                "2": {
                    subject: "Výtvarná výchova",
                    shortSubject: "Vv",
                    teacher: "Lavo",
                    shortTeacher: "LAVO"
                },

                "3": {
                    subject: "Dějepis",
                    shortSubject: "D",
                    teacher: "Musil Roman",
                    shortTeacher: "MUSR"
                },

                "4": {
                    subject: "Matematika",
                    shortSubject: "M",
                    teacher: "Bauer František",
                    shortTeacher: "BAFR"
                },

                "5A": {
                    subject: "Přírodopis",
                    shortSubject: "Př",
                    teacher: "Spni",
                    shortTeacher: "SPNI"
                },

                "5B": null,

                "6": {
                    subject: "Český jazyk",
                    shortSubject: "ČjL",
                    teacher: "Sion",
                    shortTeacher: "SION"
                },

                "7": [
                    {
                        subject: "Německý jazyk",
                        shortSubject: "Nj",
                        teacher: "Musil Roman",
                        shortTeacher: "MUSR"
                    },
                    {
                        subject: "Španělský jazyk",
                        shortSubject: "Sj",
                        teacher: "Muiv",
                        shortTeacher: "MUIV"
                    }
                ]
            },


            "Čt": {

                "1": {
                    subject: "Český jazyk",
                    shortSubject: "ČjL",
                    teacher: "Sion",
                    shortTeacher: "SION"
                },

                "2": {
                    subject: "Český jazyk",
                    shortSubject: "ČjL",
                    teacher: "Sion",
                    shortTeacher: "SION"
                },

                "3": {
                    subject: "Anglický jazyk",
                    shortSubject: "Aj",
                    teacher: "Musil Martin",
                    shortTeacher: "MUSM"
                },

                "4": [
                    {
                        subject: "Matematika",
                        shortSubject: "M",
                        teacher: "Bauer František",
                        shortTeacher: "BAFR"
                    },
                    {
                        subject: "Informatika",
                        shortSubject: "Inf",
                        teacher: "Noma",
                        shortTeacher: "NOMA"
                    }
                ],

                "5A": [
                    {
                        subject: "Matematika",
                        shortSubject: "M",
                        teacher: "Bauer František",
                        shortTeacher: "BAFR"
                    },
                    {
                        subject: "Informatika",
                        shortSubject: "Inf",
                        teacher: "Noma",
                        shortTeacher: "NOMA"
                    }
                ],

                "5B": null,

                "6": {
                    subject: "Výchova ke zdraví",
                    shortSubject: "Vz",
                    teacher: "Spni",
                    shortTeacher: "SPNI"
                },

                "7": null
            },


            "Pá": {

                "1": {
                    subject: "Matematika",
                    shortSubject: "M",
                    teacher: "Bauer František",
                    shortTeacher: "BAFR"
                },

                "2": {
                    subject: "Fyzika",
                    shortSubject: "F",
                    teacher: "Lavo",
                    shortTeacher: "LAVO"
                },

                "3": {
                    subject: "Zeměpis",
                    shortSubject: "Z",
                    teacher: "Musil Roman",
                    shortTeacher: "MUSR"
                },

                "4": {
                    subject: "Anglický jazyk",
                    shortSubject: "Aj",
                    teacher: "Musil Martin",
                    shortTeacher: "MUSM"
                },

                "5A": {
                    subject: "Český jazyk",
                    shortSubject: "ČjL",
                    teacher: "Sion",
                    shortTeacher: "SION"
                },

                "5B": null,

                "6": [
                    {
                        subject: "Německý jazyk",
                        shortSubject: "Nj",
                        teacher: "Musil Roman",
                        shortTeacher: "MUSR"
                    },
                    {
                        subject: "Španělský jazyk",
                        shortSubject: "Sj",
                        teacher: "Muiv",
                        shortTeacher: "MUIV"
                    }
                ],

                "7": null
            }

        }

    },


    /*
    ==================================================
    SUPLOVÁNÍ
    ==================================================
    */

    substitutions: [],


    /*
    ==================================================
    ZPRÁVY
    ==================================================
    */

    news: [

        {
            title: "Vítejte ve školním systému",
            text: "Zde budou zveřejňovány důležité školní informace.",
            date: "7. 10. 2026"
        },

        {
            title: "Rozvrh třídy 9. A",
            text: "Do systému byl přidán rozvrh třídy 9. A.",
            date: "7. 10. 2026"
        }

    ],


    /*
    ==================================================
    KALENDÁŘ
    ==================================================
    */

    calendar: [

        {
            day: "10",
            month: "ŘÍJ",
            title: "Školní akce",
            text: "Podrobnosti budou zveřejněny."
        },

        {
            day: "15",
            month: "ŘÍJ",
            title: "Pedagogická rada",
            text: "Pedagogická rada školy."
        }

    ]

};
