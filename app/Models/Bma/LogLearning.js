'use strict'

const Model = use('Model')
const table = 'ml_log_learning'

class LogLearning extends Model {
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
        return null
    }
    static get updatedAtColumn () {
        return null
    }
}

module.exports = LogLearning
