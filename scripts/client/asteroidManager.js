// ------------------------------------------------------------------
//
//
// ------------------------------------------------------------------
MyGame.components.AsteroidManager = function (managerSpec) {
  'use strict';

  let image = new Image();
  let imageReady = false;
  image.onload = function () {
    imageReady = true;
  };
  image.src = managerSpec.imageSrc;

  //------------------------------------------------------------------
  //
  // Public function used to initially create a newly connected player
  // at some random location.
  //
  //------------------------------------------------------------------
  let asteroids = [];
  let accumulatedTime = 0;

  /// move asteroids according to speed and the elapsed time 
  function update(elapsedTime) {
    // remove dead asteroids
    asteroids = asteroids.filter(asteroid => !asteroid.isDead);

    for (let a = 0; a < asteroids.length; a++) {
      let asteroid = asteroids[a];
      asteroid.position.x += asteroid.velocity.x * elapsedTime;
      asteroid.position.y += asteroid.velocity.y * elapsedTime;
      asteroid.rotation += asteroid.rotationSpeed * elapsedTime;
    }
  }

  function startGame() {
    asteroids = [];
    accumulatedTime = 0;
  }

  let api = {
    update: update,
    startGame: startGame,
    get imageReady() { return imageReady; },
    get image() { return image; },
    get asteroids() { return asteroids; },
    set asteroids(inAsteroids) { asteroids = inAsteroids;  }
  };

  return api;
}
