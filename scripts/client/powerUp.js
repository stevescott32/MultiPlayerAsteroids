MyGame.components.PowerUp = (function () {

    let manager =  {
            imageSrc: "../assets/wrench.png",
            //audioSrc: 'resources/audio/coin10.wav',
            size: 100,
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
          radius: manager.size / 2,
          isDead: false,
          playerId: powerUpSpec.playerId
        };
    
    
        return powerUp;
      }
      let api = {
        createPowerUp: createPowerUp,
      }
      return api;
    }());