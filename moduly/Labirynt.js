class Labirynt {

    /**
     * Generuje serwer
     * https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker
     * @param {number} iloscWierzy
     * @param {number} iloscKolumn
     * @returns {Array<{wiersz: number, kolumna: number, lewa: boolean, prawa: boolean, gora: boolean, dol: boolean}[]>} Labirynt
     */
    static GenerujLabirynt(iloscWierzy, iloscKolumn) {
        //Zmienne
        const grid = new Array(iloscWierzy).fill(0).map((value, wiersz) => new Array(iloscKolumn).fill(0).map((value2, kolumna) => (
            {
                wiersz: wiersz,
                kolumna: kolumna,
                lewa: true,
                prawa: true,
                gora: true,
                dol: true
            })
        ));
        const odwiedzone = [];
        const stack = [];
        let obecna_komorka;

        //Ustaw startową komórkę na bieżącą komórkę i oznacz ją jako odwiedzoną
        obecna_komorka = grid[0][0];
        odwiedzone.push(obecna_komorka);

        //Dopuki są komórki, które jeszcze nie zostały odwiedzone
        while (odwiedzone.length !== iloscWierzy * iloscKolumn) {
            //Jeśli obecna komórka ma jakiś sąsiadów, którzy nie zostali odwiedzeni
            const wszyscy_sasiedzi = Labirynt.SasiedziKomorki(obecna_komorka, grid);
            const nieodwiedzeni_sasiedzi = wszyscy_sasiedzi.filter(value => odwiedzone.indexOf(value) < 0);
            if (nieodwiedzeni_sasiedzi.length > 0) {
                //Wybierz losowego nieodwiedzonego sąsiada
                let losowa = nieodwiedzeni_sasiedzi[Math.floor(Math.random() * nieodwiedzeni_sasiedzi.length)];

                //Dodaj wylosowaną komórke do staku
                stack.push(losowa);

                //Usuń ściany pomiędzy wylosowaną komórka a obecną
                Labirynt.UsunSciany(losowa, obecna_komorka);

                //Losowa komórka staje się obecna i zostaje oznaczona jako odwiedzona
                obecna_komorka = losowa;
                odwiedzone.push(obecna_komorka);
            }

            //Jeżeli stack nie jest pusty
            else if (stack.length > 0) obecna_komorka = stack.pop();
        }

        return grid;
    }

    /**
     * Sprawdza sąsiadów dla komórki
     * @param {{wiersz: number, kolumna: number, lewa: boolean, prawa: boolean, gora: boolean, dol: boolean}} komorka
     * @param {{wiersz: number, kolumna: number, lewa: boolean, prawa: boolean, gora: boolean, dol: boolean}[]} grid
     * @returns {{wiersz: number, kolumna: number, lewa: boolean, prawa: boolean, gora: boolean, dol: boolean}[]} {Array}
     */
    static SasiedziKomorki(komorka, grid) {
        const sasiedzi = [];
        if (komorka.wiersz - 1 >= 0) sasiedzi.push(grid[komorka.wiersz - 1][komorka.kolumna]);
        if (komorka.wiersz + 1 < grid.length) sasiedzi.push(grid[komorka.wiersz + 1][komorka.kolumna]);
        if (komorka.kolumna - 1 >= 0) sasiedzi.push(grid[komorka.wiersz][komorka.kolumna - 1]);
        if (komorka.kolumna + 1 < grid[komorka.wiersz].length) sasiedzi.push(grid[komorka.wiersz][komorka.kolumna + 1]);
        return sasiedzi;
    }

    /**
     * Usuwa ściany pomiędzy komórkami
     * @param {{wiersz: number, kolumna: number, lewa: boolean, prawa: boolean, gora: boolean, dol: boolean}} komorkaA
     * @param {{wiersz: number, kolumna: number, lewa: boolean, prawa: boolean, gora: boolean, dol: boolean}} komorkaB
     */
    static UsunSciany(komorkaA, komorkaB) {
        if (komorkaA.kolumna === komorkaB.kolumna && komorkaB.wiersz === komorkaA.wiersz - 1) {
            komorkaA.gora = false;
            komorkaB.dol = false;
        } else if (komorkaA.wiersz === komorkaB.wiersz && komorkaB.kolumna === komorkaA.kolumna + 1) {
            komorkaA.prawa = false;
            komorkaB.lewa = false;
        } else if (komorkaA.kolumna === komorkaB.kolumna && komorkaB.wiersz === komorkaA.wiersz + 1) {
            komorkaA.dol = false;
            komorkaB.gora = false;
        } else if (komorkaA.wiersz === komorkaB.wiersz && komorkaB.kolumna === komorkaA.kolumna - 1) {
            komorkaA.lewa = false;
            komorkaB.prawa = false;
        } else throw new Error('Nie można usunąć ściań');
    }

    /**
     * Konwertuje serwer na liczby '0' puste '1' sciana
     * @param {Array<{wiersz: number, kolumna: number, lewa: boolean, prawa: boolean, gora: boolean, dol: boolean}[]>} grid
     * @returns {Array<number[]>} Przekonwertowany serwer
     */
    static KonwertujNaLiczby(grid) {
        //Tworze wiekszy grid
        const przekonwertowany = new Array(grid.length * 2 + 1).fill(1).map(value => new Array(grid[0].length * 2 + 1).fill(1));

        //Konwertuje
        for (let wiersz = 0; wiersz < grid.length; wiersz++) {
            for (let kolumna = 0; kolumna < grid[wiersz].length; kolumna++) {
                const n_wiersz = wiersz * 2 + 1;
                const n_kolumna = kolumna * 2 + 1;

                //Jeżeli jest przejście do innej
                if (!grid[wiersz][kolumna].lewa || !grid[wiersz][kolumna].prawa || !grid[wiersz][kolumna].gora || !grid[wiersz][kolumna].dol)
                    przekonwertowany[n_wiersz][n_kolumna] = 0;

                //Usuwam ściany
                if (!grid[wiersz][kolumna].lewa) przekonwertowany[n_wiersz][n_kolumna - 1] = 0;
                if (!grid[wiersz][kolumna].prawa) przekonwertowany[n_wiersz][n_kolumna + 1] = 0;
                if (!grid[wiersz][kolumna].gora) przekonwertowany[n_wiersz - 1][n_kolumna] = 0;
                if (!grid[wiersz][kolumna].dol) przekonwertowany[n_wiersz + 1][n_kolumna] = 0;
            }
        }

        //Zwracam
        return przekonwertowany;
    }
}

module.exports = Labirynt;
