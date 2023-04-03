var width = 490,
  height = 400;
var margin = {
  top: 20,
  left: 30,
  bottom: 20,
  right: 20,
};
var svg = d3
  .select("#chart-box")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var container = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

var x = d3.scaleLinear().range([0, width - margin.left - margin.right]);

var y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

var x_axis = d3.axisBottom().scale(x);
var y_axis = d3.axisLeft().scale(y);

container
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${height - margin.top - margin.bottom})`);

container.append("g").attr("class", "y-axis");

var brush_g = container.append("g").attr("class", "brush");

let startX = 0,
  startY = 0;

let actived_circles = null;
let brush = null;

function updateChart(result, r) {
  let data = [];
  result.forEach((element) => {
    data.push(...element.points);
  });

  var x_max = d3.max(result, (d) => d3.max(d.points, (t) => t.value[0]));
  var y_max = d3.max(result, (d) => d3.max(d.points, (t) => t.value[1]));

  x.domain([0, x_max]);
  y.domain([0, y_max]);

  brush = d3
    .brush()
    .on("start", function () {
      svg.on("mousedown", null).on("mouseup", null);

      d3.selectAll("circle").on(".drag", null);
    })
    .on("brush", function () {
      var ext = d3.brushSelection(this);

      d3.selectAll("circle").classed("selected", (d) => {
        if (
          x(d.value[0]) >= ext[0][0] - r &&
          x(d.value[0]) <= ext[1][0] + r &&
          y(d.value[1]) >= ext[0][1] - r &&
          y(d.value[1]) <= ext[1][1] + r
        ) {
          return "true";
        }
      });
    })
    .on("end", function (d) {
      actived_circles = d3.selectAll(".selected").nodes().length;

      if (actived_circles) {
        d3.selectAll(".brush rect").remove();
      }
      moused();
    })
    .extent([
      [-margin.left, -margin.top],
      [width + margin.right, height + margin.bottom],
    ]);

  brush_g.call(brush);

  d3.select(".selection").style("display", "none");

  const drag = d3
    .drag()
    .on("drag", function (event, d) {
      d3.select(this)
        .raise()
        .attr("cx", function (t) {
          t.x = x.invert(event.x);
          return event.x;
        })
        .attr("cy", function (t) {
          t.y = y.invert(event.y);
          return event.y;
        });
    })
    .on("end", function (event, d) {
      let arr = [];

      d3.selectAll("circle").each((d) => {
        if (d.x && d.y) {
          arr.push([d.x, d.y]);
        } else {
          arr.push(d.value);
        }
      });
      runKmeans(arr, k, distanceType);
    });

  container
    .selectAll(".circle")
    .data(data)
    .join("circle")
    .attr("class", "circle")
    .call(drag);

  container
    .selectAll(".circle")
    .transition()
    .duration(500)
    .attr("cx", (d) => {
      return x(d.value[0]);
    })
    .attr("cy", (d) => {
      return y(d.value[1]);
    })
    .attr("r", r)
    .attr("fill", (d, i) => {
      return d3.schemeSet2[d.type];
    });

  d3.select(".y-axis").transition().duration(500).call(y_axis);
  d3.select(".x-axis").transition().duration(500).call(x_axis);

  function moused() {
    svg
      .on("mousedown", function (start) {
        startX = start.offsetX;
        startY = start.offsetY;

        if (actived_circles) {
          d3.select(this).on("mousemove", function (event) {
            if (
              event.offsetX < margin.left ||
              event.offsetY < margin.top ||
              event.offsetX > width - margin.right ||
              event.offsetY > height - margin.bottom
            ) {
              d3.select(this).on("mousemove", null);

              if (actived_circles) {
                let arr = [];
                d3.selectAll("circle").each((d) => {
                  if (d.x && d.y) {
                    arr.push([d.x, d.y]);
                  } else {
                    arr.push(d.value);
                  }
                });
                runKmeans(arr, k, distanceType);
              }
              return;
            }

            d3.selectAll(".selected")
              .attr("cx", (d) => {
                var move = x(d.value[0]) + event.offsetX - startX;
                d.x = x.invert(move);
                return move;
              })
              .attr("cy", (d) => {
                var move = y(d.value[1]) + event.offsetY - startY;
                d.y = y.invert(move);
                return move;
              });
          });
        }
      })
      .on("mouseup", function () {
        d3.select(this).on("mousemove", null);

        if (actived_circles) {
          let arr = [];
          d3.selectAll("circle").each((d) => {
            if (d.x && d.y) {
              arr.push([d.x, d.y]);
            } else {
              arr.push(d.value);
            }
          });
          runKmeans(arr, k, distanceType);
        }
      });
  }
}
