'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('BaseModel')
const table = 'ml_notify'
class SecNotify extends Model {
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
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    }
}

module.exports = SecNotify
