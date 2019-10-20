class Postac {

    /**
     * Tworzy postać
     * @param {THREE.Scene} scena Scena do jakiej zostanie dodany obiekt
     * @param {'skeleton' | 'chicken'} typ Typ postaci (szkielet albo kurczak)
     * @param {THREE.Vector3} pozycja Pozycja postaci (domyślna 0,0,0)
     * @param {THREE.Vector3} skala Skalowanie postaci (domyślna 1,1,1)
     */
    constructor(scena, typ, pozycja = new THREE.Vector3(), skala = new THREE.Vector3(1, 1, 1)) {
        //Walidacja danych
        if (!(scena instanceof THREE.Scene)) throw new Error('Nieprawidłowa scena');
        if (typ !== 'skeleton' && typ !== 'chicken') throw new Error(`Typ postaci ${typ} nie jest znany.`);

        //Dane obiektu
        this.meshModelu = null; //Mesh modelu ('null' jeśli nie jest załadowany)
        this.animacjeModelu = null; //Animacje modelu ('null' jeśli nie jest załadowany)
        this.ruch = { //Te zmienne decydują w jaką stronę porusza się postać
            lewo: false,
            prawo: false,
            przod: false,
            tyl: false
        };
        this.oswietlenie = Postac.GenerujOswietlenie(scena); //Oświetlenie postaci od spodu
        this.typ = typ;
        this.id = null;//Id tworzonego obiektu (nadawane przeciwnikom)

        //W zależności od typu postaci odpowiednia tekstura i model
        let sciezkaModelu, sciezkaTekstury;
        switch (typ) {
            case 'skeleton':
                sciezkaModelu = 'modele/skeleton/tris.js';
                sciezkaTekstury = 'modele/skeleton/Ctf_r-ConvertImage.png';
                break;
            case 'chicken':
                sciezkaModelu = 'modele/chicken/tris.js';
                sciezkaTekstury = 'modele/chicken/Psycho.png';
                break;
        }

        //Materiał modelu
        const modelMaterial = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(sciezkaTekstury),
            morphTargets: true // odpowiada za animację materiału modelu
        });

        //Ładowanie modelu
        const loader = new THREE.JSONLoader();
        loader.load(sciezkaModelu, geometry => {
            //Tworze model i dodaje do sceny
            this.meshModelu = new THREE.Mesh(geometry, modelMaterial);
            this.meshModelu.position.copy(pozycja);
            this.meshModelu.scale.copy(skala);
            scena.add(this.meshModelu);

            //'Wyśrodkowanie' postaci (0,0,0) u podnuża stóp
            const box = new THREE.Box3().setFromObject(this.meshModelu);
            this.meshModelu.position.y += box.getSize().y / 2;

            //Animacje postaci
            this.animacjeModelu = new THREE.AnimationMixer(this.meshModelu);
        });
    }

    /**
     * Tworzy lapkę
     * https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_physical.html
     * @param {THREE.Scene} scene Scena do jakiej zostanie dodana
     * @returns {THREE.PointLight} Lapka
     */
    static GenerujOswietlenie(scene) {
        const bulbLight = new THREE.PointLight(0xffffff, 1, 140, 2);
        bulbLight.castShadow = true;
        bulbLight.power = 11000000;
        scene.add(bulbLight);
        return bulbLight;
    }

    /**
     * Zwraca bierzącą pozycje postaci
     * @returns {THREE.Vector3 | null} Klon pozycji
     */
    get pozycja() {
        return this.meshModelu !== null ? this.meshModelu.position.clone() : null;
    }

    /**
     * Zwraca wymiary postaci
     * @returns {THREE.Vector3 | null} Wymiary
     */
    get rozmiar() {
        if (this.meshModelu === null) return null;

        const box = new THREE.Box3().setFromObject(this.meshModelu);
        const wymiary = new THREE.Vector3();
        box.getSize(wymiary);
        return wymiary instanceof THREE.Vector3 ? wymiary : null;
    }

    /**
     * Aktualizuje animacje postaci
     * @param {number} delta
     */
    aktualizujAnimacje(delta) {
        //Jeżeli brak animacji nic nie robie
        if (this.animacjeModelu === null) return;

        //Jeżeli kurczak
        if (this.typ === 'chicken') {
            //Zmiana animacja w zależności od kierunku poruszania sie
            if (this.ruch.przod) {
                this.animacjeModelu.clipAction("Jump").play();
                this.animacjeModelu.clipAction("Stand").stop();
            } else {
                this.animacjeModelu.clipAction("Stand").play();
                this.animacjeModelu.clipAction("Jump").stop();
            }
        }

        //Jeżeli szkieletor
        if (this.typ === 'skeleton') {
            //Zmiana animacja w zależności od kierunku poruszania sie
            if (this.ruch.przod) {
                this.animacjeModelu.clipAction("run").play();
                this.animacjeModelu.clipAction("stand").stop();
            } else {
                this.animacjeModelu.clipAction("stand").play();
                this.animacjeModelu.clipAction("run").stop();
            }
        }

        //Aktualizuje
        this.animacjeModelu.update(delta);
    }

    /**
     * Aktualizuje pozycje postaci w zależności w jakim kierunku się porusza
     * @param {THREE.Mesh[] | undefined} meshe Tablica meshy po jakich może poruszać się gracz ('podłoga')
     *                                         jeżeli undefined to porusza się po wszystkim.
     */
    aktualizujPozycje(meshe = undefined) {
        //Jeżeli brak meshu -> nic nie robie
        if (this.meshModelu === null) return;

        //Obrót postaci
        if (this.ruch.lewo) this.meshModelu.rotateY(0.1);
        if (this.ruch.prawo) this.meshModelu.rotateY(-0.1);

        //Ruch przód/tył
        const ruch = new THREE.Vector3;
        if (this.ruch.przod) ruch.x = -3;
        if (this.ruch.tyl) ruch.x = 3;

        //Jeżeli mogę chodzić po wszystkim (meshe === undefined) to aktualizuje
        if (meshe === undefined) {
            this.meshModelu.translateX(ruch.x);
            return;
        }
        if (meshe !== undefined && !(meshe instanceof Array))
            throw new Error('Nieprawidłowa tablica meshy');


        //Sprawdzam raycasterem czy po wykonaniu ruchu będę stał na 'podłodze'
        const raycaster = new THREE.Raycaster();
        raycaster.ray = new THREE.Ray(
            this.meshModelu.clone().translateX(ruch.x).position,
            new THREE.Vector3(0, -1, 0)
        );
        let intersects = raycaster.intersectObjects(meshe).filter(value => meshe.indexOf(value.object) >= 0);

        //Jeżeli tak wykonuje ruch
        if (intersects.length > 0) this.meshModelu.translateX(ruch.x);
    }

    /**
     * Aktualizuje pozycje oświetlenia pod postacia
     */
    aktualizujPozycjeOswietlenia() {
        //Jeżeli brak meshu -> nic nie robie
        if (this.meshModelu === null) return;

        //Brak oświetlnia -> nic nie robie
        if (!this.oswietlenie) return;

        //Aktualizuje
        this.oswietlenie.position.set(this.meshModelu.position.x, 50, this.meshModelu.position.z);
    }
}
