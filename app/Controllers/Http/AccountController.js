'use strict'

const collect = use('collect.js')
const Helpers = use('Help');
const _ = use('lodash');
const async = use('async');
const Encryption = use('Encryption')

var encryptor = require('simple-encryptor')({
    key: '8kwRDYGmYbdpZND3AQLurISX74G5N3sgAmcN1/F4150=',
    hmac: 'AES-256',
    debug: true
  });

class AccountController {
    async login ({request}){
        return await encryptor.encrypt('123456')
        var sss = await Encryption.getInstance({
            hmac: 'AES-256-CBC'
        }).decrypt('eyJpdiI6Im41XC9oMW85ajhXd1h2K0phQVdkQW1RPT0iLCJ2YWx1ZSI6IklhUFByXC91RENHNVgySXc3R01xUGpBPT0iLCJtYWMiOiJmNWJmNDRiNDFmNWVhM2ZlYmQxNTk3ZjhmMDFmZjYzNTQ1NWEwNjM3ZjQxOGE3MmYwNTA2MTM4OTViN2M5NGVjIn0=');
        return sss
        var   User = await use('App/Models/User').all()
        return collect(User.rows).map((res)=>{
            res.password = encryptor.decrypt(res.password)
            return res
        }).all();
        // const sessionAuth = request.auth.authenticator('jwt')
        // return await sessionAuth.attempt(email, password)
    }
}

module.exports = AccountController
