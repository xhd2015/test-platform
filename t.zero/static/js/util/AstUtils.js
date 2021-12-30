class AstUtils{
	static traverseAst(ast,f){
		if(ast==null)return
		let nodeType = Object.getPrototypeOf(ast).constructor

		function _traverseAst(ast){
			f(ast)
			for(let key in ast){
				let e = ast[key]
				if(e==null){
					continue
				}
				if(e instanceof Array){
					if(e.length === 0 || Object.getPrototypeOf(e[0]).constructor !== nodeType){
						continue
					}
					for(let i of e){
						_traverseAst(i)
					}
				}else if(Object.getPrototypeOf(e).constructor === nodeType){
					_traverseAst(e)
				}
			}
		}

		_traverseAst(ast)
	}

	static isNumericInt(s){
		if(!s)return false
		if(s[0]==='0')return false
		for(let c of s){
			if(c<'0' || c >'9'){
				return false
			}
		}
		return true
	}

	static trasferLargeNumber(code){
		let {ast} = Babel.transform(code,{ast:true})
		AstUtils.traverseAst(ast,function(e){
			if(e.type === 'NumericLiteral'){
				let raw = e.extra.raw
				if(raw && raw.length > 15){
					if(AstUtils.isNumericInt(raw)){
						e.extra.raw  += 'n'
					}
				}
			}
		})
		let res = Babel.transformFromAst(ast,null,{})
		return res.code
	}
}

