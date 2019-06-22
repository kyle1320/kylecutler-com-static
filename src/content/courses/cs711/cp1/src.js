import {
  Scene,
  WebGLRenderer,
  MeshPhongMaterial,
  PointLight,
  PerspectiveCamera,
  SphereGeometry,
  PlaneGeometry,
  Mesh,
  AmbientLight } from 'three';
import { $, linkAll } from '../../../experiments/util';

window.onload = function () {
  var scene = new Scene();
  var renderer = new WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });

  var options = {
    sphere1Radius: 1.2,
    sphere2Radius: 1.2,
    floorWidth: 15,
    floorLength: 24,
    cameraPosX: -3.3,
    cameraPosY: 3,
    cameraPosZ: 12,
    cameraFOV: 45,
    cameraLookX: -4,
    cameraLookY: 0,
    cameraLookZ: -21,
    sphere1PosX: -3.6,
    sphere1PosY: 3.1,
    sphere1PosZ: 7.2,
    sphere2PosX: -1.8,
    sphere2PosY: 2.2,
    sphere2PosZ: 5.3,
    lightPosX: -5.4,
    lightPosY: 14,
    lightPosZ: 18,
    targetOpacity: 0
  };

  var sphere1Mat = new MeshPhongMaterial({
    color: 'red',
    shininess: 60
  });
  var sphere2Mat = new MeshPhongMaterial({
    color: 'green',
    shininess: 60
  });
  var floorMat = new MeshPhongMaterial({
    color: 'blue',
    shininess: 60
  });

  var light = new PointLight(0xffffff);

  renderer.setSize(375, 225);
  document
    .getElementsByClassName('canvas-container')[0]
    .appendChild(renderer.domElement);

  linkAll(options, {
    cameraPosX:    [ $('camera-pos-x'), render ],
    cameraPosY:    [ $('camera-pos-y'), render ],
    cameraPosZ:    [ $('camera-pos-z'), render ],
    cameraFOV:     [ $('camera-fov'), render ],
    cameraLookX:   [ $('camera-look-x'), render ],
    cameraLookY:   [ $('camera-look-y'), render ],
    cameraLookZ:   [ $('camera-look-z'), render ],
    sphere1PosX:   [ $('sphere-1-x'), render ],
    sphere1PosY:   [ $('sphere-1-y'), render ],
    sphere1PosZ:   [ $('sphere-1-z'), render ],
    sphere2PosX:   [ $('sphere-2-x'), render ],
    sphere2PosY:   [ $('sphere-2-y'), render ],
    sphere2PosZ:   [ $('sphere-2-z'), render ],
    lightPosX:     [ $('light-x'), render ],
    lightPosY:     [ $('light-y'), render ],
    lightPosZ:     [ $('light-z'), render ],
    sphere1Radius: [ $('sphere-1-radius'), render ],
    sphere2Radius: [ $('sphere-2-radius'), render ],
    floorWidth:    [ $('floor-width'), render ],
    floorLength:   [ $('floor-length'), render ],
    targetOpacity: [ $('target-opacity'), render ]
  });

  function render() {
    var camera = new PerspectiveCamera(
      options.cameraFOV, 15 / 9, 0.1, 100
    );

    var sphere1Geo = new SphereGeometry(options.sphere1Radius, 32, 32);
    var sphere2Geo = new SphereGeometry(options.sphere2Radius, 32, 32);
    var floorGeo = new PlaneGeometry(
      options.floorWidth, options.floorLength, 1, 1
    );

    var sphere1Mesh = new Mesh(sphere1Geo, sphere1Mat);
    var sphere2Mesh = new Mesh(sphere2Geo, sphere2Mat);
    var floorMesh = new Mesh(floorGeo, floorMat);

    camera.position.set(
      options.cameraPosX, options.cameraPosY, options.cameraPosZ
    );
    camera.lookAt(
      options.cameraLookX, options.cameraLookY, options.cameraLookZ
    );

    sphere1Mesh.position.set(
      options.sphere1PosX, options.sphere1PosY, options.sphere1PosZ
    );
    sphere2Mesh.position.set(
      options.sphere2PosX, options.sphere2PosY, options.sphere2PosZ
    );
    floorMesh.position.set(0, 0, 0);
    floorMesh.rotation.x = -Math.PI / 2;
    light.position.set(options.lightPosX, options.lightPosY, options.lightPosZ);

    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    scene.add(sphere1Mesh);
    scene.add(sphere2Mesh);
    scene.add(floorMesh);
    scene.add(light);
    scene.add(new AmbientLight(0x404040));

    renderer.render(scene, camera);
    renderer.domElement.style.opacity = (1 - options.targetOpacity);
  }

  render();
};