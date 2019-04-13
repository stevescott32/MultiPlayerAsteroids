let random = require ('./random');

let manager =  {
    imageSrc: "../assets/lasers/greenLaser.png",
        //audioSrc: 'resources/audio/coin10.wav',
        size: 0.9,
        speed: 0.015,
        interval: 1, // seconds
        maxLasers: 10,
}; 

function createLaser(laser) {

    // larger asteroids rotate more slowely 
    let sign = Math.pow(-1, Math.floor(Math.random() * 2)); // returns 1 or negative one 
    let rotationSpeed = sign * Math.PI * speed / (asteroidSpec.sizeCategory * managerSpec.minSize);

    let rotation = Math.random() * Math.PI * 2;

    let newLaser = {
      position: {
        x: laser.position.x,
        y: laser.position.y
      },
      size: {
        height: manager.minSize * asteroidSpec.sizeCategory,
        width: managerSpec.minSize * asteroidSpec.sizeCategory,
        sizeCategory: asteroidSpec.sizeCategory
      },
      velocity: {
        x: Math.cos(rotation) * speed,
        y: Math.sin(rotation) * speed
      },
      radius: managerSpec.minSize * asteroidSpec.sizeCategory / 2,
      rotation: rotation,
      rotationSpeed: rotationSpeed,
      break: false,
      isDead: false
    };

    return asteroid;
  }