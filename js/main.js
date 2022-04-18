import {LoremIpsum} from "lorem-ipsum";

import * as THREE from "three";
import * as dat from 'dat.gui';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {TextureLoader} from "three";


const settings = {
  textVisible: true,
  gridVisible: true,
}



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

let renderer, camera, mixer, clipDuration, totalScrollHeight, object, subObject, elem;

const gui = new dat.GUI({name: 'Controls', width: 350});

elem = document.getElementById("site");

function changeVisibility() {
  elem.style.visibility = settings.textVisible ? 'visible' : 'hidden'
}


elem.innerText = lorem.generateParagraphs(50);
//let controls;

let scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(
  50,
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

camera.position.x = 2;
camera.position.y = 0;
camera.position.z = 0;
camera.lookAt(0, 0, 0);

const clock = new THREE.Clock();

/*
const axesHelper = new THREE.AxesHelper( 10 );
scene.add( axesHelper );
*/

const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

/*const light = new THREE.AmbientLight( 0xFFFFFF, 1 ); // soft white light
scene.add( light );*/

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 10 );
scene.add( light );


const dirLight1 = new THREE.DirectionalLight( 0xffffff, 0.6);
dirLight1.position.set( 1, 0, 0 );
scene.add( dirLight1 );

gui.add(settings, 'textVisible').name(`Text`).onChange(() => changeVisibility());
gui.add(settings, 'gridVisible').name(`Grid`).onChange(() => {
  gridHelper.visible = settings.gridVisible;
});
gui.add(dirLight1, 'intensity', 0, 1).name(`Intensity Dir Light`);




const spotLight = new THREE.SpotLight(0xffffff, 6, 25, -Math.PI / 6);
spotLight.position.set(-1, 3, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

gui.add(spotLight, 'intensity', 0, 10).name(`Spot Int`);
gui.add(spotLight.position, 'y', 2, 5).name(`Spot Y`);

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

      object = gltf.scene;

      object.scale.set(scale, scale, scale);
      object.rotation.setFromVector3(new THREE.Vector3(0, Math.PI/2, 0))

      object.castShadow = true;
      object.receiveShadow = true;

      object.traverse((o) => {
        if (o.isMesh) {

          if (o.name === 'Cube002_1') subObject = o;
          gui.add(o.material, 'metalness', 0, 1).name(`Metalness ${o.name}`);

       /*   o.material.reflectivity = 1;
          o.material.metalness = 1;
          o.material.envMapIntensity = 0.8;
          o.material.roughness = 0.15
          o.material.needsUpdate = true;*/
        }
      });

      mixer = new THREE.AnimationMixer(gltf.scene);

      gltf.animations.forEach((clip) => {
        clipDuration = clip.duration;
        console.log('clipDuration -->', clipDuration);

        const animAction = mixer.clipAction(clip);
        //animAction.loop = THREE.LoopRepeat;
        animAction.loop = THREE.LoopRepeat;
        //animAction.timeScale = 1;

        animAction.play();

      });

      scene.add(object);

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

let direction = 1;


let animate = function () {
  requestAnimationFrame(animate);




  if (object && mixer) {
    if (mixer.time > 0.8) {

      object.rotation.y += clock.getDelta();
    } else {
      object.rotation.y = THREE.MathUtils.degToRad(90)
    }


  }


  renderer.render(scene, camera);

  //const a = object.getObjectByName('Cylinder005');


};

animate();

let oldValue = 0;


window.addEventListener('load', function (e) {


  totalScrollHeight = window.document.documentElement.scrollHeight - window.innerHeight;
});

window.addEventListener('scroll', function (e) {


/*
  if (camera.position.y <= 0) {
    direction = 1;
  } else if (camera.position.y >= 2) {
    direction = -1
  }*/

const offset = window.pageYOffset;


  camera.position.y = THREE.MathUtils.mapLinear(offset, 0, totalScrollHeight, 0, 2);
  camera.lookAt(0, camera.position.y * 0.5, 0);
  camera.updateProjectionMatrix();


  subObject.rotateX(offset * 0.01);



  //let newValue = window.pageYOffset;

/*   const diff = (newValue / totalScrollHeight) * 3;
    console.log('diff -->', diff);


    camera.position.y = -0.5 + diff;
    camera.lookAt(0, 0.5 - (diff * 0.1), 0)*/

  //mixer.update((newValue - oldValue) / 1000);
  //oldValue = newValue;
 /* const time = (window.pageYOffset / totalScrollHeight) * clipDuration;
  console.log('time -->', time);*/
  mixer.setTime(THREE.MathUtils.mapLinear(offset, 0, totalScrollHeight, 0, clipDuration-0.0001));
});

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

