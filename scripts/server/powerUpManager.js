// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a laser.
//
// ------------------------------------------------------------------
'use strict';

let random = require('./random')
let PowerUp = require('./powerUp');


function createPowerUpManager(managerSpec) {


  let timeOnScreen = 0;
  let accumulatedTime = 0;  
  let currentPowerUp = {};
  let powerUpAvailable = false;
  let powerUpArray = ['Shield', 'Guided Lasers']
  function createPowerUp(x,y, type) {
    let position = {
      x:  x,
      y:  y,
    }
    
    {
        currentPowerUp = PowerUp.create({
        position: position,
        type: type
      });
    }
  }

  /// move lasers according to speed and the elapsed time 
  function update(elapsedTime) {
   accumulatedTime += elapsedTime;
   if (accumulatedTime > managerSpec.interval)
    {
      powerUpAvailable = true;
    }
  }

  function startGame() {
    currentPowerUp = {};
    accumulatedTime = 0;
  }

  let api = {
    update: update,
    startGame: startGame,
    createPowerUp: createPowerUp,
    get accumulatedTime(){return accumulatedTime},
    set accumulatedTime(value){return accumulatedTime = value},
    get currentPowerUp() { return currentPowerUp; },
    get type(){ return type},
    get powerUpAvailable(){return powerUpAvailable},
    set powerUpAvailable(value){return powerUpAvailable = value},
    get powerUpArray(){return powerUpArray},
    get timeOnScreen(){return timeOnScreen},
    set timeOnScreen(value){return timeOnScreen = value}
  };

  return api;
}

module.exports.create = (spec) => createPowerUpManager(spec); 