'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const collect = use('collect.js')

const async = use('async');
const Config = use('Config');
const Helpers = use('Help');
const Database = use('Database')

const _Number = use('App/Number')
const fs = require('fs')
const path = require('path')

const PDF2Pic = require('pdf2pic').default;
var PDFImage = require("pdf-image").PDFImage;
var pdf2img = require('pdf2img');

const swaggerJSDoc = use('swagger-jsdoc')
let apis = ['app/**/*.js', 'start/routes.js']
let apisConfig = Config.get('swagger.apis')
apis = apis.concat(apisConfig)
Route.get('/tmp',async ({request,response}) => {
    return Helpers.numthai('1234','to-th')
    var data =await Helpers.callBack('App/Controllers/Http/MethodMainController','test',[{Helpers,request,response}])
    return collect(data).shuffle().all();

})
Route.get('/permission',async ({request,help,response}) => {
    var data = await Database.connection('mysql2').table('ml_permission')
        ,$data = collect(data).map(r=>{
            return collect(r).only(['id','name','types','parent_id']).all()
        }).all()
        ,tree = help.buildTree($data,{
            idKey: 'id',
            parentKey: 'parent_id',
            childrenKey: 'children'
        })
    return tree;
})
Route.get('/pic',async ({request,help,response}) => {
    // var converter = new PDF2Pic({
    //     density: 100,           // output pixels per inch
    //     savename: "untitled",   // output file name
    //     savedir: help.publicPath("assets"),    // output file location
    //     format: "png",          // output file format
    //     size: 600               // output size in pixels
    //   })
    // var data = help.publicPath("sample.pdf")

    // converter.convert('/public/sample.pdf',[1])
    // .then(resolve => {
    //     console.log("image converted successfully")
    // })

    // var pdfImage = new PDFImage("/public/sample.pdf");
    // pdfImage.convertPage(0).then(function (imagePath) {
    // // 0-th page (first page) of the slide.pdf is available as slide-0.png
    // fs.existsSync("/public/slide-0.png") // => true
    // });

    pdf2img.setOptions({
        type: 'png',                                // png or jpg, default jpg
        size: 1024,                                 // default 1024
        density: 600,                               // default 600
        outputdir: help.publicPath("assets"), // output folder, default null (if null given, then it will create folder name same as file name)
        outputname: 'test',                         // output file name, dafault null (if null given, then it will create image name same as input name)
        page: null                                  // convert selected page, default null (if null given, then it will convert all pages)
      });
       
      pdf2img.convert(help.publicPath("sample.pdf"), function(err, info) {
        if (err) console.log(err)
        else console.log(info);
      });

    return '';
})

Route.on('/').render('welcome')

Route.any('/user', 'AccountController.login')

/**
  * @swagger
  * /test/test:
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

Route.any('/test/test/:drink?', 'MethodMainController.test')
Route.any('/fi', 'V1/BmaMlearnController.filterNotify')



Route.group(() => {
    //mlearn
    Route.any('/get', 'V1/MlearnController.getLog')
    Route.any('/store', 'V1/MlearnController.storeLog')
    Route.any('/upload-ex', 'V1/MlearnController.uploadEx')
    Route.any('/upload-video', 'V1/MlearnController.uploadVideo')
    Route.any('/get-video-gw', 'V1/MlearnController.getFile')

    //sec mlearn
    Route.any('/get2', 'V1/SecMlearnController.getLog')
    Route.any('/store2', 'V1/SecMlearnController.storeLog')
    Route.any('/notify-store2', 'V1/SecMlearnController.notifyStore')
    Route.any('/notify-send2', 'V1/SecMlearnController.filterNotify')
    Route.any('/upload-ex2', 'V1/SecMlearnController.uploadEx')
    Route.any('/svoa/update-path', 'V1/SecMlearnController.updatePath')
    Route.any('/check-file', 'V1/SecMlearnController.checkFile')
    Route.any('/get-video', 'V1/SecMlearnController.getFile')
    

    //bma mlearn
    Route.any('/get-survey', 'V1/BmaMlearnController.getSurvey')
    Route.any('/notify-store', 'V1/BmaMlearnController.notifyStore')
    Route.any('/notify-send', 'V1/BmaMlearnController.filterNotify')
    Route.any('/test', 'V1/MlearnController.chkTest')
    Route.any('/que', 'V1/BmaMlearnController.que')

    //raw query
    Route.any('/raw-query', 'V1/RawQueryController.rawQuery')
  }).prefix('api/v1')




Route.any('/cal',async ({request}) => {
    return Helpers.numthai(request.input('num'),request.input('to'))
    // var number_c = new _Number(request.input('num'));
    // return number_c.calculate().toTh()
})
Route.get('/log',async ({request}) => {
    return await use('App/Models/LogLearning').columnList('type');
})
Route.get('/api_json',async ({request}) => {
const options = {
    swaggerDefinition: {
    info: {
        title: Config.get('swagger.title'),
        version: Config.get('swagger.version')
    },
    basePath: Config.get('swagger.basePath'),
    securityDefinitions: {
        'ApiKey': {
        'type': 'apiKey',
        'description': Config.get('swagger.securityDefinitions.ApiKey.description'),
        'name': Config.get('swagger.securityDefinitions.ApiKey.name'),
        'in': 'header'
        },
        'BasicAuth': {
        'type': 'basic'
        },
        'OAuth2': {
        'type': 'oauth2',
        'flow': 'accessCode',
        'authorizationUrl': Config.get('swagger.securityDefinitions.OAuth2.authorizationUrl'),
        'tokenUrl': Config.get('swagger.securityDefinitions.OAuth2.tokenUrl'),
        'scopes': Config.get('swagger.securityDefinitions.OAuth2.scopes')
        }
    }
    },
    apis: apis
}
var json = swaggerJSDoc(options);
json.basePath = request.headers().host
json = collect(json).all()
return json
})
Route.get('/v2/docs.json',async ({request}) => {
    const options = {
        swaggerDefinition: {
        info: {
            title: Config.get('swagger.title'),
            version: Config.get('swagger.version')
        },
        basePath: Config.get('swagger.basePath'),
        securityDefinitions: {
            'ApiKey': {
            'type': 'apiKey',
            'description': Config.get('swagger.securityDefinitions.ApiKey.description'),
            'name': Config.get('swagger.securityDefinitions.ApiKey.name'),
            'in': 'header'
            },
            'BasicAuth': {
            'type': 'basic'
            },
            'OAuth2': {
            'type': 'oauth2',
            'flow': 'accessCode',
            'authorizationUrl': Config.get('swagger.securityDefinitions.OAuth2.authorizationUrl'),
            'tokenUrl': Config.get('swagger.securityDefinitions.OAuth2.tokenUrl'),
            'scopes': Config.get('swagger.securityDefinitions.OAuth2.scopes')
            }
        }
        },
        apis: apis
    }
    var json = swaggerJSDoc(options);
    var rootPath = request.protocol()+'://'+request.headers().host
    json = collect(json).map((res,key)=>{
        if(key!='paths'){
            return res;
        }else{
            return collect(res).map((par,index)=>{
                return collect(par).map((port)=>{
                    if(Helpers.empty(port.operationId)){
                        port.operationId = index.replace(/(\/)/gm,'_')
                    }
                    if(!Helpers.empty(port.description)){
                        port.description = port.description.replace(/{{url}}/gm,rootPath)
                    }
                    return port;
                }).all();
            }).all();
        }
    }).all()

    var tags = collect(json.paths).map((res)=>{
        var tag = collect(res).pluck('tags').values().collapse().all()
        return tag;
    }).values().collapse().unique().map((res)=>{
        return {'name':res,'description':res};
    }).all()
    if(Helpers.empty(json.tags)){
        json.tags = tags
    }
    
    json.rootPath = request.protocol()+'://'+request.headers().host
    return json
    })

///////////////////////////////test connect///////////////////////////////////
const sql = use('mssql');
Route.get('/db',async () => {
    await sql.connect(Config.get('database.mssql.connection'))
    const result = await sql.query`SELECT *
    FROM ml_log_learning
    ORDER BY id asc
    OFFSET 10 ROWS
    FETCH NEXT 10 ROWS ONLY
    `
    ,user = use('App/Models/ExUser').query()
    ,coll = collect(result.recordsets).collapse().all()
    ,get = {}
    async.forEachOf(coll,function (params,key) {
        params.ex = use('App/Models/ExUser').query().where({'user_id':params.user_id,'curr_id':params.curr_id}).fetch()
        get[key] = params;
    })
    return get;
  })

