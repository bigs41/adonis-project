# Adonis fullstack application

This is the fullstack boilerplate for AdonisJs, it comes pre-configured with.

1. Bodyparser
2. Session
3. Authentication
4. Web security middleware
5. CORS
6. Edge template engine
7. Lucid ORM
8. Migrations and seeds

## Setup

Use the adonis command to install the blueprint

```bash
adonis new yardstick
```

or manually clone the repo and then run `npm install`.

## Lucid ORM more function

1. getTable show table name
    ```js
    User.getTable() /* tb_user */
    ```
2. getPrimary show Primary name
    ```js
    User.getPrimary() /* id */
    ```
3. getConnent show is getConnent
    ```js
    User.getConnent() /* mysql */
    ```
4. nextId show next id auto_increment
    ```js
    User.nextId()
    ```
5. columnList show column list
    ```js
    User.columnList() /* full */
    User.columnList('key') /* column name */
    ```

## Helpers more function
1. encrypt encryption format laravel
    ```js
    Helpers.encrypt('1234') 
    ```
2. decrypt decryption format laravel
    ```js
    Helpers.decrypt('1234') 
    ```
3. empty check value
    ```js
    Helpers.empty(null) /* false */
    ```
4. range number
    ```js
    Helpers.range(0,10) /* [0,1,2,3,..,10] */
    Helpers.range(0,10,2) /* [0,2,4,..,10] */
    ```
5. strLimit Limit by string
    ```js
    Helpers.strLimit('This string is really really long.', 7) /* This st... */
    Helpers.strLimit('This string is really really long.', 7, '&raquo') /* This st» */
    ```
6. callBack data function
    ```js
    Helpers.callBack('App/Controllers/Http/UserController'/* path file */,'show'/* function */,[{request, response}]/* paramiter */)
    ```
7. convertDate convert format datetime
    ```js
    Helpers.convertDate('Thursday, February 6th, 2014 9:20pm','YYYY-M-D h:mm:ss')
    /* 2014-2-6 9:20:00 */
    Helpers.convertDate('Thursday, February 6th, 2014 9:20pm','YYYY-MM-DD h:mm:ss')
    /* 2014-02-06 9:20:00 */
    ```