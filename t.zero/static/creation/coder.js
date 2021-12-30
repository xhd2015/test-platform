(function(){
   class Applier {
      constructor(old){
         this.old = old
         this.varPrefix = old ? "var":"let"
      }
      applyAll(stmts){
          let appliedStmts = []
          for(let stmt of stmts){
              let v = stmt
              if(v.constructor === Function){ v = v(applier) }
              appliedStmts.push(v)
          }
          return appliedStmts
      }
   }
   // define stmts that can be applied
   // prototype is declared
   class Coder{
      defineFunc(name,args,needFunction,stmts){
          return function(applier) {
                  let appliedStmts = applier.applyAll(stms)
                  return `${noFunction?"":"function "}${name?" "+name:""}(${args}){
${appliedStmts.join("\n")}
}` 
                 }
      }
      
      assign(id,val){
         return function(applier) {  
             if(val.constructor === Function){ val = val(applier) }
             return `${applier.varPrefix?applier.varPrefix+" ":""}${id} = ${val}`
         }
      }
      exportVal(id,val){
          return function(applier) {
              if(val.constructor === Function){ val = val(applier) }
              if(applier.old){
                  return `var ${id} = ${val}
exports.${id} = ${id}`
              }else{
                  return `export const ${id} = ${val}`
              }
         }
      }
      defineObject(stmts){
         return function(applier){
             return "{\n" + applier.applyAll(stmts).join("\n\n") + "}"
         }
      }
   }
   // add js,es as applier
   return Object.assign(new Coder(), {
     js: new Applier(true),
     es: new Applier(false)
   })
})()
