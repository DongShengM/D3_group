/* * * * * * * * * * * * * *
 *          MapVis          *
 * * * * * * * * * * * * * */


class MapVis {

    constructor(element, geoData, covidData, usaData,geoData2) {
        this.parentElement = element
        this.geoData = geoData
        this.covidData = covidData;
        this.usaData = usaData;
        this.geoData2 = geoData2

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");
        this.initVis()
    }

    initVis() {
        let vis = this

        let us = vis.geoData
        vis.margin = {
            top: 20,
            right: 50,
            bottom: 20,
            left: 50
        };
        vis.width = 975;
        vis.height = 610;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("viewBox",
                [0, 0, vis.width + vis.margin.left + vis.margin.right,
                    vis.height + vis.margin.top + vis.margin.bottom
                ])

            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
         const  projection =  d3.geoAlbersUsa().translate([vis.width/2, vis.height/2])
            .scale([1400])
        vis.path = d3.geoPath()
        .projection(projection)

        vis.mapPath = vis.svg.append('g')
            .attr("fill", "#444")
            .attr("cursor", "pointer")
            .selectAll("path")
            .data(this.geoData2.features)
            .join("path")
            .attr("stroke", "black")
            .attr("d", vis.path);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')


        const linearGradient = vis.svg.append("defs").append("linearGradient")
            .attr("id", "linearColor")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", '#ffffff');

        linearGradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", '#136D70');

        vis.legendG = vis.svg.append('g').attr('transform', `translate(${vis.width/2},${vis.height})`)

        vis.legend = vis.legendG.append('rect')
            .attr("width", 250)
            .attr("height", 25)
            .style("fill", "url(#" + linearGradient.attr("id") + ")");


        vis.legendScale = d3.scaleLinear()
            .range([0, 250])

        vis.legendAxis = d3.axisBottom()
            .scale(vis.legendScale)

        vis.legendG.append('g')
            .attr('class', 'legend-axis')
            .attr('transform','translate(0,25)')

        this.wrangleData()
    }
    wrangleData() {
        let vis = this

        // check out the data


        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        // if there is a region selected
        if (selectedTimeRange.length !== 0) {
            //console.log('region selected', vis.selectedTimeRange, vis.selectedTimeRange[0].getTime() )
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
        let covidDataByState = Array.from(d3.group(filteredData, d => d.state), ([key, value]) => ({
            key,
            value
        }))

        // have a look


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
            vis.stateInfo.push({
                state: stateName,
                population: population,
                absCases: newCasesSum,
                absDeaths: newDeathsSum,
                relCases: (newCasesSum / population * 100),
                relDeaths: (newDeathsSum / population * 100)
            })
        })


        vis.updateChart()
    }
    updateChart() {
        let vis = this


        let maxValue = d3.max(vis.stateInfo, (d) => d[selectedCategory])

        let scale = d3.scaleLinear()
            .domain([0, maxValue])
            .range(['#ffffff', '#136D70'])

        vis.legendScale.domain([0, maxValue])
        vis.legendAxis.tickValues([0, maxValue]).tickFormat((d)=>{
            if(d>1000) return Math.round( d/1000)+'k'
            else if( selectedCategory.includes('rel')){
                return Math.round(d*100)/100+'%'
            }
            return d
        })

        vis.mapPath.attr('fill', (d) => {
                const filter = vis.stateInfo.filter((t) => {
                    return t.state == d.properties.name
                })[0]
                if (!filter) return

                return scale(filter[selectedCategory])
            })
            .on('mouseover', function (event, d) {

                const filter = vis.stateInfo.filter((t) => {
                    return t.state == d.properties.name
                })[0]
                if (!filter) return

                d3.select(this)
                    .attr('fill', 'rgba(255,0,0,0.47)')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3>${filter.state}<h3>
                     <h4> Population: ${filter.population}</h4>      
                     <h4> Cases(absolute): ${filter.absCases}</h4>
                     <h4> Deaths(absolute): ${filter.absDeaths}</h4>   
                     <h4> Cases(relative): ${ filter.relCases.toFixed(2)}%</h4>  
                     <h4> Deaths(relative): ${filter.relDeaths.toFixed(2)}%</h4>                             
                 </div>`);

                selectedState = d.properties.name
                myBarVisOne.wrangleData()
                myBarVisTwo.wrangleData()
                myBrushVis.wrangleDataResponsive()

            })
            .on('mouseout', function (event, d) {

                const filter = vis.stateInfo.filter((t) => {
                    return t.state == d.properties.name
                })[0]
                if (!filter) return

                d3.select(this)
                    .attr("fill", (d) => scale(filter[selectedCategory]))

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);

                selectedState = ''

                myBarVisOne.wrangleData()
                myBarVisTwo.wrangleData()
                myBrushVis.wrangleDataResponsive()
            });

        vis.svg.select(".legend-axis").call(vis.legendAxis);
    }
}