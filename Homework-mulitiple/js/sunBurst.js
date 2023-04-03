class SubSun {
  constructor(el, data, config) {
    this.data = data;
    this.el = el;
    this.config = config;
    this.selectData = data;

    this.wrangleData();
  }
  wrangleData() {
    const that = this;
    const rootData = {
      name: "root",
      children: [],
    };
    that.config.forEach((element) => {
      rootData.children.push({ name: element });
    });

    rootData.children.forEach((node) => {
      const temp = d3.rollup(
        this.selectData,
        (v) => v.length,
        (d) => d[node.name]
      );

      let children = Array.from(temp, ([name, value]) => ({ name, value }));

      node.children = children;
      let sum = 0;
      children.forEach((d) => {
        sum += d.value;
      });
      node.total = sum;
    });
    this.updated(rootData);
  }
  updated(data) {
    const that = this;
    d3.select(`#${that.el} svg`).remove();
    that.margin = { left: 10, right: 20, top: 20, bottom: 20 };

    that.width = document.getElementById(this.el).getBoundingClientRect().width;
    that.height = document
      .getElementById(this.el)
      .getBoundingClientRect().height;

    that.distance = d3.min([that.width, that.height]);

    that.radius = that.distance / 6;

    that.arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(that.radius * 1.5)
      .innerRadius((d) => d.y0 * that.radius)
      .outerRadius((d) => Math.max(d.y0 * that.radius, d.y1 * that.radius - 1));

    that.svg = d3
      .select(`#${that.el}`)
      .append("svg")
      .attr("viewBox", [0, 0, that.width, that.height])
      .style("font", "10px sans-serif");

    that.g = that.svg
      .append("g")
      .attr("transform", `translate(${that.width / 2},${that.height / 2})`);

    that.root = that.partition(data);
    that.root.each((d) => (d.current = d));

    barColor = d3.scaleOrdinal()
              .range(d3.schemePaired )
              .domain(data.children.map((d)=>d.name))
    ;
    that.path = that.g
      .append("g")
      .selectAll("path")
      .data(that.root.descendants().slice(1))
      .join("path")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return barColor(d.data.name);
      })
      .attr("fill-opacity", (d) => {
        return that.arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0;
      })
      .attr("d", (d) => that.arc(d.current));

    that.path
      .filter((d) => d.children)
      .style("cursor", "pointer")
      .on("click", (event, d) => that.clicked(d));

    that.label = that.g
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(that.root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr('font-size','0.8em')
      .attr("fill-opacity", (d) => +that.labelVisible(d.current))
      .attr("transform", (d) => that.labelTransform(d.current))
      .text((d) => d.data.name);

    that.parent = that.g
      .append("circle")
      .datum(that.root)
      .attr("r", that.radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", (event, d) => {
        return that.clicked(d);
      });

    typeSelected(that.root);
  }
  clicked(p) {
    const that = this;
    that.parent.datum(p.parent || that.root);
    that.root.each(
      (d) =>
        (d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        })
    );

    const t = that.g.transition().duration(750);

    that.path
      .transition(t)
      .tween("data", (d) => {
        const i = d3.interpolate(d.current, d.target);
        return (t) => (d.current = i(t));
      })
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || that.arcVisible(d.target);
      })
      .attr("fill-opacity", (d) =>
        that.arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attrTween("d", (d) => () => that.arc(d.current));

    that.label
      .filter(function (d) {
        return (
          +this.getAttribute("fill-opacity") || that.labelVisible(d.target)
        );
      })
      .transition(t)
      .attr("fill-opacity", (d) => +that.labelVisible(d.target))
      .attrTween("transform", (d) => () => that.labelTransform(d.current));

    //向外传递数据
    typeSelected(p);
  }

  arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }
  labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }
  labelTransform(d) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * this.radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
  //
  partition(data) {
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);
    return d3.partition().size([2 * Math.PI, root.height + 1])(root);
  }

  /**
   * 选择年龄段过滤数据
   */

  filterAge(ageArr) {
    const temp = d3.group(this.data, (d) => {
      let aim = Number(d["Customer_Age"]);
      return ageArr[0] <= aim && aim < ageArr[1];
    });
    this.selectData = temp.get(true);
    this.wrangleData();
  }
}
