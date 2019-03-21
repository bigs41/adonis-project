'use strict'

const collect = use('collect.js');
const Helpers = use('Help');
const _ = use('lodash');
const async = use('async');
const { validate } = use('Validator')
const OneSignal = require('onesignal-node');
const Env = use('Env')
class SecMlearnController {

  /**
  * @swagger
  * /api/v1/get2:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     summary: SEC log_learning get
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

 async getLog ({request}){
    // return Helpers.columnList('ml_log_learning',{get:['type','maxLength']})
    var     log = await use('App/Models/SecLogLearning');

    var LogLearning = log.query()
            .select([
                'ml_log_learning.*',
                'ml_curriculum.name as curr_name',
                'ml_user.name as user_name',
                'ml_user.lastname as user_lastname',
            ])
            .leftJoin('ml_curriculum','ml_curriculum.id','ml_log_learning.curr_id')
            .leftJoin('ml_user','ml_user.id','ml_log_learning.user_id')
            .where(function () {
                if(!Helpers.empty(request.input('id'))){
                    this.where('ml_log_learning.id', request.input('id'))
                }
                if(!Helpers.empty(request.input('user_id'))){
                    this.where('ml_log_learning.user_id', request.input('user_id'))
                }
            });

    var     callback = !Helpers.empty(request.input('callback'))?request.input('callback'):'all'
            ,current_page = !Helpers.empty(request.input('page'))?request.input('page'):1
            
            ,limit = !Helpers.empty(request.input('limit'))?request.input('limit'):20
            ,first_page = 1
            ,last_page = Math.ceil(await LogLearning.getCount()/limit)
            ,list_page = Helpers.range(first_page,last_page+1)
            ,next_page = _.indexOf(list_page,(parseInt(current_page)+1))>=0?parseInt(current_page)+1:0
            ,prev_page = _.indexOf(list_page,(parseInt(current_page)-1))>=0?parseInt(current_page)-1:0
            ,offset = prev_page?prev_page*limit:0
            ,to = current_page*limit

    var     sort = !Helpers.empty(request.input('sort'))?request.input('sort'):'id'
            ,order = !Helpers.empty(request.input('order'))?request.input('order'):'desc'
            if(request.input('sortBy')){
                const  sort_By = JSON.parse(request.input('sortBy'))
                if(typeof sort_By == 'object'){
                    sort = collect(sort_By).keys().first()
                    order = collect(sort_By).values().first()
                }
            }

    var   paginate = await LogLearning
            .with('contact')
            .orderBy(sort,order)
            .offset(offset)
            .limit(limit)
            .fetch()

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
            var data = JSON.parse(JSON.stringify(res))
            if(!Helpers.empty(data.contact)){
                if(!Helpers.empty(res.curr_id)){
                    res.ex = collect(data.contact).where('curr_id','==',res.curr_id).values().all()
                }else{
                    res.ex = []
                }
            }else{
                res.ex = []
            }
            return {
                id:res.id,
                user_id:res.user_id,
                user_name:res.user_name,
                user_lastname:res.user_lastname,
                curr_id:res.curr_id,
                curr_name:res.curr_name,
                log_event:res.log_event,
                time_start:res.time_start,
                time_end:res.time_end,
                finish:res.finish,
                ex:res.ex,
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
  * /api/v1/store2:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     summary: SEC log_learning store
  *     parameters:
  *       - name: id
  *         description: if value empty = create; !empty = update
  *         in: formData
  *         type: string
  *       - name: user_id
  *         description: 
  *         in: formData
  *         type: string
  *       - name: curr_id
  *         description: 
  *         in: formData
  *         type: string
  *       - name: curr_id
  *         description: 
  *         in: formData
  *         type: string
  *       - name: log_event
  *         description: 
  *         in: formData
  *         type: string
  *       - name: time_start
  *         description: 
  *         in: formData
  *         type: string
  *       - name: time_end
  *         description: 
  *         in: formData
  *         type: string
  *       - name: finish
  *         description: value [0,1]
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async storeLog ({request}){
        var   LogLearning = await use('App/Models/LogLearning')
            ,columnList = collect(await Helpers.columnList('ml_log_learning',{get:['type']})).pluck('key').all()
            ,getPrimary = LogLearning.getPrimary()

        if(!Helpers.empty(request.input('id'))){
            if(LogLearning.find(request.input('id'))){
                var Log = await LogLearning.find(request.input('id'))
            }
        }
        if(Helpers.empty(Log)){
            var Log = new LogLearning()
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
            // return Log
        }
        return 'success'
    }

/**
  * @swagger
  * /api/v1/notify-store2:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     summary: SEC_Mlearn notify store
  *     consumes:
  *       - multipart/form-data
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
        var notify = await use('App/Models/SecNotify')
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
        // Log['user_id'] = request.input('user_id')
        // Log['onesignal_id'] = request.input('onesignal_id')
        // return await Log.save()
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
  * /api/v1/notify-send2:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     summary: SEC_Mlearn notify store
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
            ,survey = await use('App/Models/SecSurveyUser')
            ,SurveyUser = await  survey.query().where('sv_id',sv_id).pluck('user_id')
            ,notify = await use('App/Models/SecNotify')
            ,notification = await notify.query().whereIn('user_id',SurveyUser).pluck('onesignal_id')
            ,surveyData = await use('App/Models/SecSurvay')
            ,survey_data = await surveyData.query().where('id',sv_id).first()
            ,start_date = Helpers.convertDate(survey_data.start_date,'D MMM พ.ศ. YYYY, h:mm',{hl:'th',er:'BD'})
            ,end_date = Helpers.convertDate(survey_data.end_date,'D MMM พ.ศ. YYYY, h:mm',{hl:'th',er:'BD'})
            ,namenoti = Helpers.strLimit(survey_data.name,'15','...')+' '+start_date
        // return  namenoti
        //*/
        var myClient = new OneSignal.Client({    
            userAuthKey: Env.get('ONESIGNAL_USERAUTHKEY_SEC','OTk1OWEzNTAtZDE1My00ZTJlLTk2YjMtNTQ0MTYyNzgzY2M5'),    
            app: { appAuthKey: Env.get('ONESIGNAL_APPAUTHKEY_SEC','MjRiZmEzMWUtZTI1YS00ZTRjLTgxMTQtYTFhZmRkOTVlMzY3'), appId: Env.get('ONESIGNAL_APPID_SEC','c2fac756-e991-4cd4-b0e4-380c29385851') }    
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
  * /api/v1/upload-ex2:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     description: id = 1134
  *                  filePath = {{url}}/store/ex/svoa/1134.zip
  *     summary: SEC_Mlearn ex upload
  *     parameters:
  *       - name: file_ex
  *         description: 
  *         in: formData
  *         type: file
  *       - name: curr_id
  *         description: 
  *         in: formData
  *         type: string
  *       - name: name
  *         description: 
  *         in: formData
  *         type: string
  *       - name: user_id
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async uploadEx({request}){
            

        var fileEx = request.file('file_ex')
            ,id = 1134

        if(Helpers.empty(fileEx)){
            return 'input false'
        }
        
        // return Helpers.publicPath('store/ex/gw')
        if(!Helpers.empty(request.input("id"))){
            id = request.input("id");
        }

        var   Ex = await use('App/Models/SecEx')
            ,columnList = collect(await Helpers.columnList('ml_ex',{get:['type']})).pluck('key').all()
            ,getPrimary = Ex.getPrimary()

        if(!Helpers.empty(id)){
            if(Ex.find(id)){
                var Log = await Ex.find(id)
            }
        }
        if(Helpers.empty(Log)){
            var Log = new Ex()
        }
        
        if(!Helpers.empty(request.all())){
            async.forEachOf(request.all(),function (value, key, callback){
                if(_.indexOf(columnList,key)){
                    if(key!==getPrimary){
                        if(!Helpers.empty(value)){
                            Log[key] = value;
                        }
                    }
                }
            })
            await Log.save();
            // return Log
        }
        var filename =  Log.id+'.'+fileEx.extname
        await fileEx.move(Helpers.publicPath('store/ex/svoa'), {
            name: filename,
            overwrite: true
        })
        
        if (!fileEx.moved()) {
        return fileEx.error()
        }

        return 'success'
    }

/**
  * @swagger
  * /api/v1/svoa/update-path:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     description:
  *     summary: SEC_Mlearn ex upload
  *     parameters:
  *       - name: id
  *         description: ใช้ในการอ่างอิง กับ ฐานข้อมูล
  *         in: formData
  *         type: string
  *       - name: old_path
  *         description: (หากไม่มี id ) ที่อยู่เดิมของ file ในการอ่างอิง กับ ฐานข้อมูล Example 'Z:/raw/1_2018-12-10/1.mp4'
  *         in: formData
  *         type: string
  *       - name: path
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async updatePath ({request}){
        const validation = await validate(request.all(), {
            'path':'required'
        })
        if (validation.fails()) {
            return 'input failed'
        }
        var id = 0;
        var data = {};
        var media = await use('App/Models/SecMedia')
        if(!Helpers.empty(request.input("id"))){
            id = request.input("id");
        }
        if(!Helpers.empty(request.input("old_path"))){
            if(data = await media.query().where('name',request.input("old_path")).first()){
              id = data.id;  
            }
        }
        if(Helpers.empty(id)){
            media = await use('App/Models/Media')
            if(!Helpers.empty(request.input("old_path"))){
                if(data = await media.query().where('name',request.input("old_path")).first()){
                  id = data.id;  
                }
            }
            if(Helpers.empty(id)){
                return 'input failed'
            }            
        }

        request.add({name:request.input('path')})
        var  columnList = collect(await Helpers.columnList(media.getTable(),{get:['type']})).pluck('key').all()
            ,getPrimary = media.getPrimary()

        if(!Helpers.empty(id)){
            if(media.find(id)){
                // var Media = await media.find(id)
                // Media.name = request.input('path');
                // await Media.save();
                return 'success';
            }
        }
        return 'data not found';
    }
/**
  * @swagger
  * /api/v1/check-file:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     description:
  *     summary: SEC_Mlearn ex upload
  *     parameters:
  *       - name: path
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async checkFile({request}){
        
        var fs = require('fs');
        var filePath = request.input('path')
        var regex = /110.170.48.77\/+(\w+[a-z0-9-_/]+)\/playlist.m3u8$/g
            ,regid = /(_\d+_)/g
        var path = regex.exec(filePath)
        var id = regid.exec(path[1])
        id = id[0].replace(/_/g,'')
        var checkfile = '\\\\172.30.108.52\\data\\output\\'+path[1]+'\\'+id+'.mp4';
        if (fs.existsSync(checkfile)) {
            if(fs.statSync(checkfile).isFile()){
                return 'success'
            }
        }
        return 'no data'
    }
/**
  * @swagger
  * /api/v1/get-video:
  *   post:
  *     tags:
  *       - SEC_Mlearn
  *     description:
  *     summary: SEC_Mlearn ex upload
  *     parameters:
  *       - name: id
  *         description: id curriculum tb
  *         in: formData
  *         type: string
  *       - name: media_id
  *         description: id media tb
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async getFile({request}){
        if(Helpers.empty(request.input('id'))&&Helpers.empty(request.input('media_id'))){
            return 'input fail'
        }

        var  media = await use('App/Models/SecMedia')
             ,columnList = media.columnList('key')
             ,getPrimary = media.getPrimary()
             ,data = {}
             if(!Helpers.empty(data = await media.query().where(function(que){
                if(!Helpers.empty(request.input('id'))){
                    que.where('ref_id',request.input('id'));
                }
                if(!Helpers.empty(request.input('media_id'))){
                    que.where('id',request.input('media_id'));
                }
            }).last())){
                return data.name
            }
        return 'no data'
    }



}

module.exports = SecMlearnController
