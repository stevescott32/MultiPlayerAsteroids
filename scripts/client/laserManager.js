

MyGame.components.LaserManager = function (managerSpec) {
    'use strict';
  
    let fireRate = 500;
    let fire = true;
    let image = new Image();
    let imageReady = false;
    image.onload = function () {
      imageReady = true;
    };
    image.src = "../assets/lasers/purpleBlob.png";
  

    let laserArray = [];
    let accumulatedTime = 0;
  
    /// move asteroids according to speed and the elapsed time 
    function update(elapsedTime) {
      // remove dead asteroids
      //let laser = laserArray.filter(laser => !laser.isDead);
      accumulatedTime += elapsedTime;
      for (let a = 0; a < laserArray.length; a++) {
        let laser = laserArray[a];
        laser.position.x += laser.velocity.x * elapsedTime;
        laser.position.y += laser.velocity.y * elapsedTime;

        let worldSize = MyGame.components.Viewport.worldSize; 
        if(laser.position.x < 0 || laser.position.y < 0 
          || laser.position.x > worldSize.width
          || laser.position.y > worldSize.height) {
          laser.isDead = true; 
        }
      }
    }

    // create a new laser at the specified location
    function generateNewLaser(x,y,rotation) {
        //console.log(x);
        //console.log(y);
        //console.log(rotation);
        let position = {
          x:  x,
          y:  y,
        }
    
//        if(fire === true)
        {
            fire = false;
            accumulatedTime = 0;
            laserArray.push(MyGame.components.Laser.createLaser({
              position: position,
              rotation: rotation,
            }));
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
      get imageReady() { return imageReady; },
      get image() { return image; },
      get laserArray() { return laserArray; },
      get accumulatedTime(){return accumulatedTime},
      get fireRate(){ return fireRate},
      set laserArray(inLasers) { laserArray = inLasers;  }
    };
  
    return api;
  }