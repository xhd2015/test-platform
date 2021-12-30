// define functions for Page object
//    all components has a name as prefix
// the following items present:
//       data_table
//       data_table_setter
//       delete_button
//       edit_button
//       delete_dialog
// Contextual data:
//       MisContext.deleteID -> id to delete
//       MisContext.editData -> data to edit
//  Useful functions:
//     MisUtils.callButton(fx, "${prefix}data_table_setter", MisUtils.parseRpcDataList(resp.Data)) // set data
//     fx.stateTree.set("${prefix}delete_dialog.visible", false)     // set visible
//     fx.actionTree.dispatch("${prefix}search_button", "onClick")   // call button
function(context,arg){
	let {rpcConfig} = context.args
	let {coder} = context.funcs
	let prefix = arg.name ? arg.name + "_"  : ""
	let dataKind = arg.dataKind
	// define search, update functions for Page
	return function(applier) { 
		return `{
    search(fx){
      ${coder.assign("param",`{
	  Kind:${dataKind},
	  Operator: fx.platform.user.name,
	  Filter:"{}",
	  Offset:0,
	  Limit:0
}`)(applier)}
      ${coder.assign("rpcOption",JSON.stringify(rpcConfig.query))(applier)}
      rpcOption.params = param
    MisUtils.rpc(fx,rpcOption).then(function(resp)){
       fx.prompt.message.error("查询成功!")
       MisUtils.callButton(fx, "${prefix}data_table_setter", MisUtils.parseRpcDataList(resp.Data))
    }).catch(function(e)){
       console.log("rpc query failed",e)
       fx.prompt.message.error("查询失败，请重试!")
    })
}

    delete(fx){
	console.log("delete executed")
	${coder.assign("id","MisContext.deleteID")(applier)}
	if (id == null || id <= 0) {
	    fx.prompt.message.error("删除ID非法")
	    return
	}
	${coder.assign("param",`{"ID":id}`)(applier)}
	${coder.assign("rpcParams",`{
		 Kind:${dataKind},
		 Operator: fx.platform.user.name,
		 Data:[JSON.stringify(param)],
}`)(applier)}
	${coder.assign("rpcOption",JSON.stringify(rpcConfig.delete))(applier)}
	rpcOption.params = rpcParams
	MisUtils.rpc(fx, rpcOption).then(function (resp) {
	    console.log("rpc success", resp)
	    fx.prompt.message.info("删除成功!")

	    fx.stateTree.set("${prefix}delete_dialog.visible", false)
	    // reload
	    fx.actionTree.dispatch("${prefix}search_button", "onClick")
	}).catch(function (e) {
	    console.log("rpc delete failed", e)
	    fx.prompt.message.error("删除失败，请重试！")
	})
    }
  }
`
	}
}
