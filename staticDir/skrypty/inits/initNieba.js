/**
 * Dodaje niebo do sceny
 * https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
 */
function initNieba() {
    //Add Sky
    const sky = new THREE.Sky();
    sky.scale.setScalar(450000);
    SCENE.add(sky);

    //Add Sun Helper
    const sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(20000, 16, 8),
        new THREE.MeshBasicMaterial({color: 0xffffff})
    );
    sunSphere.position.y = -700000;
    sunSphere.visible = false;
    SCENE.add(sunSphere);

    //GUI
    const effectController = {
        turbidity: 5.7,
        rayleigh: 0.122,
        mieCoefficient: 0,
        mieDirectionalG: 0.366,
        luminance: 0.7,
        inclination: 0.4965,
        azimuth: 0.2472, // Facing front,
        sun: false
    };
    const distance = 400000;

    //Wprowadzanie ustawien
    const uniforms = sky.material.uniforms;
    uniforms.turbidity.value = effectController.turbidity;
    uniforms.rayleigh.value = effectController.rayleigh;
    uniforms.luminance.value = effectController.luminance;
    uniforms.mieCoefficient.value = effectController.mieCoefficient;
    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
    const theta = Math.PI * (effectController.inclination - 0.5);
    const phi = 2 * Math.PI * (effectController.azimuth - 0.5);
    sunSphere.position.x = distance * Math.cos(phi);
    sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
    sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
    sunSphere.visible = effectController.sun;
    uniforms.sunPosition.value.copy(sunSphere.position);
    RENDERER.render(SCENE, CAMERA);
}