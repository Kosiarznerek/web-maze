/**
 * Tworzy labirynt na podstawie danych
 * @param {number[][]} grid '0' puste '1' sciana
 * @param {number} skala Rozmiar jednego pola (mesha)
 * @returns {THREE.Mesh[]} Tablica meshy
 */
function GenerujLabirynt(grid, skala) {
    //Meshe do zwrotu
    const meshe = [];

    //Materiał
    const material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: 0xffffff,
        metalness: 0.2,
        bumpScale: 0.0005
    });

    //Ładuje teksture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("texturyGrafiki/podloze.png", function (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(skala / 100, skala / 100);
        material.map = map;
        material.needsUpdate = true;
    });

    //Tworze kształt i mesha
    const floorGeometry = new THREE.PlaneBufferGeometry(skala, skala);
    const floorMesh = new THREE.Mesh(floorGeometry, material);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;

    //Generuje
    for (let wiersz = 0; wiersz < grid.length; wiersz++) {
        for (let kolumna = 0; kolumna < grid[wiersz].length; kolumna++) {

            //Klonuje
            const mesh = floorMesh.clone();

            //Zapisuje czy jest to sciana czy puste pole
            Object.defineProperty(mesh.userData, 'typ', {
                value: grid[wiersz][kolumna] === 1 ? 'LABIRYNT_SCIANA' : 'LABIRYNT_KORYTARZ',
                writable: false
            });

            //Pozycjonuje
            mesh.position.set(kolumna * skala + skala / 2, 0, wiersz * skala + skala / 2);

            //Dodaje do tablicy
            meshe.push(mesh);
        }
    }

    //Zwracam
    return meshe;
}