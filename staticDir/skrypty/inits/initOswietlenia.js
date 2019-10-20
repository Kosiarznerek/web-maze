/**
 * Dodaje oświetlenie do sceny
 */
function initOswietlenia() {
    const hemiLight = new THREE.HemisphereLight(0xffee88, 0xffee88, 0.6);
    SCENE.add(hemiLight);
}