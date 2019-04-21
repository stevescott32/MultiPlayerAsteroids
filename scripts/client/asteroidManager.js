// ------------------------------------------------------------------
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

  function generateBrokenAsteroid(x, y, sizeCategory) {
    return MyGame.components.Asteroid.create({
      position: { x: x, y: y },
      sizeCategory: sizeCategory,
    });
  }

  function explode(asteroid, particleSystemManager) {
    asteroid.isDead = true;
    //console.log('Asteroid to explode: ', asteroid); 
    particleSystemManager.createAsteroidBreakup(asteroid)
    if (asteroid.size.sizeCategory > 1) {
      let numToGenerate = 3 + (3 % asteroid.size.sizeCategory);
      for (let a = 0; a < numToGenerate; a++) {
        asteroids.push(generateBrokenAsteroid(asteroid.position.x, asteroid.position.y, asteroid.size.sizeCategory - 1));
      }
    }
  }

  function startGame() {
    asteroids = [];
    accumulatedTime = 0;
  }

  let api = {
    update: update,
    startGame: startGame,
    explode: explode,
    get imageReady() { return imageReady; },
    get image() { return image; },
    get asteroids() { return asteroids; },
    set asteroids(inAsteroids) { asteroids = inAsteroids; }
  };

  return api;
};
