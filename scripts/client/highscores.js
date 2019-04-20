MyGame.screens['high-scores'] = (function(game) {
    'use strict';
    var highScores = [];
    
    function initialize() {
        for(var i = 0; i < 4; i++)
        {
            highScores.push(localStorage.getItem(i));
        }
        document.getElementById('id-high-scores-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });
    }
    
    function run() {
        document.getElementById("one").innerHTML = highScores[0];
        document.getElementById("two").innerHTML = highScores[1];
        document.getElementById("three").innerHTML = highScores[2];
        document.getElementById("four").innerHTML = highScores[3];
        //
        // I know this is empty, there isn't anything to do.
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));
