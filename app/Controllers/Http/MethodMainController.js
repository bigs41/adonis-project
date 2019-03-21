'use strict'

const Helpers = use('Help');
const DB = use('Database')
class MethodMainController {
    output(){
        return Helpers.range(0,10);
    }
    async test({response, request  }){

        // var knex = require('knex')({
        //     client: 'mysql',
        //     connection: {
        //       host : '127.0.0.1',
        //       user : 'root',
        //       password : 'mysql',
        //       database : 'dcsics'
        //     }
        //   });
        // var  data = await knex.select('*').from('dcs_family')

        
        // var  PoliScore = await use('App/Models/PoliScore');
        // var  data = await PoliScore.all()

        var  data = await DB.connection('mysql2').from('dcs_house').select('*')
        return data
    }

    ml_get(){
        var response ={
            class:'V1/MlearnController',
            func:'getLog',
        }
        return response
    }
    sec_get(){
        var response ={
            class:'V1/SecMlearnController',
            func:'getLog',
        }
        return response
    }

    callBack({request}){
        try {
            if(Helpers.empty(request.input('method'))){
                return 'method undefined'
            }
            if(Helpers.empty(request.input('target'))){
                return 'method undefined'
            }

            var target = request.input('method')+'_'+request.input('target'),
                getMethod = this[target]()

            return Helpers.callBack('App/Controllers/Http/'+getMethod.class,getMethod.func,[{request}])

            
        } catch (error) {
            return 'target Error!. not func'
        }
    }
}

module.exports = MethodMainController
