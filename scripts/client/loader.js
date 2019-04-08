MyGame = {
    input: {},
    components: {},
    renderer: {},
    utilities: {},
    assets: {}
};

//------------------------------------------------------------------
//
// Purpose of this code is to bootstrap (maybe I should use that as the name)
// the rest of the application.  Only this file is specified in the index.html
// file, then the code in this file gets all the other code and assets
// loaded.
//
//------------------------------------------------------------------
MyGame.loader = (function() {
    'use strict';
    // scripts are guaranteed to be loaded in this order 
    let scriptOrder = [
        {
            scripts: ['queue'],
            message: 'Utilities loaded',
            onComplete: null,
        }, {
            scripts: ['input'],
            message: 'Input loaded',
            onComplete: null
        }, {
            scripts: ['viewport'],
            message: 'Viewport model loaded',
            onComplete: null
        }, {
            scripts: ['asteroidManager'],
            message: 'Asteroid models loaded',
            onComplete: null
        }, {
            scripts: ['player', 'player-remote'],
            message: 'Player models loaded',
            onComplete: null
        }, {
            scripts: ['rendering/graphics'],
            message: 'Graphics loaded',
            onComplete: null
        }, {
            scripts: ['rendering/player', 'rendering/player-remote', 'rendering/asteroid'],
            message: 'Renderers loaded',
            onComplete: null
        }, {
            scripts: ['game'],
            message: 'Gameplay model loaded',
            onComplete: null
        }],
        // all assets are specified with a key and a source. 
        // this allows the assets to be referenced using their key
        // so that the source can be changed without changing any code outside of this
        assetOrder = [{
            key: 'player-self',
            source: 'assets/playerShip1_blue.png'
        }, {
            key: 'player-other',
            source: 'assets/playerShip1_red.png'
        }, {
            key: 'asteroid', 
            source: 'assets/asteroid.png'
        }];

    //------------------------------------------------------------------
    //
    // Helper function used to load scripts in the order specified by the
    // 'scripts' parameter.  'scripts' expects an array of objects with
    // the following format...
    //    {
    //        scripts: [script1, script2, ...],
    //        message: 'Console message displayed after loading is complete',
    //        onComplete: function to call when loading is complete, may be null
    //    }
    //
    //------------------------------------------------------------------
    function loadScripts(scripts, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (scripts.length > 0) {
            let entry = scripts[0];
            require(entry.scripts, function() {
                console.log(entry.message);
                // if the entry has a non null onComplete function, call it 
                if (entry.onComplete) {
                    entry.onComplete();
                }
                // changed from scripts.splice(0, 1)
                // remove the script we just finished, 
                // load any remaining scripts recursively 
                scripts.shift()
                loadScripts(scripts, onComplete);
            });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // Helper function used to load assets in the order specified by the
    // 'assets' parameter.  'assets' expects an array of objects with
    // the following format...
    //    {
    //        key: 'asset-1',
    //        source: 'assets/url/asset.png'
    //    }
    //
    // onSuccess is invoked per asset as: onSuccess(key, asset)
    // onError is invoked per asset as: onError(error)
    // onComplete is invoked once per 'assets' array as: onComplete()
    //
    //------------------------------------------------------------------
    function loadAssets(assets, onSuccess, onError, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (assets.length > 0) {
            let entry = assets[0];
            loadAsset(entry.source,
                function(asset) {
                    onSuccess(entry, asset);
                    assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                },
                function(error) {
                    onError(error);
                    assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // This function is used to asynchronously load image and audio assets.
    // On success the asset is provided through the onSuccess callback.
    // Reference: http://www.html5rocks.com/en/tutorials/file/xhr2/
    //
    //------------------------------------------------------------------
    function loadAsset(source, onSuccess, onError) {
    	let xhr = new XMLHttpRequest(),
            asset = null,
            // returns whatever comes after the final . in the file name. 
            // if no dots exist, returns the whole string. 
            // Source: http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
            fileExtension = source.substr(source.lastIndexOf('.') + 1);    

        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                if (xhr.status === 200) { // we have received back a valid response
                    // image file extensions mean that the asset should be an Image()
                    if (fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                    // mp3 files should be an Audio() object
                    } else if (fileExtension === 'mp3') {
                        asset = new Audio();
                    } else {
                        if (onError) { onError('Unknown file extension: ' + fileExtension); }
                    }
                    asset.onload = function() {
                        // revokeObjectUrl releases an object that was tied
                        // to the document using createObjectUrl
                        // once the object is loaded, we don't need to keep the reference 
                        window.URL.revokeObjectURL(asset.src);
                    };
                    // until the object is loaded, tie the lifetime of the asset to the doc
                    asset.src = window.URL.createObjectURL(xhr.response);
                    if (onSuccess) { onSuccess(asset); }
                } else {
                    if (onError) { onError('Failed to retrieve: ' + source); }
                }
            };
        } else {
            if (onError) { onError('Unknown file extension: ' + fileExtension); }
        }

        xhr.send();
    }

    //------------------------------------------------------------------
    //
    // Called when all the scripts are loaded, it kicks off the demo app.
    //
    //------------------------------------------------------------------
    function mainComplete() {
        console.log('it is all loaded up');
        MyGame.main.initialize();
    }

    //
    // Start with loading the assets, then the scripts.
    console.log('Starting to dynamically load project assets');
    loadAssets(assetOrder,
        function(source, asset) {    // Store it on success
            MyGame.assets[source.key] = asset;
        },
        function(error) {
            console.log(error);
        },
        function() {
            console.log('All assets loaded');
            console.log('Starting to dynamically load project scripts');
            loadScripts(scriptOrder, mainComplete);
        }
    );

}());
