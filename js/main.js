import {LoremIpsum} from "lorem-ipsum";

import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {MathUtil} from "three/examples/jsm/libs/OimoPhysics";
import {TextureLoader} from "three";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 30,
    min: 10
  },
  format: "plain",
  suffix: "\n\n\n"
});

const elem = document.getElementById("site");
elem.innerText = lorem.generateParagraphs(50);

let renderer, camera, mixer, clipDuration, totalScrollHeight;
//let controls;

let scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(
  54,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById("viewport")
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(0x1f1f1f));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
// document.body.appendChild(renderer.domElement);

camera.position.x = 1.5;
camera.position.y = 1.5;
camera.position.z = 0;
camera.lookAt(0, 0.5, 0);

const light = new THREE.AmbientLight( 0xFFFFFF, 2 ); // soft white light
scene.add( light );

/*
const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
scene.add(directionalLight);

const helper = new THREE.DirectionalLightHelper( directionalLight, 5, 'red' );
scene.add( helper );
*/

const spotLight = new THREE.SpotLight(0xffffff, 10, 25, -Math.PI / 6);
spotLight.position.set(-2, 2, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

/*const spotHelper = new THREE.SpotLightHelper(spotLight, 'red');
scene.add(spotHelper);*/



const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let loader = new GLTFLoader();

const rgbeLoader = new TextureLoader();
rgbeLoader.load('https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', function (texture) {

  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  //scene.background = envMap;
  scene.environment = envMap;

  texture.dispose();
  pmremGenerator.dispose();

  loader.load("spinblade.glb", function (gltf) {

      const scale = 0.3

      let object = gltf.scene;

      object.scale.set(scale, scale, scale);
      object.castShadow = true;
      object.receiveShadow = true;

      object.traverse((o) => {
        if (o.isMesh) {

          o.material.reflectivity = 1;
          o.material.metalness = 1;
          o.material.needsUpdate = true;
          o.material.envMapIntensity = 0.8;
          o.material.roughness = 0.15
        }
      });

      mixer = new THREE.AnimationMixer(gltf.scene);

      gltf.animations.forEach((clip) => {
        clipDuration = clip.duration;
        console.log('clipDuration -->', clipDuration);

        const animAction = mixer.clipAction(clip);
        //animAction.loop = THREE.LoopRepeat;
        animAction.loop = THREE.LoopPingPong;
        //animAction.timeScale = 1;

        animAction.play();

      });

      scene.add(object);
      directionalLight.target = object
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log('error -->', error);
      console.log("Load Failed!");
    }
  );

});

let animate = function () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

animate();

let oldValue = 0;

window.addEventListener('load', function (e) {
  totalScrollHeight = window.document.documentElement.scrollHeight - window.innerHeight;
});

window.addEventListener('scroll', function (e) {


  console.log('totalScrollHeight -->', totalScrollHeight);

  let newValue = window.pageYOffset;
  //console.log('newValue -->', newValue);
  /*
    const diff = (newValue / totalScrollHeight) * 3;
    console.log('diff -->', diff);


    camera.position.y = -0.5 + diff;
    camera.lookAt(0, 0.5 - (diff * 0.1), 0)*/

  mixer.update((newValue - oldValue) / 1000);
  oldValue = newValue;
 /* const time = (window.pageYOffset / totalScrollHeight) * clipDuration;
  console.log('time -->', time);
  mixer.setTime(MathUtil.clamp(time, 0, clipDuration));*/
});

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

