<template>
    <div>
        <login-frame
                     style="position: absolute;border: 0;width: 100%;height:100%;justify-content: center;"
                     class="flex-h" @close="onUserCancelLogin" @login="onUserLogin">
        </login-frame>
    </div>
</template>

<script>
    module.exports =  {
        components: {
            'login-frame': httpVueLoader('./LoginFrame.vue')
        },
        name: "LoginPage",
        data(){
          return {
              loginApi:'/user/login',
              query :DocumentUtils.getCurrentUrlQuery()
          }
        },

        methods:{
            onUserCancelLogin(){
                // do nothing
            },
            onUserLogin(userId){
                if(!userId.userName){
                    alert("Requires userName")
                    return
                }
                if(!userId.password){
                    alert("Requires password")
                    return
                }
                let _this = this
                userId.password = encMe(userId.password, 'cbe92676735640ac9e26dbf6386acec1')
                RequestUtils.request({
                        uri: RequestUtils.makeUrl(this.loginApi, userId),
                        async: false
                    },
                    {
                        success(resp){
                            let close = _this.query.close
                            if(close == null || close === "" || close!=="false"){
                                window.close()
                            }else{
                                // direct to index.html
                                window.location ="index.html"
                            }
                        },
                        fail(code,resp){
                            alert("Login failed, server says:" + resp + ", please try again.")
                        }
                    }
                )
            }
        }
    }
</script>

<style scoped>
</style>
