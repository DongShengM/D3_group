class MultipleLine {
  constructor(el, data) {
    this.el = el;
    this.xValue = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    
    this.data = data;
    this.displayData = data;
    this.wrangleData();
  }

  wrangleData() {
    const temp = d3.group(this.data, (d) => {
      const age = +d.AGE;
      let age_lang = "";

      if (age >= 20 && age < 32) {
        age_lang = "20-32";
      } else if (age >= 32 && age < 44) {
        age_lang = "32-44";
      } else if (age >= 44 && age < 56) {
        age_lang = "44-56";
      } else if (age >= 56 && age < 68) {
        age_lang = "56-68";
      } else {
        age_lang = "68-80";
      }
      return age_lang;
    });

    const arrayData = Array.from(temp, ([key, value]) => ({
      key,
      value,
    }));
    this.displayData = this.DealMonths(arrayData);

    if (checkedType == "Pay" || checkedType == "Bill") {
      this.displayData = this.displayData.filter((d) => d.type == checkedType);
    }
    this.initChart();
  }

  initChart() {
    let that = this;

    const data = this.displayData;
    that.color = d3
      .scaleOrdinal()
      .range(d3.schemePastel1)
      .domain(["Pay", "Bill"]);
    that.margin = {
      left: 80,
      right: 80,
      bottom: 40,
      top: 70,
    };

    const tip = d3.select(`.tooltip`);

    d3.select(`#${this.el} svg`).remove();

    const width = document
      .getElementById(that.el)
      .getBoundingClientRect().width;
    const height = document
      .getElementById(that.el)
      .getBoundingClientRect().height;

    const innerWidth = width - that.margin.left - that.margin.right;
    that.innerHeight = height - that.margin.top - that.margin.bottom;

    const svg = d3
      .select(`#${this.el}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .on("mousemove",(event)=> that.mouseMove(event))
      .on('mouseout',()=>{
        d3.select('.tooltip').style('display','none')
        that.line.attr('opacity',0)
      })

    that.line = svg
      .append("line")
      .attr("y1", that.margin.top)
      .attr("y2", that.innerHeight + that.margin.top)
      .attr("stroke", "#ccc")
      .attr('stroke-dasharray',3)
      .attr("stroke-width", 2);
    const mainGroup = svg
      .append("g")
      .attr("class", "mainGroup")
      .attr("transform", `translate(${that.margin.left},${that.margin.top})`);


     const legend_g= mainGroup.selectAll('legend')
      .data(["Pay", "Bill"])
      .join('g')
      .attr('transform',(d,i)=>`translate(${innerWidth/2+i*100-70},-20)`)

      legend_g.append('line')
      .attr('x1',0)
      .attr('y1',0)
      .attr('x2',20)
      .attr('y2',0)
      .attr('stroke',(d)=>that.color(d))
      .attr('stroke-width',2)
      

      legend_g.append('text')
      .text((d)=>d)
      .attr('x',30)
      .attr('y',7)


    that.xScale = d3
      .scalePoint()
      .range([0, innerWidth])
      .domain([...that.xValue]);

    const xAxis = d3.axisBottom(that.xScale);

    mainGroup
      .append("g")
      .attr("transform", `translate(0,${this.innerHeight})`)
      .call(xAxis);

    const xDomain = d3.max(data, (d) => d3.max(d.children, (m) => m.q1));

    mainGroup
      .append("text")
      .text("(aud)")
      .attr("transform", `translate(-20,-15)`);
    const yScale = d3
      .scaleLinear()
      .domain([0, xDomain])
      .range([this.innerHeight, 0])
      .nice();

    const yAxis = d3.axisLeft(yScale);

    mainGroup.append("g").call(yAxis);
    let line = d3
      .line()
      .curve(d3.curveCardinal)
      .x((d, i) => {
        return that.xScale(d.name);
      })
      .y((d, i) => {
        return yScale(+d.q1);
      });

    const lineG = mainGroup.selectAll(".path").data(data).join("g");

    lineG
      .append("path")
      .attr("fill", "none")
      .style("cursor", "pointer")
      .attr("stroke-width", "3")
      .attr("stroke", (d) => {
        return that.color(d.type);
      })
      .attr("d", (d) => {
        return line(d.children);
      })
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "rgb(178, 223, 138)");
        
      })
     
      .on("mouseout", function () {
        d3.select(this).attr("stroke", (d) => that.color(d.type));
      })
      .on("click", function (event, d) {
        that.clicked(d);
      });

      lineToPoint(data[0])
  }

  DealMonths(data) {
    const BillData = data.map((line) => {
      const mapBill = new Map();
      this.xValue.forEach((v) => {
        mapBill.set(
          v,
          line.value.map((d) => Number(d[`Bill_${v}`]))
        );
      });
      const ob = {};

      const temp = Array.from(mapBill, ([name, value]) => ({
        name,
        value,
      }));
      ob.children = temp.map((d) => {
        return {
          name: d.name,
          value: d.value,
          mean: Math.round(d3.mean(d.value)),
          median: Math.round(d3.median(d.value)),
          q1: Math.round(d3.quantile(d.value, 0.25)),
        };
      });
      ob.value = line.value;
      ob.type = "Bill";
      ob.key = line.key;
      return ob;
    });
    const PayData = data.map((line) => {
      const mapPay = new Map();
      this.xValue.forEach((v) => {
        mapPay.set(
          v,
          line.value.map((d) => Number(d[`Pay_${v}`]))
        );
      });
      const ob = {};

      const temp = Array.from(mapPay, ([name, value]) => ({
        name,
        value,
      }));

      ob.children = temp.map((d) => {
        return {
          name: d.name,
          value: d.value,
          mean: Math.round(d3.mean(d.value)) * 8,
          median: d3.median(d.value),
          q1: d3.quantile(d.value, 0.25),
        };
      });

      ob.value = line.value;
      ob.type = "Pay";
      ob.key = line.key;
      return ob;
    });

    return BillData.concat(PayData);
  }

  clicked(d) {
    lineToPoint(d);
  }

  mouseMove(event){
    const that =this

    
    if (event.x - that.margin.left < 1) return;

    that.line.attr('opacity',1)
    let step = Math.ceil((event.x - that.margin.left) / that.xScale.step());
    const xName = that.xValue[step - 1];
    const distance = that.xScale(xName) + that.margin.left;
    that.line.attr("x1", distance).attr("x2", distance);

   const tipInfo = d3.map(that.displayData, (d) => {

      const fil = d3.filter(d.children, (t) => t.name == xName)[0];
      return { ...fil, key: d.key,type:d.type};
    });

    const tip = d3.select(`.tooltip`);

    let str =''

    tipInfo.forEach((t)=>{
      str+=`  <span class='point' style='background:${that.color(t.type)};opacity:0.8'></span>
       <span>${t.key  }</span>
       <span style='margin-left:5px'>${t.q1}</span><br>`
    })
    tip.html(`
    <div class='map-tip'> 
      <div>
      ${str}
      </div>
    </div>
  `);
  tip.style("display", "block");
  const x = event.pageX + 30;
  const y = event.pageY - 30;
  tip.style("top", y + "px").style("left", x + "px");

  }
}
