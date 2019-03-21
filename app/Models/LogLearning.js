'use strict'

const Model = use('BaseModel')
const table = 'ml_log_learning'
class LogLearning extends Model {
    static get connection () {
      return 'mssql'
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
      // static get incrementing () {
      //   return false
      // }
      static get createdAtColumn () {
        return null
      }
      static get updatedAtColumn () {
        return null
      }
      contact (){
        return this.hasMany('App/Models/ExUser','user_id','user_id')
      }
}

module.exports = LogLearning
