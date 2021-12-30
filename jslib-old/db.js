let mysql = require('mysql');
let util = require('util');

/*
# escapeID
var sorter = 'date';
var sql    = 'SELECT * FROM posts ORDER BY ' + connection.escapeId('posts.' + sorter);
// -> SELECT * FROM posts ORDER BY `posts`.`date`

# use ??
var userId = 1;
var columns = ['username', 'email'];
var query = connection.query('SELECT ?? FROM ?? WHERE id = ?', [columns, 'users', userId], function (error, results, fields) {
  if (error) throw error;
  // ...
});

console.log(query.sql); // SELECT `username`, `email` FROM `users` WHERE id = 1


# use Pool
pool.getConnection() -> connection.query() -> connection.release()

must release


*/
class DB {
	constructor(options) {
		this.pool = mysql.createPool({
			connectionLimit: 11,
			host: '10.227.27.107',
			port: 3306,
			user: 'user_r',
			password: 'Xpassword',
			database: 'account',
			dateStrings: true, // force returned date as string
			// var connection = mysql.createConnection({debug: ['ComQueryPacket', 'RowDataPacket']});
			debug: false,
			supportBigNumbers: true, // use string to represent BIGINT if bigNumberStrings = false and the number is big enough
			bigNumberStrings: false, // 
			...options
		});
		this.getConnection = util.promisify(this.pool.getConnection).bind(this.pool)
	}

	async newConnection() {
		let conn = await this.getConnection()
		return new Connection(conn)
	}
	// what if pipelining inside a connection?
	// auto release
	// f(conn) can return a Promise, or just a value
	withConnection(f) {
		let newConn
		return new Promise((resolve, reject) => {
			this.pool.getConnection(function (err, dbConn) {
				if (err != null) {
					reject(err)
					return
				}
				newConn = dbConn
				// the f() returns  a promise, it will be 
				// followed
				try {
					Promise.resolve(f(new Connection(dbConn))).then(resolve).catch(reject)
				} catch (e) {
					reject(e)
				}
			})
		}).finally(() => {
				if (newConn) {
					newConn.release()
				}
			})
	}

	newTransaction(fn) {
		return new Promise((resolve, reject) => {
			this.newConnection().then(conn => {
				let dbConn = conn.getConnection()
				dbConn.beginTransaction(function (err) {
					if (err) {
						dbConn.release()
						return reject(err)
					}
					let fnErr
					let result
					try{
						result = fn.call(conn, conn)
					}catch(e){
						fnErr = e
					}
					// fast error
					if(fnErr){
						dbConn.reject()
					    return reject(fnErr)
					}
					// Promise.resolve always returns a Promise
					// while resolve always return a value
					Promise.resolve(result).then(result => {
						dbConn.commit(function (err) {
							if (err) {
								return reject(err)
							}
							resolve(result)
						})
					}).catch(e => {
						dbConn.rollback(() => { throw e })
					}).finally(() => {
						dbConn.release()
					})
				})
			}).catch(reject)
		})
	}

	// shortcut methods
	// async
	async query(sql, args) {
		return await this.withConnection(conn => conn.query(sql, args))
	}
	async queryOne(sql, args) {
		return await this.withConnection(conn => conn.queryOne(sql, args))
	}
	async count(sql, args) {
		return await this.withConnection(conn => conn.count(sql, args))
	}
	async execute(sql, args) {
		return await this.withConnection(conn => conn.execute(sql, args))
	}
}

class Connection {
	constructor(conn) {
		this.conn = conn
	}

	getConnection() {
		return this.conn
	}

	async query(sql, args) {
		// console.log("queryConn:sql,args = ",sql,args)
		let query = util.promisify(this.conn.query).bind(this.conn)
		return await query(sql, args)
	}

	async queryOne(sql, args) {
		let resultSet = await this.query(sql, args)
		if (resultSet.length == 0) {
			return null
		}
		return resultSet[0]
	}

	async count(sql, args) {
		let resultSet = await this.query(sql, args)
		if (resultSet.length === 0) {
			throw new Error("invalid sql to count, result empty:" + sql)
		}
		if (resultSet.length !== 1) {
			throw new Error("invalid sql to count, result more 1 row:" + sql)
		}
		if (Object.keys(resultSet[0]) != 1) {
			throw new Error("invalid result,expects one column:" + sql)
		}
		for (let k in resultSet[0]) {
			return resultSet[0][k]
		}
	}

	async execute(sql, args) {
		return await this.query(sql, args)
	}
}

module.exports = {
	DB,
	Connection,
}