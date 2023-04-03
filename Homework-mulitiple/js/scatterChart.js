class ScatterChart {
  constructor(el) {
    this.el = el;
    this.initChart();
  }
  initChart() {
    let that = this;
    const margin = {
      left: 40,
      right: 40,
      bottom: 40,
      top: 70,
    };
    d3.select(`#${this.el} svg`).remove();

    const width = document
      .getElementById(that.el)
      .getBoundingClientRect().width;
    const height = document
      .getElementById(that.el)
      .getBoundingClientRect().height;

    that.innerWidth = width - margin.left - margin.right;
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

    that.xScale = d3.scaleLinear().range([0, that.innerWidth]);

    that.yScale = d3.scaleLinear().range([this.innerHeight, 0]);

    that.xAxis = d3
      .axisBottom()
      .scale(that.xScale)
      .ticks(7)
      .tickSize(-that.innerHeight);
    that.yAxis = d3
      .axisLeft()
      .scale(that.yScale)
      .ticks(7)
      .tickSize(-that.innerWidth);

    mainGroup
      .append("g")
      .attr("class", "x-axis axis")
      .attr("transform", `translate(0,${that.innerHeight})`);

    mainGroup.append("g").attr("class", "y-axis axis");

    svg.append("text").attr("class", "myXtext");

    mainGroup.append("text").attr("class", "myYtext");

    mainGroup
      .append("path")
      .attr("class", "regression")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2);

    mainGroup.append('text')
    .attr('class','title')
    .attr('x',this.innerWidth/2)
    .attr('y',-20)
    .attr('text-anchor','middle')
    .attr('font-size','1.2em')
    
  }
  wrangleData(data) {
    const { value,key} = data;

    d3.select('.title').text(key)

    const pointData = value.map((el) => {
      const Bill =
        Number(el.Bill_Apr) +
        Number(el.Bill_May) +
        Number(el.Bill_Jun) +
        Number(el.Bill_Jul) +
        Number(el.Bill_Aug) +
        Number(el.Bill_Sep);

      const Pay =
        Number(el.Pay_Apr) +
        Number(el.Pay_May) +
        Number(el.Pay_Jun) +
        Number(el.Pay_Jul) +
        Number(el.Pay_Aug) +
        Number(el.Pay_Sep);
      return { Bill:Bill/25, Pay:Pay/25 };
    });

    this.updateChart(pointData);
  }

  updateChart(data) {
    const that = this;
    that.xScale.domain([0, d3.max(data, (d) => d.Bill)]).nice();
    that.yScale.domain([0, d3.max(data, (d) => d.Pay)]).nice();

    const regression = d3
      .regressionLinear()
      .x((d) => that.xScale(d["Bill"]))
      .y((d) => that.yScale(d["Pay"]));
    const line = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1]);

    d3.select(`#${this.el} .regression`).attr("d", line(regression(data)));

    d3.select(`#${this.el} .mainGroup`)
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => that.xScale(d["Bill"]))
      .attr("cy", (d) => that.yScale(d["Pay"]))
      .attr("r", 3)
      .attr("opacity", 0.4);

    d3.select(`#${this.el} .myXtext`)
      .text("Bill")
      .attr(
        "transform",
        `translate(${that.innerWidth + 40},${that.innerHeight + 100})`
      );

    d3.select(`#${this.el} .myYtext`)
      .text("Pay")
      .attr("transform", `translate(-20,-20)`);

    d3.select(`#${that.el} .y-axis`).call(that.yAxis);
    d3.select(`#${that.el} .x-axis`).call(that.xAxis);
  }
}
