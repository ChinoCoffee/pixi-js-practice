/**
 * geometry.js
 */


/////////////////////////////////////
//     Utilities
/////////////////////////////////////

function debugP(p) {
}


function proportion(x, y, p) {
    return (y - x) * p + x;
}

function zeropad(stops, reverse) {
    var direction = (reverse) ? 1: 0;

    return stops.map(function(s) {
        var max_normal = Math.max(s[0][0], s[0][1]);
        var mi = s[0].indexOf(max_normal);
        var new_normals = (mi == direction) ? [0, s[0][1]]: [s[0][0], 0];
        return [new_normals, s[1]];
    });
}


/*
function TwoBezierInterpolator(path1, path2) {
    this.path1 = path1.curves[0].getValues();
    this.path2 = path2.curves[0].getValues();
    path1.visible = false;
    path2.visible = false;
}
TwoBezierInterpolator.prototype.interpolate = function(t) {
    var values = [];
    for (var i = 0; i < this.path1.length; i++) {
        values.push(
            proportion(this.path1[i], this.path2[i], t)
        );
    }
    var result = new Path();
    result.moveTo([values[0], values[1]]);
    result.cubicCurveTo(
        [values[2], values[3]],
        [values[4], values[5]],
        [values[6], values[7]]
    );
    return result;
}
 */


/////////////////////////////////////
//     GraduatedOutline
/////////////////////////////////////

function GraduatedOutline(bezier, numDiv) {
    this.numDiv = (numDiv !== undefined) ? numDiv: 25;
    this.bezier = bezier;
    this.stops = {};
}

GraduatedOutline.prototype.setNumDiv = function(numDiv) {
    this.numDiv = numDiv;
}

GraduatedOutline.prototype.length = function() {
    return this.bezier.length();
}

GraduatedOutline.prototype.calcOutline = function(bezier, t1, t2, d1, d2, d3, d4) {
    var splitted = bezier.split(t1, t2);
    return splitted.outline(d1, d2, d3, d4);
}

GraduatedOutline.prototype.getNormalSplines = function(stops) {
    var result = [];
    var spline, tvList;

    for (var i = 0; i <= 1; i++) {
        tvList = stops.map(function(s) {
            return [s[1], s[0][i]];
        });

        spline = new Spline(tvList);
        result.push(spline);
    }
    return result;
}

GraduatedOutline.prototype.drawOutline = function(graphics, stops) {
    /*
      Structure of stops:

        stops = [
            [[normal, anti_normal], t],
            ...
        ]
    */
    var splines = this.getNormalSplines(stops);

    function getStops(t) {
        return [[splines[0].interpolate(t), splines[1].interpolate(t)], t];
    }

    var _curves;
    var t, stop1, stop2;

    var ls,
        le,
        fcurves = [],
        bcurves = [];
    var L;

    for (var i = 0; i < this.numDiv; i++) {

        stop1 = getStops(i / this.numDiv);
        stop2 = getStops((i + 1) / this.numDiv);

        _curves = this.getOneCurveOutline(stop1, stop2).curves;
        L = _curves.length;

        if (i == 0) {   // start
            ls = _curves[0];
        }
        if (i == this.numDiv - 1) {   // end
            le = _curves[L / 2];
        }

        fcurves = fcurves.concat(_curves.slice(1, L / 2));
        bcurves = (_curves.slice(L / 2 + 1)).concat(bcurves);
    }

    // Concatenate all curves
    var allCurves = [ls].concat(fcurves).concat([le]).concat(bcurves);

    // draw
    var moveTo, bezierCurveTo;

    if (graphics.constructor.name === 'PaperScope') {
        // Paper.js
        var path = new graphics.Path();
        moveTo = function(p) { path.moveTo(p); };
        bezierCurveTo = function(p1, p2, p3) {
            path.cubicCurveTo(p1, p2, p3);
        };
    } else {
        // Pixi.js
        moveTo = function(p) { graphics.moveTo(p.x, p.y); };
        bezierCurveTo = function(p1, p2, p3) {
            graphics.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        };
    }

    moveTo(allCurves[0].points[0]);
    allCurves.forEach(function(curve) {
        bezierCurveTo(curve.points[1], curve.points[2], curve.points[3]);
    });

    if (graphics.constructor.name === 'PaperScope') {
        path.closePath(true);
        return path;
    }
};

GraduatedOutline.prototype.getOneCurveOutline = function(stop1, stop2) {
    var t1 = stop1[1], t2 = stop2[1];
    var n1 = stop1[0][0], a1 = stop1[0][1],
        n2 = stop2[0][0], a2 = stop2[0][1];

    var _outline = this.calcOutline(
        this.bezier,
        t1, t2,
        n1, a1, n2, a2);
    return _outline;
};
