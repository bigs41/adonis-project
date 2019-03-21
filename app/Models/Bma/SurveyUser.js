'use strict'

const Model = use('BaseModel')
const table = 'ml_survey_user'

class SurveyUser extends Model {
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

module.exports = SurveyUser
