//Eventy na window
window.addEventListener('load', SocketIO.ZnajdzStolik);
window.addEventListener('keydown', klawiszDol);
window.addEventListener('keyup', klawiszGora);

//Zmienne gry
const ROZMIAR_KAFELKA = 100; //Rozmiar jednego kafelka labiryntu
let POSTAC;
let PRZECIWNICY;
let LABIRYNT;
let LAMPY;
let START_PUNKT, META_PUNKT; //Punkt startowy i końcowy

/**
 * Funkcja wykonuje się po wciśnieciu klawisza
 * @param {KeyboardEvent} event
 */
function klawiszDol(event) {
    switch (event.key.toUpperCase()) {
        case 'W':
            POSTAC.ruch.przod = true;
            SocketIO.AktualizacjaRuchu({ruch: POSTAC.ruch});
            break;
        case 'A':
            POSTAC.ruch.lewo = true;
            SocketIO.AktualizacjaRuchu({ruch: POSTAC.ruch});
            break;
        case 'D':
            POSTAC.ruch.prawo = true;
            SocketIO.AktualizacjaRuchu({ruch: POSTAC.ruch});
            break;
    }
}

/**
 * Funkcja wykonuje się po zwolnieniu klawisza
 * @param {KeyboardEvent} event
 */
function klawiszGora(event) {
    switch (event.key.toUpperCase()) {
        case 'W':
            POSTAC.ruch.przod = false;
            SocketIO.AktualizacjaRuchu({ruch: POSTAC.ruch});
            break;
        case 'A':
            POSTAC.ruch.lewo = false;
            SocketIO.AktualizacjaRuchu({ruch: POSTAC.ruch});
            break;
        case 'D':
            POSTAC.ruch.prawo = false;
            SocketIO.AktualizacjaRuchu({ruch: POSTAC.ruch});
            break;
    }
}

/**
 * Moja inicjalizacja aplikacji
 * @param {number[][]} labirynt Labirynt do przejścia '0' puste '1' ściana
 * @param {{wiersz:number, kolumna:number}} start Miejsce startu
 * @param {{wiersz:number, kolumna:number}} meta Meta (punkt do jakiego trzeba dojść w labiryncie)
 * @param {number[]} idPrzeciwnikow Id moich przeciwnikow.
 */
function myInit({labirynt, start, meta, idPrzeciwnikow}) {
    //Start i meta
    START_PUNKT = new THREE.Vector3(
        start.kolumna * ROZMIAR_KAFELKA + ROZMIAR_KAFELKA / 2,
        0,
        start.wiersz * ROZMIAR_KAFELKA + ROZMIAR_KAFELKA / 2
    );
    META_PUNKT = new THREE.Vector3(
        meta.kolumna * ROZMIAR_KAFELKA + ROZMIAR_KAFELKA / 2,
        0,
        meta.wiersz * ROZMIAR_KAFELKA + ROZMIAR_KAFELKA / 2
    );

    //Tworze postać
    POSTAC = new Postac(SCENE, 'skeleton', START_PUNKT);

    //Tworze przeciwnikow
    PRZECIWNICY = idPrzeciwnikow.map(id => {
        const p = new Postac(SCENE, 'chicken', START_PUNKT);
        p.id = id;
        return p;
    });

    //Tworze labirynt
    LABIRYNT = GenerujLabirynt(labirynt, ROZMIAR_KAFELKA);
    LABIRYNT
        .filter(value => value.userData.typ === 'LABIRYNT_KORYTARZ')
        .forEach(value => SCENE.add(value));

    //Lampa na starcie i na mecie [X] nad ziemią
    LAMPY = [];
    LAMPY.push(new Lampa(SCENE, START_PUNKT.clone().add(new THREE.Vector3(0, 40, 0)), 0x0000ff));
    LAMPY.push(new Lampa(SCENE, META_PUNKT.clone().add(new THREE.Vector3(0, 40, 0)), 0x00ff00));
}

/**
 * Pętla animacji
 */
function animate() {
    //Obliczanie delty
    const deltaTime = CLOCK.getDelta();


    //Aktualizacja postaci
    POSTAC.aktualizujAnimacje(deltaTime);
    POSTAC.aktualizujPozycjeOswietlenia();
    POSTAC.aktualizujPozycje(LABIRYNT.filter(value => value.userData.typ === 'LABIRYNT_KORYTARZ'));


    //Jeżeli się poruszam, muszę o tym poinformować moich przeciwników
    if (POSTAC.ruch.przod || POSTAC.ruch.tyl) SocketIO.AktualizacjaRuchu({
        pozycja: POSTAC.meshModelu.position
    });
    if (POSTAC.ruch.lewo || POSTAC.ruch.prawo) SocketIO.AktualizacjaRuchu({
        rotacja: new THREE.Vector3(POSTAC.meshModelu.rotation.x, POSTAC.meshModelu.rotation.y, POSTAC.meshModelu.rotation.z)
    });


    //Aktualizacja przeciwnikow
    PRZECIWNICY.forEach(przeciwnik => {
        przeciwnik.aktualizujAnimacje(deltaTime);
        przeciwnik.aktualizujPozycjeOswietlenia();
    });


    //Kamera porusza się za postacią
    CONTROLS.target = (POSTAC.pozycja
            ? POSTAC.pozycja.add(new THREE.Vector3(0, POSTAC.rozmiar.y / 2, 0))
            : new THREE.Vector3(0, 0, 0)
    );


    //Jeżeli doszedłem do mety informuje pozostalych
    if (POSTAC.pozycja !== null && POSTAC.pozycja.distanceTo(META_PUNKT) <= ROZMIAR_KAFELKA) {
        SocketIO.Wygrana();
        return;
    }


    //Render i requestAnimationFrame
    STATS.update();
    CONTROLS.update();
    RENDERER.render(SCENE, CAMERA);
    requestAnimationFrame(animate);
}