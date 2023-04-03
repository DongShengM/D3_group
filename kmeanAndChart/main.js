let distanceType = document.getElementById("FunctionSelector").value;

let k = 3,
  c_r = 3;

const promiseData = d3.csv(
  "../north-carolina-school-performance-data_1.csv",
  function (data, i) {
    return {
      pctpassingeogtests: data["pctpassingeogtests"],
      pctfreereduced: data["pctfreereduced"],
      schoolscore: data["schoolscore"],
    };
  }
);

let activeNutritional = "Combination_A";
selectData();

function selectData(param) {
  if (param) {
    activeNutritional = param;
  }
  d3.selectAll(".dataType-item").classed("active", false);

  d3.select("." + activeNutritional).classed("active", true);

  let combination = [];
  if (activeNutritional == "Combination_A") {
    combination = ["pctpassingeogtests", "pctfreereduced"];
  } else if (activeNutritional == "Combination_B") {
    combination = ["pctfreereduced", "schoolscore"];
  } else {
    combination = ["pctpassingeogtests", "schoolscore"];
  }

  promiseData.then((data) => {
    const arr = data.map((d) => {
      return [+d[combination[0]], +d[combination[1]]];
    });

    runKmeans(arr.slice(0, 100), k, distanceType);
  });
}

function runKmeans(data, k, function_type) {
  var pointsAndCentroids = kmeans(
    data,
    {
      k: k,
      iterations: 1000,
    },
    function_type
  );

  var points = pointsAndCentroids.points;
  var centroids = pointsAndCentroids.centroids;

  const result = centroids.map(function (centroid, i) {
    return {
      centroid: centroid.location(),
      points: points
        .filter(function (point) {
          return point.label() == centroid.label();
        })
        .map(function (point) {
          return {
            value: point.location(),
            type: i,
          };
        }),
    };
  });

  updateChart(result, c_r);
}

function showValue(val) {
  k = val;
  d3.select(".clusters-k").html(val);
  selectData();
}

function changeCircle(val) {
  c_r = val;
  d3.select(".circle-r").html(val);
  selectData();
}

function FunctionChange() {
  distanceType = document.getElementById("FunctionSelector").value;
  selectData();
}
