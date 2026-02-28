import * as THREE from "three";

export function getBrick(inex, number) {
  let mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xff0000 }),
  );

  return mesh;
}
