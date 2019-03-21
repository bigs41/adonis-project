'use strict'

const Model = use('Model')
const _ = require('lodash');
const collect = require('collect.js');
class BaseModels extends Model {
    
    static getTable () {
        return this.table
    }
    static getPrimary () {
        return this.primaryKey;
    }
    static getConnent () {
        return this.connection;
    }
    static async nextId () {
        const Database = use('Database')
        const collect = use('collect.js')
        var data = await Database.connection(this.connection).raw('SELECT IDENT_CURRENT (\''+this.table+'\') as id ')

        return collect(data).first().id;
    }
    static async columnList ($setting={}) {
        const $table = this.table
        var collect = use('collect.js')
        var Config = use('Config')
        ,$seting = Config.get('database.connection')
        ,$config = Config.get('database.'+$seting)
        ,knex = use('knex')($config)
        ,resp =await knex($table).columnInfo()
        ,$get = 'full';
        
        if(typeof $setting == 'string'){
        $get = $setting;
        }else if(!_.isEmpty($setting.get)){
        $get = $setting.get;
        }
        if(typeof $get ==='string'){
            if($get=='full'){
            return  resp;
            }else if($get=='key'){
            return collect(resp).keys();
            }else{
            return collect(resp).map((v,k)=>{
                let $response = {}
                $response['key'] = k;
                $response[$get] = v[$get]
                return $response
            }).values().pluck($get,'key').all()
            }
        }else{
        return collect(resp).map((v,k)=>{
            let $response = {}
            $response['key'] = k;
            $get.forEach((key,ele)=> {
            $response[key] = v[key]
            });
            return $response
        }).values().all()
        }
    }
}

module.exports = BaseModels
