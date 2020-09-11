<template>

  <div id='mat-view-container'>
      <div class='name'>用户访问热度日历图</div>
      <div id='mat-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';


export default {
  name:'mat-view',
  data () {
    return { }
  },
  methods:{
    chartInit(persons){

      let that = this

      let intergrated_rect = []

      for(let i =0;i<7;i++){

        let meta = []

        for(let j=0;j<24;j++){

          meta.push(0)
        }

        intergrated_rect.push(meta)
      }

      persons.forEach(function(person){

        let meta_data = that.data[person].rect

        for(let i =0;i<7;i++){

          for(let j=0;j<24;j++){

            intergrated_rect[i][j] += meta_data[i][j]
          }
        }

      })

        let mat_data = intergrated_rect

        let data_max = 0
        let data_min = 0

        data_max = d3.max(mat_data, d => d3.max(d))

        let heatScale = d3.scaleLinear().domain([data_min, data_max]).range([1,0])

        let rect_size = [(this.width) / 8, (this.height) / 26]

        let lowerColor = d3.rgb(50,50,50)
        let higherColor = d3.rgb(220,220,220)

        let greyScale = d3.interpolateRgb(lowerColor, higherColor)


        d3.select("#mat-view").select('svg').remove()

        const svg = d3.select("#mat-view").append('svg')
            .attr("viewBox", [-80, -50, this.width + 80, this.height + 50])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        let groups = svg.selectAll('rect_group')
        .data(mat_data)
        .enter()
        .append('g')
        .attr('transform',function(d,i){
           return 'translate(' + (i * rect_size[0]) + ',0)'
        })

        groups.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('y', function(d,i){
            return i * rect_size[1]
        })
        .attr('width', rect_size[0])
        .attr('height', rect_size[1])
        .attr('fill-opacity', 1)
        .attr('fill', d => greyScale(heatScale(d)))
        .attr('stroke','white')
        .attr('stroke-width','1.5')

        let xScale = d3.scalePoint().domain(['Mon','Tue','Thu','Wed','Fri','Sat','Sun']).range([0,rect_size[0]*7])

        const xAxisContainer = svg.append("g")
        .attr("transform", `translate(0,` + (this.height - 20) + `)`);

        const xAxis = d3.axisBottom(xScale)
        .ticks(7)

        xAxisContainer.call(xAxis);
        xAxisContainer.selectAll('text').attr('fill','black')
        xAxisContainer.selectAll('path').attr('stroke','black')
        xAxisContainer.selectAll('line').attr('stroke','black')

        let yScale = d3.scaleLinear().domain([1,24]).range([0,rect_size[1] * 24])

        const yAxisContainer = svg.append("g")
        .attr("transform", `translate( ` + -20 + `,0)`);

        const yAxis = d3.axisLeft(yScale)
        .ticks(24)

        yAxisContainer.call(yAxis);
        yAxisContainer.selectAll('text').attr('fill','black')
        yAxisContainer.selectAll('path').attr('stroke','black')
        yAxisContainer.selectAll('line').attr('stroke','black')

        let ranges = [0,0.25,0.5,0.75,1]

        var legend = svg.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

        ranges.forEach(d=>{
        
          legend.append("stop")
          .attr("offset", d * 100 + "%")
          .attr("stop-color", greyScale(d))
          .attr("stop-opacity", 1);

        })

        svg.append("rect")
        .attr('x', this.width - 25)
        .attr('y', -10)
        .attr("width", rect_size[0] / 2)
        .attr("height", rect_size[1] * 24)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)");

        svg.append('text')
        .attr('x', rect_size[0] * 3.5)
        .attr('y', -15)
        .attr('fill','black')
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text('Weekday')

        svg.append('text')
        .attr('transform', 'translate(' + (-60) + ',' + rect_size[1] * 12 + ')' + 'rotate(90)')
        .attr('text-anchor', 'middle')
        .attr('fill','black')
        .attr('font-size', 14)
        .text('Hour of day')

        svg.append('text')
        .attr('x', rect_size[0] * 7.65)
        .attr('y', -5)
        .attr('fill','black')
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text(heatScale.domain()[1])

        svg.append('text')
        .attr('x', rect_size[0] * 7.65)
        .attr('y', rect_size[1] * 25 + 5)
        .attr('fill','black')
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text(heatScale.domain()[0])

    }   
  },
  mounted(){

    d3.select('#' + 'mat-view-container')
      .style('position', 'absolute')
      .style('top', '54%')
      .style('right', '40px')

    this.width = 340
    this.height = 340

    let that = this

    DataProvider.getUserBehavior().then(response => {
              
        that.data = response.data;

        }, error => {
            that.loading = false;
    });
    
    this.$root.$on('updateMatTopic', persons => {
      this.chartInit(persons)
    })

  },
}
</script>

<style scoped>
#mat-view-container{
  width:85%;
  height:32%;
}

.name{
  border-left: lightsalmon solid 3px;
  color:black;
  padding-left:10px;
  margin-right: 10px;
  right:0px;
  float: right;
}


</style>