// detect whether two circles overlap
// each object must have a radius and a position
function detectCircleCollision(object1, object2) {
    if(!object1 || !object2 || !object1.position || !object2.position) { 
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

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

  // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}

	denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
	if (denominator === 0) {
		return false
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}

  // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return {x, y}
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

// each object and circle must have a radius and a position
function sweptCircle(sweptStart1, sweptEnd1, sweptStart2, sweptEnd2) {
    // if any of the circle end points is currently colliding, return true
    if(detectCircleCollision(sweptStart1, sweptStart2) 
    || detectCircleCollision(sweptEnd1, sweptEnd2)
    || detectCircleCollision(sweptEnd1, sweptStart2)
    || detectCircleCollision(sweptStart1, sweptEnd2)
    ) {
        //console.log('Endpoint collision'); 
        return true; 
    }
    if(intersect(
        sweptStart1.position.x, sweptStart1.position.y,
        sweptEnd1.position.x, sweptEnd1.position.y, 
        sweptStart2.position.x, sweptStart2.position.y,
        sweptEnd2.position.x, sweptEnd2.position.y) === false )
    {
        return false; 
    } else {
        //console.log('Swept collision'); 
        return true; 
    }
}

module.exports.detectCircleCollision = detectCircleCollision;
module.exports.sweptCircle = sweptCircle;
module.exports.detectCirclePointCollision = detectCirclePointCollision; 
