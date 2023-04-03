class AgeRange {
  constructor(el, data) {
    this.data = data;
    this.el = el;
    this.initChart();

    this.distance = 0;
  }

  initChart() {
    const that = this;
    d3.select(`#${this.el} svg`).remove();
    const margin = {
      left: 20,
      right: 20,
      bottom: 20,
      top: 20,
    };

    const width = document
      .getElementById(that.el)
      .getBoundingClientRect().width;
    const height = document
      .getElementById(that.el)
      .getBoundingClientRect().height;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(`#${this.el}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    that.xScale = d3
      .scaleLinear()
      .domain(d3.extent(that.data))
      .range([0, innerWidth]);

    // const axis =d3.axisBottom(xScale)
    // .ticks(5)

    // mainGroup.append('g')
    // .call(axis)
    mainGroup
      .append("line")
      .attr('x1',0)
      .attr("x2", innerWidth)
      .attr("y1", 10)
      .attr("y2", 10)
      .attr('stroke-width',8)
      .attr('stroke-linecap','round')
      .attr("stroke", "#ccc");

    mainGroup
      .append("rect")
      .datum(AgeChecked)
      .attr("class", "rectRange")
      .attr("width", (d) => that.xScale(d[1]) - that.xScale(d[0]))
      .attr("height", 10)
      .attr("y", 5)
      .attr("x", (d) => that.xScale(d[0]))
      .attr("fill", "rgba(166, 206, 227,0.7)");

    mainGroup
      .selectAll(".point")
      .data(AgeChecked)
      .join("circle")
      .attr("class", "point")
      .style("cursor", "pointer")
      .attr("r", 7)
      .attr('stroke','black')
      .attr('fill','rgb(31, 120, 180,1)')
      .attr("cx", (d) => that.xScale(d))
      .attr("cy", 10)
      .call(
        d3
          .drag()
          .on("drag", function (d, flag) {
            return that.dragged(d, flag, this);
          })
          .on("end", function (d, flag) {
            d3.select(this).attr("cx", that.xScale(that.distance));
            that.updateRang(flag, that.distance);
          })
      );

    mainGroup
      .selectAll("text")
      .data(this.data)
      .join("text")
      .attr("transform", (d) => {
        return `translate(${that.xScale(d)},10)`;
      })
      .attr("text-anchor", "middle")
      .attr("y", 25)
      .text((d) => d);
  }
  dragged(d, flag, event) {
    if (d.x < 0 || d.x > this.xScale(80)) return;
    const aim = this.xScale.invert(d.x);
    const temp = (aim - d.subject) / 12;
    this.distance = Math.round(temp) * 12 + d.subject;

    if (AgeChecked[0] == flag && this.distance >= AgeChecked[1]) {
      this.distance = AgeChecked[1] - 12;
      return;
    }
    if (AgeChecked[1] == flag && this.distance <= AgeChecked[0]) {
      this.distance = AgeChecked[0] + 12;
      return;
    }
    d3.select(event).attr("cx", d.x);
    // this.updateRang(flag,)
  }

  updateRang(flag, aim) {
    let that = this;
    AgeChecked = AgeChecked.map((d) => {
      return d == flag ? aim : d;
    });
    d3.select(".rectRange")
      .datum(AgeChecked)
      .attr("width", (d) => this.xScale(d[1]) - this.xScale(d[0]))
      .attr("x", (d) => this.xScale(d[0]));

    //重新绑定数据
    d3.selectAll("svg .point").data(AgeChecked).join("circle");

    //年龄选择
    quitAge();
  }
}
