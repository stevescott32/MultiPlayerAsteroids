
let random = require ('./random');

let managerSpec =  {
    imageSrc: "resources/images/asteroid.png",
        audioSrc: 'resources/audio/coin10.wav',
        maxSize: 0.9,
        minSize: 0.03, 
        maxSpeed: 0.00015,
        minSpeed: 0.00005,
        interval: 1, // seconds
        maxAsteroids: 12,
        initialAsteroids: 8,
}; 

function createAsteroid(asteroidSpec) {
    // speed follows gaussian distribution divided by the size 
    let speed = -1 * random.nextGaussian(
      ((managerSpec.maxSpeed - managerSpec.minSpeed) / 2) + managerSpec.minSpeed,
      (managerSpec.maxSpeed - managerSpec.minSpeed) / 4)
      / (asteroidSpec.sizeCategory);

    // larger asteroids rotate more slowely 
    let sign = Math.pow(-1, Math.floor(Math.random() * 2)); // returns 1 or negative one 
    let rotationSpeed = sign * Math.PI * speed / (asteroidSpec.sizeCategory * managerSpec.minSize);

    let rotation = Math.random() * Math.PI * 2;

    let asteroid = {
      position: {
        x: asteroidSpec.position.x,
        y: asteroidSpec.position.y
      },
      size: {
        height: managerSpec.minSize * asteroidSpec.sizeCategory,
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
  
module.exports.create = (asteroidSpec) => createAsteroid(asteroidSpec);
