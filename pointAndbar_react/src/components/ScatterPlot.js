import React from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({
    config: {
        colorScale,
        containerWidth,
        containerHeight,
        margin,
        tooltipPadding,
    },
    data,
    setFilterCategory,
}) => {

    const svgRef = React.useRef();

    const chart = React.useRef();
    const xAxisG = React.useRef();
    const yAxisG = React.useRef();
    const bars = React.useRef();

    // These calculated intermidiate data should be
    // cleaned up to React-styled code.
    // that is, to combine all below refs and the "initialized" state into a single state
    const _colorScale = React.useRef();
    const width = React.useRef();
    const height = React.useRef();
    const xScale = React.useRef();
    const yScale = React.useRef();
    const xAxis = React.useRef();
    const yAxis = React.useRef();
    const _containerWidth = React.useRef();
    const _containerHeight = React.useRef();
    const [initialized, setInitialized] = React.useState(false)
    const _tooltipPadding = React.useRef()

    const brushGroup = React.useRef()
    const brush = React.useRef()


    // Cannot dynamically change. If dynamically chaning is needed, these code can be modified.

    const _margin = React.useRef();

    const orderedKeys = ['Easy', 'Intermediate', 'Difficult'];


    // Intialize the scatter plot (5pts)

    React.useEffect(() => {
        initVis()
    }, [])

    // To DO


    // Update rendering result (5pts)
    React.useEffect(() => {
        if (initialized) {
            updateVis()
        }
    }, [data])

    // To DO


    const initVis = () => {
        let svg = d3.select(svgRef.current);
        _tooltipPadding.current = tooltipPadding || 15
        _containerWidth.current = containerWidth || 500;
        _containerHeight.current = containerHeight || 350;
        svg.attr('width', _containerWidth.current).attr('height', _containerHeight.current);
        _margin.current = margin || {
            top: 75,
            right: 20,
            bottom: 50,
            left: 40
        };
        width.current = _containerWidth.current - _margin.current.left - _margin.current.right;
        height.current = _containerHeight.current - _margin.current.top - _margin.current.bottom;

        xScale.current = d3.scaleLinear().range([0, width.current]);
        yScale.current = d3.scaleLinear().range([height.current, 0]);

        xAxis.current = d3.axisBottom(xScale.current)
            .ticks(6)
            .tickSize(-height.current - 10)
            .tickPadding(10)
            .tickFormat(d => d + ' km');
        yAxis.current = d3.axisLeft(yScale.current)
            .ticks(6)
            .tickSize(-width.current - 10)
            .tickPadding(10);

        chart.current = svg.append('g').attr('transform', `translate(${_margin.current.left},${_margin.current.top})`);
        xAxisG.current = chart.current.append('g').attr('class', 'axis x-axis').attr('transform', `translate(0,${height.current})`);
        yAxisG.current = chart.current.append('g').attr('class', 'axis y-axis');

        svg.append('text').attr('class', 'title').attr('x', 0).attr('y', 0).attr('dy', '1em').attr('font-size', '1.5em').text('Vancouver Trails');

        svg.append('text').attr('class', 'axis-title').attr('x', 0).attr('y', 50).attr('dy', '.71em').text('Hours');
        svg.append('text').attr('class', 'axis-title').attr('x', width.current - 10).attr('y', height.current + 60).attr('dy', '.71em').text('Distance');

        _colorScale.current = d3.scaleOrdinal()
            .range(['#a0a1e2', '#6495ed', '#04ea17'])
            .domain(['Easy', 'Intermediate', 'Difficult']);


        let legendG = svg.selectAll('.legend')
            .data(orderedKeys)
            .join('g')
            .attr('transform', (d, i) => `translate(${_margin.current.left+100*i},${_containerHeight.current-20})`)

        legendG.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', (d) => _colorScale.current(d))

        legendG.append('text')
            .text(d => d)
            .attr('font-size', '0.7em')
            .attr('x', 15)
            .attr('y', 9)

        brushGroup.current = svg.append('g')
            .attr('class', 'brush')
            .attr('transform', `translate(${_margin.current.left},${_margin.current.top})`)

        brush.current = d3.brush()
            .extent([
                [0, 0],
                [width.current, height.current]
            ])
            .on('start', function () {
                d3.select(this).on('brush', function () {
                    console.log('dddd')
                })
            })
            .on('brush',function () {
                console.log( d3.select('.selection'))
               let a_w =  d3.select(this).node().getBoundingClientRect()
               let a_h = d3.select(this).attr('height')
               console.log(a_h)
               console.log(a_w)
              })
           
            .on('end', function () {
                d3.select(this).on('brush',null)
              
            })
           
            brushGroup.current.call(brush.current)
       
        setInitialized(true);
    }

    const updateVis = () => {

        

        let colorValue = d => d.difficulty;
        let xValue = d => d.time;
        let yValue = d => d.distance;

        xScale.current.domain([0, d3.max(data, xValue)]);
        yScale.current.domain([0, d3.max(data, yValue)]);



        // renderVis()
        bars.current = chart.current.selectAll('.point')
            .data(data, d => d.trail)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cy', d => yScale.current(yValue(d)))
            .attr('cx', d => xScale.current(xValue(d)))
            .attr('fill', d => _colorScale.current(colorValue(d)))


        xAxisG.current.call(xAxis.current);
        yAxisG.current.call(yAxis.current);



    }

    return ( <
        svg ref = {
            svgRef
        } > < /svg>
    );
}

export default ScatterPlot;