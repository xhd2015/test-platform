<template>
    <div>
        <div style="display: flex">
            <label>Thrift:</label>
            <input>
        </div>
        <button @click="test">Test</button>
        <!--        <p>-->
        <!--            gintool -s -c ..... something else that is affected by this tool-->
        <!--        </p>-->
        <!--        <div style="display: flex">-->
        <!--            <label style="align-self: center">Object:</label>-->
        <!--            <textarea @input="DocumentUtils.updateTextareaHeight($event.target)" v-model="text"-->
        <!--                      placeholder="http://... or the parameter" style="width: 100%;overflow: hidden"></textarea>-->
        <!--        </div>-->
        <!--        <div style="display: flex;margin-top: 10px">-->
        <!--            <button style="margin-right: 20px" @click="decode">Decode</button>-->
        <!--            <button style="margin-right: 20px" @click="encode">Encode</button>-->
        <!--            <button style="margin-right: 20px" @click="encodeJSON">Encode JSON to URL Param</button>-->
        <!--        </div>-->

        <!--        <hr/>-->
        <!--        <div>-->
        <!--            <div v-if="result">{{result}}</div>-->
        <!--            <div v-else-if="urlResult">-->
        <!--                <p v-for="param of urlResult">-->
        <!--                    {{param.key}}: {{param.value}}-->
        <!--                </p>-->
        <!--            </div>-->
        <!--        </div>-->
    </div>


</template>

<script>

    module.exports = {
        name: "ThriftTool",
        components: {},
        props: [],
        data() {
            return {}
        },

        methods: {
            test() {
                // let transport = new Thrift.Transport("/thrift/service/tutorial/");
                // let transport = new Thrift.Transport("http://x.d:8888",{useCORS:true});
                let transport = new Thrift.TWebSocketTransport("http://x.d:8888")
                let protocol = new Thrift.TBinaryProtocol(transport, false, false);
                let client = new projectGameInfoServiceClient(protocol,protocol);


                let resp = client.MGetPlaySwitch(ThriftWrapper.wrapReq("MGetPlaySwitchReq", new MGetPlaySwitchReq({
                    LiveID: 1,
                    ReqItems: [new PlaySwitchItem({
                        AnchorID: 123,
                        PlaySwitch: 2
                    })],
                    Base: new Base({})
                })))
                console.log(resp)
            }
        }
    }
</script>

<style scoped>
</style>
