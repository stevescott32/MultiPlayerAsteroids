//------------------------------------------------------------------
//
// Model for each remote player in the game.
//
//------------------------------------------------------------------
MyGame.components.PlayerRemote = function() {
    'use strict';
    let player = {};
    let size = {
        width: 0.05,
        height: 0.05
    };
    let state = {
        direction: 0,
        position: {
            x: 0,
            y: 0
        },
        momentum: {
            x: 0,
            y: 0
        }
    };
    let goal = {
        direction: 0,
        position: {
            x: 0,
            y: 0
        },
        updateWindow: 0      // Server reported time elapsed since last update
    };

    Object.defineProperty(player, 'state', {
        get: () => state
    });

    Object.defineProperty(player, 'goal', {
        get: () => goal
    });

    Object.defineProperty(player, 'size', {
        get: () => size
    });

    //------------------------------------------------------------------
    //
    // Update of the remote player depends upon whether or not there is
    // a current goal or if the ship is just floating along.  If a current
    // goal, update is a simpler progression/interpolation from the previous 
    // state to the goal (new) state.  If it is floating along, then use
    // the momentum to update the position.
    //
    //------------------------------------------------------------------
    player.update = function(elapsedTime) {
        let goalTime = Math.min(elapsedTime, goal.updateWindow);
        if (goalTime > 0) {
            let updateFraction = goalTime / goal.updateWindow;
            // Turn first, then move.
            state.direction -= (state.direction - goal.direction) * updateFraction;

            state.position.x -= ((state.position.x - goal.position.x) * updateFraction);
            state.position.y -= ((state.position.y - goal.position.y) * updateFraction);

            goal.updateWindow -= goalTime;
        } else {
            // Ship is only floating along, only need to update its position
            state.position.x += (state.momentum.x * elapsedTime);
            state.position.y += (state.momentum.y * elapsedTime);
        }
    };

    return player;
};
