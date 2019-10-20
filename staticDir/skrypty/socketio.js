//Socket.IO
const KLIENT = new io;

//Odbieranie danych
KLIENT.on('RozpocznecieRozgrywki', dane => Kontroler.UruchomGre(dane));
KLIENT.on('KoniecRozgrywki', dane => Kontroler.WyswietlKomunikat(dane.powod));
KLIENT.on('AktualizacjaRuchu', dane => {
    //Jeżeli nie mam żadnych przeciwnikow to nic nie robie
    if (!(PRZECIWNICY instanceof Array) || PRZECIWNICY.length === 0) return;

    //Szukam tego, co sie poruszył i aktualuzuje jego dane, które się zmieniły
    const przeciwnik = PRZECIWNICY.reduce((p, c) => c.id === dane.idGracza ? c : p);
    if (dane.dane.ruch) przeciwnik.ruch = dane.dane.ruch;
    if (dane.dane.pozycja) przeciwnik.meshModelu.position.set(
        dane.dane.pozycja.x,
        dane.dane.pozycja.y,
        dane.dane.pozycja.z
    );
    if (dane.dane.rotacja) przeciwnik.meshModelu.rotation.set(
        dane.dane.rotacja.x,
        dane.dane.rotacja.y,
        dane.dane.rotacja.z
    );
});

//Wysyłanie danych
class SocketIO {

    /**
     * Prośba o znalezienie wolnego stolika do gry
     */
    static ZnajdzStolik() {
        console.warn('Wysłano prośbe o przydzielenie stolika.');
        Kontroler.WyswietlKomunikat('Trwa oczekiwanie na reszte graczy.');
        KLIENT.emit("ZnajdzStolik");
    }

    /**
     * Informowanie przeciwników o własnej bierzącej pozycji
     * @param {THREE.Vector3} pozycja Pozycja postacji
     * @param {THREE.Vector3} rotacja Rotacja postaci
     * @param {{prawo: boolean, lewo: boolean, przod: boolean, tyl: boolean}} ruch
     */
    static AktualizacjaRuchu({pozycja = null, rotacja = null, ruch = null}) {
        KLIENT.emit('AktualizacjaRuchu', {pozycja, rotacja, ruch});
    }

    /**
     * Wysyła informaje o wygranej
     */
    static Wygrana() {
        KLIENT.emit('Wygrana');
    }
}