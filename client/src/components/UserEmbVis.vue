<template>

  <div id='user-emb-container'>
      <div class='name'>用户聚类视图</div>
      <div id='user-emb'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';
import $ from "jquery";


export default {
  name:'user-emb-vis',
  data () {
    return { }
  },
  methods:{
    chartInit(data, cells){

        let persons_seqs_dict = {}

        let cells_retriver = {}

        for(let cell in cells){

             if(cells[cell].id != undefined){

                cells[cell]['code'] = cell

                let id = cells[cell].id

                cells_retriver[id] = cells[cell]//key为cell_info的id
            }
        }//给有id的基站添加code属性，该属性即为10065|11162类型

        data.forEach(function(d){

            persons_seqs_dict[d.person] = d.seq
        })

        d3.select("#user-emb").select('svg').remove()

        let zoom_lambda = this.width / 200

        let container = d3.select("#user-emb").append('svg')
            .attr("viewBox", [-50, -50, this.width + 50, this.height + 50])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        const svg = container.append('g')
        .attr('transform', 'translate(0,-30)')

        svg.append('circle')
        .attr('r', this.width/2)
        .attr('fill','black')
        .attr('opacity', 0.1)
        .attr('cx',this.width/2)
        .attr('cy',this.height/2)

        let that = this

        svg.append('g')
        .attr('transform', 'translate(' + this.width/2 + ',' + (this.height/2) + ')')
        .selectAll('axisLine')
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
        .attr('stroke','white')
        .attr('stroke-width','1.5')
        .attr('opacity', 0.8)

        let button = container.append('g')
        .attr('transform','translate(280,290)')
        .on('click', d => {

            button
            .selectAll('rect')
            .attr('fill','grey')
        })
       
        button.append('rect')
        .attr('width', 60)
        .attr('height', 20)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill','black')
       
        button.append('text')
        .attr('fill', 'white')
        .text('confirm')
        .attr('y',15)
        .attr('x',8)
        .attr('font-size', 14)
       
        svg.selectAll('points')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('person', d=>d.person)
        .attr('r', 1)
        .attr('fill', 'black')
        .attr('opacity', '0.5')
        .attr('cx', d=>d.x * zoom_lambda + this.width / 2)
        .attr('cy', d=>d.y * zoom_lambda + this.height / 2)
        
        let selecting = false

        let selected_persons = []

        svg.on("mouseover", function(d){

            d3.select(this).style("cursor", "crosshair");
        })
        .on('mousedown', function(d){

            var coords = d3.pointer(d, this);
            svg.append('circle')
            .attr('id','pointer')
            .attr('r', 5)
            .attr('fill','red')
            .attr('opacity', 0.5)
            .attr('cx', coords[0])
            .attr('cy', coords[1])

            selecting = true
        })
        .on('mousemove', function(d){

            if(selecting){

                var coords = d3.pointer(d, this);
    
                svg.select('#pointer')
                //.transition()
                .attr('cx', coords[0])
                .attr('cy', coords[1])

                let x = coords[0]
                let y = coords[1]

                svg.selectAll('.point')
                .attr('fill', function(d){

                    if(d3.select(this).attr('selected') == 1){

                        let person = d3.select(this).attr('person')
                        selected_persons.push(person)//selected_persons中为选中的person
                        return 'red'
                    }

                    let cx = d.x * zoom_lambda + that.width / 2
                    let cy = d.y * zoom_lambda + that.width / 2
                    let dis = (x - cx) * (x - cx) + (y - cy) * (y - cy)

                    if(dis <= 25){
                        d3.select(this).attr('selected', 1)
                        return 'red'
                    }
                
                })//如果point距离鼠标滑过的点小于5个像素点就变红，
            }

        })
        .on('mouseup', function(d){

            svg.select('#pointer')
            .remove()

            selecting = false;

            let cell_counter = {};

            let ODs = {};

            selected_persons.forEach(function(person){

                let seqs = persons_seqs_dict[person]

                for(let i=0;i<seqs.length - 1;i++){

                    let prev_cell = seqs[i]
                    let next_cell = seqs[i+1]
                    let pair = prev_cell + '-' + next_cell

                    if(ODs[pair] != undefined){

                        ODs[pair] += 1
                    }
                    else{

                        ODs[pair] = 1
                    }
                }

                seqs.forEach(function(cell){

                    if(cell_counter[cell] != undefined)
                        cell_counter[cell] += 1
                    else
                        cell_counter[cell] = 1
                })
            })//cell_counter中key为seq中的基站，value为seq中基站出现的次数

            //console.log(ODs)
            let ODList = []

            for (let pair in ODs){

                ODList.push([pair, ODs[pair]])
            }

            ODList = ODList.sort(function(a,b){

                return b[1] - a[1]
            })

            ODList = ODList.slice(0, 50)

            let VIP_cell_list = []

            ODList.forEach(function(od){

                let pair = od[0]
                let source= pair.split('-')[0]
                let target = pair.split('-')[1]

                let sourceInfo = cells_retriver[source]
                //let sourcePosition = 
                let targetInfo = cells_retriver[target]
                let count = parseInt(od[1])

                if(sourceInfo != undefined && targetInfo != undefined)
                    VIP_cell_list.push({'source': sourceInfo, 'target': targetInfo, 'count': count})
            })

            that.$root.$emit("getScreenInfo", VIP_cell_list);
            //console.log(transfered_data)

            let selected_persons_dict = {}

            selected_persons.forEach(function(person){

                selected_persons_dict[person] = 1
            })//selected_persons_dict中key为选中的person value为1
          
            $.post('http://localhost:4000/users/', JSON.stringify({'persons': selected_persons_dict}))
               .done(function( data ) {

                   console.log(data)
            });

            that.$root.$emit('updateMapTopic', cell_counter) 

            that.$root.$emit('updateMatTopic', selected_persons)

            that.$root.$emit('updateCellCluster', cell_counter)

            selected_persons = []

            d3.selectAll('.point').attr('selected', 0 )
        })
        
    }   
  },
  mounted(){

    d3.select('#' + 'user-emb-container')
      .style('position', 'absolute')
      .style('top', '2%')
      .style('right', '40px')

    this.width = 340
    this.height = 340

    let that = this

//读取用户通话位置和基站位置，data为user_emb,res2为cell_info
    DataProvider.getUserEmbData().then(response => {       

        DataProvider.getCellInfo().then(response2 => {
              
            that.data = response.data;

            that.chartInit(that.data, response2.data)

            }, error => {
                that.loading = false;
        });

        }, error => {
            that.loading = false;
    });

  },
}
</script>

<style scoped>
#user-emb-container{
  width:93%;
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