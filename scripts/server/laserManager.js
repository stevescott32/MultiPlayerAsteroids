// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a laser.
//
// ------------------------------------------------------------------
'use strict';


let Laser = require('./laser');


function createLaserManager(managerSpec) {
  let laserArray = [];
  let accumulatedTime = 0; 
  let fireRate = 500;
  let fire = true;


  function generateNewLaser(x,y,rotation) {
    let position = {
      x:  x,
      y:  y,
    }
    
    if(fire === true)
    {
      fire = false;
      accumulatedTime = 0;
      laserArray.push(Laser.create({
        position: position,
        rotation: rotation,
      }));
    }
     
  }



  /// move lasers according to speed and the elapsed time 
  function update(elapsedTime) {
    // remove dead lasers
    accumulatedTime += elapsedTime;
    if (accumulatedTime > fireRate)
    {
      fire = true;
    }
    laserArray = laserArray.filter( laser => !laser.isDead); 

    for (let a = 0; a < laserArray.length; a++) {
      let laser = laserArray[a];
      laser.position.x += laser.velocity.x * elapsedTime;
      laser.position.y += laser.velocity.y * elapsedTime;

      if(laser.position.x < 0 || laser.position.y < 0 
        || laser.position.x > managerSpec.worldSize.width
        || laser.position.y > managerSpec.worldSize.height) {
        laser.isDead = true; 
      }
    }
  }

  function startGame() {
    laserArray = [];
    accumulatedTime = 0;
  }

  let api = {
    update: update,
    startGame: startGame,
    generateNewLaser: generateNewLaser,
    get image() { return image; },
    get accumulatedTime(){return accumulatedTime},
    get fireRate(){return fireRate},
    get laserArray() { return laserArray; },
  };

  return api;
}

module.exports.create = (spec) => createLaserManager(spec); 