
import './App.css';

import * as d3 from 'd3';
import React from 'react';
import ScatterPlot from './components/ScatterPlot';


function App() {

    // Create three states, i.e., data, selectedData, and filterCategory

 const [data, setData] =React.useState([])


    const colorScale = d3.scaleOrdinal()
        .range(['#d3eecd', '#7bc77e', '#2a8d46']) 
        .domain(['Easy','Intermediate','Difficult']);

 
  

    const loadData =    () => {
        d3.csv('./vancouver_trails.csv') 
        .then(_data => {
            setData(_data.map(d => {
                d.time = +d.time;
                d.distance = +d.distance;
                return d
            }));            
        })
    }

    // Use useEffect to render and update visual results when dependency/dependencies change (30pts)
    React.useEffect(()=>{
        loadData();
        
    },[])



    // To DO

    return (
        <div className='Container'>
 
        <div className="App">
        <ScatterPlot config={colorScale} data = {data}/>
    
        <div id='tooltip'></div>
        </div>
        </div>
    );
}

export default App;
