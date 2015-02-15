
//  Gravity module 
// (c) Monish Biswas 2015
//  
//  Classes
//
//  Universe - Holds all objects in the universe
//  Body     - Holds a body with mass, position and velocity
 

//  This is the module definition
var Gravity = {};

// Creates a universe
Gravity.Universe = function () {
//  List of bodies
	var bodies = [];
	
}



//  G - Gravitational constant
Gravity.Universe.G =  6.673e-11;

//  Body class 

Gravity.Body = function(mass,position,velocity) {
	this.mass     = mass;
	this.position = position;
	this.velocity = velocity;
	this.forces = [];
}

Gravity.Body.prototype = {
	//  Adds a force vector in 
	//  Newton
	addForce: function (force_vector) {
		this.forces.push(force_vector);
	},
	toString: function () {
		return "pos: "+ this.position + ", vel: " + this.velocity;
	},
	// Get Position in coordinates, given 
	// 
	// viewport top ,left, bottom ,right values
	// Positions of top left, bottom right in universe
	// Converts up--down direction
	viewportCoord: function (top,left, height, width, bottom_vector, top_vector) {
		var cols = left + ((this.position.x - bottom_vector.x) / (top_vector.x - bottom_vector.x) * width);
		// rows are the other way round
		var rows    = top + ((top_vector.y - this.position.y ) / (top_vector.y - bottom_vector.y) * height);
		return {rows: rows,cols:cols}
	
	},
	// Moves the body on per frame
	newFrame: function (time) {
		//  Work out the new velocity
		var accel = new Gravity.Vector (0,0)

		for (var i in this.forces) {
			var force = this.forces[i];			
			//  Add in the acceleration
			accel = accel.add(force.scale(1/this.mass));
		}
		this.forces = [];
		//  New Velocity
		this.velocity = this.velocity.add(accel.scale(time));
		this.position = this.position.add(this.velocity.scale(time));
	}
}



//  Vector Class

Gravity.Vector = function(the_x,the_y) {
	this.x = the_x;
	this.y = the_y;
	
}


Gravity.Vector.prototype = {
	"add": function (a) {
		return new Gravity.Vector(this.x + a.x,this.y + a.y);
	},
	"scale": function (a) {
		return new Gravity.Vector (this.x*a, this.y*a);
	},
	//  Returns modulus of vector
	modulus: function () {
		return Math.sqrt(this.x*this.x + this.y*this.y); 
	},
	//  Returns a vector of length 1 in the same direction
	direction: function () {
		return this.scale(1/this.modulus());
	},
	
	toString: function() {
		return '(' + this.x + ',' + this.y + ')';
	}
}