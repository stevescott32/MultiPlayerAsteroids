// ------------------------------------------------------------------
//
// Nodejs module that represents the model for an asteroid.
//
// ------------------------------------------------------------------
'use strict';

let random = require ('./random');
let Asteroid = require('./asteroid');

//------------------------------------------------------------------
//
// Public function used to initially create a newly connected player
// at some random location.
//
//------------------------------------------------------------------
function createAsteroidManager() {
  let asteroids = [];
  let accumulatedTime = 0;

  function generateBrokenAsteroid(x, y, sizeCategory) {
    return Asteroid.create({
      center: { x: x, y: y },
      sizeCategory: sizeCategory,
    });
  }

  function generateNewAsteroid() {
    let sizeCategory = Math.ceil(Math.random() * 3);
    let center = {
      x: random.nextDouble(),
      y: random.nextDouble()
    }

    return Asteroid.create({
      center: center,
      sizeCategory: sizeCategory
    });
  }

  function populateAstroids(elapsedTime) {
    // if the script has been paused by the browser or something, 
    // we don't want to create a wall of astroids from all directions 
    if (accumulatedTime > 2 * managerSpec.interval * 1000) {
      accumulatedTime = 2 * managerSpec.interval * 1000;
    }
    // if we didn't generate an asteroid recently, make one 
    if (accumulatedTime > managerSpec.interval * 1000) {
      accumulatedTime -= managerSpec.interval * 1000;

      if(asteroids.length < managerSpec.maxAsteroids) {
        asteroids.push(generateNewAsteroid());
      }
    }
    else {
      accumulatedTime += elapsedTime;
    }
  }

  function explode(asteroid, particleSystemManager) {
    asteroid.isDead = true;
    particleSystemManager.createAsteroidBreakup(asteroid)
    if (asteroid.size.sizeCategory > 1) {
      let numToGenerate = 3 + (3 % asteroid.size.sizeCategory);
      for (let a = 0; a < numToGenerate; a++) {
        asteroids.push(generateBrokenAsteroid(asteroid.center.x, asteroid.center.y, asteroid.size.sizeCategory - 1));
      }
    }
    if(!disableAudio) {
      let audio = new Audio(managerSpec.audioSrc);
      audio.volume = 0.3;
      audio.play(); 
    }
  }


  /// move asteroids according to speed and the elapsed time 
  function update(elapsedTime) {
    // remove dead asteroids
    asteroids = asteroids.filter( asteroid => !asteroid.isDead); 

    populateAstroids(elapsedTime);
    for (let a = 0; a < asteroids.length; a++) {
      let asteroid = asteroids[a];
      asteroid.center.x += asteroid.xSpeed * elapsedTime / 1000;
      asteroid.center.y += asteroid.ySpeed * elapsedTime / 1000;
      asteroid.rotation += asteroid.rotationSpeed * elapsedTime / 1000;

      /*
      if(asteroid.center.x + asteroid.radius < 0) 
      {
          asteroid.center.x = Game.graphics.canvas.width + asteroid.radius; 
      }
      else if(asteroid.center.x - asteroid.radius > Game.graphics.canvas.width) {
          asteroid.center.x = 0 - asteroid.radius; 
      }
      else if(asteroid.center.y + asteroid.radius < 0) 
      {
          asteroid.center.y = Game.graphics.canvas.height + asteroid.radius; 
      }
      else if(asteroid.center.y - asteroid.radius > Game.graphics.canvas.height) {
          asteroid.center.y = 0 - asteroid.radius; 
      }
      */
    }
  }

  function startGame() {
    asteroids = [];
    accumulatedTime = 0;
    for(let i = 0; i  < 15; i ++) {
      asteroids.push(generateNewAsteroid()); 
    }
  }

  let api = {
    update: update,
    startGame: startGame,
    explode, explode,
    get image() { return image; },
    get asteroids() { return asteroids; },
  };

  return api;
}

module.exports.create = () => createAsteroidManager(); 
