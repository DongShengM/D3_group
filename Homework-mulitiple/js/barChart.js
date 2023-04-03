class BarChart {
  constructor(el, data) {
    this.el = el;
    this.data = data;

    this.initChart();
  }

  initChart() {
    let that = this;
    d3.select(`#${this.el} svg`).remove();

    const margin = {
      left: 40,
      right: 20,
      bottom: 120,
      top: 60,
    };

    const width = document
      .getElementById(that.el)
      .getBoundingClientRect().width;
    const height = document
      .getElementById(that.el)
      .getBoundingClientRect().height;

    const innerWidth = width - margin.left - margin.right;
    that.innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(`#${this.el}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const mainGroup = svg
      .append("g")
      .attr("class", "mainGroup")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    that.xScale = d3.scaleBand().range([0, innerWidth]).padding(0.2);

    that.yScale = d3.scaleLinear().range([that.innerHeight, 0]);

    that.xAxis = d3.axisBottom().scale(that.xScale);
    that.yAxis = d3.axisLeft().scale(that.yScale);

    mainGroup
      .append("g")
      .attr("class", "x-axis axis")
      .attr("transform", `translate(0,${that.innerHeight})`);

    mainGroup.append("g").attr("class", "y-axis axis");
  }

  wrangleData(data) {
    this.updateChart(data);
  }

  updateChart({ data, value }) {
    const that = this;

    const yArr = data.children.map((d) => d.value);
    that.xScale.domain(data.children.map((d) => d.name));
    that.yScale.domain([0, d3.max(yArr) / value]);

    const tip = d3.select(`.tooltip`);

    d3.select(".mainGroup")
      .selectAll(".rect")
      .data(data.children)
      .join("rect")
      .attr("class", "rect")
      .style("cursor", "pointer")
      .attr("width", that.xScale.bandwidth())
      .attr("height", (d) => {
        return that.innerHeight - that.yScale(d.value / value);
      })
      .attr("x", (d, i) => {
        return that.xScale(d.name);
      })
      .attr("y", (d) => that.yScale(d.value / value))
      .attr("fill", (d) => {
        return barColor(d.parent);
      })
      .attr("fill-opacity", 0.3)
      .on("mouseover", function (event,d) {
        d3.select(this).attr("fill-opacity", "0.6");
        tip.html(`
          <div class='map-tip'> 
            <p>${d.name}</p>
            <div>
              <span class='point'></span>
              <span>${d.value}</span>
            </div>

          </div>
        `);
        tip.style("display", "block");
      })
      .on("mousemove", function (event) {
        const x = event.pageX + 30;
        const y = event.pageY - 30;
        tip.style("top", y + "px").style("left", x + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill-opacity", "0.3");
        tip.style("display", "none");
      });

    d3.select(`#${that.el} .y-axis`).call(that.yAxis);
    d3.select(`#${that.el} .x-axis`).call(that.xAxis);

    d3.selectAll(`#${that.el} .x-axis text`)
      .attr("text-anchor", "end")
      .attr("transform", `translate(-13,10) rotate(270) `);
  }
}
