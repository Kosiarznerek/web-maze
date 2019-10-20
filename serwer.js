//Zmienne serwera
const http = require("http");
let fs = require("fs");
const PORT_SERWERA = 3000;

//Baza danych
const Datastore = require('nedb');
const WYNIKI_KOLEKCJA = new Datastore({filename: './bazaDanych/WYNIKI.db', autoload: true});

//Socket.io
const socketio = require("socket.io");

//Dozwolone foldery klienta
const DOZWOLONE_FOLDERY = ['biblioteki', 'modele', 'skrypty', 'style', 'texturyGrafiki'];

//Rozgrywka
const Labirynt = require('./moduly/Labirynt');
const Gracz = require('./moduly/Gracz');
const KontrolerStolikow = require('./moduly/KontrolerStolikow');
const ROZM_STOLIKA = 2; //Maksymalna liczba osób przy stoliku
const STOLIKI = []; //Tablica tablic dwuwymiarowych [[Gracz, Gracz], [Gracz, Gracz], ...]
const W_LAB = 10; //Liczba wierszy generowanego labiryntu
const K_LAB = 10; //Liczba kolumn generowanego labiryntu

//Serwer
const SERWER = http.createServer((req, res) => {
    //Odsyłanie plików do klienta
    if (req.method.toUpperCase() === 'GET') {

        //Jeżeli prośba o index.html lub jakikolwiek plik z dozwolonego folderu
        if (req.url === "/index.html" ||
            DOZWOLONE_FOLDERY.indexOf(req.url.split('/').filter(v => v !== '')[0]) >= 0
        ) {
            fs.readFile(`staticDir${req.url}`, (error, data) => {
                res.writeHead(200);
                res.write(data);
                res.end();
            })
        }

        //Prośba o zezwolenie na dotęp do pliku z niedozwolonego folderu
        else if (req.url !== '/favicon.ico') {
            console.log(`[WARN]Próba wstępu do niedozwolonego folderu. ${req.url}`);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write("<h1>404 - Brak wstepu.</h1>");
            res.end();
        }
    }
});
SERWER.listen(PORT_SERWERA);
console.log(`Serwer uruchomiony na porcie: ${PORT_SERWERA}`);

//Socket.io
const io = socketio.listen(SERWER);
io.sockets.on("connection", client => {

    //Prośba o znalezienie przeciwnika
    client.on('ZnajdzStolik', dane => {

        //Sprawdzam czy jest gdzieś stolik gdzie można się dosiąść
        const wolnyStolik = KontrolerStolikow.WolnyStolik(STOLIKI, ROZM_STOLIKA);
        if (wolnyStolik) {
            //Jest wolny stolik wiec dodaje tam gracza i sprawdzam czy już jest zapełniony
            const zapelniony = KontrolerStolikow.DodajDoStolika(wolnyStolik, new Gracz(client.id), ROZM_STOLIKA);
            if (!zapelniony) return; //Jeżeli nie jest zapełniony to nic nie robie (czekam aż sie zapełni)

            //Jeżeli jest zapełniony to losuje im labirynt i wysyłam informacje o rozpoczęciu rozgrywki
            const labirynt = Labirynt.KonwertujNaLiczby(Labirynt.GenerujLabirynt(W_LAB, K_LAB));
            wolnyStolik.forEach(gracz => io.sockets.to(gracz.idGracza).emit("RozpocznecieRozgrywki", {
                labirynt,
                start: {wiersz: 1, kolumna: 1},
                meta: {wiersz: W_LAB * 2 - 1, kolumna: K_LAB * 2 - 1},
                idPrzeciwnikow: wolnyStolik
                    .filter(value => value.idGracza !== gracz.idGracza)//Wszyscy oprócz tego do którego wysyłam
                    .map(value => value.idGracza) //Tylko id przeciwnikow
            }))
        }

        //W przeciwnym wypradku tworze nowy stolik i dodaje tam gracza
        else {
            const nowyStolik = KontrolerStolikow.WstawPustyStolik(STOLIKI);
            KontrolerStolikow.DodajDoStolika(nowyStolik, new Gracz(client.id), ROZM_STOLIKA);
        }


    });

    //Aktualizacja ruchu
    client.on('AktualizacjaRuchu', dane => {
        //Szukam stolika przy jakim siedzi gracz
        const stolik = KontrolerStolikow.StolikGracza(client.id, STOLIKI);
        if (stolik === null) return; //Ktoś wysłał, że aktualizował pozycje a nie siedzi przy stoliku

        //Wysyłam do wszystkich jego przeciwnikow informacje o aktualizacji pozycji
        stolik
            .filter(uczestnik => uczestnik.idGracza !== client.id)
            .forEach(przeciwnik => io.sockets.to(przeciwnik.idGracza).emit('AktualizacjaRuchu', {
                idGracza: client.id,
                dane
            }))
    });

    //Wygrana
    client.on('Wygrana', () => {
        //Szukam stolika przy jakim siedzi gracz
        const stolik = KontrolerStolikow.StolikGracza(client.id, STOLIKI);
        if (stolik === null) return; //Ktoś wysłał, że wygral a nie siedzi przy stoliku

        //Wysyłam graczowi informacje o wygranej
        client.emit('KoniecRozgrywki', {powod: 'Gratulacje wygrałeś !!!'});

        //Wysyłam do wszystkich jego przeciwnikow informacje o przegranej
        stolik
            .filter(uczestnik => uczestnik.idGracza !== client.id)
            .forEach(przeciwnik => io.sockets.to(przeciwnik.idGracza).emit('KoniecRozgrywki', {
                powod: `Przegrałeś\nWygrywa gracz o id ${client.id}`
            }));

        //Zapisuje w bazie danych id wygranego
        WYNIKI_KOLEKCJA.insert({
            idWygranego: client.id,
            data: new Date().toUTCString()
        });
    });

    //Rozłączenie z klientem
    client.on("disconnect", () => {
        //Sprawdzam czy gracz siedział przy jakimś stoliku
        const stolik = KontrolerStolikow.StolikGracza(client.id, STOLIKI);
        if (stolik === null) return;//Jeżeli nie nie mam o co się martwić

        //Jeżeli gdzieś siedział to go usuwam ze stolika
        const przeciwnicy = KontrolerStolikow.UsunGraczaZeStolika(client.id, STOLIKI);
        if (przeciwnicy === null) return; //Jeżeli nie miał przeciwnikow to nie mam o co się martwić

        //Informuje każdego przeciwnika gracza, że ktoś opuścił gre
        przeciwnicy.forEach(przeciwnik => io.sockets.to(przeciwnik.idGracza).emit('KoniecRozgrywki', {
            powod: `Gracz o id ${client.id} opuścił gre.\nProszę czekać na nowego lub odświeżyć okno przeglądarki.`
        }))
    })
});