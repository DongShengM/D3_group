class StarkBar {
  constructor(el, data) {
    this.el = el;
    this.data = data;
    this.displayData = data;
    this.wrangleData();
  }

  initChart() {
    let that = this;
    const tip = d3.select(`.tooltip`);
    const margin = {
      left: 40,
      right: 20,
      bottom: 120,
      top: 60,
    };
    d3.select(`#${this.el} svg`).remove();

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

    const data = this.displayData;

    const xScale = d3
      .scaleBand()
      .range([0, innerWidth])
      .domain(data.children.map((d) => d.name))
      .padding(0.2);

    const xAxis = d3.axisBottom(xScale);

    mainGroup
      .append("g")
      .attr("class", "x-axis axis")
      .attr("transform", `translate(0,${that.innerHeight})`)
      .call(xAxis);

    d3.selectAll(`#${that.el} .x-axis text`)
      .attr("text-anchor", "end")
      .attr("transform", `translate(-13,10) rotate(270) `);

    // const  color = d3.scaleOrdinal(d3.quantize(d3.interpolateSinebow, data.children.length + 1))

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data.children, (d) => d.total)])
      .range([that.innerHeight, 0])
      .nice();

    const yAxis = d3.axisLeft(yScale);

    mainGroup.append("g").call(yAxis);

    const barGroup = mainGroup
      .selectAll(".barGroup")
      .data(data.children)
      .join("g")
      .attr("class", "barGroup")
      .on('mouseover',function(event,d){
       let str =''
        d.children.forEach((t,i)=>{
         const  temp=`<span class='point' style='background:${barColor(d.name)};opacity:${0.8 - i * 0.15}' ></span><span>${t.name}</span><br>`
            str+=temp
        })
        tip.html(`
        <div class='map-tip'> 
          <p>${d.name}</p>
          <div>
            ${str}
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
      .on("mouseout", function (d, i) {
        tip.style("display", "none");
      });

    barGroup
      .selectAll("rect")
      .data((d) => d.children)
      .join("rect")
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => that.innerHeight - yScale(d.value))
      .attr("x", (d) => xScale(d.parent))
      .attr("y", (d, i) => {
        return yScale(d.value + d.y);
      })
      .attr("fill", (d, i) => {
        return barColor(d.parent);
      })
      .attr("fill-opacity", (d, i) => {
        return 0.8 - i * 0.15;
      });
  }

  wrangleData() {
    const data = this.data.data;

    data.children.forEach((ele) => {
      ele.children = ele.children.map((d) => ({ parent: ele.name, ...d }));

      let y = 0;
      for (let i = 0; i < ele.children.length; i++) {
        const temp = ele.children[i];
        temp.y = y;
        y += temp.value;
      }
    });

    this.displayData = data;
    this.initChart();
  }
}
