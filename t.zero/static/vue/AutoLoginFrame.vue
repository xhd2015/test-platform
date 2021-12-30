<template>
    <div v-show="show" class="login-frame">
        <div class="flex-h login-frame-box">
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
                        <!--<input name="password" v-model="password">-->
                    </div>

                    <button @click="login">Login</button>
                    <span v-if="error" :class="{error:error}">{{error}}</span>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    // events: login-success, login-fail
    module.exports = {
        name: "AutoLoginFrame",
        props: {},
        data() {
            return {
                show: false,
                uriTemplate: null,
                userName: null,
                password: null,
                error: "",
                loginApi: '/user/login'
            }
        },

        methods: {
            /* unused */
            wrapHandleFail(targetHandler) {
                let _this = this
                return function (code, resp) {
                    if (code === 401) {
                        _this.show = true
                    } else {
                        targetHandler(code, resp)
                    }
                }
            },
            handleFail(code, resp, targetHandler) {
                if (code === 401) {
                    this.show = true
                } else {
                    targetHandler(code, resp)
                }
            },
            login() {
                let _this = this
                this.error = ""
                if (!this.userName) {
                    this.error = "Requires user name"
                    return
                }
                if (!this.password) {
                    this.error = "Requires password"
                    return
                }

                let param = {userName: this.userName, password: this.password}
                param.password = encMe(param.password, 'cbe92676735640ac9e26dbf6386acec1')


                RequestUtils.request({
                        uri: RequestUtils.makeUrl(this.loginApi, param),
                        async: false
                    },
                    {
                        success(resp) {
                            _this.show = false
                            _this.$emit('login-success')
                        },
                        fail(code, resp) {
                            _this.error = resp
                            _this.$emit('login-fail', code, resp)
                        }
                    }
                )
            },
            close() {
                this.show = false
            }
        }
    }
</script>

<style scoped>
    .login-frame {
        position: absolute;
        border: 0;
        width: 100%;
        height: 100%;
        justify-content: center;
        background-color: #55667730;
        z-index: 100;
    }

    .login-frame-box {
        justify-content: center;
        border: 0;
        margin-top: 100px
    }

    .error {
        color: red;
    }
</style>
