// ------------------------------------------------------------------
//
// A component to keep track of the square where the ship can see 
// within the world. Provides ccoordinate conversions 
//
// ------------------------------------------------------------------
MyGame.components.TileUtils = (function() {
    let imageSize = {
        height: 1,
        width: 1
    }

    let tileSize = {
        height: 0.1,
        width: 0.1
    }

    function tilePathCreater(number) {
        if (number<=9999) { number = ("000"+number).slice(-4); }
        let path = '/tiles' + number; 
        return path; 
    }


    let api = {
        tilePathCreater: tilePathCreater,
        get tileSize() { return tileSize; },
        set tileSize(inSize) { tileSize = inSize; },
        get imageSize() { return imageSize; },
        set imageSize(inSize) { 
            imageSize = inSize; 
        },
    }

    return api; 
})(); 