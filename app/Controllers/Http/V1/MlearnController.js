'use strict'

const collect = use('collect.js')
const Helpers = use('Help');
const _ = use('lodash');
const async = use('async');
const fs = use('fs');
const { validate } = use('Validator')
const moment = use('moment');
class MlearnController {

  /**
  * @swagger
  * /api/v1/get:
  *   post:
  *     tags:
  *       - Mlearn
  *     summary: Mlearn log_learning get
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
  *          {
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
       
        var     log = await use('App/Models/LogLearning');

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
            })[callback]();
        
        
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
  * /api/v1/store:
  *   post:
  *     tags:
  *       - Mlearn
  *     summary: Mlearn log_learning store
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
  * /api/v1/upload-ex:
  *   post:
  *     tags:
  *       - Mlearn
  *     description: id = 1153;
  *                  filePath = {{url}}/store/ex/gw/1153.zip
  *     summary: Mlearn ex upload
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
  *       - name: num_ex
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */
    async uploadEx({request}){
        

        var fileEx = request.file('file_ex')
            ,id = 1153

        if(Helpers.empty(fileEx)){
            return 'input false'
        }
        
        // return Helpers.publicPath('store/ex/gw')
        if(!Helpers.empty(request.input("id"))){
            id = request.input("id");
        }

        var   Ex = await use('App/Models/Ex')
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
        await fileEx.move(Helpers.publicPath('store/ex/gw'), {
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
  * /api/v1/test:
  *   post:
  *     tags:
  *       - Mlearn
  *     description:
  *     summary: Mlearn ex upload
  *     parameters:
  *       - name: path
  *         description: 
  *         in: formData
  *         type: string
  *     responses:
  *       200:
  *         description: success
  */

 async chkTest({request}){
    var testFolder = request.input('path')
    var get = fs.readdirSync(testFolder)
    return get;
}
/**
  * @swagger
  * /api/v1/upload-video:
  *   post:
  *     tags:
  *       - Mlearn
  *     description: id = 1153;
  *                  filePath = {{url}}/store/ex/gw/1153.zip
  *     summary: Mlearn ex upload
  *     parameters:
  *       - name: media
  *         description: 
  *         in: formData
  *         type: file
  *     responses:
  *       200:
  *         description: success
  */

    async uploadVideo({request}){
        
        var fileEx = request.file('media')
            ,id = 1

        if(Helpers.empty(fileEx)){
            return 'input false'
        }
        var paragraph = '\\\\172.30.108.52\\data\\raw\\';
        // var paragraph = '\\\\192.168.1.204\\data\\raw\\';

        var idfile = id
        var filename =  idfile+'.'+fileEx.extname
        ,path = 'gw_'+idfile+'_'+moment().format('YYYY-MM-DD')
        paragraph = paragraph+path

        fs.mkdir(paragraph,function(e){
            console.log(e);
            fs.open(paragraph+'\\order', 'w', function (err, file) {
                console.log('Saved!');
            }); 
        })

        var   Media = await use('App/Models/Media')
              ,columnList = collect(await Helpers.columnList(Media.getTable(),{get:['type']})).pluck('key').all()
              ,getPrimary = Media.getPrimary()

        if(!Helpers.empty(id)){
            if(Media.find(id)){
                var Log = await Media.find(id)
            }
        }
        if(Helpers.empty(Log)){
            var Log = new Media()
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

        
        await fileEx.move(paragraph, {
            name: filename,
            overwrite: true
          })
        
        if (!fileEx.moved()) {
            return fileEx.error()
        }
        Log.name ="http://110.170.48.77/"+path+"/"+idfile+"/playlist.m3u8"
        await Log.save();
        return Log.name
    }

/**
  * @swagger
  * /api/v1/get-video-gw:
  *   post:
  *     tags:
  *       - Mlearn
  *     description:
  *     summary: get link video
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

    var  media = await use('App/Models/Media')
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

module.exports = MlearnController
