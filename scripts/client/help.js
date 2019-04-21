MyGame.screens['help'] = (function(game) {
    'use strict';
    
    function setControls() {
        let thrust = document.getElementById("id-controls-thrust").value;
        let rotateRight = document.getElementById("id-controls-rotate-right").value;
        let rotateLeft = document.getElementById("id-controls-rotate-left").value;
        let fire = document.getElementById("id-controls-fire").value;
        let hyperspace = document.getElementById("id-controls-hyperspace").value;
        let controls = {
            move: thrust,
            rotateRight: rotateRight, 
            rotateLeft: rotateLeft,
            fire: fire,
            hyperspace: hyperspace 
        }
        let controlsJSON = JSON.stringify(controls);
        window.localStorage.setItem("asteroidSettings", controlsJSON);
        console.log('Controls: ', controlsJSON);
        game.showScreen('main-menu');
        return true;
    }

    function initialize() {
        let previousControls = JSON.parse(window.localStorage.getItem("asteroidSettings")); 
        if(previousControls) {
            document.getElementById("id-controls-thrust").value = previousControls.move; 
            document.getElementById("id-controls-rotate-right").value = previousControls.rotateRight;
            document.getElementById("id-controls-rotate-left").value = previousControls.rotateLeft;
            document.getElementById("id-controls-fire").value = previousControls.fire;
            document.getElementById("id-controls-hyperspace").value = previousControls.hyperspace;
        }

        // set back button so it works
        document.getElementById('id-help-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });

        document.getElementById('id-controls-set').addEventListener(
            'click', setControls);
        document.getElementById('id-controls-form').addEventListener('keypress', function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                setControls();
            }
        });

    }
    
    function run() {
        //
        // I know this is empty, there isn't anything to do.
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
