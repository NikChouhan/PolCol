import * as THREE from "three";

let camera, scene, renderer;

init();
render();

function init() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.z = 2;

  scene = new THREE.Scene();

  const vertices = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0];
  // const vertices1 = [0, -1.2, 0, 1, -1.2, 0, 1, -0.2, 0, 0, -0.2, 0];
  // const vertices1 = [0.8, -0.8, 0, 1.8, -0.8, 0, 1.8, 0.2, 0, 0.8, 0.2, 0];
  // const vertices1 = [1, -1, 0, 1, -1, 0, 2, 0, 0, 1, 0, 0];
  const vertices1 = [0.8, -0.8, 0, 1.8, -0.8, 0, 1.8, -0.2, 0, 0.8, -0.2, 0];

  const material = new THREE.MeshBasicMaterial({ color: 0xfff000 });
  const material1 = new THREE.MeshBasicMaterial({ color: 0x000fff });

  const myshape = createQuad(vertices, material1);
  scene.add(myshape);

  const shape2 = createQuad(vertices1, material);
  scene.add(shape2);

  //   let direction = new THREE.Vector3(1,0,1);
  //   console.log(getFarthestPoint(myshape,direction));

  console.log(gjk(myshape, shape2));

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function render() {
  renderer.render(scene, camera);
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
  console.log(shape, farthestPoint, direction);
  return farthestPoint;
}

function createQuad(vertices, material) {
  const geometry = new THREE.BufferGeometry();
  const indices = [
    0,
    1,
    2, // first triangle
    2,
    3,
    0, // second triangle
  ];
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  const myshape = new THREE.Mesh(geometry, material);
  return myshape;
}

function gjk(shape1, shape2) {
  let centre1 = find_centre(shape1);
  let centre2 = find_centre(shape2);
  let d = subvec(centre1, centre2);
  console.log(centre1, centre2);
  let simplex = [support(shape1, shape2, d)];
  console.log(simplex[0]);
  let origin = new THREE.Vector3(0, 0, 0);
  d = subvec(origin, simplex[0]);
  console.log(d);
  while (1) {
    let A = support(shape1, shape2, d);
    console.log(A);
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
  const positionAttribute1 = geometry1.getAttribute("position");
  const vertices1 = positionAttribute1.array;
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

function support(shape1, shape2, d) {
  var dir = d.clone().normalize();

  var p1 = getFarthestPoint(shape1, dir);
  var p2 = getFarthestPoint(shape2, dir.negate());

  return p1.clone().sub(p2);
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
  let abperp = vectortripleprod(ab, ac, ab);
  let acperp = vectortripleprod(ac, ab, ac);

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
