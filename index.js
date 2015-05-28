var _ = require("lodash");
var sylvester = require("sylvester");

// TODO: Provide a way to go back to 3D
// - To go back from local coordinates (Lx, Ly) to 3D the transformation is
// p = locOrigin + Lx*locX + Ly*locY

// Input: [[x,y,z], [...]]
// Output: [[x,y], [x,y]]
// Source: http://stackoverflow.com/a/26370192/997339
var points3dto2d = function(points3d, zUP, parent) {
  parent = (!parent) ? {} : parent;

  var p0 = $V(points3d[0]);
  var p1 = $V(points3d[1]);
  var p2 = $V(points3d[2]);

  var locOrigin = (parent.origin) ? parent.origin : p0.dup();
  var locX = (parent.locX) ? parent.locX : p1.subtract(locOrigin);
  var normal = (parent.normal) ? parent.normal : locX.cross(p2.subtract(locOrigin));
  var locY = (parent.locY) ? parent.locY : normal.cross(locX);

  var locXUnit = locX.toUnitVector();
  var locYUnit = locY.toUnitVector();

  var points2d = [];

  _.each(points3d, function(point) {
    var pointVec = $V(point);

    var pointVecMinusOrigin;
    var x, y;

    if (!zUP) {
      // Original code
      pointVecMinusOrigin = pointVec.subtract(locOrigin);
      x = pointVecMinusOrigin.dot(locXUnit);
      y = pointVecMinusOrigin.dot(locYUnit);
    } else {
      // Flip axis
      pointVecMinusOrigin = pointVec.subtract(locOrigin);
      x = pointVecMinusOrigin.dot(locYUnit);
      y = pointVecMinusOrigin.dot(locXUnit);
    }

    points2d.push([x, y]);
  });

  return {
    points: points2d,
    state: {
      origin: locOrigin,
      locX: locX,
      locY: locY,
      normal: normal
    }
  };
};

module.exports = points3dto2d;
