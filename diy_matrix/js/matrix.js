class Matrix {
    constructor(el, data) {
        this.parentElement = el
        this.data = data

        this.colors = ['#8686bf', '#fbad52']

        this.displayData = []
        this.initVis()
    }
    wrangleData() {

        let dataMarriages = [
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0]
        ];

        let dataBusiness = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        ];

        let arr = []

        this.data.forEach((e, i) => {
            const business = d3.sum(dataBusiness[i])
            const marriages = d3.sum(dataMarriages[i])
            const temp = {
                "index": i,
                "name": e.Family,
                "allRelations": business + marriages,
                "businessTies": business,
                "businessValues": dataBusiness[i],
                "marriages": marriages,
                "marriageValues": dataMarriages[i],
                "numberPriorates": Number(e.Priorates),
                "wealth": Number(e.Wealth)
            }

            arr.push(temp)
        });


        if (selectedCategory == 'Default') {
            this.displayData = arr
        } else {
            this.displayData = arr.sort((a, b) => b[selectedCategory] - a[selectedCategory])
        }

        this.updateVis()
    }

    initVis() {
        let vis = this;

        vis.cell = {
            cellHeight: 20,
            cellWidth: 20,
            cellPadding: 10
        }

        vis.margin = {
            top: 140,
            right: 20,
            bottom: 20,
            left: 100
        };

        this.xValue = this.data.map((d) => d.Family)

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height

        vis.innerWidth = vis.width - vis.margin.left - vis.margin.right;
        vis.innerHeight = vis.height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .on('mouseenter', function (event) {
                if (event.offsetX - vis.margin.left < 0) return

                const order = Math.floor((event.offsetX - vis.margin.left) / (vis.cell.cellPadding + vis.cell.cellWidth))

            })
            .on('mousemove', function (event) {

                if ((event.offsetX - vis.margin.left) < 0 || (event.offsetY - vis.margin.top) < 0) {
                    d3.selectAll('path').attr('fill-opacity', 1)
                    return
                }

                const orderX = Math.floor((event.offsetX - vis.margin.left) / (vis.cell.cellPadding + vis.cell.cellWidth))
                const orderY = Math.floor((event.offsetY - vis.margin.top) / (vis.cell.cellPadding + vis.cell.cellHeight))

                d3.selectAll('.matrix-cell-marriage')
                    .attr('fill-opacity', (d, i) => {
                        return Math.floor(i / 16) == orderY || i % 16 == orderX ? 1 : 0.3
                    })
                d3.selectAll('.matrix-cell-business')
                    .attr('fill-opacity', (d, i) => {
                        return Math.floor(i / 16) == orderY || i % 16 == orderX ? 1 : 0.3
                    })
            })
            .on('mouseleave', function (event) {
                d3.selectAll('path').attr('fill-opacity', 1)
            })
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)



        vis.svg.selectAll('.xText')
            .data(this.xValue)
            .join('text')
            .attr('class', 'xText')
            .attr('font-size', '0.8em')
            .attr('transform', (d, i) => `translate(${vis.cell.cellPadding * i + vis.cell.cellWidth * (i + 1)},0) rotate(270)`)
            .text(d => d)


            let legend = vis.svg.selectAll('.legend')
            .data(['Marriage','Business Tie'])
            .join('g')
            .attr('class','legend')
            .attr('transform',(d,i)=>`translate(${i*140},-110)`)
    
            legend.append('rect')
            .attr('width',10)
            .attr('height',10)
            .attr('fill',(d,i)=>{
               return this.colors[i]
            })
    
            legend.append('text')
            .text((d)=>d)
            .attr('x',20)
            .attr('y',10)

        vis.wrangleData()
    }

    updateVis() {
        let vis = this

         vis.svg.transition().duration(1000)

        let yText = vis.svg.selectAll('.yText')
            .data(vis.displayData,d=>d.name)
            .join('text')
            .attr('class', 'yText')
            .attr('font-size', '0.8em')
            .attr('text-anchor', 'end')
            .text(d => d.name)
            .attr('x',0)
            .transition()
            .duration(1000)
            .attr('y', (d, i) => vis.cell.cellPadding * i + vis.cell.cellHeight * (i + 1))


        vis.svg.selectAll('.matrix-row')
            .data(vis.displayData,d=>d.name)
            .join('g')
            .attr('class', 'matrix-row')
            .transition()
            .duration(1000)
            .attr('transform', (d, i) => `translate(0,${(vis.cell.cellHeight+vis.cell.cellPadding)*i})`)


        d3.selectAll('.matrix-row').selectAll('.matrix-cell-marriage')
            .data(d => d.marriageValues)
            .join('path')
            .attr('class', 'matrix-cell-marriage')
            .attr('d', function (d, i) {
                let x = (vis.cell.cellWidth + vis.cell.cellPadding) * i + vis.cell.cellPadding / 2
                return 'M ' + x + ' ' + vis.cell.cellPadding / 2 + ' l ' + vis.cell.cellWidth + ' 0 l 0 ' + vis.cell.cellHeight + ' z';
            })
            .attr('fill', (d) => d ? this.colors[0] : '#ccc')

        d3.selectAll('.matrix-row').selectAll('.matrix-cell-business')
            .data(d => d.businessValues)
            .join('path')
            .attr('class', 'matrix-cell-business')
           
            .attr('d', function (d, i) {
                let x = (vis.cell.cellWidth + vis.cell.cellPadding) * i + vis.cell.cellPadding / 2
                return 'M ' + x + ' ' + vis.cell.cellPadding / 2 + ' l 0 ' + vis.cell.cellWidth + ' l ' + vis.cell.cellHeight + ' 0 z';
            })
         
            .attr('fill', (d) => d ? this.colors[1] : '#ccc')
    }
    
}