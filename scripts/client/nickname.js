MyGame.screens['nickname'] = (function (game) {
    'use strict';

    function setNickname() {
        let nickname = document.getElementById("id-nickname-text");
        let nicknameJSON = JSON.stringify(nickname.value);
        window.localStorage.setItem("nickname", nicknameJSON);
        console.log('Nickname: ', nicknameJSON);
        game.showScreen('gamePlay');
        return true;
    }

    function initialize() {
        document.getElementById('id-nickname-back').addEventListener(
            'click',
            function () { game.showScreen('main-menu'); });
        document.getElementById('id-nickname-start').addEventListener(
            'click', setNickname);
        //document.getElementById('id-nickname-form').action = setNickname; 
        //        document.getElementById('id-nickname-form').addEventListener(
        //           'keypress', setNickname);
        document.getElementById('id-nickname-form').addEventListener('keypress', function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                setNickname();
            }
        });
        // focus to text box
//        document.getElementById('id-nickname-text').focus(); 
    }

    function run() {
        //
        // I know this is empty, there isn't anything to do.
    }

    return {
        initialize: initialize,
        run: run
    };
}(MyGame.game));
