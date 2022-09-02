/* STYLE GUIDE



Classes have first character of each word capitalised

    Vec2 √
    vec2 x
    VEC2 x

    CompressorMap √
    Compressormap x

Variables receive no capitalisation with underscores

    vec2 √
    Vec2 x

    compressor_map √
    compressormap x
    compressorMap x

Constants are all-caps with underscores

    CURVE_TYPE √
    Curve_Type x
    curve_type x

functions take the same formating as variables.
*/

const CURVE_TYPE = {
    SPEED: 1,
    EFFICIENCY: 2
}

class Vec2 {
    constructor(X,Y) {
        this.x = X;
        this.y = Y;
    }
    add(VEC2_B) {
        // adds VEC2_B to this vector
        return new Vec2(this.x+VEC2_B.x,this.y+VEC2_B.y);
    }
    sub(VEC2_B) {
        // subtracts VEC2_B from this vector
        return new Vec2(this.x-VEC2_B.x,this.y-VEC2_B.y);
    }
    mul(K) {
        // performs a scalar multiplication
        return new Vec2(this.x*K,this.y*K);
    }
    div(K) {
        // performs a scalar division
        return new Vec2(this.x/K,this.y/K);
    }
    len2() {
        // returns the length squared of the vector
        return Math.pow(this.x,2)+Math.pow(this.y,2);
    }
    len() {
        // returns the length of the vector
        return Math.pow(this.len2(),0.5);
    }
    unit() {
        // returns a copy of the vector with magnitude 1
        return this.div(this.len());
    }
    dist2(VEC2_B) {
        // returns the squared distance between the two vectors
        return this.sub(VEC2_B).len2();
    }
    dist(VEC2_B) {
        // returns the distance between the two vectors
        return this.sub(VEC2_B).len();
    }
    rotate(ANGLE) {
        // rotates the vector by the angle specified, taking anticlockwise to be a positive rotation
        return new Vec2(this.x*Math.cos(ANGLE)-this.y*Math.sin(ANGLE),this.x*Math.sin(ANGLE)+this.y*Math.cos(ANGLE));
    }
    dot(VEC2_B) {
        // this returns the dot product between the two vectors
        return this.x*VEC2_B.x + this.y*VEC2_B.y;
    }
    angle_between(VEC2_B) {
        // This function uses the cosine rule to determine the angle between two vectors
        const A = this.len();
        const B = VEC2_B.len();
        const C = VEC2_B.sub(this).len();
        return Math.acos((A*A + B*B - C*C)/(2*A*B));
    }
    cross(VEC2_B) {
        // Note: the cross product is not strictly defined for 2D space, but we can pretend that these
        // 2D vectors are actually 3D vectors on the XY plane, so this function returns
        // the Z component of the cross of the two '3D' vectors
        return this.x*VEC2_B.y - this.y*VEC2_B.x;
    }
}

class Curve {
    constructor(CURVE_DATA_STRING) {
        // Setup some of the variables
        this.curve_type = 0;
        this.closed = false;
        this.value = 0;
        this.nodes = [];

        // Load an array containing all the curve's data
        const CURVE_DATA = CURVE_DATA_STRING.split(" ");

        // Set the curve's type
        if (CURVE_DATA[0] == 'sp') {
            this.curve_type = CURVE_TYPE.SPEED;
        } else if (CURVE_DATA[0] == 'ef') {
            this.curve_type = CURVE_TYPE.EFFICIENCY;
        }

        // Set whether or not the curve is closed
        this.closed = CURVE_DATA[1] == "c";

        // Set the curve's associated value
        this.value = parseFloat(CURVE_DATA[2]);

        // Iterate over the remaining values to produce the list of points
        for (var i=3; i < CURVE_DATA.length; i += 2) {
            const X = CURVE_DATA[i];
            const Y = CURVE_DATA[i+1];

            this.nodes[this.nodes.length] = new Vec2(parseFloat(X),parseFloat(Y));
        }
    }
    closest_point_on_segment(SEGMENT_INDEX,POINT,VERTICAL_SCALING) {
        // Get the points that define this segment
        const POINT_1 = this.nodes[SEGMENT_INDEX];
        var point_2 = this.nodes[SEGMENT_INDEX+1];

        if (point_2 == null && this.closed == true && SEGMENT_INDEX == this.nodes.length-1) {
            point_2 = this.nodes[0];
        }  

        // make sure both points exist
        if (!POINT_1 || !point_2) {
            
            return;
        }

        POINT_1.y *= VERTICAL_SCALING;
        point_2.y *= VERTICAL_SCALING;
        POINT.y *= VERTICAL_SCALING;

        // Get the distance to the line segment using the SDF of a line segment
        // See https://www.youtube.com/watch?v=PMltMdi1Wzg for guidance

        const H = Math.min(1,Math.max(0,
            POINT.sub(POINT_1).dot(point_2.sub(POINT_1)) /
            point_2.sub(POINT_1).dot(point_2.sub(POINT_1))
        ));


        const CLOSEST_POINT = point_2.sub(POINT_1).mul(H).add(POINT_1);

        return CLOSEST_POINT;
    }

    closest_point_on_curve(POINT,VERTICAL_SCALING) {
        // set up the variables
        var closest_distance = Infinity;
        var closest_segment_index = 0;
        var last_distance = 0;
        // iterate over each line segment in the curve to find the line segment 
        // with the smallest unsigned distance to the point
        for (var i=0; i < (this.nodes.length); i++) {
            const DISTANCE = this.signed_distance_to_segment(i,POINT,VERTICAL_SCALING);

            if (Math.abs(DISTANCE) < Math.abs(closest_distance)) {
                closest_distance = DISTANCE;
                closest_segment_index = i;
            } else if ((0 < i) && (Math.abs(DISTANCE) == Math.abs(closest_distance)) && (DISTANCE + last_distance == 0)) {
                var next_node = this.nodes[i+1]
                if (next_node == null) {
                    if (this.closed) {
                        next_node = this.nodes[0];
                    } else {
                        closest_distance = this.signed_distance_to_segment(i,POINT,VERTICAL_SCALING);
                        continue;
                    }
                }
                closest_distance = Math.abs(DISTANCE) * -Math.sign(this.nodes[i].sub(this.nodes[i-1]).cross(next_node.sub(this.nodes[i-1])));
            }
            
            last_distance = DISTANCE;
        }

        return  this.closest_point_on_segment(closest_segment_index,POINT,VERTICAL_SCALING);
    }

    signed_distance_to_segment(SEGMENT_INDEX,POINT,VERTICAL_SCALING) {
        // Get the points that define this segment
        const POINT_1 = this.nodes[SEGMENT_INDEX];
        var point_2 = this.nodes[SEGMENT_INDEX+1];

        if (point_2 == null && this.closed == true && SEGMENT_INDEX == this.nodes.length-1) {
            point_2 = this.nodes[0];
        }  
        // make sure both points exist
        if (!POINT_1 || !point_2) {
            
            return;
        }

        POINT_1.y *= VERTICAL_SCALING;
        point_2.y *= VERTICAL_SCALING;
        POINT.y *= VERTICAL_SCALING;

        // Get the distance to the line segment using the SDF of a line segment
        // See https://www.youtube.com/watch?v=PMltMdi1Wzg for guidance

        const H = Math.min(1,Math.max(0,
            POINT.sub(POINT_1).dot(point_2.sub(POINT_1)) /
            point_2.sub(POINT_1).dot(point_2.sub(POINT_1))
        ));

        
        const UNSIGNED_DISTANCE = (POINT.sub(POINT_1).sub(point_2.sub(POINT_1).mul(H))).len();
        
        // multiply the unsigned distance by the sign of the cross product
        var sign = Math.sign(point_2.sub(POINT_1).unit().cross(POINT.sub(POINT_1).unit()));
        
        if (sign == 0) {
            sign = 1
        }

        return sign*UNSIGNED_DISTANCE;
    }

    signed_distance_to_curve(POINT,VERTICAL_SCALING) {
        // set up the variables
        var closest_distance = Infinity;
        var closest_segment_index = 0;
        var last_distance = 0;
        // iterate over each line segment in the curve to find the line segment 
        // with the smallest unsigned distance to the point
        for (var i=0; i < (this.nodes.length); i++) {
            const DISTANCE = this.signed_distance_to_segment(i,POINT,VERTICAL_SCALING);

            if (Math.abs(DISTANCE) < Math.abs(closest_distance)) {
                closest_distance = DISTANCE;
                closest_segment_index = i;
            } else if ((0 < i) && (Math.abs(DISTANCE) == Math.abs(closest_distance)) && (DISTANCE + last_distance == 0)) {
                var next_node = this.nodes[i+1]
                if (next_node == null) {
                    if (this.closed) {
                        next_node = this.nodes[0];
                    } else {
                        closest_distance = this.signed_distance_to_segment(i,POINT,VERTICAL_SCALING);
                        continue;
                    }
                }
                closest_distance = Math.abs(DISTANCE) * -Math.sign(this.nodes[i].sub(this.nodes[i-1]).cross(next_node.sub(this.nodes[i-1])));
            }
            
            last_distance = DISTANCE;
        }

        return  closest_distance;
    }
}

class CompressorMap {
    constructor(COMPRESSOR_MAP_DATA_STRING) {
        // set up the variables
        this.name = "Unnamed Compressor Map";
        this.compressor_img_url = "";
        this.graph_start_pixel = new Vec2(0,0);
        this.graph_end_pixel = new Vec2(10,10);
        this.graph_width = 0;
        this.graph_height = 0;
        this.min_efficiency = Infinity;
        this.max_efficiency = 0;
        this.min_speed = Infinity;
        this.max_speed = 0;

        this.speed_curves = [];
        this.efficiency_curves = [];

        // Load the compressor map data
        const COMPRESSOR_MAP_DATA = COMPRESSOR_MAP_DATA_STRING.split("\n");
        
        // Set the basic values
        this.name = COMPRESSOR_MAP_DATA[0];
        this.compressor_img_url = COMPRESSOR_MAP_DATA[1];
        this.graph_start_pixel = new Vec2(parseInt(COMPRESSOR_MAP_DATA[2]),parseInt(COMPRESSOR_MAP_DATA[3]));
        this.graph_end_pixel = new Vec2(parseInt(COMPRESSOR_MAP_DATA[4]),parseInt(COMPRESSOR_MAP_DATA[5]));
        this.graph_width = COMPRESSOR_MAP_DATA[6];
        this.graph_height = COMPRESSOR_MAP_DATA[7];


        const DIMENSIONS = this.graph_end_pixel.sub(this.graph_start_pixel);

        this.VERTICAL_SCALING = 1; // this solution to the artefacts didn't work.

        // iterate over the remaining data to add the curves
        for (var i=8; i<COMPRESSOR_MAP_DATA.length; i++) {
            const CURVE = new Curve(COMPRESSOR_MAP_DATA[i]);
            
            if (CURVE.curve_type == CURVE_TYPE.SPEED) {
                this.speed_curves[this.speed_curves.length] = CURVE;

                if (CURVE.value < this.min_speed) {
                    this.min_speed = CURVE.value;
                }
                if (CURVE.value > this.max_speed) {
                    this.max_speed = CURVE.value;
                }

            } else if (CURVE.curve_type == CURVE_TYPE.EFFICIENCY) {
                this.efficiency_curves[this.efficiency_curves.length] = CURVE;

                if (CURVE.value < this.min_efficiency) {
                    this.min_efficiency = CURVE.value;
                }
                if (CURVE.value > this.max_efficiency) {
                    this.max_efficiency = CURVE.value;
                }

            }
        }
    }
    determine_bounding_curves(POINT,TYPE) {
        var reference_curve_list = null;

        // select the type of curves to search
        if (TYPE == CURVE_TYPE.SPEED) {
            reference_curve_list = this.speed_curves;
        } else if (TYPE == CURVE_TYPE.EFFICIENCY) {
            reference_curve_list = this.efficiency_curves;
        }

        // break out of the function if the referenced list does not exist
        if (!reference_curve_list) {return;}

        // sort the list by its associated value
        reference_curve_list.sort((A,B)=>A.value-B.value);
       
        var closest_inside_index;
        var closest_outside_index;

        var closest_inside_distance = Infinity;
        var closest_outside_distance = Infinity;

        var closest_outright_index;
        var closest_outright_distance = Infinity;

        for (var i = 0; i < reference_curve_list.length; i++) {

            var is_inside = true;
            var min_dist = Infinity;
            var closest_curve_index;
            for (var offset = 0; offset + i < reference_curve_list.length &&  reference_curve_list[i+offset].value == reference_curve_list[i].value; offset ++) {
                const CURVE = reference_curve_list[offset + i];

                const DISTANCE = CURVE.signed_distance_to_curve(POINT,this.VERTICAL_SCALING);

                is_inside = is_inside && DISTANCE < 0;

                if (Math.abs(DISTANCE) < Math.abs(min_dist)) {
                    min_dist = DISTANCE;
                    closest_curve_index = i+offset
                }

            }
            i += offset -1;

            if (is_inside) {
                if (Math.abs(min_dist) < Math.abs(closest_inside_distance)) {
                    closest_inside_index = closest_curve_index;
                    closest_inside_distance = min_dist;
                }
            } else {
                if (Math.abs(min_dist) < Math.abs(closest_outside_distance)) {
                    closest_outside_index = closest_curve_index;
                    closest_outside_distance = min_dist;
                }
            }
            if (Math.abs(min_dist) < Math.abs(closest_outright_distance)) {
                closest_outright_index = closest_curve_index;
                closest_outright_distance = min_dist;
            }
        }

        if (closest_inside_index != null && closest_outside_index != null) {
            const CLOSEST_INSIDE_POINT = reference_curve_list[closest_inside_index].closest_point_on_curve(POINT,this.VERTICAL_SCALING);
            const CLOSEST_OUTSIDE_POINT = reference_curve_list[closest_outside_index].closest_point_on_curve(POINT,this.VERTICAL_SCALING);

            if (POINT.sub(CLOSEST_INSIDE_POINT).dot(CLOSEST_OUTSIDE_POINT.sub(POINT)) > 0) {
                return [closest_inside_index,closest_outside_index];
            }
        }

        return [closest_outright_index];
    }
    estimate_value(POINT,TYPE) {
        var reference_curve_list = null;

        // select the type of curves to search
        if (TYPE == CURVE_TYPE.SPEED) {
            reference_curve_list = this.speed_curves;
        } else if (TYPE == CURVE_TYPE.EFFICIENCY) {
            reference_curve_list = this.efficiency_curves;
        }

        // break out of the function if the referenced list does not exist
        if (!reference_curve_list) {return;}

        const BOUNDING_CURVES = this.determine_bounding_curves(POINT,TYPE);

        const CURVE_1 = reference_curve_list[BOUNDING_CURVES[0]]
        const CURVE_2 = reference_curve_list[BOUNDING_CURVES[1]]

        if (CURVE_1&&CURVE_2) {
            const D_1 = Math.abs(CURVE_1.signed_distance_to_curve(POINT,this.VERTICAL_SCALING));
            const D_2 = Math.abs(CURVE_2.signed_distance_to_curve(POINT,this.VERTICAL_SCALING));
            const V_1 = CURVE_1.value;
            const V_2 = CURVE_2.value;
            
            return V_1 + V_2 - (V_1*D_1)/(D_1+D_2) - (V_2*D_2)/(D_1+D_2);
        } else if (CURVE_1) {
            return CURVE_1.value;
        }
        else return 0

    }
}

