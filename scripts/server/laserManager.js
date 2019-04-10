// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a laser.
//
// ------------------------------------------------------------------
'use strict';

let random = require ('./random');
let Laser = require('./laser');


function createLaserManager(managerSpec) {
  let laserArray = [];
  let accumulatedTime = 0; 


  function generateNewLaser(x,y,rotation) {
    let position = {
      x:  x,
      y:  y,
    }

     laserArray.push(Laser.create({
      position: position,
      rotation: rotation,
    }));
  }



  /// move lasers according to speed and the elapsed time 
  function update(elapsedTime) {
    // remove dead lasers
    laserArray = laserArray.filter( laser => !laser.isDead); 

    for (let a = 0; a < laserArray.length; a++) {
      let laser = laserArray[a];
      laser.position.x += laser.velocity.x * elapsedTime;
      laser.position.y += laser.velocity.y * elapsedTime;

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
    get laserArray() { return laserArray; },
  };

  return api;
}

module.exports.create = (spec) => createLaserManager(spec); 