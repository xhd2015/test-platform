

class WebSQLClient {

    constructor(name){
        this.db = openDatabase(name,"1.0","Database of " + name,2*1024*1024)
    }

    /**
     * execute a CREATE, INSERT,UPDATE, DELETE, DROP etc, i.e. update operations,returns rows affected
     * @param sql
     * @param callback either the success(affectedRows) or {  success(affectedRows), fail(sqlError)}
     */
    execute(sql,arg,callback){
        let {success,fail } = WebSQLClient.getCallBack(callback)
        this.db.transaction(function (tx) {
            tx.executeSql(sql,arg,function(tx,resultSet){
                if(success){
                    success(resultSet.rowsAffected)
                }
            }, function(tx,sqlError){
                if(fail){
                    fail(sqlError)
                }
            })
        })
    }

    executeMany(sql,args) {
        let {success,fail } = WebSQLClient.getCallBack(callback)

        if(args.length === 0){
            if(success){
                success(0)
            }
            return
        }
        this.db.transaction(function (tx) {
            let left = args.length
            let count = 0
            let failed = false
            for(let arg of args){
                tx.executeSql(sql,arg,function(tx,resultSet){
                    if(failed){
                        return
                    }
                    count += resultSet.rowsAffected
                    left--
                    if(left===0){
                        if(success){
                           success(count)
                        }
                    }
                }, function (tx, sqlError) {
                    failed = true
                    left--
                    if(fail){
                        fail(sqlError)
                    }
                })
            }
        })
    }

    /**
     * query sql
     * @param sql
     * @param arg
     * @param callback
     */
    query(sql,arg,callback){
        let {success,fail } = WebSQLClient.getCallBack(callback)
        this.db.readTransaction(function (tx) {
            tx.executeSql(sql,arg,function(tx,resultSet){
                if(success){
                    let res = []
                    for(let i = 0;i<resultSet.rows.length;i++){
                        res.push(resultSet.rows.item(i))
                    }
                    success(res)
                }
            },function (tx, sqlError) {
                if(fail){
                    fail(sqlError)
                }
            })
        })
    }

    static getCallBack(callback){
        if(callback){
            if(callback.constructor === Function){
                return {
                    success:callback
                }
            }else{
                return callback
            }
        }else{
            return {}
        }
    }


}

