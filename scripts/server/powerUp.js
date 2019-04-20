let random = require ('./random');

let manager =  {
        //imageSrc: "../assets/lasers/greenLaser.png",
        //audioSrc: 'resources/audio/coin10.wav',
        size: .15,
}; 

function createPowerUp(powerUpSpec) {


    let powerUp = {
      position: {
        x: powerUpSpec.position.x,
        y: powerUpSpec.position.y
      },
      size: {
        height: manager.size,
        width: manager.size,
      },
      lastPosition: {
        position: {
          x: powerUpSpec.position.x,
          y: powerUpSpec.position.y
        },
        size: {
          height: manager.size,
          width: manager.size,
        },
      },
      type: powerUpSpec.type,
      radius: manager.size / 2,
    };

    return powerUp;
  }

  module.exports.create = (powerUpSpec) => createPowerUp(powerUpSpec);