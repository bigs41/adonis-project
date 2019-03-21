'use strict'

const Model = use('BaseModel')
const table = 'ml_log_learning'
class SecLogLearning extends Model {
      static get connection () {
        return 'mssql2'
      }
      static get table () {
        return table
      }
      static get_table () {
        return table
      }
      static get primaryKey () {
        return 'id'
      }
      static get incrementing () {
        return false
      }
      static get dates () {
        return null
      }
      contact (){
        return this.hasMany('App/Models/SecExUser','user_id','user_id')
      }
}

module.exports = SecLogLearning
