
//  Simulation module
// (c) Monish Biswas 2015


//
//  Classes
//
SimEl = function(id) {
    this.id = id;
    this.displayed = false;
	this.rows = null;
	this.cols = null;
	this.width = null;
	this.height = null;
	this.z_index = null;
}

SimEl.prototype = {
    move: function (displayed, rows, cols, width, height, z_index) {
    	that = new SimEl(this.id);
    	that.displayed = displayed
        that.rows = rows
        that.cols = cols
        that.width = width
        that.height = height
        that.z_index = z_index
		return that;
    },
	toString: function() {
    	return "rows:" + this.rows
			+ " cols:" + this.cols
            + " width:" + this.width
            + " height:" + this.height
            + " z_index:" + this.z_index;
	}

};


Simulation = function (universe_el) {
	//  Holds the canves for the universe
	this.universe_el = universe_el;

    //  properties
    //
    this.mainmon = new SimEl('mainmon');
    this.elements =[];
	this.universe = new Gravity.Universe();
	this.bottom = new Gravity.Vector(-2,-2,-2);
	this.top    = new Gravity.Vector(2,2,2);

	this.height = null;
	this.width = null;

	this.n_bodies = 10;
	//  Set up timeout
	this.frame_rate = 25;
	this.subdivisions = 100;
	this.speedup = 2;

	//  Used for calculating frame rate
	this.calc_frame_time_n = 0;
	this.calc_frame_time_sum = 0;
	this.calc_last_frame_rate_time = Date.now()
	this.calc_frame_rate = null;

	this.interval = 1 / this.frame_rate;

	this.last_model_time = null;
	this.last_paint_time = null;

	this.view_distance = 0.5;
}



Simulation.prototype = {
		now: function() {

			// Returns the number of milliseconds elapsed since either the browser navigationStart event or
			// the UNIX epoch, depending on availability.
			// Where the browser supports 'performance' we use that as it is more accurate (microsoeconds
			// will be returned in the fractional part) and more reliable as it does not rely on the system time.
			// Where 'performance' is not available, we will fall back to Date().getTime().

			// jsFiddle: http://jsfiddle.net/davidwaterston/xCXvJ
			var performance = window.performance || {};

			performance.now = (function() {
				return performance.now    ||
					performance.webkitNow     ||
					performance.msNow         ||
					performance.oNow          ||
					performance.mozNow        ||
					function() { return new Date().getTime(); };
			})();
			return performance.now();
		},

	setup: function () {
        this.addSun(10000,0.5);
        var n_existing = this.elements.length;
        var n_new = this.n_bodies - n_existing
        if (n_new < 0) {
            for (var i = 0; i < -n_new; i++) {
                this.removeBody(n_existing - i - 1);
            }
        } else {
            this.addRandomBodies(n_new,
                0.5, 2,
                1, 10,
                0.02);
        }
    },
	addSun: function (mass, radius) {
		this.sun = new Gravity.Body (
		"sun",
		mass,
		radius,
		new Gravity.Vector (0,0,0),
		new Gravity.Vector (0,0,0));
	},
	addRandomBodies : function (n_planets,min_r,max_r,min_mass,max_mass,unit_size) {
		var base_i = this.elements.length
		// Random orbiting planets
		for (var i =0; i < n_planets; i++) {
			var mass = min_mass + (Math.random() * (max_mass - min_mass) );
			// Use polar coordinates
			// 1. Choose a random radius
			// 2. Chose  a random ange from 0 360 = 2*pi in radians
			var the_r = min_r + Math.random()*(max_r - min_r)
			var angle_z = Math.random()*2*Math.PI;
			var angle_x = Math.random()*2*Math.PI;
			
			var pos = new Gravity.Vector(the_r,0,0).rotate(angle_z,"Z").rotate(angle_x,'X');
			var orb_vel = this.universe.getOrbitalVelocity(new Gravity.Vector(the_r,0,0),mass,0).rotate(angle_z,"Z").rotate(angle_x,'X');
			this.addBody(base_i + i, mass, mass*unit_size, pos,orb_vel);
		}
		this.paint();
},
	addBody: function (id,  mass, radius, pos, vel) {
		this.elements.push(new SimEl(id));
		this.universe.addBody(id,mass,radius,pos,vel);
	},
	removeAllBodies : function () {
		this.elements.splice(0,this.elements.length);
		this.universe.removeAllBodies()
	},
	removeBody: function (id) {
		this.elements.splice(id);
		this.universe.removeBody(id);
	},
	iterate: function() {
		this.setup()
		var time = this.now();

		for (var i = 0; i < this.subdivisions; i++) {
			this.universe.iterate(this.interval*this.speedup/this.subdivisions);
		}
		var model_time = this.now() - time;
		this.paint();
		var paint_time = this.now() - time - model_time;
		this.calc_frame_time_sum += model_time + paint_time;
		this.calc_frame_time_n ++;
		if (Date.now() - this.calc_last_frame_rate_time > 1e3) {
			this.calc_frame_rate = this.calc_frame_time_n * 1e3/this.calc_frame_time_sum
			this.calc_last_frame_rate_time = Date.now()
		}

	},
	paint: function () {
		this.height = this.universe_el.clientHeight;
		this.width  = this.universe_el.clientWidth;
		// Try and maintain aspect ratio
		// By expanding view port
		var x_scale=1;
		var y_scale=1;
		if (this.height > this.width) {
			y_scale = this.height / this.width;
		} else if (this.width > this.height) {
			x_scale = this.width / this.height;
		}
		var scale_vec = new Gravity.Vector(x_scale,y_scale,1);
		coors  = this.sun.viewportCoord(0,0,this.height, this.width, this.view_distance, this.bottom.scalev(scale_vec),this.top.scalev(scale_vec));
		this.mainmon = this.mainmon.move(true, coors.rows, coors.cols,coors.width, coors.height,coors.z_index);
		for (i in this.universe.bodies) {

            body = this.universe.bodies[i];
            var coors = body.viewportCoord(0, 0, this.height, this.width, this.view_distance, this.bottom.scalev(scale_vec), this.top.scalev(scale_vec));
            var el = this.elements[i];
			this.elements[i] = el.move(coors.displayed, coors.rows, coors.cols,coors.width,coors.height,coors.z_index);
		}
	},
}
