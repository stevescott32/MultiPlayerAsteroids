//------------------------------------------------------------------
//
// Model for each remote player in the game.
//
//------------------------------------------------------------------
MyGame.components.AlienShips = function() {
    'use strict';

    let alien = {};
    let size = {
        width: 0.10,
        height: 0.10
    };
    let state = {
        direction: 0, 
        position: {
            x: 1,  
            y: 1 
        },
        momentum: {
            x: 0,
            y: 0
        }
    };

    Object.defineProperty(alien, 'state', {
        get: () => state,
        set: (inState) => state = inState
    });

    Object.defineProperty(alien, 'size', {
        get: () => size
    });

    //------------------------------------------------------------------
    //
    // Update of the remote alien depends upon whether or not there is
    // a current goal or if the ship is just floating along.  If a current
    // goal, update is a simpler progression/interpolation from the previous 
    // state to the goal (new) state.  If it is floating along, then use
    // the momentum to update the position.
    //
    //------------------------------------------------------------------
    alien.update = function(elapsedTime) {
        // Ship is only floating along, only need to update its position
        state.position.x += (state.momentum.x * elapsedTime);
        state.position.y += (state.momentum.y * elapsedTime);

        let worldSize = MyGame.components.Viewport.worldSize; 

        if(state.position.x < 0) {
            state.position.x = worldSize.width + size.width
        }
        if(state.position.y < 0) {
            state.position.y = worldSize.height + size.height
        }
        if(state.position.x > worldSize.width + size.width) {
            state.position.x = 0 - size.width
        }
        if(state.position.y > worldSize.height + size.height) {
            state.position.y = 0 - size.height
        }
    };

    return alien;
};
