'use strict'

const Model = use('BaseModel')
const table = 'ml_ex_user'
class ExUser extends Model {
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
      static get incrementing () {
        return false
      }
      
}

module.exports = ExUser
