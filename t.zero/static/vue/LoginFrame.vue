<template>
    <div>
        <div class="flex-h" style="justify-content: center;border: 0;margin-top: 100px">
            <div class="flex-v" style="border: 1px solid;width: 400px;height: fit-content">
                <div class="header-bar flex-h" style="justify-content: flex-end;background-color: #555555 ">
                    <button class="close-button" style="width: 20px" @click="close">X</button>
                </div>
                <div class="flex-v"
                     style="justify-content: center; align-items: center; border: 1px solid #555555;border-top:0;background-color: white">
                    <div>
                        <label>User Name:</label>
                        <input name="userName" v-model="userName">
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="password" name="password" v-model="password">
                    </div>
                    <button @click="login">Login</button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    module.exports =  {
        name: "LoginFrame",
        props:["initUserName", "initPassword"],
        data(){
          return {
              userName: this.initUserName,
              password: this.initPassword
          }
        },

        methods:{
            login() {
                this.$emit('login', {
                    userName: this.userName,
                    password: this.password
                })
            },
            close(){
                this.$emit('close')
            }
        }
    }
</script>

<style scoped>
</style>
