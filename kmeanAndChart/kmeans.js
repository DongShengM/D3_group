function kmeans(data, config, function_type) {
  // default k
  var k = config.k || Math.round(Math.sqrt(data.length / 2));
  var iterations = config.iterations;

  // initialize point objects with data
  var points = data.map(function (vector) {
    return new Point(vector, function_type);
  });

  // intialize centroids randomly
  var centroids = [];
  for (var i = 0; i < k; i++) {
    centroids.push(new Centroid(points[i % points.length].location(), i));
  }

  // update labels and centroid locations until convergence
  for (var iter = 0; iter < iterations; iter++) {
    points.forEach(function (point) {
      point.updateLabel(centroids);
    });
    centroids.forEach(function (centroid) {
      centroid.updateLocation(points);
    });
  }

  // return points and centroids
  return {
    points: points,
    centroids: centroids,
  };
}

// objects
function Point(location, function_type) {
  var self = this;

  this.location = getterSetter(location);
  this.label = getterSetter();
  this.updateLabel = function (centroids) {
    var distancesSquared = centroids.map(function (centroid) {
      if (function_type == "L1") {
        return L1(self.location(), centroid.location());
      } else if (function_type == "L2") {
        return L2(self.location(), centroid.location());
      } else {
        return cosine(self.location(), centroid.location());
      }
    });

    if (function_type == "cos") {
      self.label(Maxdex(distancesSquared));
    } else {
      self.label(mindex(distancesSquared));
    }

    // self.label(mindex(distancesSquared));
  };
}

function Centroid(initialLocation, label) {
  var self = this;
  this.location = getterSetter(initialLocation);
  this.label = getterSetter(label);
  this.updateLocation = function (points) {
    var pointsWithThisCentroid = points.filter(function (point) {
      return point.label() == self.label();
    });
    if (pointsWithThisCentroid.length > 0)
      self.location(averageLocation(pointsWithThisCentroid));
  };
}

// convenience functions
function getterSetter(initialValue, validator) {
  var thingToGetSet = initialValue;
  var isValid =
    validator ||
    function (val) {
      return true;
    };
  return function (newValue) {
    if (typeof newValue === "undefined") return thingToGetSet;
    if (isValid(newValue)) thingToGetSet = newValue;
  };
}

function L1(oneVector, anotherVector) {
  var squareDiffs = oneVector.map(function (component, i) {
    return Math.abs(component - anotherVector[i]);
  });
  return squareDiffs.reduce(function (a, b) {
    return a + b;
  }, 0);
}

function cosine(oneVector, anotherVector) {
  let [x1, y1] = oneVector;
  let [x2, y2] = anotherVector;

  const t = x1 * x2 + y1 * y2;
  const b =
    Math.sqrt(Math.pow(x1, 2) + Math.pow(y1, 2)) *
    Math.sqrt(Math.pow(x2, 2) + +Math.pow(y2, 2));
  return t / b;
}
i = 0;
function L2(oneVector, anotherVector) {
  var squareDiffs = oneVector.map(function (component, i) {
    return Math.pow(component - anotherVector[i], 2);
  });

  let total = squareDiffs.reduce(function (a, b) {
    return a + b;
  }, 0);

  return Math.sqrt(total);
}

function Maxdex(array) {
  var max = array.reduce(function (a, b) {
    return Math.max(a, b);
  });
  return array.indexOf(max);
}

function mindex(array) {
  var min = array.reduce(function (a, b) {
    return Math.min(a, b);
  });
  return array.indexOf(min);
}

function sumVectors(a, b) {
  return a.map(function (val, i) {
    return val + b[i];
  });
}

function averageLocation(points) {
  var zeroVector = points[0].location().map(function () {
    return 0;
  });
  var locations = points.map(function (point) {
    return point.location();
  });
  var vectorSum = locations.reduce(function (a, b) {
    return sumVectors(a, b);
  }, zeroVector);
  return vectorSum.map(function (val) {
    return val / points.length;
  });
}
