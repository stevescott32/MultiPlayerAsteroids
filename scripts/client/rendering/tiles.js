// ------------------------------------------------------------------
//
// Rendering function for a Player object.
//
// ------------------------------------------------------------------
MyGame.renderer.Tiles = (function (graphics) {
    'use strict';
    let that = {};
    let canvases = ["viewport"];

    function tilePathCreater(number) {
        if (number<=9999) { number = ("000"+number).slice(-4); }
        let path = '/tiles' + number; 
        return path; 
    }

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function () {
        // render each of the tiles in the viewport
        let vpx = MyGame.components.Viewport.viewport.x; 
        let vpy = MyGame.components.Viewport.viewport.y; 
        let wx1 = Math.floor(vpx); 
        let wy1 = Math.floor(vpy); 
        let wx2 = Math.ceil(vpx + 1); 
        let wy2 = Math.ceil(vpy + 1); 
        let tx1 = wx1 * 2560 / 128;  // (MyGame.components.Viewport.worldSize.width * 128); 
        let ty1 = wy1 * 2560 / 128; // (MyGame.components.Viewport.worldSize.height * 128); 
        let tx2 = wx2 * 2560 / 128; // (MyGame.components.Viewport.worldSize.width * 128); 
        let ty2 = wy2 * 2560 / 128; // (MyGame.components.Viewport.worldSize.height * 128); 

        // x is the row of the tile, which should iterate from the tile just
        // before where the viewport starts to the tile just after the viewport ends
 //        for(let x = tx1; x < tx2; x++) {
  //          for(let y = ty1; y < ty2; y++) {
        let tileNum = 0; 
        for(let x = 0; x < 16; x+= 1) {
        for(let y = 0; y < 16; y+= 1) {
                if(MyGame.assets["background" + tilePathCreater(y * x + x)]) {
                    that.renderOneTile(y, x, MyGame.assets["background" + tilePathCreater(tileNum)]); 
                    tileNum++; 
                }
                else {
                    console.log('Tile not found error at' + x + ': ' + y); 
                }
            }
        }
        //that.renderOneTile(1, 1, MyGame.assets["background/tiles0030"]);
    };

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.renderOneTile = function (x, y, texture) {
//        console.log('Tile: ' + x + ': ' + y); 
        let size = {
            width: 5 / 16,
            height:  5 / 16
        }
       let position = {
            x: x * 128 * 5 / 2048 + (size.width / 2),
            y: y * 128 * 5 / 2048 + (size.height / 2) 
        }
        graphics.saveContext();
        graphics.drawImage(texture, position, size, canvases);
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
