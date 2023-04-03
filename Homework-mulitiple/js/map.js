class AuMap {
  constructor(el, data) {
    this.el = el;
    this.mapData = data;

    this.wrangleData()
  }

  wrangleData(){

    this.initChart();
  }
  initChart() {
    const that = this;

    d3.select(`#${this.el} svg`).remove();
    const tip = d3.select('.tooltip')

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

    const mercator = d3
      .geoEquirectangular()
      .scale(500)
      .center([135.08, -30])
      .translate([width / 2, height / 2]);

    const container = svg.append("g");
    const path = d3.geoPath().projection(mercator);

    const data = this.mapData;
    container
      .append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("stroke", "white")
      .attr("strok-widht", 1)
      .style("cursor", "pointer")
      .attr("d", path)
      .attr("fill", "#444")
      .on("mouseover", function (event,d) {
        d3.select(this).attr("fill", "rgba(255,89,89,0.5)");
        const {cred,boy,girl} =that.mouseOver(d.properties.simple_name)
       
        tip.html(`
          <div class='map-tip'>
          <p>${d.properties.STATE_NAME}</p>
              <span>emplyment</span>
              <div >
                 <span class='point' ></span> <span>Female: ${girl}</span> <br>
                 <span class='point' ></span>  <span>Male: ${boy}</span>
              </div>
              <span style='margin-top:10px'>creditcard</span>
              <div>
                 <span class='point'/> </span>  <span>${cred}</span>
              </div>
          <div>
        `);
        tip.style("display", "block");
     
      }) .on("mousemove", function (event) {
        const x = event.pageX + 30;
        const y = event.pageY - 30;
        tip.style("top", y + "px").style("left", x + "px");
      })
      .on("mouseout", function (d, i) {
        d3.select(this).attr("fill", "#444");
        tip.style("display", "none");
      })
      .on("click", (d) => that.clicked(d));

    container
      .append("g")
      .selectAll("text")
      .data(data.features)
      .enter()
      .append("text")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        var position = mercator(d.properties.centroid || [0, 0]);

        return position[0];
      })
      .attr("y", function (d, i) {
        var position = mercator(d.properties.centroid || [0, 0]);
        return position[1];
      })
      .text(function (d, i) {
        return d.properties.STATE_NAME;
      });
  }

  mouseOver(state){
    const cred =  geoTipInfo.creditcard.filter((d)=>d.state==state)[0]
    const emp =geoTipInfo.emplyment.filter((d)=>d.state==state)[0]
    
    let girl=0,boy=0
      emp.value.forEach((d)=>{
          girl+=Number(d.Female)
          boy+=Number(d.Male)
      })
   return {cred:cred.value.length,girl,boy}
  }

  clicked(d) {
    this.mouseOver()
  }
}
