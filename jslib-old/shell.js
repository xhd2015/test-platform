// provide basic shell capabilities
const fs = require("fs")
let {spawn,execSync} = require("child_process")

// escape string
function esc(s){
	let idx = s.indexOf("'")
	if(idx!=-1){
		s = s.replace("'", "'\\''") // escape the ' with \'
	}
	return "'" + s + "'"
}

// originally, escape is function for urlencode
// used to escape arguments
function escape(commands){
	if(!commands || commands.length === 0)return ""
	if(commands.constructor === String){
		return esc(commands)
	}
	let c = ""
	for(let command of commands){
		c += esc(command) + " "
	}
	return c.slice(0,c.length-1) // remove last " "
}

function writestdout(data){
	process.stdout.write(data)
}
function writestderr(data){
	process.stderr.write(data)
}
function chomp(s){
	return ( s && s.endsWith("\n"))? s.slice(0,s.length-1) : s
}
function realpath(s){
	return exec(["realpath",s])
}

// node file.js ..
// argv[0] = path to node
// argv[1] = file.js
let cmdDirResolved
function cmdDir(){
	if(cmdDirResolved){
		return cmdDirResolved
	}
	let path = realpath(process.argv[1])
	return cmdDirResolved = require("path").dirname(path)
}

// relative to execFile
function cmdRel(path){
	return require("path").join(cmdDir(),path)
}
// execute the cmd and connect them to stderr & stdout
// return the exit code
async function spawnStd(cmd,args,options){
	let c = spawn(cmd,args,options)
	c.stdout.on('data', writestdout)
	c.stderr.on('data', writestderr)
	return await new Promise(function(resolve,reject){
		c.on('error',function(e){
			reject(e)
		})
		c.on('close', function(code){
			resolve(code)
	        })
	})
}

function exec(cmd,options){
	if(cmd instanceof Array){
		cmd = escape(cmd)
	}
	// stderr is output parent's stderr
	// stdout is returned as result
	//
	try{
		let c = execSync(cmd,{encoding:'utf-8', ...options})
		return chomp(c)
	}catch(e){
		// e.code will be the exit code
		// the caller should check
		// if(e.errcode){ /* handle the case*/}
		// let message = e.message
		e.cmd = cmd
		e.message = `command failed(exit ${e.status}): ${cmd}`
		e.errcode = e.status
		return e
	}
}

function ls(dir) {
	return fs.readdirSync(dir || ".")
}
function exists(path){
	return fs.existsSync(path)
}
function cp(src,dest){
	fs.copyFileSync(src,dst)
}
// cp -rf src dst
function cp_rf(src,dest){
	// src can be array
	let cmd = exec(["cp","-rf",...(src instanceof Array?src: [src]), dest])
	if(!cmd.errcode){
		throw cmd
	}
}
function cat(f){
	// return string if encoding specified,otherwise buffer
	return fs.readFileSync(f,{encoding:"utf-8"})
}
function cat_silent(f){
	try{
		return cat(f)
	}catch(e){
		// ignore
	}
}
function cat_bin(f){
	return fs.readFileSync(f)
}
function write(f,content){
	return fs.writeFileSync(f,content)
}

function rm(f){
	if(fs.rmSync){ // node 15
		fs.rmSync(f)
	}else{
		let cmd = exec(`rm ${escape(f)}`)
		if(cmd.errcode){
			throw cmd
		}
	}
}
function rm_rf(f){
	if(fs.rmSync){ // node 15
		fs.rmSync(f,{force:true,recursive:true})
	}else{
		let cmd = exec(`rm -rf ${escape(f)}`)
		if(cmd.errcode){
			throw cmd
		}
	}
}

function isFile(f){
	let fileStat = stat(f)
	return fileStat && fileStat.isFile()
}
function isDir(d){
	let dirStat = stat(d)
	return dirStat && dirStat.isDirectory()
}
function mkdir_p(path){
	fs.mkdirSync(path, {recursive:true})
}
// stat a path, if not exist, return null
function stat(path){
	try{
		return fs.statSync(path)
	}catch(e){
		return null
	}
}

function touch(file){
	fs.writeFileSync(file,"")
}
function removeSuffix(name,suffix){
	if(name && name.endsWith(suffix)){
		return name.slice(0, name.length - suffix.length)
	}
	return name
}
module.exports = {
	escape,
	chomp,
	spawnStd,
	exec,
	realpath,
	cmdDir,
	cmdRel,
	ls,
	exists,
	cp,
	cp_rf,
	cat,
	cat_silent,
	cat_bin,
	write,
	rm,
	rm_rf,
	isFile,
	isDir,
	mkdir_p,
	stat,
	touch,
	removeSuffix,
}
