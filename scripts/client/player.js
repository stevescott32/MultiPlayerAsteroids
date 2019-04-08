//------------------------------------------------------------------
//
// Model for each player in the game.
//
//------------------------------------------------------------------
MyGame.components.Player = function() {
    'use strict';
    let player = {}; // object that will be returned 
    let position = {
        x: 0,
        y: 0
    };
    let size = {
        width: 0.05,
        height: 0.05
    };
    let direction = 0;
    let rotateRate = 0;
    let speed = 0;
    let thrust = 0.001;
    let velocity = {
        x: 0,
        y: 0
    }
    let maxSpeed = .1;

    Object.defineProperty(player, 'thrust', {
        get: () => thrust
    });
    Object.defineProperty(player, 'maxSpeed', {
        get: () => maxSpeed
    });
    Object.defineProperty(player, 'directionVector', {
        get: () => velocity,
    });
    Object.defineProperty(player, 'direction', {
        get: () => direction,
        set: (value) => { direction = value }
    });

    Object.defineProperty(player, 'speed', {
        get: () => speed,
        set: value => { speed = value; }
    });

    Object.defineProperty(player, 'rotateRate', {
        get: () => rotateRate,
        set: value => { rotateRate = value; }
    });

    Object.defineProperty(player, 'position', {
        get: () => position
    });

    Object.defineProperty(player, 'size', {
        get: () => size
    });

    //------------------------------------------------------------------
    //
    // Public function that moves the player in the current direction.
    //
    //------------------------------------------------------------------
    player.move = function(elapsedTime) {
        let vectorX = Math.cos(direction);
        let vectorY = Math.sin(direction);

        velocity.x += (vectorX * thrust * elapsedTime/100);
        velocity.y += (vectorY * thrust * elapsedTime/100);

        // if the ship is going to fast in any direction, slow it down
        if(velocity.x > maxSpeed)
        {
            velocity.x = maxSpeed;
        }
        if(velocity.x < 0-maxSpeed)
        {
            velocity.x = maxSpeed;
        }
        if(velocity.y > maxSpeed)
        {
            velocity.y = maxSpeed;
        }
        if(velocity.y < 0-maxSpeed)
        {
            velocity.y = maxSpeed;
        }

    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    player.rotateRight = function(elapsedTime) {
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    player.rotateLeft = function(elapsedTime) {
        direction -= (rotateRate * elapsedTime);
    };

    player.update = function(elapsedTime) {
        position.x += velocity.x * elapsedTime / 100;
        position.y += velocity.y * elapsedTime / 100;

        // if the ship would leave the edge of the world, don't let it
        if(position.x < 0) { 
            position.x = 0; 
            velocity.x = 0; 
        } 
        if(position.y < 0) { 
            position.y = 0;
            velocity.y = 0; 
        }
        if(position.x > MyGame.components.Viewport.worldSize.width) {
            position.x = MyGame.components.Viewport.worldSize.width;
            velocity.x = 0; 
        }
        if(position.y > MyGame.components.Viewport.worldSize.height) {
            position.y = MyGame.components.Viewport.worldSize.height;
            velocity.y = 0; 
        }
      
        // if the ship is going to leave its viewport soon, adjust the
        // viewport
        let playerVectorViewport = MyGame.components.Viewport.toViewport(position); 
        if(playerVectorViewport.x > 0.9 && position.x < MyGame.components.Viewport.worldSize.width - 0.1) {
            MyGame.components.Viewport.shiftX(playerVectorViewport.x - 0.9); 
        }
        if(playerVectorViewport.y > 0.9 && position.y < MyGame.components.Viewport.worldSize.height - 0.1) {
            MyGame.components.Viewport.shiftY(playerVectorViewport.y - 0.9); 
        }
        if(playerVectorViewport.x < 0.1 && position.x > 0.1) {
            MyGame.components.Viewport.shiftX(-1 * (0.1 - playerVectorViewport.x)); 
        }
        if(playerVectorViewport.y < 0.1 && position.y > 0.1) {
            MyGame.components.Viewport.shiftY(-1 * (0.1 - playerVectorViewport.y)); 
        }
    };

    return player;
};
