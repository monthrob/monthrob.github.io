
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
	this.centre_mass = 10000;
	this.centre_radius = 0.5;
	this.do_elastic = false;
	this.max_r = 5;
	this.elastic_factor  = 1;
	this.do_retard = true;
	this.max_speed   = 0.1;
	this.slowdown_factor = 1;
	this.do_all_gravity  = true;
	this.do_collisions = true;
	this.bounce_threshold = 100;
	this.sun = new Gravity.Body("sun", this.centre_mass, this.centre_radius,
		new Vector(0,0,0), new Vector(0,0,0))
	this.n_collisions = 0;
}

Gravity.Universe.prototype = {
	addBody: function (id,  mass, radius, pos, vel) {
		this.bodies[id] = new Gravity.Body("p_" + id, mass, radius, pos, vel,this);
	},
	removeAllBodies: function () {
		delete this.bodies;
		this.bodies = {}
	},
	removeBody: function (id) {
		delete this.bodies[id];
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

			if (this.do_collisions) {
                this.collide(body, this.sun, this.bounce_threshold)
            }

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

			if (this.do_collisions) {
				for (j in this.bodies) {
					if (i == j) {
						continue;
					}
					var other = this.bodies[j];
					this.collide(body, other, this.bounce_threshold);
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
	//  Check for collision and handle of body with other
	collide: function(body, other, compression_modulus) {
		var relative_pos = body.position.minus(other.position);
		var r = relative_pos.modulus();
		var r_t = body.radius;
		var r_o = other.radius;
		var overlap = r - r_t - r_o;
		if (overlap < 0) {
			var bounce_force = -compression_modulus* overlap
			//  give a shove in the opposite direction
			var force = relative_pos.direction().scale(bounce_force);
			body.addForce(force);
			this.n_collisions ++;
		}
    },
	getOrbitalVelocity: function (pos,m,up) {
		var r = pos.modulus();
		var angle = Math.PI/2;

		if (!up) {
			angle=-angle;
		}

		var speed = Math.sqrt(this.gravity_constant * (this.centre_mass + m)/r);
		return pos.rotate(angle,'Z').direction().scale(speed);
	}




}




//  Body class

Gravity.Body = function(label, mass,radius,position,velocity) {
	this.label    = label;
	this.mass     = mass;
	this.radius   = radius;
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
	viewportCoord: function (top,left, height, width, view_distance, bottom_vector, top_vector) {
		var factor_x = width  / (top_vector.x - bottom_vector.x);
		var factor_y = height / (top_vector.y - bottom_vector.y);

		var z = this.position.z;

		// Assume origin is normal viewport

		var z_far  = top_vector.z;
		var z_near = bottom_vector.z;

		var cols;
		var rows;
		var el_height;
		var el_width;

		if (z > z_near) {
			var z_factor = (0 - z_near + view_distance) / (z - z_near + view_distance);
			//  x, take into account radius
			var radius = this.radius;

			var x = (this.position.x )*z_factor;
			var y = (this.position.y )*z_factor;

			var cols = left + ((x - bottom_vector.x) / (top_vector.x - bottom_vector.x) * width);
			// rows are the other way round
			var rows    = top + ((top_vector.y - y) / (top_vector.y - bottom_vector.y) * height);

			var el_height = this.radius * z_factor * factor_y*2 ;
			var el_width  = this.radius * z_factor * factor_x*2 ;

			//  Note HTML z-index is opposite to the model z index
			return {label: this.label ,displayed: true, rows: rows,cols:cols, height: el_height , width: el_width, z_index: -Math.round(z * 100)}
		} else {
			return {label: this.label, displayed: false}
		}
	},
	// Moves the body on per frame
	newFrame: function (time) {
		//  Work out the new velocity
		var accel = new Vector (0,0,0)

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


