MyGame.screens['high-scores'] = (function (game) {
    'use strict';
    let highScores = {};
    let highScoresList = [];

    function initialize() {
        document.getElementById('id-high-scores-back').addEventListener(
            'click',
            function () { game.showScreen('main-menu'); });
    }

    function run() {
        highScoresList = [];
        let highScoresJSON = window.localStorage.getItem("highScores");
        if (highScoresJSON) {
            highScores = JSON.parse(highScoresJSON);
        } else {
            console.log('No high scores received');
        }
        console.log(highScores);

        for (let clientId in highScores) {
            highScores[clientId].inList = false; 
        }
        console.log(highScores); 
        for (let i = 0; i < 5; i++) {
            let displayText = "This could be you!";
            let currentEntry = null; 
            for (let clientId in highScores) {
                let currentHighest = 0;
                if (highScores[clientId]) {
                    let score = highScores[clientId];
                    if (score.score > currentHighest && !score.inList) {
                        currentHighest = score.score;
                        currentEntry = score; 
                    }
                }
            }
            if(currentEntry) {
                currentEntry.inList = true; 
                displayText = currentEntry.nickname + ' ' + currentEntry.score;
            }
            highScoresList.push(displayText);
        }

        document.getElementById("one").innerHTML = highScoresList[0];
        document.getElementById("two").innerHTML = highScoresList[1];
        document.getElementById("three").innerHTML = highScoresList[2];
        document.getElementById("four").innerHTML = highScoresList[3];
        document.getElementById("five").innerHTML = highScoresList[4];
        //
        // I know this is empty, there isn't anything to do.
    }

    return {
        initialize: initialize,
        run: run
    };
}(MyGame.game));
