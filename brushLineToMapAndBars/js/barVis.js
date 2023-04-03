/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    constructor(parentElement,covidData, usaData,descending){
        this.parentElement = parentElement
        this.descending = descending
        this.covidData = covidData;
        this.usaData = usaData;


         // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");
        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Title for Barchart')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // TODO

        vis.xScale = d3.scaleBand()
        .range([0,vis.width])
        .padding(0.2)

        vis.yScale = d3.scaleLinear()
        .range([vis.height,0])
        .nice()

        vis.xAxis  = d3.axisBottom(vis.xScale)
       

        vis.yAxis = d3.axisLeft(vis.yScale)
   

        vis.svg.append('g')
        .attr('transform',`translate(0,${vis.height})`)
        .attr('class','x-axis axis')

        vis.svg.append('g')
        .attr('class','y-axis axis')

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this
        // Pulling this straight from dataTable.js
        let filteredData = [];

        // if there is a region selected
        if (selectedTimeRange.length !== 0) {
            //console.log('region selected', vis.selectedTimeRange, vis.selectedTimeRange[0].getTime() )

            // iterate over all rows the csv (dataFill)
            vis.covidData.forEach(row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0].getTime() <= vis.parseDate(row.submission_date).getTime() && vis.parseDate(row.submission_date).getTime() <= selectedTimeRange[1].getTime()) {
                    filteredData.push(row);
                }
            });
        } else {
            filteredData = vis.covidData;
        }

        // prepare covid data by grouping all rows by state
        let covidDataByState = Array.from(d3.group(filteredData, d => d.state), ([key, value]) => ({key, value}))
        
        // init final data structure in which both data sets will be merged into
        vis.stateInfo = []

        // merge
        covidDataByState.forEach(state => {

            // get full state name
            let stateName = nameConverter.getFullName(state.key)

            // init counters
            let newCasesSum = 0;
            let newDeathsSum = 0;
            let population = 0;

            // look up population for the state in the census data set
            vis.usaData.forEach(row => {
                if (row.state === stateName) {
                    population += +row["2020"].replaceAll(',', '');
                }
            })

            // calculate new cases by summing up all the entries for each state
            state.value.forEach(entry => {
                newCasesSum += +entry['new_case'];
                newDeathsSum += +entry['new_death'];
            });

            // populate the final data structure
            vis.stateInfo.push(
                {
                    state: stateName,
                    population: population,
                    absCases: newCasesSum,
                    absDeaths: newDeathsSum,
                    relCases: (newCasesSum / population * 100),
                    relDeaths: (newDeathsSum / population * 100)
                }
            )
        })
        // TODO: Sort and then filter by top 10
        // maybe a boolean in the constructor could come in handy ?
        /*


        console.log('final data structure', vis.topTenData);
        */

       
        if (vis.descending){
            vis.stateInfo.sort((a,b) => {return b[selectedCategory] - a[selectedCategory]})
        } else {
            vis.stateInfo.sort((a,b) => {return a[selectedCategory] - b[selectedCategory]})
        }

        // console.log('final data structure', vis.stateInfo);

        vis.topTenData = vis.stateInfo.slice(0, 10)

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        
        vis.xScale.domain(d3.map(vis.topTenData,(d)=>d.state))

        const maxValue =d3.max(vis.stateInfo,(d)=>d[selectedCategory])

        vis.yScale.domain([0,d3.max(vis.topTenData,(d)=>d[selectedCategory])])

        let scaleColor = d3.scaleLinear()
        .domain([0, maxValue])
        .range(['#ffffff', '#136D70'])

        vis.svg.selectAll('.myRect')
        .data(vis.topTenData)
        .join('rect')
        .attr('class','myRect')
        .attr('width',(d)=> vis.xScale.bandwidth())
        .attr('height',(d)=>vis.height - vis.yScale(d[selectedCategory]))
        .attr('x',(d)=>vis.xScale(d.state))
        .attr('y',(d)=>vis.yScale(d[selectedCategory]))
        .attr('fill',(d)=> {
           if( d.state==selectedState) return 'rgba(255,0,0,0.47)'
           return scaleColor(d[selectedCategory])}
           )
        .on('mouseover', function(event, d){
            d3.select(this)
                .attr('fill', 'rgba(255,0,0,0.47)')
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .style('position','absolute')
                .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3>${d.state}<h3>
                     <h4> Population: ${d.population}</h4>      
                     <h4> Cases(absolute): ${d.absCases}</h4>
                     <h4> Deaths(absolute): ${d.absDeaths}</h4>   
                     <h4> Cases(relative): ${ d.relCases.toFixed(2)}%</h4>  
                     <h4> Deaths(relative): ${d.relDeaths.toFixed(2)}%</h4>                             
                 </div>`);
        })
        .on('mouseout', function(event, d){
            d3.select(this)
                .attr('stroke-width', '0px')
                .attr("fill", (d)=>scaleColor(d[selectedCategory]))

            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        });
      
        
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);
    }



}