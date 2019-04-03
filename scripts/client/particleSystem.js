Game.objects.ParticleSystemManager = function (managerSpec) {
    let effects = []; 

    function makeEffect(spec) {
        let nextName = 1;
        let particles = {};
        
        let image = new Image();
        let isReady = false;
        let systemTotalTime = 0; 

        image.onload = () => {
            isReady = true;
        };
        image.src = spec.imageSrc;

        function create() {
            let size = Random.nextGaussian(spec.size.mean, spec.size.stdev);
            let p = {
                center: { x: spec.center.x, y: spec.center.y },
                size: { height: size, width: size },
                direction: Random.nextCircleVector(),
                speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
                rotation: 0,
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev), // seconds
                alive: 0
            };

            if(spec.thrustEffect) {
                p.direction.x = Math.cos(spec.spaceShipDirection); 
                p.direction.y = Math.sin(spec.spaceShipDirection); 
            }

            return p;
        }

        function isDead() {
            let count = 0; 
            Object.getOwnPropertyNames(particles).forEach(function () {
                count++; 
            }); 

            if(systemTotalTime > spec.explosionLifetime && count == 0) {
                return true;
            }
            return false; 
        }

        function update(elapsedTime) {
            let removeMe = [];

            elapsedTime = elapsedTime / 1000;
            systemTotalTime += elapsedTime; 

            for (let particle = 0; particle < spec.density; particle++) {
                if(systemTotalTime < spec.explosionLifetime) {
                    particles[nextName++] = create();
                }
            }

            Object.getOwnPropertyNames(particles).forEach(value => {
                let particle = particles[value];

                particle.alive += elapsedTime;
                particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
                particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

                particle.rotation += particle.speed / 500;

                if (particle.alive > particle.lifetime) {
                    removeMe.push(value);
                }
            });

            for (let particle = 0; particle < removeMe.length; particle++) {
                delete particles[removeMe[particle]];
            }
        }

        let api = {
            update: update,
            get image() { return image; },
            get particles() { return particles; },
            get isReady() { return isReady; },
            isDead: isDead
        };

        return api;
    }
    
    function createThrustEffect(spaceship) {
        let x = spaceship.center.x + Math.cos(spaceship.rotation) * spaceship.radius; 
        let y = spaceship.center.y + Math.sin(spaceship.rotation) * spaceship.radius; 
        effects.push(makeEffect({
            center: { x: x, y: y },
            size: { mean: 15, stdev: 6 }, 
            speed: { mean: 400, stdev: 30 }, 
            lifetime: { mean: 0.1, stdev: 0.1 }, 
            explosionLifetime: 0.1, 
            density: 3, 
            imageSrc: "resources/textures/fire.png",
            thrustEffect: true,
            spaceShipDirection: spaceship.rotation
        })); 
    }

    function createHyperspaceEffect(spaceship) {
        effects.push(makeEffect({
            center: { x: spaceship.center.x, y: spaceship.center.y },
            size: { mean: 20, stdev: 4 }, 
            speed: { mean: 400, stdev: 20 }, 
            lifetime: { mean: 0.3, stdev: 0.1 }, 
            explosionLifetime: 0.3, 
            density: 8, 
            imageSrc: "resources/textures/flare.png"
        })); 
    }

    function createNewLifeEffect(spaceship) {
        effects.push(makeEffect({
            center: { x: spaceship.center.x, y: spaceship.center.y },
            size: { mean: 20, stdev: 4 }, 
            speed: { mean: 400, stdev: 20 }, 
            lifetime: { mean: 0.3, stdev: 0.1 }, 
            explosionLifetime: 0.3, 
            density: 8, 
            imageSrc: "resources/images/lasers/greenBlob.png"
        })); 
    }

    function createAsteroidBreakup(asteroid) {
        let sc = asteroid.size.sizeCategory; 
        effects.push(makeEffect({
            center: { x: asteroid.center.x, y: asteroid.center.y },
            size: { mean: 10, stdev: 2 }, 
            speed: { mean: (150 * sc), stdev: 20 }, 
            lifetime: { mean: (0.18 + sc * 0.05), stdev: 0.1 }, 
            explosionLifetime: 0.18 + sc * 0.03, 
            density: sc * sc * 5, 
            imageSrc: "resources/textures/smoke.png"
        })); 
    }

    function createShipExplosion(xPos, yPos) {
        effects.push(makeEffect({
            center: { x: xPos, y: yPos },
            size: { mean: 20, stdev: 4 }, 
            speed: { mean: 100, stdev: 20 }, 
            lifetime: { mean: 1, stdev: 0.5 }, 
            explosionLifetime: 1, 
            density: 10, 
            imageSrc: "resources/textures/fire.png"
        })); 
    }

    function clearScreen() {
        effects.push(makeEffect({
            center: { x: Game.graphics.canvas.width / 2, y: Game.graphics.canvas.height / 2 },
            size: { mean: 100, stdev: 4 }, 
            speed: { mean: 500, stdev: 20 }, 
            lifetime: { mean: 1, stdev: 0.5 }, 
            explosionLifetime: 1, 
            density: 10, 
            imageSrc: "resources/images/lasers/purpleBlob.png"
        })); 
    }

    function createUFOExplosion(xPos, yPos) {
        effects.push(makeEffect({
            center: { x: xPos, y: yPos },
            size: { mean: 30, stdev: 4 }, 
            speed: { mean: 100, stdev: 20 }, 
            lifetime: { mean: 1, stdev: 0.5 }, 
            explosionLifetime: 1, 
            density: 5, 
            imageSrc: "resources/textures/smoke.png"
        })); 
        effects.push(makeEffect({
            center: { x: xPos, y: yPos },
            size: { mean: 30, stdev: 4 }, 
            speed: { mean: 100, stdev: 20 }, 
            lifetime: { mean: 1, stdev: 0.5 }, 
            explosionLifetime: 1, 
            density: 8, 
            imageSrc: "resources/textures/fire.png"
        })); 

    }

    function startGame() {
        effects = []; 
    }

    function update(elapsedTime) {
        if (effects[0] && effects[0].isDead()) {
            effects.shift();
        }
        for (let e = 0; e < effects.length; e++) {
            effects[e].update(elapsedTime);
        }
    }

    let api = {
        createShipExplosion: createShipExplosion,
        createAsteroidBreakup: createAsteroidBreakup,
        createUFOExplosion: createUFOExplosion,
        createHyperspaceEffect: createHyperspaceEffect,
        createNewLifeEffect: createNewLifeEffect,
        createThrustEffect: createThrustEffect, 
        clearScreen: clearScreen, 
        startGame: startGame,
        update: update,
        get effects() { return effects; },
    }

    return api;
}
