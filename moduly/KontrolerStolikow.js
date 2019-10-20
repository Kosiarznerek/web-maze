class KontrolerStolikow {

    /**
     * Sprawdza jest jest jakich wolny stolik
     * @param {Array<Gracz[]>} stoliki Wszyskie stoliki
     * @param {number} maxOsob Maksymalna liczba osob jaka moze siedziec przy stoliku (Domyśna 2)
     * @returns {Gracz[] | null} Wolny stolik lub null jeżeli nie ma wolnego stolika
     */
    static WolnyStolik(stoliki, maxOsob = 2) {
        return stoliki
            .reduce((wolny, sprawdzany) => sprawdzany.length < maxOsob ? sprawdzany : wolny, null)
    }

    /**
     * Dodaje gracza do stolika
     * @param {Gracz[]} stolik Stolik do jakiego trzeba dodać gracza
     * @param {Gracz} gracz Gracz jakiego trzeba dodać
     * @param {number} maxOsob Maksymalna liczba osob przy stoliku (Domyślnie 2)
     * @returns {boolean} True jeżeli już jest zapełniony, fałsz jeżeli jeszcze się ktoś zmieści
     */
    static DodajDoStolika(stolik, gracz, maxOsob = 2) {
        //Jeżeli już jest zapełniony zwracam true
        if (stolik.length >= maxOsob) return true;

        //Dodaje i sprawdzam czy zapełniony
        stolik.push(gracz);
        return stolik.length >= maxOsob;
    }

    /**
     * Wstawia pusty stolik do tablicy stolików
     * @param {Array<Gracz[]>} stoliki Tablica ze wszystkimi stolikami
     * @returns {Gracz[]} Nowo dodany stolik
     */
    static WstawPustyStolik(stoliki) {
        const nowy = [];
        stoliki.push(nowy);
        return nowy;
    }

    /**
     * Wyszukuje stolik przy jakim obecnie siedzi gracz
     * @param {number} idGracza ID klienta gracza
     * @param {Array<Gracz[]>} stoliki Wszystkie stoliki
     * @returns {Gracz[] | null} Stolik przy jakim siedzi lub null jeżeli nigdzie nie siedzi
     */
    static StolikGracza(idGracza, stoliki) {
        return stoliki
            .reduce((stolikGracza, stolik) => {
                return stolik.filter(uczestnik => uczestnik.idGracza === idGracza).length > 0
                    ? stolik
                    : stolikGracza
            }, null)
    }

    /**
     * Usuwa wszystkie puste stoliki
     * @param {Array<Gracz[]>} stoliki
     */
    static _UsunPuste(stoliki) {
        //Przeszukuje wszystkie stoliki
        for (let i = 0; i < stoliki.length; i++) {
            //Jeżeli nie jest pusty -> szukaj dalej
            if (stoliki[i].length !== 0) continue;

            //Jeżeli jest pusty usuwam go
            stoliki.splice(i, 1);
            i--;
        }
    }

    /**
     * Indeks gracza przy stoliku
     * @param {number} idGracza Id klienta poszukiwanego gracza
     * @param {Gracz[]} stolik Stolik przy jakim trzeba go szukac
     */
    static _IndexGraczaPrzyStoliku(idGracza, stolik) {
        for (let i = 0; i < stolik.length; i++)
            if (stolik[i].idGracza === idGracza) return i;
        throw new Error('Nie można znaleść gracza');
    }

    /**
     * Usuwa gracza ze stolika
     * @param {number} idGracza ID klienta gracza
     * @param {Array<Gracz[]>} stoliki Wszystkie stoliki
     * @returns {Gracz[] | null} Stolik przy jakim siedział lub null jeżeli ostatni opuscil stolik
     */
    static UsunGraczaZeStolika(idGracza, stoliki) {
        //Szukam stolika przy jakim siedzi
        const stolikGracza = KontrolerStolikow.StolikGracza(idGracza, stoliki);
        if (stolikGracza === null) return null; //Jeżeli nigdzie nie siedzi to zwracam null

        //Usuwam go ze stolika
        const index = KontrolerStolikow._IndexGraczaPrzyStoliku(idGracza, stolikGracza);
        stolikGracza.splice(index, 1);

        //Jeżeli stolik jest pusty
        if (stolikGracza.length === 0) {
            //Usuwam wszystkie stoliki, które są puste
            KontrolerStolikow._UsunPuste(stoliki);

            //zwracam null
            return null;
        }

        //Jeżeli nie jest pusty to go zwracam
        return stolikGracza;
    }
}

module.exports = KontrolerStolikow;