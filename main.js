import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
/* const textureLoader = new THREE.TextureLoader() */


/* const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
]) */

/**
 * Test sphere
 */
/* const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
sphere.castShadow = true
sphere.position.y = 0.5
scene.add(sphere) */

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        /* envMap: environmentMapTexture,
        envMapIntensity: 0.5 */
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/* 
Test cube
*/

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const material2 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const cube = new THREE.Mesh( geometry, material );

const cube2 = new THREE.Mesh( geometry, material2 );
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    cube.translateX(0.001)
    cube2.translateX(-0.001)

    console.log(gjk(cube, cube2))

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


/* const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );

const cube2 = new THREE.Mesh( geometry, material ); */

function gjk(shape1, shape2) {
    let centre1 = find_centre(shape1);
    let centre2 = find_centre(shape2);
    let d = subvec(centre1, centre2);
   /*  console.log(centre1, centre2); */
    let simplex = [support(shape1, shape2, d)];
    /* console.log(simplex[0]); */
    let origin = new THREE.Vector3(0, 0, 0);
    d = subvec(origin, simplex[0]);
    /* console.log(d); */
    while (1) {
      let A = support(shape1, shape2, d);
      /* console.log(A); */
      if (A.dot(d) < 0) {
        return false;
      }
      simplex.push(A);
      let obj = { simplex1: simplex, d1: d };
      if (handleSimplex(obj)) {
        return true;
      }
    }
  }
  
  function find_centre(shape) {
    const geometry1 = shape.geometry;
    const positionAttribute1 = geometry1.attributes;
    const vertices1 = positionAttribute1.position.array;
    const numVertices1 = vertices1.length;
    let newx = 0,
      newy = 0,
      newz = 0;
    for (let i = 0; i < numVertices1; i += 3) {
      newx += vertices1[i];
      newy += vertices1[i + 1];
      newz += vertices1[i + 2];
    }
    let centre = new THREE.Vector3(
      (newx * 3) / numVertices1,
      (newy * 3) / numVertices1,
      (newz * 3) / numVertices1
    );
    return centre;
  }
  
  function support(shape1, shape2, direction) {
    let origin = new THREE.Vector3(0, 0, 0);
    let farthestPointShape1 = getFarthestPoint(shape1, direction);
    let farthestPointShape2 = getFarthestPoint(shape2, subvec(origin, direction));
    return subvec(farthestPointShape1, farthestPointShape2);
  }

  function getFarthestPoint(shape, direction) {
    const geometry = shape.geometry;
    const positionAttribute = geometry.getAttribute("position");
    const vertices = positionAttribute.array;
    const numVertices = vertices.length;
  
    if (numVertices === 0) {
      return null; // No vertices in the shape
    }
    let newvertex = new THREE.Vector3(vertices[0], vertices[1], vertices[2]);
    let farthestPoint = new THREE.Vector3();
    farthestPoint.copy(newvertex).applyMatrix4(shape.matrixWorld);
    let maxProjection = farthestPoint.dot(direction);
  
    for (let i = 3; i < numVertices; i += 3) {
      let newvertex = new THREE.Vector3(
        vertices[i],
        vertices[i + 1],
        vertices[i + 2]
      );
      let vertex = new THREE.Vector3();
      vertex.copy(newvertex).applyMatrix4(shape.matrixWorld);
      let projection = vertex.dot(direction);
      if (projection > maxProjection) {
        farthestPoint = vertex;
        maxProjection = projection;
      }
    }
    /* console.log(shape, farthestPoint, direction); */
    return farthestPoint;
  }
  
  function handleSimplex(obj) {
    if (obj.simplex1.length == 2) {
      return linearsimplex(obj);
    }
    return triangularsimplex(obj);
  }
  
  function linearsimplex(obj) {
    let a = obj.simplex1[1];
    let b = obj.simplex1[0];
    let origin = new THREE.Vector3(0, 0, 0);
    let ab = subvec(b, a);
    let ao = subvec(origin, a);
    let temp = vectortripleprod(ab, ao, ab);
    obj.simplex1.push(temp);
    obj.d1 = ab;
    return false;
  }
  
  function triangularsimplex(obj) {
    let simplex = obj.simplex1;
    let origin = new THREE.Vector3(0, 0, 0);
    let d = obj.d1;
    let c = simplex[0];
    let b = simplex[1];
    let a = simplex[2];
    let ab = subvec(b, a);
    let ac = subvec(c, a);
    let ao = subvec(origin, a);
    let abperp = vectortripleprod(ac, ab, ab);
    let acperp = vectortripleprod(ab, ac, ac);
  
    if (abperp.dot(ao) > 0) {
      //origin is in region ab
      simplex[0] = b;
      simplex[1] = a;
      d = abperp;
      obj.simplex1 = simplex;
      obj.d1 = d;
      return false;
    } else if (acperp.dot(ao) > 0) {
      //origin is in region ac
      simplex[0] = c;
      simplex[1] = a;
      d = acperp;
      obj.simplex1 = simplex;
      obj.d1 = d;
      return false;
    }
  
    return true;
  }
  
  function subvec(vec1, vec2) {
    let dx = vec1.x - vec2.x;
    let dy = vec1.y - vec2.y;
    let dz = vec1.z - vec2.z;
    let d = new THREE.Vector3(dx, dy, dz).normalize();
    return d;
  }
  
  function vectortripleprod(vec1, vec2, vec3) {
    //returns (vec1xvec2)xvec3
    vec1.cross(vec2);
    vec1.cross(vec3);
    return vec1.normalize();
  }

 cube.position.y = 0.5;
cube2.position.x = 2;
cube2.position.y = 0.5;
scene.add(cube);
scene.add(cube2);

let pos = geometry.attributes.position;
let vertex = new THREE.Vector3( pos.getX(0), pos.getY(0), pos.getZ(0) );

let vertex2 = new THREE.Vector3( pos.getX(0), pos.getY(0), pos.getZ(0) );

/* cube.localToWorld(vertex); */

cube.localToWorld(vertex);

cube2.localToWorld(vertex2);
console.log(vertex);

console.log(vertex2)

var verts = geometry.attributes.position;

var verts2 = geometry.attributes.position;

console.log(verts)


