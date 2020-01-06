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
        const canvas = document.querySelector('c');
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
        camera.position.z = 30;
        camera.position.x = 0;
        camera.position.y = -3;

      }

})();
