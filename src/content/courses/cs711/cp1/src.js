window.onload = function () {
  var scene = new THREE.Scene();
  var renderer = new THREE.WebGLRenderer({
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

  var inputs = {
    cameraPosX: $('camera-pos-x'),
    cameraPosY: $('camera-pos-y'),
    cameraPosZ: $('camera-pos-z'),
    cameraFOV: $('camera-fov'),
    cameraLookX: $('camera-look-x'),
    cameraLookY: $('camera-look-y'),
    cameraLookZ: $('camera-look-z'),
    sphere1PosX: $('sphere-1-x'),
    sphere1PosY: $('sphere-1-y'),
    sphere1PosZ: $('sphere-1-z'),
    sphere2PosX: $('sphere-2-x'),
    sphere2PosY: $('sphere-2-y'),
    sphere2PosZ: $('sphere-2-z'),
    lightPosX: $('light-x'),
    lightPosY: $('light-y'),
    lightPosZ: $('light-z'),
    sphere1Radius: $('sphere-1-radius'),
    sphere2Radius: $('sphere-2-radius'),
    floorWidth: $('floor-width'),
    floorLength: $('floor-length'),
    targetOpacity: $('target-opacity')
  };

  var sphere1Mat = new THREE.MeshPhongMaterial({
    color: 'red',
    shininess: 60
  });
  var sphere2Mat = new THREE.MeshPhongMaterial({
    color: 'green',
    shininess: 60
  });
  var floorMat = new THREE.MeshPhongMaterial({
    color: 'blue',
    shininess: 60
  });

  var light = new THREE.PointLight(0xffffff);

  renderer.setSize(375, 225);
  // renderer.setClearColor(0xffffff, 1);
  document
    .getElementsByClassName('canvas-container')[0]
    .appendChild(renderer.domElement);

  linkInputToNumber(inputs.cameraPosX, options, 'cameraPosX', render);
  linkInputToNumber(inputs.cameraPosY, options, 'cameraPosY', render);
  linkInputToNumber(inputs.cameraPosZ, options, 'cameraPosZ', render);
  linkInputToNumber(inputs.cameraFOV, options, 'cameraFOV', render);
  linkInputToNumber(inputs.cameraLookX, options, 'cameraLookX', render);
  linkInputToNumber(inputs.cameraLookY, options, 'cameraLookY', render);
  linkInputToNumber(inputs.cameraLookZ, options, 'cameraLookZ', render);
  linkInputToNumber(inputs.sphere1PosX, options, 'sphere1PosX', render);
  linkInputToNumber(inputs.sphere1PosY, options, 'sphere1PosY', render);
  linkInputToNumber(inputs.sphere1PosZ, options, 'sphere1PosZ', render);
  linkInputToNumber(inputs.sphere2PosX, options, 'sphere2PosX', render);
  linkInputToNumber(inputs.sphere2PosY, options, 'sphere2PosY', render);
  linkInputToNumber(inputs.sphere2PosZ, options, 'sphere2PosZ', render);
  linkInputToNumber(inputs.lightPosX, options, 'lightPosX', render);
  linkInputToNumber(inputs.lightPosY, options, 'lightPosY', render);
  linkInputToNumber(inputs.lightPosZ, options, 'lightPosZ', render);
  linkInputToNumber(inputs.sphere1Radius, options, 'sphere1Radius', render);
  linkInputToNumber(inputs.sphere2Radius, options, 'sphere2Radius', render);
  linkInputToNumber(inputs.floorWidth, options, 'floorWidth', render);
  linkInputToNumber(inputs.floorLength, options, 'floorLength', render);
  linkInputToNumber(inputs.targetOpacity, options, 'targetOpacity', render);

  function render() {
    var camera = new THREE.PerspectiveCamera(
      options.cameraFOV, 15 / 9, 0.1, 100
    );

    var sphere1Geo = new THREE.SphereGeometry(options.sphere1Radius, 32, 32);
    var sphere2Geo = new THREE.SphereGeometry(options.sphere2Radius, 32, 32);
    var floorGeo = new THREE.PlaneGeometry(
      options.floorWidth, options.floorLength, 1, 1
    );

    var sphere1Mesh = new THREE.Mesh(sphere1Geo, sphere1Mat);
    var sphere2Mesh = new THREE.Mesh(sphere2Geo, sphere2Mat);
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);

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
    scene.add(new THREE.AmbientLight(0x404040));

    renderer.render(scene, camera);
    renderer.domElement.style.opacity = (1 - options.targetOpacity);
  }

  render();
};