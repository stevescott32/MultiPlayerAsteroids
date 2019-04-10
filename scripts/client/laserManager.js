

MyGame.components.LaserManager = function (managerSpec) {
    'use strict';
  
    let image = new Image();
    let imageReady = false;
    image.onload = function () {
      imageReady = true;
    };
    image.src = managerSpec.imageSrc;
  

    let laserArray = [];
    let accumulatedTime = 0;
  
    /// move asteroids according to speed and the elapsed time 
    function update(elapsedTime) {
      // remove dead asteroids
      //let laser = laserArray.filter(laser => !laser.isDead);
  
      for (let a = 0; a < laserArray.length; a++) {
        let laser = laserArray[a];
        laser.position.x += laser.velocity.x * elapsedTime;
        laser.position.y += laser.velocity.y * elapsedTime;
      }
    }
    function generateNewLaser(x,y,rotation) {
        console.log(x);
        console.log(y);
        console.log(rotation);
        let position = {
          x:  x,
          y:  y,
        }
    
         laserArray.push(MyGame.components.Laser.createLaser({
          position: position,
          rotation: rotation,
        }));
      }
  
    function startGame() {
      laserArray = [];
      accumulatedTime = 0;
    }
  
    let api = {
      update: update,
      startGame: startGame,
      generateNewLaser: generateNewLaser,
      get imageReady() { return imageReady; },
      get image() { return image; },
      get laserArray() { return laserArray; },
      set laserArray(inLasers) { laserArray = inLasers;  }
    };
  
    return api;
  }