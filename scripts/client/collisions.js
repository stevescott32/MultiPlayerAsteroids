
MyGame.utilities.Collisions = (function () {

    // detect whether two circles overlap
    // each object must have a radius and a position
    function detectCircleCollision(object1, object2) {
        if (!object1 || !object2 || !object1.position || !object2.position) {
            console.log('Error! Invalid object for collision detection');
            console.log(object1);
            console.log(object2);
            return false;
        }
        let distanceSquared = Math.pow(object1.position.x - object2.position.x, 2) +
            Math.pow(object1.position.y - object2.position.y, 2);
        let radiusSum = object1.radius + object2.radius;
        if (radiusSum * radiusSum > distanceSquared) {
            return true;
        }
        else {
            return false;
        }
    }

    // detect whether a point is within the radius of the circle
    // circle object must have a radius and a position
    function detectCirclePointCollision(circle, point) {
        let distanceSquared = Math.pow(circle.position.x - point.position.x, 2) +
            Math.pow(circle.position.y - point.position.y, 2);
        if (circle.radius * circle.radius > distanceSquared) {
            return true;
        }
        else {
            return false;
        }
    }
    let api = {
        detectCircleCollision: detectCircleCollision,
        detectCirclePointCollision: detectCirclePointCollision
    }

    return api;
})(); 
