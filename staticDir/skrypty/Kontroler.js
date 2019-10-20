class Kontroler {

    /**
     * Wywołuje wszystkie funckcje by zrestartować/uruchomić gre
     * @param {Object} dane Obiekt z danymi potrzebnymi do rozpoczęcia aplikacji
     * @param {number[][]} dane.labirynt Labirynt do przejścia '0' puste '1' ściana
     * @param {{wiersz:number, kolumna:number}} dane.start Miejsce startu
     * @param {{wiersz:number, kolumna:number}} dane.meta Meta (punkt do jakiego trzeba dojść w labiryncie)
     * @param {number[]} dane.idPrzeciwnikow Id moich przeciwnikow.
     */
    static UruchomGre(dane) {
        Kontroler.UsunKomunikat();
        initThreeJS();
        initNieba();
        initOswietlenia();
        myInit(dane);
        animate();
    }

    /**
     * Zamyka okno z komunikatem
     */
    static UsunKomunikat() {
        //Pobieram wszystkie komunikaty
        const pojemniki = document.getElementsByClassName("komunikatPojemnik");

        //Usuwam wszystkie
        for (let i = 0; i < pojemniki.length; i++) pojemniki[i].parentElement.removeChild(pojemniki[i]);
    }

    /**
     * Wyświetla komunikat
     * @param {string} tresc Treść do wyświetlenia
     */
    static WyswietlKomunikat(tresc) {
        //Usuwam poprzedni
        Kontroler.UsunKomunikat();

        //Pojemnik
        const poj = document.createElement('div');
        poj.className = 'komunikatPojemnik';
        document.body.appendChild(poj);

        //Treść
        const trescPoj = document.createElement('span');
        trescPoj.className = 'komunikatTresc';
        trescPoj.innerText = tresc;
        poj.appendChild(trescPoj);
    }
}