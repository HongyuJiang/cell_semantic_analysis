<template>

  <div id='chord-view-container'>
      <div id='chord-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';

let data = [
    [ 2.66973737, -1.17044832,  0.91375855, -1.29239273,  1.26487827, -0.13557874],
    [-1.17023216,  5.40903888, -2.86796811,  1.63146573, -1.93344711, -0.10021255],
    [ 0.9138532,  -2.86492803,  4.19050682, -1.21428543,  2.31520377,  0.26341632],
    [-1.29141566,  1.63599529, -1.21771119,  2.82862176, -0.95023927,  0.48478909],
    [ 1.26503694, -1.93280716,  2.31219104, -0.95118203,  4.32409752,  0.26858237],
    [-0.13367718, -0.0973722,   0.2625597,   0.48560225,  0.26653047,  1.68209613]
]

export default {
  name:'chord-view',
  data () {
    return {
      lineData: data
    }
  },
  methods:{
    chartInit(){

        const svg = d3.select("#chord-view").append('svg')
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif");

        const chords = this.chord(this.lineData);

        const group = svg.append("g")
            .selectAll("g")
            .data(chords.groups)
            .enter()
            .append('g')

        group.append("path")
            .attr('opacity',0.9)
            .attr("fill", d => d3.rgb(this.color(d.index)))
            .attr("stroke", d => d3.rgb(this.color(d.index)))
            .attr("d", this.arc);

        const groupTick = group.append("g")
            .selectAll("g")
            .data(d => this.groupTicks(d, 1e3))
            .enter()
            .append("g")
            .attr("transform", d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(${this.outerRadius},0)`);

        groupTick.append("line")
            .attr("stroke", "#000")
            .attr("x2", 6);

        groupTick
            .filter(d => d.value % 5e3 === 0)
            .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", d => d.angle > Math.PI ? "rotate(180) translate(-16)" : null)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .attr('fill','white')
            .text(d => this.formatValue(d.value));

        svg.append("g")
            .attr("fill-opacity", 0.67)
            .selectAll("path")
            .data(chords)
            .enter()
            .append("path") 
            .attr('opacity',0.8)
            .attr("d", this.ribbon)
            .attr("fill", d => d3.rgb(this.color(d.target.index)))
            .attr("stroke", d => d3.rgb(this.color(d.target.index)))
            .attr('stroke-width', 0)

    }
  },
  mounted(){

    d3.select('#' + 'chord-view-container')
      .style('position', 'absolute')
      .style('top', '50px')
      .style('right', '30px')

    this.width = 640
    this.height = 640

    this.outerRadius = Math.min(this.width, this.height) * 0.5 - 30
    this.innerRadius = this.outerRadius - 20

    this.formatValue = d3.formatPrefix(",.0", 1e3)

    this.chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)

    this.arc = d3.arc()
    .innerRadius(this.innerRadius)
    .outerRadius(this.outerRadius)

    this.ribbon = d3.ribbon()
    .radius(this.innerRadius)

    this.color = d3.scaleOrdinal()
    .domain(d3.range(6))    
    .range(["#FF6600","#FFD443", "#FF6361", "#484C7F", "#BABEEA", "#E2ECF2"])

    this.groupTicks = function(d, step) {
        const k = (d.endAngle - d.startAngle) / d.value;
        return d3.range(0, d.value, step).map(value => {
            return {value: value, angle: value * k + d.startAngle};
        });
    }

    for(let i=0;i<this.lineData.length;i+=1){

        for(let j=0;j<this.lineData[i].length;j+=1){

            this.lineData[i][j] = Math.pow(Math.pow(Math.E, this.lineData[i][j]), 0.7)
        }
    }

    console.log(this.lineData)
    
    this.chartInit()
  },
}
</script>

<style scoped>
#chord-view-container{
  width:100%;
  height:600px;
}

</style>