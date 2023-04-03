class DoubleBar {
  constructor(el,data) {
    this.el = el;

    this.data = data

    this.rightData= data
    this.leftData =data

    this.xValue = ['VIC','NSW','SA','QLD','NT','WA','TAS','ACT']
    this.initChart();
  }
  initChart() {
    let that = this;
    d3.select(`#${this.el} svg`).remove();

    const margin = {
      left: 40,
      right: 120,
      bottom: 120,
      top: 60,
    };

    that.color = ["#9da8b8", "#8496a7"];
    const title = ['emplyment','creditcard']

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
      // .attr('viewBox')
      .attr("width", width)
      .attr("height", height);

    const mainGroup = svg
      .append("g")
      .attr("class", "mainGroup")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    mainGroup.append("g").attr("class", "leftGroup");
    mainGroup.append("g").attr("class", "rightGroup");

    that.xScaleLeft = d3
      .scaleLinear()
      .range([0, that.innerWidth / 2-50])
      .nice();

    that.xScaleRight = d3
      .scaleLinear()
      .range([0, that.innerWidth / 2-50])
      .nice();

    that.yScale = d3.scaleBand().range([0, this.innerHeight]).padding(0.3);

    that.xAxisLeft = d3.axisBottom().scale(that.xScaleLeft).ticks(5)
    .tickFormat((d)=>{
      if(d==0) return 0
      return d/1000+'k'
    });

    that.xAxisRight = d3.axisBottom().scale(that.xScaleRight).ticks(5);

    that.yAxis = d3.axisLeft().scale(that.yScale);
    mainGroup.append('text').attr('class','numberValue')

    // mainGroup.append('text')
    // .attr('transform',`translate(-40,${that.innerHeight+16})`)
    // .attr('font-size','0.7em')
    // .text('(k)')

    // mainGroup.append('text')
    // .attr('transform',`translate(${that.innerWidth+10},${that.innerHeight+16})`)
    // .attr('font-size','0.7em')
    // .text('(个)')

   const g_title =  mainGroup.selectAll('title').data(title)
    .join('g')
    .attr('transform',`translate(${this.innerWidth+20},${this.innerHeight-20})`)

    g_title
    .append('text')
    .text((d)=>d)
    .attr('font-size','0.7em')
    .attr('text-anchor','start')
    .attr('x',(d)=>25)
    .attr('y',(d,i)=>i*(-20)+8)

    g_title.append('rect')
    .attr('width',20)
    .attr('height',12)
    .attr('y',(d,i)=>i*(-20))
    .attr('fill',(d,i)=>this.color[i])
    
    mainGroup
      .append("g")
      .attr("class", "x-axis-left axis")
      .attr("transform", `translate(50,${that.innerHeight})`);

    mainGroup
      .append("g")
      .attr("class", "x-axis-right axis")
      .attr(
        "transform",
        `translate(${that.innerWidth / 2},${that.innerHeight})`
      );

    mainGroup.append("g").attr("class", "y-axis axis");


    
  }

  wrangleData(index) {
    const byMonths =d3.group(this.data,(d)=>{
      return Number(d['CRED_REP_START_DT'].split('/')[1])
     })

  const arrMonths =Array.from(byMonths,([month,value])=>({month,value})).sort((a,b)=>a.month-b.month)
  const selectData=arrMonths.filter((d)=>d.month==index)


  this.rightData = Array.from(d3.group(selectData[0].value,(d)=>d['CRED_REP_STATE']),([state,value])=>({state,value}))

  const months={'JAN':1,'FEB':2,'MAR':3,'APR':4,'MAY':5,'JUN':6,'JUL':7,'AUG':8,'SEP':9,'OCT':10,'NOV':11,'DEC':12}

  const byMLeft = d3.group(emplymentData,(d)=>d['months'])

    const selectL =Array.from(byMLeft,([month,value])=>({month,value})).filter((d)=>months[d.month]==index)
    
    const temp = d3.group(selectL[0].value,(d)=>{
            let arr =  d['ESA_NAME'].split(' ')
            let t = arr[arr.length-1]
            return  this.xValue.includes(t) ?t:'ACT'
            })

    const stat_data =Array.from(temp,([state,value])=>({state,value}))

   const empData =  stat_data.map((d)=>{
      let total = 0
      d.value.forEach((v)=>{
       total=total+ Number(v.Male)+Number(v.Female)
      })
      return {...d,people:total}
    })
    
    this.leftData =empData
   
    geoTipInfo.creditcard = this.rightData
    geoTipInfo.emplyment = this.leftData


    this.updataChart();
  }

  updataChart() {
    const that = this;

    that.yScale.domain(this.xValue);

    const xdomainL = d3.max(this.leftData, (d) => d.people);
    that.xScaleLeft.domain([xdomainL, 0]);

    const xdomainR = d3.max(this.rightData, (d) => d.value.length);
    that.xScaleRight.domain([0, xdomainR]);

    d3.select(".leftGroup")
      .selectAll("rect")
      .data( that.leftData)
      .join("rect")
      .attr("width", (d) => that.innerWidth / 2 - that.xScaleLeft(d.people)-50)
      .attr("height", (d) => that.yScale.bandwidth())
      .attr("x", (d) => that.xScaleLeft(d.people)+50)
      .attr("y", (d) => that.yScale(d.state))
      .attr("fill", that.color[0])
      .on('mouseover',function (event,d) { 
        d3.select('.numberValue')
        .text(d.people)
        .attr('y',that.yScale(d.state)+that.yScale.bandwidth()-4)
        .attr('font-size','0.8em')
        .attr("x",  that.xScaleLeft(d.people))
       })
       .on('mouseout',function (event,d) { 
        d3.select('.numberValue')
        .text('')
       })
    

    d3.select(".rightGroup")
      .selectAll("rect")
      .data(this.rightData)
      .join("rect")
      .attr("width", (d) => that.xScaleRight(d.value.length))
      .attr("height", (d) => that.yScale.bandwidth())
      .attr("x", that.innerWidth / 2)
      .attr("y", (d) => that.yScale(d.state))
      .attr("fill", that.color[1])
      .on('mouseover',function (event,d) { 
       
        d3.select('.numberValue')
        .text(d.value.length)
        .attr('y',that.yScale(d.state)+that.yScale.bandwidth()-4)
        .attr('font-size','0.8em')
        .attr("x",that.innerWidth / 2+ that.xScaleRight(d.value.length)+1 )
       })
       .on('mouseout',function (event,d) { 
        d3.select('.numberValue')
        .text('')
       })
    ;

    d3.select(`#${that.el} .y-axis`).call(that.yAxis);
    d3.select(`#${that.el} .x-axis-left`).call(that.xAxisLeft);
    d3.select(`#${that.el} .x-axis-right`).call(that.xAxisRight);

    d3.selectAll(`#${that.el} .domain`).attr("opacity", 0);
    d3.selectAll(`#${that.el} line`).attr("opacity", 0);
  }
  
}
