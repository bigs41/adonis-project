'use strict'
const Database = use('Database')
class RawQueryController {

/**
  * @swagger
  * /api/v1/raw-query:
  *   post:
  *     tags:
  *       - Raw Query
  *     summary: Raw Query
  *     parameters:
  *       - name: connect
  *         description: mssql = Mlearning, mssql2 = SEC_Mlearning
  *         in: formData
  *         required: true
  *         type: string
  *         enum: [mysql, mssql,mssql2]
  *       - name: raw
  *         description: 
  *         in: formData
  *         type: text
  *     responses:
  *       200:
  *         description: success
  */

    async rawQuery({request}){

        var conn = request.input('connect')
            ,raw = request.input('raw')

        var resdata = await Database
        .connection(conn)
        .raw(raw)

        resdata = JSON.parse(JSON.stringify(resdata).replace(/null/g,'""'))

        return resdata
    }
}

module.exports = RawQueryController
