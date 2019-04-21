MyGame.components.Laser = (function () {

let manager =  {
        imageSrc: "../assets/lasers/purpleBlob.png",
        //audioSrc: 'resources/audio/coin10.wav',
        size: 0.09,
        speed: 0.002,
}; 

function createLaser(laserSpec) {


    let newlaser = {
      position: {
        x: laserSpec.position.x,
        y: laserSpec.position.y
      },
      size: {
        height: manager.size,
        width: manager.size,
      },
      velocity: {
        x: Math.cos(laserSpec.rotation) * manager.speed,
        y: Math.sin(laserSpec.rotation) * manager.speed
      },
      radius: manager.size / 2,
      isDead: false,
      playerId: laserSpec.playerId
    };


    return newlaser;
  }
  let api = {
    createLaser: createLaser,
  }
  return api;
}());
