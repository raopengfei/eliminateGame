/**
 * Created by wxraopf on 2017-11-17.
 */
class Cell {
    constructor(x,y,data,id) { //构造函数
        // this.name = name;
        this.x = x;
        this.y = y;
        this.id = id || this.y*9 + this.x;
        this.data = data;
    }
    getLeft(){
        let i = this.x - 1;
        if(i > -1){
            return this.data[this.y][i];
        }else {
            return null;
        }
    }
    getRight(){
        let i = this.x + 1;
        if(i < 9){
            return this.data[this.y][i];
        }else{
            return null;
        }
    }
    getTop(){
        let i = this.y - 1;
        if(i > -1){
            return this.data[i][this.x];
        }else{
            return null;
        }
    }
    getBottom(){
        let i = this.y + 1;
        if(i < 9){
            return this.data[i][this.x];
        }else{
            return null;
        }
    }
}
class EliminateCell extends Cell {
    constructor(x,y,data,obj,id) { //构造函数
        //调用父类构造函数
        super(x,y,data,id);
        //消除类型
        this.name = obj.name;
        //消除图标
        this.src = obj.src;
        //最近一次点击
        this.isActive = false;
        //消除权限（暂未使用）
        this.power = 'eliminate';

        //消除相关参数  在交换后是要重新生成的
        //下落格数
        this.downCount = 0;
        this.maxDownCount = 0;
        //是否消除
        this.removeX = false;
        //x重复个数
        this.countX = 0;
        //y项消除
        this.removeY = false;
        //y重复个数
        this.countY = 0;

    }
    isNear(obj){
        switch (obj) {
            case this.getLeft():
                return 'left';
            case this.getRight():
                return 'right';
            case this.getTop():
                return 'top';
            case this.getBottom():
                return 'bottom';
            default:
                return '';
        }
    }
    exchange(obj){
        if(!('data' in obj) || !obj) {
            return;
        }
        var x = this.x;
        var y = this.y;
        this.x = obj.x;
        this.y = obj.y;
        this.data[this.y].splice(this.x,1,this);
        obj.x = x;
        obj.y = y;
        this.data[obj.y].splice(obj.x,1,obj);
    }
    updataDownCount() {
        var bottomCell = this.getBottom();
        var n = 0;
        while (bottomCell) {
            if(bottomCell.removeX || bottomCell.removeY){
                n++;
            }
            bottomCell = bottomCell.getBottom();
        }
        this.downCount = n;
        this.maxDownCount = this.data[0][this.x].downCount;
        if(this.data[0][this.x].removeX || this.data[0][this.x].removeY){
            this.maxDownCount = this.data[0][this.x].downCount + 1;
        }else {
            this.maxDownCount = this.data[0][this.x].downCount;
        }

    }
    moveTo(){
        var data = this.data;
        var cell = this;
        var target = data[cell.y + cell.downCount][cell.x];
        cell.exchange(target);
    }
}




