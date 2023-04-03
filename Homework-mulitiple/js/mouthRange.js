class MouthRange {
  constructor(el) {
    this.el = el;

  

    this.initChart();
  }
  initChart() {
    let that = this;
    d3.select(`#${this.el} svg`).remove();

    const margin = {
      left: 40,
      right: 40,
      bottom: 40,
      top: 40,
    };
    that.r = 6;
    const width = document
      .getElementById(that.el)
      .getBoundingClientRect().width;

    const height = document
      .getElementById(that.el)
      .getBoundingClientRect().height;

    const svg = d3
      .select(`#${this.el}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const mainGroup = svg
      .append("g")
      .attr("class", "mainGroup")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;

    const scale = d3.scalePoint().domain(monthIndex).range([0, innerWidth]);

    const line = d3
      .line()
      .x((d) => scale(d))
      .y(0);
    mainGroup
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", "8")
      .attr("d", line(monthIndex));

    mainGroup
      .selectAll("circle")
      .data(monthIndex)
      .join("circle")
      .attr("class", "circle")
      .style("cursor", "pointer")
      .attr("cx", (d) => scale(d))
      .attr("cy", 0)
      .attr("r", (d) => (d == monthChecked ? that.r * 1.5 : that.r))
      .attr("fill", (d) => (d == monthChecked ? "rgb(251, 154, 153)" : "rgba(31, 120, 180,0.8)"))
      .attr("stroke", "black");

    mainGroup
      .selectAll("text")
      .data(monthIndex)
      .join("text")
      .attr("x", (d) => scale(d))
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .text((d) => d);

    this.update();
  }
  update() {
    let that = this;

    d3.selectAll(".circle")
      .data(monthIndex)
      .join("circle")
      .attr("r", (d) => (d == monthChecked ? that.r * 1.5 : that.r))
      .attr("fill", (d) => (d == monthChecked ? "rgb(251, 154, 153)" : "rgba(31, 120, 180,0.8)"))
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", that.r * 1.5)
          .attr("fill", "rgb(251, 154, 153)");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", (d) => (d == monthChecked ? that.r * 1.5 : that.r))
          .attr("fill", (d) => (d == monthChecked ? "rgb(251, 154, 153)" : "rgba(31, 120, 180,0.8)"));
      })
      .on("click", function (event, d) {
        monthChecked = d;
        that.update();
        findMonthIndex()
      });
  }

  // clicked() {
  //   console.log(this);
  // }
}
