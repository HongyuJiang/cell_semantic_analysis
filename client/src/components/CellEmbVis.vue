<template>

  <div id='cell-emb-container'>
      <div id='cell-emb'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';


export default {
  name:'cell-emb-vis',
  data () {
    return { }
  },
  methods:{
    updatePoints(seqs_counter){

        let that = this

        d3.select("#cell-emb").selectAll('.point')
        .attr('fill', function(d){

            let id = d3.select(this).attr('ID')
            if(seqs_counter[id] != undefined){

                return '#33cc00'
            }
            else{
                return 'white'
            }
        })
        .attr('r', function(d){

            let id = d3.select(this).attr('ID')
            if(seqs_counter[id] != undefined){

                return Math.log(seqs_counter[id] / 5)
            }
            else{
                return 0.5
            }
        })

        let seq_list = []

        for(let cell in seqs_counter){

            if(that.cell_dict[cell] != undefined){

                seq_list.push([that.cell_dict[cell], seqs_counter[cell]])
            }
        }

        seq_list = seq_list.sort(function(a,b){

            return b[1] - a[1]
        })

        seq_list = seq_list.splice(0,10)

        d3.select("#cell-emb").select('svg').select('#rank').remove()

        let canvas = d3.select("#cell-emb").select('svg')
        .append('g')
        .attr('id','rank')
        .attr('transform', 'translate(0, 370)')

       /* canvas.selectAll('.top_cell')
        .data(seq_list)
        .enter()
        .append('text')
        .attr('fill','white')
        .attr('x', 80)
        .attr('font-size', 15)
        .attr('y', function(d,i){

            return i*20
        })
        .text(d => d[0].name)

        canvas.selectAll('.top_cell_circle')
        .data(seq_list)
        .enter()
        .append('circle')
        .attr('fill', 'green')
        .attr('cx', 65)
        .attr('cy', function(d,i){

            return i * 20 - 5
        })
        .attr('r', 4)*/

        let original_data = 
        [
            [47,21,0,0,0,0,57,241,617,837,912,1162,725,843,640,686,703,753,818,805,406,249,107,39],
            [53,0,0,0,0,4,64,117,901,759,1331,865,931,996,774,723,694,825,917,827,516,302,186,111],
            [63,18,18,18,18,7,40,199,563,1054,894,1169,537,934,720,889,677,1239,1304,697,604,325,174,108],
            [57,18,0,0,0,17,48,259,700,1106,861,843,711,644,711,715,564,884,1174,623,484,487,167,110],
            [35,23,17,0,2,0,51,227,548,741,869,871,700,1075,628,458,581,467,1016,661,386,547,328,103],
            [31,19,0,0,0,31,49,319,806,1125,1158,1005,865,924,771,523,682,865,1133,828,677,574,406,124],
            [81,16,11,0,14,2,34,257,672,913,1057,1113,574,969,654,728,670,509,1056,600,384,465,185,49]
        ]

        let fake_data = [] //村里的数据
        let fake_data2 = [] //城里的数据

        for(let i=0;i<7;i++){

            let meta = []
            let meta2 = []

            for(let j=0;j<24;j++){

                if(j < 10 || j > 18){
                    meta.push(original_data[i][j] * (0.5 + 0.2 * Math.random()))
                }
                else{
                    meta.push(original_data[i][j] * (0.1 + 0.2 * Math.random()))
                }

                if(j < 10 || j > 18){
                    meta2.push(original_data[i][j] * (0.1 + 0.2 * Math.random()))
                }
                else{
                    meta2.push(original_data[i][j] * (0.5 + 0.2 * Math.random()))
                }

            }

            fake_data.push(meta)
            fake_data2.push(meta2)
        }

        function createStick(data, anchorY){

            let sticksGraph1 = canvas.append('g')
            .attr('transform', 'translate(20, ' + anchorY + ')')

            let sticksGroup = sticksGraph1.selectAll('sticks')
            .data(data)
            .enter()
            .append('g')

            let days = ['Mon', 'Tue', 'Thu', 'Wed', 'Fri', 'Sat', 'Sun']

            sticksGroup
            .append('line')
            .attr('x1', function(d,i){
                return i * 50
            })
            .attr('x2', function(d,i){
                return i * 50
            })
            .attr('y1', 0)
            .attr('y2', 200)
            .attr('stroke','#666')
            .attr('stroke-width','3')
            .attr('opacity','0.7')

            sticksGroup
            .append('text')
            .attr('x', function(d,i){
                return i * 50
            })
            .attr('y', 205)
            .attr('fill','white')
            .attr('text-anchor', 'middle')
            .text(function(d,i){
                return days[i]
            })

            let counter = 0

            sticksGroup.selectAll('point')
            .data(d => d)
            .enter()
            .append('circle')
            .attr('cx', function(d,i){
                counter += 1
                return parseInt(counter/25) * 50
            })
            .attr('cy', function(d,i){

                return i * 8
            })
            .attr('r', d => d / 50)
            .attr('stroke','white')
            .attr('fill','none')
            .attr('stroke-width','2')
            .attr('opacity','0.7')

            let yScale = d3.scaleLinear().domain([1,24]).range([0,200])

            const yAxisContainer = sticksGroup.append("g")
            .attr("transform", `translate( ` + -40 + `,0)`);

            const yAxis = d3.axisLeft(yScale)
            .ticks(7)

            yAxisContainer.call(yAxis);
            yAxisContainer.selectAll('text').attr('fill','white')
            yAxisContainer.selectAll('path').attr('stroke','white')
            yAxisContainer.selectAll('line').attr('stroke','white')

        }

        createStick(fake_data, 0)

        createStick(fake_data2, 230)

    },

    chartInit(data){

        d3.select("#cell-emb").select('svg').remove()

        let zoom_lambda = this.width / 200

        let container = d3.select("#cell-emb").append('svg')
            .attr("viewBox", [-50, -50, this.width + 50, this.height + 50])
            //.attr('width',this.width)
            //.attr('height',this.height)
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        const svg = container.append('g')

        svg.append('circle')
        .attr('r', this.width/2)
        .attr('fill','white')
        .attr('opacity', 0.1)
        .attr('cx',this.width/2)
        .attr('cy',this.height/6)

        let that = this

        let axis = svg.append('g')
        .attr('transform', 'translate(' + this.width/2 + ',' + this.height/6 + ')')
        
        axis.selectAll('axisLine')
        .data([0,1,2,3,4,5,6,7])
        .enter()
        .append('line')
        .attr('x1', function(d,i){

            let r = that.width/2
            return r * Math.cos(2 * Math.PI/8 * d)
        })
        .attr('x2', function(d,i){
        
            let r = 0
            return r * Math.cos(2 * Math.PI/8 * d)
        })
        .attr('y1', function(d,i){
        
            let r = that.width/2
            return r * Math.sin(2 * Math.PI/8 * d)
        })
        .attr('y2', function(d,i){
        
            let r = 0
            return r * Math.sin(2 * Math.PI/8 * d)
        })
        .attr('stroke','black')
        .attr('stroke-width','1.5')
        .attr('opacity', 0.8)

        axis.selectAll('anchorPoint')
        .data([0,1,2,3,4,5,6,7])
        .enter()
        .append('circle')
        .attr('r', 4)
        .attr('cx', function(d,i){

            let r = that.width/2
            return r * Math.cos(2 * Math.PI/8 * d)
        })
        .attr('cy', function(d,i){
        
            let r = that.width/2
            return r * Math.sin(2 * Math.PI/8 * d)
        })
        .attr('fill','white')
        .attr('opacity', 0.8)


        svg.selectAll('points')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('ID', d=>d.ID)
        .attr('r', 1)
        .attr('fill', 'white')
        .attr('opacity', '0.5')
        .attr('cx', d=>d.x * zoom_lambda + this.width / 2)
        .attr('cy', d=>d.y * zoom_lambda + this.height / 6)

    }   
  },
  mounted(){

    this.$root.$on("updateCellCluster", counter => {
      this.updatePoints(counter);
    });

    d3.select('#' + 'cell-emb-container')
      .style('position', 'absolute')
      .style('top', '0%')
      .style('left', '52%')

    this.width = 340
    this.height = 880

    let that = this

    DataProvider.getCellEmb().then(response => {

        that.chartInit(response.data)

        }, error => {
            that.loading = false;
    });

    DataProvider.getCellInfo().then(response => {

        let cell_info = response.data

        let cell_dict = {}

        for(let cell in cell_info){

            if(cell_info[cell]['id'] != undefined){

                let id = cell_info[cell]['id']
                cell_dict[id] = cell_info[cell]
            }
               
        }

        that.cell_dict = cell_dict

        }, error => {
            that.loading = false;
    });

  },
}
</script>

<style scoped>
#cell-emb-container{
  width:300px;
  height:800px;
}

.name{
  border-left: lightsalmon solid 3px;
  color:white;
  padding-left:10px;
  margin-right: 10px;
  right:0px;
  float: right;
}


</style>