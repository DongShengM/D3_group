/* main JS file */

console.log("Hello JS world!");



let matrix
let selectedCategory = document.getElementById('categorySelector').value

d3.csv('../data/florentine-family-attributes.csv').then((data) => {

    matrix = new Matrix('matrix-chart',data)

})


function categoryChange(){
    selectedCategory =  document.getElementById('categorySelector').value;

    matrix.wrangleData()

}