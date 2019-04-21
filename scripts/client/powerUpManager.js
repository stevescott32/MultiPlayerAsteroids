

MyGame.components.PowerUpManager = function (managerSpec) {
    'use strict';
    let powerUpAvailable = false;
    let image = new Image();
    let imageReady = false;
    image.onload = function () {
      imageReady = true;
    };
    image.src = managerSpec.imageSrc;
    console.log(image.src);
  

    let currentPowerUP = {};
    let accumulatedTime = 0;
  
    /// move asteroids according to speed and the elapsed time 
    function update(elapsedTime) {
      // remove dead asteroids
      //let laser = laserArray.filter(laser => !laser.isDead);
      accumulatedTime += elapsedTime;
      if (accumulatedTime > managerSpec.interval)
      {
        powerUpAvailable = true;
      }
    }

    // create a new laser at the specified location
    function generatePowerUp(x,y,type) {
        //console.log(x);
        //console.log(y);
        //console.log(rotation);
        // let position = {
        //   x:  x,
        //   y:  y,
        // }
    
        // if(powerUpAvailable === true)
        // {
        //     powerUpAvailable = false;
        //     accumulatedTime = 0;
        //     currentPowerUP =  MyGame.components.PowerUp.createPowerUp({
        //       position: position,
        //       type: type,
        //     });
        // }
      }
  
    function startGame() {
      currentPowerUP = {};
      accumulatedTime = 0;
    }
  
    let api = {
      update: update,
      startGame: startGame,
      generatePowerUp: generatePowerUp,
      get imageReady() { return imageReady; },
      get image() { return image; },
      get currentPowerUP() { return currentPowerUP; },
      get accumulatedTime(){return accumulatedTime},
      get powerUpAvailable(){ return powerUpAvailable},
      set powerUpAvailable(value){return powerUpAvailable = value},
      set currentPowerUP(inPowerUp) { currentPowerUP = inPowerUp;  }
    };
  
    return api;
  }