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

  var p0, p1, p2;

  // TODO: Find a good value for this threshold
  // - 0.01 still resulted in collinear issues
  // - 0.05 seems to work well, though unsure if it causes false-positives
  // TODO: Look at exposing this as an option rather than hard-coding it
  var collinearThreshold = 0.05;

  // Find first sequence of points that aren't collinear
  _.each(points3d, function(point, pIndex) {
    // Exit if no more points are available
    if (pIndex === points3d.length - 2) {
      return false;
    }

    p0 = $V(point);
    p1 = $V(points3d[pIndex+1]);
    p2 = $V(points3d[pIndex+2]);

    // Colinear or near-colinear?
    var cross = p0.subtract(p1).cross(p0.subtract(p2));

    // Exit if non-collinear points are found
    if (Math.abs(cross.e(1)) > collinearThreshold || Math.abs(cross.e(2)) > collinearThreshold || Math.abs(cross.e(3)) > collinearThreshold) {
      return false;
    }
  });

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
