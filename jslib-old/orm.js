const { snakeCase } = require("voca")

// options: useSnakeCase(default:true)
class ORM {
    constructor(db, options) {
        this.db = db
        let { useSnakeCase = true } = options || {}
        this.options = { useSnakeCase }
        this.table = undefined
    }

    withDB(db) {
        let orm = new ORM(db, this.options)
        return orm
    }
    withTable(table) {
        let orm = new ORM(this.db, this.options)
        orm.table = table
        return orm
    }

    normalizeModel(model) {
        if (model === undefined) {
            return undefined
        }
        let checkedModel = {}
        for (let key in model) {
            let checkedValue = model[key]
            if (checkedValue === undefined) {
                continue // skip undefined
            }
            // skip function properties
            if (checkedValue instanceof Function) {
                continue
            }
            let checkedKey = this.options.useSnakeCase ? snakeCase(key) : key
            checkedModel[checkedKey] = this.truncateDate(checkedValue)
        }
        return checkedModel
    }
    truncateDate(date) {
        if (date instanceof Date) {
            date.setMilliseconds(0)
        }
        return date
    }
    // return {condition, args}
    modelToConditions(model) {
        let conditions = []
        let args = []
        for (let key in model) {
            conditions.push(this.quoteName(key) + " = ?")
            args.push(model[key])
        }
        return { conditions, args }
    }
    quoteName(name) {
        let split = name.split(".")
        if (split && split.length == 2) {
            return "`" + split[0] + "`.`" + split[1] + "`"
        } else {
            return "`" + name + "`"
        }
    }

    // Date's milliseconds are auto truncated 
    async insert(model) {
        if (!this.db) {
            throw new Error("no db specified")
        }
        if (!this.table) {
            throw new Error("no table specified")
        }
        const checkedModel = this.normalizeModel(model)
        return await this.db.execute("INSERT INTO ?? SET ?", [this.table, checkedModel])
    }

    // all existent value will be update
    // empty value not filtered
    async update(model, where,) {
        if (!this.db) {
            throw new Error("no db specified")
        }
        if (!this.table) {
            throw new Error("no table specified")
        }
        const checkedModel = this.normalizeModel(model)
        let idModel = where
        if (idModel === undefined) {
            if (checkedModel.getID) {
                idModel = checkedModel.getID()
            }
            if (idModel === undefined) {
                idModel = checkedModel.id
            }
            if (idModel !== undefined && (typeof idModel !== 'object')) {
                idModel = { id: idModel }
            }
        }
        if (idModel === undefined) {
            throw new Error("no condition specified for update")
        }
        let { conditions, args } = this.modelToConditions(idModel)
        return await this.db.execute("UPDATE ?? SET ? WHERE " + conditions.join(" AND "), [this.table, checkedModel, ...args])
    }
    // options: {orderBy:[...]}
    async find(where, options) {
        if (!this.table) {
            throw new Error("no table specified")
        }
        // TODO: has orderBy
        let {orderBy} = options || {}
        if(orderBy){
            if(orderBy instanceof Array){
                  
            }
        }
        let returnNoWhere = async () => {
            return await this.db.query("SELECT * FROM ??", [this.table])
        }
        if (where === undefined) {
            return await returnNoWhere()
        }
        // where is object
        if (!(where instanceof Array)) {
            let checkedModel = this.normalizeModel(where)
            if (checkedModel === undefined) {
                return await returnNoWhere()
            } else {
                let { conditions, args } = this.modelToConditions(checkedModel)
                return await this.db.query("SELECT * FROM ?? WHERE " + conditions.join(" AND "), [this.table, ...args])
            }
        }
        // is array
        let conditions = []
        let args = [this.table]
        for (let keyValue of where) {
            if (keyValue == null) {
                continue
            }
            if (keyValue instanceof String) {
                conditions.push(keyValue)
                continue
            }
            conditions.push(keyValue[0])
            if (keyValue.length > 1) {
                args.push(this.truncateDate(keyValue[1]))
            }
        }
        if (conditions.length === 0) {
            return await returnNoWhere()
        }
        // console.log("conditions:", conditions)
        // console.log("args:", args)
        return await this.db.query("SELECT * FROM ?? WHERE " + conditions.join(" AND "), args)
    }
    // options
    async findOne(where, options) {
        let result = await this.find(where, orderBy)
        return result[0]
    }

}

module.exports = {
    ORM
}


if (require.main === module) {
    const { DB } = require("./db")
    let orm = new ORM(new DB({ debug: false }))

    let model = orm.normalizeModel({ id: 1, userName: "haha" })
    console.log("normalized model:", model)


    async function testInsert() {
        await orm.withTable("t_user").insert({
            name: "me", password: "hash"
        })

        let specUsers = await orm.withTable("t_user").findOne({ name: "me" })
        console.log("user:", specUsers)
    }

    async function testUpdate() {
        let specUsers = await orm.withTable("t_user").findOne({ name: "me" })
        await orm.withTable("t_user").update({ password: "hash2" })
        let updateUsers = await orm.withTable("t_user").findOne({ name: "me" })
        console.log("update user:", updateUsers)
    }


    async function testFind() {
        let users = await orm.withTable("t_user").find()
        console.log("users:", users)

        let specUsers = await orm.withTable("t_user").findOne({ id: 1 })
        console.log("user:", specUsers)
    }

    // testInsert()
    testUpdate()
    // testFind()
}