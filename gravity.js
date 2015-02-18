
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
	this.bodies = {};

	//  G - Gravitational constant
	//  Should be  6.673e-11;
	//  but pick a value by trial end error
	//  that animates well
	this.gravity_constant = 1e-5;
	//  This is in mass units, earth mass's
	this.centre_mass = 10000
	this.do_elastic = false;
	this.max_r = 5;
	this.elastic_factor  = 1;
	this.do_retard = true;
	this.max_speed   = 0.1;
	this.slowdown_factor = 1;
	this.do_all_gravity  = false;
}

Gravity.Universe.prototype = {
	addBody: function (id,  mass, pos, vel) {
		this.bodies[id] = new Gravity.Body(mass, pos, vel,this);
	},
	iterate: function (time) {
		//  Force relative to position from origin
		for (var i in this.bodies) {
			var body = this.bodies[i];
			//  Gravitational pull
			// Kind of m1*m1*G / r^2
			var body_mass = body.mass
			var factor = body_mass * this.centre_mass * this.gravity_constant;
			var r = body.position.modulus();
			var force = body.position.scale(-1).direction().scale(factor/(r*r));
			body.addForce(force);
			// Also consider the interactions with all the other bodies
			if (this.do_all_gravity) {
				for (j in this.bodies) {
					if (i == j) {
						continue;
					}
					var other = this.bodies[j];
					var relative_pos = other.position.minus(body.position);
					var r = relative_pos.modulus();
					var other_mass  = other.mass;
					
					var factor = body_mass * other_mass * this.gravity_constant
					var force = relative_pos.direction().scale(factor/(r*r));
		
					body.addForce(force);
				}
			}
			
			
			//  Also add a elastic force to bring it back
			if (this.do_elastic && r > this.max_r) {
				var elastic_force = body.position.scale(-1).scale(this.elastic_factor);
				body.addForce(elastic_force);
			}
			// Also retard it if is it too fast 
			var speed = body.velocity.modulus()
			if (this.do_retard &&  r > this.max_r) {
					//  Work out the component in the direction from the origin
					//  and pull in that direction 
				var outward_vel = body.velocity.dot(body.position)
				var slowdown_force = body.position.direction().scale(-this.slowdown_factor);
				body.addForce(slowdown_force);
			}
			body.newFrame(time);
		}
	},
	getOrbitalVelocity: function (pos,m,up) {
		var r = pos.modulus();
		var angle = Math.PI/2;

		if (!up) {
			angle=-angle;
		}
		
		var speed = Math.sqrt(this.gravity_constant * (this.centre_mass + m)/r);
		return pos.rotate(angle).direction().scale(speed);
	}

	
	
	
}




//  Body class 

Gravity.Body = function(mass,position,velocity,universe) {
	this.mass     = mass;
	this.position = position;
	this.velocity = velocity;
	this.universe = universe;
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
			accel = accel.add(force.scale(1/(this.mass)));
		}
		this.forces = [];
		// Equation of motion = 
		// r = ro + vt + 0.5*a*t^2
		// New Position - from Velocity 
		this.position = this.position.add(this.velocity.scale(time));
		// Now consider acceleration 0.5 * a * t^2
		this.position = this.position.add(accel.scale(0.5).scale(time*time));
		//  New Velocity
		this.velocity = this.velocity.add(accel.scale(time));
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
	"minus": function (a) {
		return new Gravity.Vector(this.x - a.x,this.y - a.y);
	},
	"dot": function (v) {
		return this.x*v.x + this.y*v.y;
	},
	"scale": function (a) {
		return new Gravity.Vector (this.x*a, this.y*a);
	},
	"scalev": function (v) {
		return new Gravity.Vector (this.x*v.x, this.y*v.y);
	},

	//  Returns modulus of vector
	modulus: function () {
		return Math.sqrt(this.x*this.x + this.y*this.y); 
	},
	//  Returns a vector of length 1 in the same direction
	direction: function () {
		return this.scale(1/this.modulus());
	},
	rotate: function (angle) {
		var sin = Math.sin(angle);
		var cos = Math.cos(angle);
		var x=this.x;
		var y=this.y;

		return new Gravity.Vector(
			x*cos - y*sin,
			x*sin + y*cos
		);
	},	
	toString: function() {
		return '(' + this.x + ',' + this.y + ')';
	}
}