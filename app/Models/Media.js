'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('BaseModel')
const table = 'ml_media'
class Media extends Model {
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
      static get createdAtColumn () {
        return null
      }
      static get updatedAtColumn () {
        return null
      }
}

module.exports = Media
