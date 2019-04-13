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
        let utils = MyGame.components.TileUtils; 
        let rowNum = (utils.imageSize.height / utils.tileSize.height);
        let colNum = (utils.imageSize.width / utils.tileSize.width);
        let tileNum = 0; 
        for(let x = 0; x < colNum; x+= 1) {
        for(let y = 0; y < rowNum; y+= 1) {
                if(MyGame.assets["background" + tilePathCreater(y * x + x)]) {
                    that.renderOneTile(y, x, MyGame.assets["background" + tilePathCreater(tileNum)]); 
                    tileNum++; 
                }
                else {
                    console.log('Tile not found error at' + x + ': ' + y); 
                }
            }
        }
    };

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.renderOneTile = function (x, y, texture) {
        let viewport = MyGame.components.Viewport; 
        let utils = MyGame.components.TileUtils; 
        let numRows = (utils.imageSize.height / utils.tileSize.height);
        let numCols = (utils.imageSize.width / utils.tileSize.width);
        let size = {
            width: viewport.worldSize.width / numCols,
            height:  viewport.worldSize.height / numRows
        }
       let position = {
            x: x * utils.tileSize.width * viewport.worldSize.width / utils.imageSize.width + (size.width / 2),
            y: y * utils.tileSize.height * viewport.worldSize.height / utils.imageSize.height + (size.height / 2) 
        }
        graphics.saveContext();
        graphics.drawTileImage(texture, position, size, canvases);
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
