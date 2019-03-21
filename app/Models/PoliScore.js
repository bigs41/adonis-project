'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('BaseModel')

class PoliScore extends Model {
    static get connection () {
        return 'mysql2'
      }
      static get table () {
        return 'dcs_family'
      }

      static get primaryKey () {
        return 'Id'
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

module.exports = PoliScore
