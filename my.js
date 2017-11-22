/**
 * Created by wxraopf on 2017-11-17.
 */
var lastCell = {};
var _lastCell = {};
var isMove = false;
Vue.component('obj-list', {
    props: ['cell'],
    template: '<div v-bind:class="{active: cell.isActive}" v-on:click="li_click()"><img v-bind:src="cell.src" v-bind:alt="cell.name"></div>',
    // template: '<div v-bind:class="{active: cell.isActive,remove:cell.obj}" v-on:click="li_click()">{{cell.src}}</div>',
    data:function () {
        return {}
    },
    methods:{
        li_click:function(){
            if(isMove){
                return;
            }
            var cell = this.cell;
            if(cell.isNear(lastCell)){
                console.log('执行交换操作');
                cell.exchange(lastCell);
                //重置点击
                cell.isActive = false;
                lastCell.isActive = false;
                this.$emit('li_click')
            }else {
                cell.isActive = true;
                if(cell != lastCell){
                    lastCell.isActive = false;
                }
                console.log('非相邻不执行交换');
            }
            _lastCell = lastCell;
            lastCell = cell;
        }
    }
});

var app = new Vue({
    el:'#app',
    data:{
        data:[],
        dataType:[],
        apiUrl:'data.json',
        rem:[],
        id:81
    },
    created:function(){
        this.getData();
    },
    beforeUpdate:function(){

    },
    methods: {
        getData: function () {
            var self = this;
            this.$http.get(this.apiUrl).then(function (data) {
                data = data.body;
                this.dataType = data.type;
                for (var i = 0; i < 9; i++) {
                    self.data.push([]);
                    for (var j = 0; j < 9; j++) {
                        var num = _.random(0, data.type.length - 1);
                        var obj = new EliminateCell(j,i,self.data,data.type[num]);
                        self.data[i].push(obj);
                    }
                }
                this.updataLastCell();
            })
        },
        app_test: function () {
            console.log('执行消除校验');
            var data = this.data;
            var flag = false;
            var nX = 0;
            var nY = 0;
            _.each(data,function(row,r,arr){
                _.each(row,function(cell,i){
                    //横向检验
                    var rightCell = cell.getRight() || {};
                    if(cell.name === rightCell.name){
                        nX++;
                    }else {
                        for(let i = nX; i > -1; i--){
                            if(nX >= 2){
                                cell.removeX = true;
                                flag = true;
                            }else {
                                cell.removeX = false;
                            }
                            cell.countX = nX;
                            cell = cell.getLeft() || {};
                        }
                        nX = 0;
                    }
                });
                for(let i = 0; i < 9; i++){
                    let cell = data[i][r];
                    let bottomCell = cell.getBottom() || {};
                    if(cell.name === bottomCell.name){
                        nY++;
                    }else {
                        for(let i = nY; i > -1; i--){
                            if(nY >= 2){
                                cell.removeY = true;
                                flag = true;
                            }else {
                                cell.removeY = false;
                            }
                            cell.countY = nY;
                            cell = cell.getTop() || {};
                        }
                        nY = 0;
                    }
                }
            });
            return flag;
        },
        updataLastCell:function(noEdit){
            isMove = true;
            setTimeout(()=>{
                var isExchange = this.app_test();
                if(noEdit && !isExchange){
                    console.log('消除完毕' + '\n--------------' );
                    isMove = false;
                    return;
                }
                var data = this.data;
                var self = this;
                if(!noEdit && !isExchange && ('exchange' in lastCell)){
                    lastCell.exchange(_lastCell);
                    lastCell = {};
                    _lastCell = {};
                    console.log("非法交换执行还原");
                }else {
                    console.log("开始执行消除");
                    //计算下落格数
                    _.each(data,function(row){
                        _.each(row,function(cell){
                            cell.updataDownCount()
                        })
                    });
                    console.log('计算下落格数完成');
                    //执行下落动画
                    for(let i = 8; i > -1; i--){
                        for(let j = 0; j < 9; j++){
                            let row = data[i];
                            let cell = row[j];
                            if(cell && cell.downCount){
                                cell.moveTo();
                            }
                        }
                    }
                    console.log('已有对象执行下落动画');
                    //补充删除的对象;
                    _.each(data,function(row,r){
                        _.each(row,function(cell,i){
                            if(cell.removeX || cell.removeY){
                                data[r].splice(i,1,{
                                    id:cell.id,
                                    // x:cell.x,
                                    // y:-(cell.y+1),
                                    // src:cell.maxDownCount - (cell.y+1),
                                    // data:cell.data,
                                    // obj: self.dataType[_.random(0, self.dataType.length - 1)]
                                });
                                var obj = new EliminateCell(cell.x,-(cell.y+1),cell.data,self.dataType[_.random(0, self.dataType.length - 1)],self.id++);
                                obj._y = cell.maxDownCount - (cell.y+1);
                                self.rem.push(obj);
                            }
                        })
                    });
                    console.log('补充删除的对象完成');
                    //执行补充对象的动画
                    this.$nextTick(function(){
                        _.each(this.rem,function(cell){
                            cell.y = cell._y;
                            cell.data[cell.y].splice(cell.x,1,cell);
                        });
                        this.rem = [];
                        console.log('执行补充对象的动画完成');
                        this.updataLastCell(true);
                    });

                    //
                    // var arr  = [];
                    // _.each(data,function(row,r){
                    //     _.each(row,function(cell,i){
                    //         arr.push(cell.id);
                    //     })
                    // });
                    // console.log(_.uniq(arr).sort(function (a,b) {
                    //     return a-b;
                    // }));
                }
                isMove = false;
            },1000);

        }
    }
});



