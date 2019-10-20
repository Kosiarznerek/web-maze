//Zmienne TheeJS
let CAMERA, SCENE, RENDERER, STATS, CLOCK, CONTROLS;

/**
 * Przygotowywuje ThreeJS do pracy po załadowaniu strony
 */
function initThreeJS() {

    //Pojemnik na ThreeJS
    const threeJS_Canvas = document.getElementById('threeJS_Canvas');
    threeJS_Canvas.innerHTML = '';

    //Scena
    SCENE = new THREE.Scene();
    SCENE.background = new THREE.Color(0xf0f0f0);

    //Kamera
    CAMERA = new THREE.PerspectiveCamera(70, threeJS_Canvas.offsetWidth / threeJS_Canvas.offsetHeight, 0.01, 2000000);
    CAMERA.position.set(50, 50, 50);
    CAMERA.lookAt(new THREE.Vector3());

    //Osie układu współrzędnych
    let axesHelper = new THREE.AxesHelper(1000);
    SCENE.add(axesHelper);

    //Render
    RENDERER = new THREE.WebGLRenderer({antialias: true});
    RENDERER.setSize(threeJS_Canvas.offsetWidth, threeJS_Canvas.offsetHeight);
    RENDERER.physicallyCorrectLights = true;
    RENDERER.gammaInput = true;
    RENDERER.gammaOutput = true;
    RENDERER.shadowMap.enabled = true;
    RENDERER.toneMapping = THREE.ReinhardToneMapping;
    RENDERER.toneMappingExposure = Math.pow(0.68, 5.0); // to allow for very bright scenes.
    RENDERER.shadowMap.enabled = true;
    threeJS_Canvas.appendChild(RENDERER.domElement);

    //Dostosowanie nowego rozmiaru okna do canvasu
    window.addEventListener('resize', () => {
        CAMERA.aspect = threeJS_Canvas.offsetWidth / threeJS_Canvas.offsetHeight;
        CAMERA.updateProjectionMatrix();
        RENDERER.setSize(threeJS_Canvas.offsetWidth, threeJS_Canvas.offsetHeight);
    });

    //Wydajność
    STATS = new Stats();
    threeJS_Canvas.appendChild(STATS.dom);

    //Zegar
    CLOCK = new THREE.Clock();

    //OrbitControls
    CONTROLS = new THREE.OrbitControls(CAMERA);
    CONTROLS.domElement = RENDERER.domElement;
    //CONTROLS.addEventListener('change', () => RENDERER.render(SCENE, CAMERA));
    CONTROLS.maxDistance = 200;
    CONTROLS.minDistance = 200;
    CONTROLS.enableKeys = false;
}