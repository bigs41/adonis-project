'use strict'

const Model = use('BaseModel')
const table = 'ml_survey_user'

class SecSurveyUser extends Model {
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

module.exports = SecSurveyUser
