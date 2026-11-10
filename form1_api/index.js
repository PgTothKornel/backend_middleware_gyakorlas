import express from "express";

const app = new express();
const PORT = 3000;

const adatok = {
kovetkezoId: 16,
versenyzok: [
{ id: 1, nev: "Juan Manuel Fangio", nemzetiseg: "argentin", cimek: 5, elsoCim: 1951 },
{ id: 2, nev: "Alberto Ascari", nemzetiseg: "olasz", cimek: 2, elsoCim: 1952 },
{ id: 3, nev: "Jack Brabham", nemzetiseg: "ausztrál", cimek: 3, elsoCim: 1959 },
{ id: 4, nev: "Jim Clark", nemzetiseg: "brit", cimek: 2, elsoCim: 1963 },
{ id: 5, nev: "Jackie Stewart", nemzetiseg: "brit", cimek: 3, elsoCim: 1969 },
{ id: 6, nev: "Emerson Fittipaldi", nemzetiseg: "brazil", cimek: 2, elsoCim: 1972 },
{ id: 7, nev: "Niki Lauda", nemzetiseg: "osztrák", cimek: 3, elsoCim: 1975 },
{ id: 8, nev: "Nelson Piquet", nemzetiseg: "brazil", cimek: 3, elsoCim: 1981 },
{ id: 9, nev: "Alain Prost", nemzetiseg: "francia", cimek: 4, elsoCim: 1985 },
{ id: 10, nev: "Ayrton Senna", nemzetiseg: "brazil", cimek: 3, elsoCim: 1988 },
{ id: 11, nev: "Nigel Mansell", nemzetiseg: "brit", cimek: 1, elsoCim: 1992 },
{ id: 12, nev: "Michael Schumacher", nemzetiseg: "német", cimek: 7, elsoCim: 1994 },
{ id: 13, nev: "Mika Häkkinen", nemzetiseg: "finn", cimek: 2, elsoCim: 1998 },
{ id: 14, nev: "Kimi Räikkönen", nemzetiseg: "finn", cimek: 1, elsoCim: 2007 },
{ id: 15, nev: "Sebastian Vettel", nemzetiseg: "német", cimek: 4, elsoCim: 2010 },
],
};

function naplozo(req,res, next) {
    const ido = new Date().toLocaleDateString("hu-HU")
    console.log(`Jelenlegi idő: ${ido}, ${req.method}, ${req.originalUrl}`)
    
    next()
}

function ervenyesId(req,res,next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({hiba: "Az azonosító pozitív egész szám kell legyen!!"})
    }

    let tmp = true;

    for (let i = 0; i < adatok.versenyzok.length; i++) {
        if (adatok.versenyzok[i].id === id) {
            tmp = false;
        }
    }

    if (tmp) {
        return res.status(400).json({hiba: "Nem létezik ilyen versenyző!"})
    }

    req.versenyzoId = id;

    next()
}

function versenyzoKeresese(req,res,next) {
    const versenyzo = adatok.versenyzok.find((x) => x.id === req.versenyzoId)
    if (!versenyzo) {
        return res.status(404).json({hiba: "Nem létező versenyző!"})
    }

    req.versenyzo = versenyzo;

    next()
}

function apiKulcs(req,res,next) {
    if (req.get("X-Api-Kulcs") !== "secret") {
        return res.status(401).json({hiba: "Sikertelen azonosítás"})
    }

    next()
}

function ervenyesVersenyzo(req,res,next) {
    const {nev, nemzetiseg, cimek, elsoCim} = req.body

    if (!nev || !nemzetiseg || !Number.isInteger(cimek) || !Number.isInteger(elsoCim) || Number(cimek) < 0 || Number(elsoCim) < 1900){
        return res.status(400).json({hiba: "Hibás adatok!"})
    }

    next()
}

app.use(naplozo)

app.use(express.json())




app.get("/api/versenyzok/", (req,res) => {
    res.json(adatok.versenyzok)
})

app.get("/api/versenyzok/:id", ervenyesId, (req, res, next) => {
    res.status(200).json({uzenet: req.versenyzo})
})

app.delete("/api/versenyzok/:id", ervenyesId, (req, res, next) => {
    adatok.versenyzok = adatok.versenyzok.filter((x) => x.id !== req.versenyzoId)

    res.status(200).json({uzenet: "Sikeres törlés!"})
})

app.post("/api/versenyzok/", apiKulcs, ervenyesVersenyzo, (req,res,next) => {
    const {nev, nemzetiseg, cimek, elsoCim} = req.body
    const uj = {id: adatok.kovetkezoId, nev: nev, nemzetiseg, cimek, elsoCim}

    adatok.kovetkezoId++;
    adatok.versenyzok.push(uj)

    res.status(200).json({uzenet: "Siker"})
})

app.listen(PORT, (hiba) => {
    if (hiba) throw hiba;
    console.log(`A szerver fut a ${PORT}-es porton.`)
})