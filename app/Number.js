'use strict'

const ThaiBaht = require('thai-baht-text')

class Number {
    constructor(num=''){
        this.num = this.toEn(num);
        return this
    }
    set(num=''){
        this.num = this.toEn(num);
        return this
    }
    calculate(v=this.num){
        v = v.toString();
        this.num = eval(v);
        return this
    }
    toEn(v=this.num){
        v = v.toString();
        v = v.replace(/๐/g,'0');
        v = v.replace(/๑/g,'1');
        v = v.replace(/๒/g,'2');
        v = v.replace(/๓/g,'3');
        v = v.replace(/๔/g,'4');
        v = v.replace(/๕/g,'5');
        v = v.replace(/๖/g,'6');
        v = v.replace(/๗/g,'7');
        v = v.replace(/๘/g,'8');
        v = v.replace(/๙/g,'9');
        return v
    }
    toTh(v=this.num){
        v = v.toString();
        v = v.replace(/0/g,'๐');
        v = v.replace(/1/g,'๑');
        v = v.replace(/2/g,'๒');
        v = v.replace(/3/g,'๓');
        v = v.replace(/4/g,'๔');
        v = v.replace(/5/g,'๕');
        v = v.replace(/6/g,'๖');
        v = v.replace(/7/g,'๗');
        v = v.replace(/8/g,'๘');
        v = v.replace(/9/g,'๙');
        return v
    }
    toThStr(v=this.num){
        v = ThaiBaht(v);
        v = v.replace(/บาท/g,'');
        v = v.replace(/สตางค์/g,'');
        v = v.replace(/ถ้วน/g,'');
        return v;
    }
    toThStrBaht(v=this.num){
        return ThaiBaht(v);
    }
}

module.exports = Number
