'use strict'

const Model = use('BaseModel')
const table = 'ml_ex_user'
class SecExUser extends Model {
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
      
}

module.exports = SecExUser
