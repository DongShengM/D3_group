/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myDataTable,
    myMapVis,
    myBarVisOne,
    myBarVisTwo,
    myBrushVis;

let selectedTimeRange = [];
let selectedState = ''
let selectedCategory = document.getElementById('categorySelector').value

//color 



// load data using promises
let promises = [

   
    // d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),  // not projected -> you need to do it
   d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"), // already projected -> you can just scale it to fit your browser window
    d3.csv("data/covid_data_20.csv"),
    d3.csv("data/census_usa.csv"),
    d3.json('data/us.json'),
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);

   
    // init table
    myDataTable = new DataTable('tableDiv', dataArray[1], dataArray[2]);

    console.log(dataArray[0])

 // TODO - init map
    myMapVis = new MapVis('mapDiv', dataArray[0],dataArray[1], dataArray[2],dataArray[3])
    // TODO - init bars
    myBarVisOne = new BarVis('barDiv',dataArray[1], dataArray[2],true)
    myBarVisTwo = new BarVis('barTwoDiv',dataArray[1], dataArray[2],false)
    

    // init brush
    myBrushVis = new BrushVis('brushDiv', dataArray[1]);
}


function categoryChange() {
    selectedCategory =  document.getElementById('categorySelector').value;

  
    myMapVis.wrangleData(); // maybe you need to change this slightly depending on the name of your MapVis instance
    myBarVisOne.wrangleData();
    myBarVisTwo.wrangleData();
 }

 d3.csv('../data/precipitation (1).csv',function(d,i,g,t){
   
    if(i>3){
        return {
            Date:d[g[0]],
            value:d[g[1]]
        }
    }
   
    
 }).then((data)=>{
    console.log(data)
 })