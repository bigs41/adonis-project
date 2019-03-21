'use strict'

const collect = use('collect.js')
const Helpers = use('Help');
const _ = use('lodash');
const async = use('async');
const { validate } = use('Validator')
const OneSignal = require('onesignal-node');
const Env = use('Env')
class BmaMlearnController {
  /**
  * @swagger
  * /api/v1/get-survey:
  *   post:
  *     tags:
  *       - BMA_Mlearn
  *     summary: BMA get survey
  * 
  *     parameters:
  *       - name: id
  *         description: filter by id if null response all
  *         in: formData
  *         type: string
  *       - name: user_id
  *         description: filter by user_id if null response all
  *         in: formData
  *         type: string
  *       - name: sv_id
  *         description: filter by sv_id(survey id) if null response all
  *         in: formData
  *         type: string
  *       - name: callback
  *         description: response to [all,first]
  *         in: formData
  *         type: string
  *       - name: page
  *         description: page to pagination
  *         in: formData
  *         type: string
  *       - name: limit
  *         description: limit items per page
  *         in: formData
  *         type: string
  *       - name: sort
  *         description: sort by attribute db
  *         in: formData
  *         type: string
  *       - name: order
  *         description: sort format [asc,desc]
  *         in: formData
  *         type: string
  *       - name: sortBy
  *         description: format `{"id":"asc"}`
  *         in: formData
  *         type: string
  *       - name: callback
  *         description: value all,first default value all
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: Send hello message
  *         example:
  *             {
    "limit": int,
    "first_page": int,
    "last_page": int,
    "next_page": int,
    "prev_page": int,
    "offset": int,
    "to": int,
    "current_page": int,
    "data":[
        {
            "id": int,
            "user_id": int,
            "curr_id": int,
            "log_event": string,
            "time_start": "2018-07-31 06:00:00",
            "time_end": "2018-07-31 06:00:00",
            "finish": int,
            "ex": array
        }
    ]}
  */
    async getSurvey({request}){

        var survey = await use('App/Models/Bma/SurveyUser');
        var SurveyUser = survey.query()
                        .select([
                            survey.get_table()+'.*'
                            ,'ml_user.name as user_name'
                            ,'ml_user.lastname as user_lastname'
                            ,'ml_survey.name as survey_name'
                        ])
                        .leftJoin('ml_user','ml_user.id',survey.get_table()+'.user_id')
                        .leftJoin('ml_survey','ml_survey.id',survey.get_table()+'.sv_id')
                        .where(function () {
                            if(!Helpers.empty(request.input('user_id'))){
                                this.where(survey.get_table()+'.user_id', request.input('user_id'))
                            }
                            if(!Helpers.empty(request.input('sv_id'))){
                                this.where(survey.get_table()+'.sv_id', request.input('sv_id'))
                            }
                            if(!Helpers.empty(request.input('id'))){
                                this.where(survey.get_table()+'.id', request.input('id'))
                            }
                        });


        var     callback = !Helpers.empty(request.input('callback'))?request.input('callback'):'all'
                ,current_page = !Helpers.empty(request.input('page'))?request.input('page'):1
                
                ,limit = !Helpers.empty(request.input('limit'))?request.input('limit'):20
                ,first_page = 1
                ,last_page = Math.ceil(await SurveyUser.getCount()/limit)
                ,list_page = Helpers.range(first_page,last_page+1)
                ,next_page = _.indexOf(list_page,(parseInt(current_page)+1))>=0?parseInt(current_page)+1:0
                ,prev_page = _.indexOf(list_page,(parseInt(current_page)-1))>=0?parseInt(current_page)-1:0
                ,offset = prev_page?prev_page*limit:0
                ,to = current_page*limit
    
        var     sort = !Helpers.empty(request.input('sort'))?request.input('sort'):'id'
                ,order = !Helpers.empty(request.input('order'))?request.input('order'):'asc'
                if(request.input('sortBy')){
                    const  sort_By = JSON.parse(request.input('sortBy'))
                    if(typeof sort_By == 'object'){
                        sort = collect(sort_By).keys().first()
                        order = collect(sort_By).values().first()
                    }
                }

        var   paginate = await SurveyUser
                .orderBy(sort,order)
                .offset(offset)
                .limit(limit)
                .fetch();

        var respage = {
                    'limit':limit,
                    'first_page':first_page,
                    'last_page':last_page,
                    'next_page':next_page,
                    'prev_page':prev_page,
                    'offset':offset,
                    'to':to,
                    'current_page':parseInt(current_page),
                    // 'list_page':list_page
                }
                ,resdata = collect(paginate.rows).map((res)=>{
                    return {
                        id:res.id,
                        user_id:res.user_id,
                        user_name:res.user_name,
                        user_lastname:res.user_lastname,
                        survey_id:res.sv_id,
                        survey_name:res.survey_name,
                    }
                })[callback]()

        respage = JSON.parse(JSON.stringify(respage).replace(/null/g,'""'))
        resdata = JSON.parse(JSON.stringify(resdata).replace(/null/g,'""'))
        if(!Helpers.empty(request.input('get_page'))){
            return respage
        }
        
        if(callback=='first'){
            return resdata
        }
        return collect(respage).merge({"data":resdata}).all()
    }

/**
  * @swagger
  * /api/v1/notify-store:
  *   post:
  *     tags:
  *       - BMA_Mlearn
  *     summary: BMA_Mlearn notify store
  *     consumes:
  *       - multipart/form-data
  *     operationId: api_v1_notify-store
  *     parameters:
  *       - name: id
  *         description: if value empty = create; !empty = update
  *         in: formData
  *         type: string
  *       - name: user_id
  *         description: 
  *         in: formData
  *         type: string
  *       - name: onesignal_id
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async notifyStore({request}){
        var notify = await use('App/Models/Bma/Notify')
            ,columnList = collect(await Helpers.columnList(notify.get_table(),{get:['type']})).pluck('key').all()
            ,getPrimary = notify.getPrimary()

        if(!Helpers.empty(request.input('id'))){
            if(notify.find(request.input('id'))){
                var Log = await notify.find(request.input('id'))
            }
        }
        
        if(Helpers.empty(Log)){
            var Log = new notify()
        }
        
        if(!Helpers.empty(request.all())){
            async.forEachOf(request.all(),function (value, key, callback){
                if(_.indexOf(columnList,key)){
                    if(key!==getPrimary){
                        Log[key] = value;
                    }
                }
            })
            await Log.save();
        }
        return 'success'
    }


/**
  * @swagger
  * /api/v1/notify-send:
  *   post:
  *     tags:
  *       - BMA_Mlearn
  *     summary: BMA_Mlearn notify store
  *     parameters:
  *       - name: sv_id
  *         description: 
  *         in: formData
  *         required: true
  *         type: string
  *       - name: content-en
  *         description: 
  *         in: formData
  *         type: string
  *       - name: content-th
  *         description: 
  *         in: formData
  *         type: string
  *       - name: decription
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */

    async filterNotify({request}){
        const validation = await validate(request.all(), {
            'sv_id':'required'
        })
        if (validation.fails()) {
            return 'input failed'
        }

        var sv_id = request.input('sv_id')
            ,survey = await use('App/Models/Bma/SurveyUser')
            ,SurveyUser = await  survey.query().where('sv_id',sv_id).pluck('user_id')
            ,notify = await use('App/Models/Bma/Notify')
            ,notification = await notify.query().whereIn('user_id',SurveyUser).pluck('onesignal_id')
            ,surveyData = await use('App/Models/Bma/Survey')
            ,survey_data = await surveyData.query().where('id',sv_id).first()
            ,start_date = Helpers.convertDate(survey_data.start_date.toISOString(),'D MMM พ.ศ. YYYY, h:mm',{hl:'th',er:'BD'})
            ,end_date = Helpers.convertDate(survey_data.end_date.toISOString(),'D MMM พ.ศ. YYYY, h:mm',{hl:'th',er:'BD'})
            ,namenoti = Helpers.strLimit(survey_data.name,'15','...')+' '+start_date
        // return  namenoti
        //*/
        var myClient = new OneSignal.Client({    
            userAuthKey: Env.get('ONESIGNAL_USERAUTHKEY','Y2ZjY2VjOWYtYzM4Mi00MjI2LWEyZTAtZGI3NjYyM2IxMjI5'),    
            app: { appAuthKey: Env.get('ONESIGNAL_APPAUTHKEY','Njk4ZGExZDYtYTRhNy00YTdjLThhYTYtMmYwMzVlZDZhZmIz'), appId: Env.get('ONESIGNAL_APPID','12a4b8f8-a5ba-4b8f-942f-640385cb4bd8') }    
        })



        var content_en = !Helpers.empty(request.input("content-en"))?request.input("content-en"):namenoti
        var content_th =  !Helpers.empty(request.input("content-th"))?request.input("content-th"):namenoti

        var setNotification = {    
                contents: {    
                    en: content_en,
                    th: content_th
                }, 
                data:{
                    text:sv_id
                },
                // included_segments: ["Active Users"],
                include_player_ids: notification//["1dd608f2-c6a1-11e3-851d-000c2940e62c", "2dd608f2-c6a1-11e3-851d-000c2940e62c"] 
            }
            ,firstNotification = new OneSignal.Notification(setNotification)
            // return request.except(['sv_id','content-en','content-th']);
            // return setNotification;
        firstNotification.postBody["data"] = {"text": sv_id};
        //*/
        return myClient.sendNotification(firstNotification, function (err, httpResponse,data) {    
            if (err) {    
                // res.json('Error: ' + err) 
                return 'Error: ' + err
            } else {    
                // res.json(data)
                return data
            }    
          })
        /*/
        return notification
        //*/
    }

/**
  * @swagger
  * /api/v1/que:
  *   post:
  *     tags:
  *       - BMA_Mlearn
  *     summary: BMA_Mlearn test
  *     parameters:
  *       - name: sv_id
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async que({help,request,response}){
        var data = await help.callBack('App/Controllers/Http/MethodMainController','test',[{help,request,response}])
        return data;
    }
}

module.exports = BmaMlearnController
