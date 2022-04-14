import { LoremIpsum } from "lorem-ipsum";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


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
elem.innerText = lorem.generateParagraphs(57);

let renderer, camera, mixer, clock;
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
renderer.setClearColor(new THREE.Color(0xfefefe));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
// document.body.appendChild(renderer.domElement);


camera.position.x = 1.5;
camera.position.y = 1;
camera.position.z = -1.5;
camera.lookAt(0, 0, 0);

const light = new THREE.AmbientLight( 0xffffbb, 1.2 );
scene.add(light);


// white spotlight shining from the side, casting a shadow
let spotLight = new THREE.SpotLight(0xffffff, 6, 25, Math.PI / 6);
spotLight.position.set(0, 10, 1);
spotLight.rotateZ(45);
scene.add(spotLight);

const loader = new GLTFLoader();
clock = new THREE.Clock();

// Load a glTF resource
loader.load(
  // resource URL
  "scene.gltf",
  // called when the resource is loaded
  function (gltf) {
    gltf.scene.scale.set(0.05, 0.05, 0.05);

    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer( gltf.scene );

    gltf.animations.forEach( ( clip ) => {

      mixer.clipAction( clip ).play();

    } );

  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log('error -->', error);
    console.log("An error happened");
  }
);

///// end of example

let animate = function () {
  requestAnimationFrame(animate);

  //const delta = clock.getDelta();

  //if ( mixer ) mixer.update( delta );
  renderer.render(scene, camera);
};

animate();

let oldValue = 0;

window.addEventListener('scroll' , function(e){

  let newValue = window.pageYOffset;

  mixer.update( (newValue - oldValue) / 250 );
  oldValue = newValue;
});

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

