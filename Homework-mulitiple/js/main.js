const age_range = [20, 32, 44, 56, 68, 80];

let AgeChecked = [20, 32];

d3.select("body").append("div").attr("class", "tooltip");

let ageRange =new AgeRange("age-line", age_range);

let barColor;

//旭日图 实例
let sunBrust;

/**
 * config 筛选的数据项
 */
const config = [
  "Attrition_Flag",
  "Gender",
  "Education_Level",
  "Marital_Status",
  "Income_Category",
  "Card_Category",
];

d3.csv("../data/BankChurners.csv").then((data) => {
  sunBrust = new SubSun("sub-sun", data, config);
});

/**
 * 年龄选择与旭日图交互
 */
function quitAge() {
  sunBrust.filterAge(AgeChecked);
}

/**
 * 旭日图与柱状图交互
 */
function typeSelected(data) {
  if (!data.parent) {
    new StarkBar("bar-chart", data);
  } else {
    let barChart = new BarChart("bar-chart");
    barChart.wrangleData(data);
  }
}

/**
 * 线型图
 */

let checkedType = "Pay";
let mulLine;
d3.csv("../data/Credit_Card1.csv").then((data) => {
  mulLine = new MultipleLine("MultipleLine", data);
});

document.getElementById("selectBox").addEventListener("change", (d) => {
  checkedType = d.target.value;
  mulLine.wrangleData();
});

let scatterChart = new ScatterChart("point-chart");
function lineToPoint(data) {
  scatterChart.wrangleData(data);
}

let monthChecked = "Jan";
const monthIndex = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
let mouthRange =new MouthRange("mouth-range");



let geoTipInfo={};

let doubleBar;
let emplymentData;
InitData()



/**
 * 地图
 */

 let map;

 async function InitData() {
    emplymentData =await d3.csv('../data/govhack.csv')

   const doubleD= await d3.csv("../data/credit_rep_202209.csv")

    doubleBar = new DoubleBar("double-bar-chart",doubleD);
    findMonthIndex();

    const mapData =await d3.json('../data/aus.geojson')
   map = new AuMap("au-map", mapData)

   }


  


function findMonthIndex() {
  const index = monthIndex.indexOf(monthChecked) + 1;

  doubleBar.wrangleData(index);
}

window.onresize=()=>{
  debounce( sunBrust.wrangleData())
  debounce(  ageRange.initChart())

  debounce(  mulLine.initChart())
  debounce( scatterChart.initChart())
  debounce(  mulLine.wrangleData())

  debounce(  map.wrangleData())

  debounce(  mouthRange.initChart())
  debounce(   doubleBar.initChart())
  debounce(   findMonthIndex())
  
}


function debounce(fn, delay = 1000) {
  let timer = null;
  return function (...args) {
      if (timer) {
          clearTimeout(timer);
          timer = null;
      }

      timer = setTimeout(() => {
          fn.apply(this, args);
      }, delay);
  }
}