const fs = require("fs")
const path = require("path")
const shell = require("./shell")

class GitRepo {
	constructor(root, repo,limit = 10){
		if(!fs.existsSync(root)){
			throw new Error("root does not exist:" + root)
		}
		this.root = root
		this.repo = repo
		this.limit = limit
	}
	// callback:  function(err,dir,branch){ .... }
	// called  when the branch is prepared
	withinBranch(branch, callback){
		if(!branch){
			branch="master"
		}
		// every $dir under root has a $dir.lock file
		// every dir has a repo_ as prefix
		let files = shell.ls(this.root)
		let fileSet = new Set(files)
		let repoCount = 0
		let freeRepo
		for(let file of files){
			if(file.startsWith("repo_") && !file.endsWith(".lock")){
				repoCount++
				if(!fileSet.has(file+".lock")){
					freeRepo = file
					break
				}
			}
		}
		let dir = freeRepo && path.join(this.root, freeRepo)
		let newRepo = false
		if(!freeRepo){
			if(this.limit>0 && repoCount > this.limit){
				callback(new Error("repository busy"))
				return
			}
			// generate random directory
			while(true){
				let rand = (Math.random()*1000000).toFixed()
				dir = path.join(this.root,"repo_" + rand)
				if(!shell.exists(dir)){
					break
				}
			}
			shell.mkdir_p(dir)
			newRepo = true
		}
		let dirLock = dir +".lock"
		shell.touch(dirLock)
		try{
			let e = shell.escape
			let cmd
			if(newRepo){
				cmd = shell.exec(`git clone --branch ${e(branch)} ${e(this.repo)} ${e(dir)}`)
			}else{
			    cmd = shell.exec(`cd ${e(dir)} && git-force-follow-upstream ${e(branch)}`)
			}
			if(cmd.errcode){
				callback(cmd) // cmd is error
				return
			}
			callback(undefined, dir, branch)
		}finally{
			shell.rm_rf(dirLock)
		}
	}
}

module.exports = {
	GitRepo,
}
