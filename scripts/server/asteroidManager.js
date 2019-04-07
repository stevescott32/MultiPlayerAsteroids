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
function createAsteroidManager(managerSpec) {
  let asteroids = [];
  let accumulatedTime = 0;

  function generateBrokenAsteroid(x, y, sizeCategory) {
    return Asteroid.create({
      position: { x: x, y: y },
      sizeCategory: sizeCategory,
    });
  }

  function generateNewAsteroid() {
    let sizeCategory = Math.ceil(Math.random() * 3);
    let position = {
      x: random.nextDouble(),
      y: random.nextDouble()
    }

    return Asteroid.create({
      position: position,
      sizeCategory: sizeCategory
    });
  }

  function populateAstroids(elapsedTime) {
    // if the script has been paused by the browser or something, 
    // we don't want to create a wall of astroids from all directions 
/*    if (accumulatedTime > 2 * managerSpec.interval * 1000) {
      accumulatedTime = 2 * managerSpec.interval * 1000;
    }
    */
    // if we didn't generate an asteroid recently, make one 
    if (accumulatedTime > managerSpec.interval * 1000) {
      accumulatedTime -= managerSpec.interval * 1000;

      if(asteroids.length < managerSpec.maxAsteroids) {
        asteroids.push(generateNewAsteroid());
        console.log('Populating a new asteroid'); 
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
        asteroids.push(generateBrokenAsteroid(asteroid.position.x, asteroid.position.y, asteroid.size.sizeCategory - 1));
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
      asteroid.position.x += asteroid.velocity.x * elapsedTime;
      asteroid.position.y += asteroid.velocity.y * elapsedTime;
      asteroid.rotation += asteroid.rotationSpeed * elapsedTime;

      /*console.log('Updating asteroid at ' + asteroid.position.x + ': ' + asteroid.position.y + ': ' + 
      ' size ' + asteroid.size.height + ': ' + asteroid.size.width);*/

      /*
      if(asteroid.position.x + asteroid.radius < 0) 
      {
          asteroid.position.x = Game.graphics.canvas.width + asteroid.radius; 
      }
      else if(asteroid.position.x - asteroid.radius > Game.graphics.canvas.width) {
          asteroid.position.x = 0 - asteroid.radius; 
      }
      else if(asteroid.position.y + asteroid.radius < 0) 
      {
          asteroid.position.y = Game.graphics.canvas.height + asteroid.radius; 
      }
      else if(asteroid.position.y - asteroid.radius > Game.graphics.canvas.height) {
          asteroid.position.y = 0 - asteroid.radius; 
      }
      */
    }
  }

  function startGame() {
    asteroids = [];
    accumulatedTime = 0;
    for(let i = 0; i  < managerSpec.initialAsteroids; i ++) {
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

module.exports.create = (spec) => createAsteroidManager(spec); 
