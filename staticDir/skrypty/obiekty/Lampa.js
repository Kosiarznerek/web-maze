class Lampa {

    /**
     * Tworzy obiekt lampy
     * @param {THREE.Scene} scena Scena do jakiej zostanie dodana lampa
     * @param {THREE.Vector3} pozycja Pozycja lampy
     * @param {number} kolor Kolor światła
     */
    constructor(scena, pozycja, kolor) {
        const bulbLight = new THREE.PointLight(kolor, 1, 140, 2);
        bulbLight.castShadow = true;
        bulbLight.power = 11000000;
        bulbLight.position.copy(pozycja);
        scena.add(bulbLight);
    }
}