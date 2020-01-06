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

      function update(){
        renderer.render(scene, camera);
        requestAnimationFrame(update);
      }
      update();

      function resizeRendererToDisplaySize(renderer){
        
      }

})();