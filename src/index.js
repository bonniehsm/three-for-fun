(function(){
  //Main variables
  let scene,
      renderer,
      camera,
      model,
      neck,
      waist,
      possibleAnims,
      mixer,
      idle,
      clock = new THREE.Clock(),
      currentlyAnimating = false,
      raycaster = new THREE.Raycaster(),    //detect click on the character (model)
      loaderAnim = document.getElementById('js-loader');

      init();

      function init(){
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const MODEL_PATH = proxyUrl + 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
        const canvas = document.querySelector('#c');
        const backgroundColor = 0xf1f1f1; //threejs references colours in a hexadecimal integer

        /** Initialize scene **/

        scene = new THREE.Scene();
        scene.background = new THREE.Color(backgroundColor);
        //not that visible, but if floor and background are different, it can come in handy to blur those together
        scene.fog = new THREE.Fog(backgroundColor, 60, 100);

        /** Initialize the renderer **/

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        //enable shadowMap so character will cast a shadow
        renderer.shadowMap.enabled = true;
        //set pixel ratio to that of device so mobile devices render correctly (otherwise canvas will display pixelated on high density screens))
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        /** Load Texture **/
        const TEXTURE_PATH = proxyUrl+'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg';
        let stacy_txt = new THREE.TextureLoader().load(TEXTURE_PATH);
        stacy_txt.flipY = false;
        const stacy_mtl = new THREE.MeshPhongMaterial({
          map: stacy_txt,
          color: 0xffffff,
          skinning: true
        });

        /** Create Loader **/
        var loader = new THREE.GLTFLoader();
        loader.load(  //model path, callback functions: i) once model is loaded, ii) during loading, iii) catch errors
          MODEL_PATH,
          function(gltf){
            model = gltf.scene;
            let fileAnimations = gltf.animations;
            //find all meshes and enable the ability to cast and receive shadows
            model.traverse(o => {
              o.castShadow = true;
              o.receiveShadow = true;
              o.material = stacy_mtl;
              //reference the neck and waist bones
              if(o.isBone && o.name === 'mixamorigSpine'){
                waist = o;
              }
              if(o.isBone && o.name === 'mixamorigNeck'){
                neck = o;
              }
            });
            //set the model's initial scale
            model.scale.set(7, 7, 7);
            model.position.y = -11;
            scene.add(model);
            loaderAnim.remove();
            //set up animations
            mixer = new THREE.AnimationMixer(model);
            let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');

            //splice the animation tracks for neck and waist
            idleAnim.tracks.splice(3, 3); //waist tracks indices: 3, 4, 5
            idleAnim.tracks.splice(9, 3); //neck tracks indices: 12, 13, 14* (becomes 9, 10, 11 after waist tracks are spliced)

            idle = mixer.clipAction(idleAnim);
            idle.play();
          },
          undefined,  //don't need this function
          function(error){
            console.error(error);
          }
        );

        /** Add camera **/

        camera = new THREE.PerspectiveCamera(
          //fov, aspect ratio, near and far clipping plane
          50,
          window.innerWidth/window.innerHeight,
          0.1,
          1000
        );
        //position 30 units back
        camera.position.z = 30;
        camera.position.x = 0;
        //position 3 units down
        camera.position.y = -3;

        /** Add lights **/

        //set hemisphere light to white light and at intensity 0.61
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
        //set position to 50 units above our center point
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);

        //set directional light
        let d = 8.25;
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
        dirLight.position.set(-8, 12, 8);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1500;
        dirLight.shadow.camera.left = d * -1;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = d * -1;
        scene.add(dirLight);

        /** Add floor **/

        let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
        let floorMaterial = new THREE.MeshPhongMaterial({
          color: 0xeeeeee,
          shininess: 0
        });
        let floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -0.5 * Math.PI;  //90 degrees
        floor.receiveShadow = true;
        floor.position.y = -11;
        scene.add(floor);
      }

      /** Add Circle Accent **/

      let geometry = new THREE.SphereGeometry(8, 32, 32);
      let material = new THREE.MeshBasicMaterial({ color: 0x9bbffaf });
      let sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      sphere.position.z = -15;
      sphere.position.y = -3;
      sphere.position.x = -0.25;

      function update(){
        if(mixer){
          //tie animation to the clock rather than the frame rate
          mixer.update(clock.getDelta());
        }
        if(resizeRendererToDisplaySize(renderer)){
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(update);
      }
      update();

      function resizeRendererToDisplaySize(renderer){
        const canvas = renderer.domElement;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let canvasPixelWidth = canvas.width / window.devicePixelRatio;
        let canvasPixelHeight = canvas.height / window.devicePixelRatio;
        //check if renderer is the same size as the canvas
        const needResize = canvasPixelWidth != width || canvasPixelHeight != height;
        if(needResize){
          renderer.setSize(width, height, false);
        }
        return needResize;
      }

})();

document.addEventListener('mousemove', function(e){
  var mousecoords = getMousePos(e);
  if(neck && waist){
    moveJoint(mousecoords, neck, 50);
    moveJoint(mousecoords, waist, 30);
  }
});

function getMousePos(e){
  return {
    x: e.clientX,
    y: e.clientY
  };
};

function moveJoint(mouse, joint, degreeLimit){
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
  joint.rotation.y = THREE.Math.degToRad(degrees.x);
  joint.rotation.y = THREE.Math.degToRad(degrees.y);
}

/**
* This function determines where the mouse is on the screen
  in a percentage between the middle & each edge of the screen
* Params: x = x position of mouse
          y = y position of mouse
          degreeLimit = degree limit that join is allowed to move
*/
function getMouseDegrees(x, y, degreeLimit){
  let dx = 0,
      dy = 0,
      xdiff,
      xPercentage,
      ydiff,
      yPercentage;
  let w = { x: x.innerWidth, y: y.innerHeight };

  //Left (rotate neck left between 0 and -degreeLimit)
  if(x <= w.x/2){
    //get the difference between the middle of the screen and cursor position
    xdiff = w.x/2 - x;
    //find the percentage of that difference (percentage towards the edge of the screen)
    xPercentage = (xdiff/(w.x/2)) * 100;
    //convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  //Right (rotate neck right between 0 and degreeLimit)
  if(x >= w.x/2){
    xdiff = x - w.x/2;
    xPercentage = (xdiff/(w.x/2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  //Up (rotate neck up between 0 and -degreeLimit)
  if(y <= w.y/2){
    ydiff = w.y/2 - y;
    yPercentage = (ydiff/(w.y/2)) * 100;
    //cut degreeLimit to half when model looks up
    dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
  }
  //Down (rotate neck down between 0 and degreeLimit)
  if(y >= w.y/2){
    ydiff = y - w.y/2;
    yPercentage = (ydiff/(w.y/2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
}
