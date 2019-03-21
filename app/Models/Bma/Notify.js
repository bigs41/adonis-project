'use strict'

const Model = use('BaseModel')
const table = 'ml_notify'

class Notify extends Model {
    static get connection () {
        return 'mysql'
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
    static get createdAtColumn () {
        return 'create_date'
    }
    static get updatedAtColumn () {
        return 'update_date'
    }
}

module.exports = Notify
