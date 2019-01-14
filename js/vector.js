

//  Vector Class

Vector = function(the_x,the_y,the_z) {
    this.x = the_x;
    this.y = the_y;
    this.z = the_z;

}


Vector.prototype = {
    "add": function (a) {
        return new Vector(this.x + a.x,this.y + a.y,this.z + a.z);
    },
    "minus": function (a) {
        return new Vector(this.x - a.x,this.y - a.y,this.z - a.z);
    },
    "dot": function (v) {
        return this.x*v.x + this.y*v.y + this.z*v.z;
    },
    "scale": function (a) {
        return new Vector (this.x*a, this.y*a, this.z*a);
    },
    "scalev": function (v) {
        return new Vector (this.x*v.x, this.y*v.y, this.z*v.z);
    },

    //  Returns modulus of vector
    modulus: function () {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    },
    //  Returns a vector of length 1 in the same direction
    direction: function () {
        return this.scale(1/this.modulus());
    },
    rotate: function (angle,axis) {
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var x=this.x;
        var y=this.y;
        var z=this.z;
        var ret;
        switch (axis) {
            case "X":
                ret = new Vector(
                    x,
                    y*cos - z*sin,
                    y*sin + z*cos
                );
                break;
            case "Y":
                ret = new Vector(
                    x*cos + z*sin,
                    y,
                    -x*sin + z*cos
                );
                break;
            case "Z":
                ret = new Vector(
                    x*cos - y*sin,
                    x*sin + y*cos,
                    z
                );
                break;
        }
        return ret;
    },
    toString: function() {
        return '(' + this.x + ',' + this.y + ',' + this.z + ')';
    }
};
