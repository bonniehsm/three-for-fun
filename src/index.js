(function(){
  //main variables
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

})();
