import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 500 );
// const camera = new THREE.OrthographicCamera(1000,-1000 ,1000, -1000 , 1, 1000);
const light = new THREE.DirectionalLight(0x0000f0, 10);
light.position.set(0,0,30);
// light.target.mesh(cube);
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 2, 2, 2 );
const material = new THREE.MeshBasicMaterial( { color: 0xfff000  } );
const material1 = new THREE.MeshBasicMaterial( { color: 0x000fff } );
const cube = new THREE.Mesh( geometry, material );

const cube2 = new THREE.Mesh(geometry, material1);
cube.position.x = -2.5;
cube2.position.x +=2.5;
scene.add(cube);

scene.add(cube2);

camera.position.z = 25;
camera.position.x = -5;
camera.position.y = 5;
camera.updateProjectionMatrix;
function animate() {
	requestAnimationFrame( animate );

	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;
	cube.translateX(0.01);
	
	cube2.translateX(-0.01);
	//cube2.rotation.x += 0.01;
	//cube2.rotation.y += 0.01;
	renderer.render( scene, camera );
}

import WebGL from 'three/addons/capabilities/WebGL.js';

if ( WebGL.isWebGLAvailable() ) {

	// Initiate function or other initializations here
	animate();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}