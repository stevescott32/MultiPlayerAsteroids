// ------------------------------------------------------------------
//
// Utility to log messages to the player's screen
//
// ------------------------------------------------------------------
MyGame.utilities.Logger = (function() {
    function log(message) {
        console.log(message); 
        let messages = document.getElementsByClassName("message");
        for(let m = messages.length - 1; m > 0; m--) {
            messages[m].innerHTML = messages[m-1].innerHTML; 
        }
        messages[0].innerHTML = message; 
    }

    let api = {
        log: log
    }

    return api; 
})(); 
