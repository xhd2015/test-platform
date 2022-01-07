import axios from "axios"

class BaseAPI {
    constructor(baseURL) {
        this.axios = axios.create({
            baseURL: baseURL,
            validateStatus: (status) => true, // any code is ok
        })
        // show error as Message
        this.axios.interceptors.response.use(function (resp) {
            return resp
        }, function (err) {
            console.log("response error:", err)
        });
    }
    async get(api, params) {
        const resp = await this.axios.get(api, {
            params,
        })
        this._validateResponse(api, resp)
        return resp.data
    }
    async postJSON(api, data) {
        const resp = await this.axios.post(api, data)
        this._validateResponse(api, resp)
        return resp.data
    }
    // abort normal exectuion if error
    _validateResponse(api, resp) {
        if (!resp) {
            // if(this.errHnadler){
            //     this.errHnadler(`empty response `)
            // }
            throw new Error(`empty response: ${api}, is the server open?`)
        }
        if (resp.status >= 400) {
            // if (this.errHnadler) {
            //     this.errHnadler(resp.data)
            // }
            // let the console log it
            throw new Error(`http error: ${api} => ${resp.status} ${resp.data}`)
        }
    }
}

// TODO: use generated
class Api extends BaseAPI {
    constructor(baseURL) {
        super(baseURL)
    }
    // req: {env,region,service}
    async listEndpoints(req) {
        return await this.get("/api/endpoint/list", req)
    }
    // req:{repo,branch,path}
    async listProtoServices(req) {
        return await this.get("/api/proto/service/list", req)
    }

    // req:{ proto:{repo,branch,path},  endpoint, service, method, request }
    async requestGRPC(req) {
        return await this.postJSON("/api/grpc/request", req)
    }

    // req:{region,env,ip}
    async getPodInfo(req) {
        return await this.get("/api/pod/info", req)
    }

    async listComposerTags() {
        return await this.get("/api/composer/tag/list")
    }
    async listComposerMethods() {
        return await this.get("/api/composer/method/list")
    }
    // req:{method}
    async listComposers(req) {
        return await this.get("/api/composer/list", req)
    }
    // req:{name}
    async getComposer(req) {
        return await this.get("/api/composer", req)
    }
    // req:{name,tags}
    // returns: {user:{ 'groupA':{'a':{},'b':{}},'groupB':{}},checkout_info:{'a':{},'b':{}}}
    async getComposerParties(req) {
        return await this.postJSON("/api/composer/parties", req)
    }
    // req: {composer, parties:{"user": ""  }, groupMapping:{"user":"",..}}
    async doCompose(req) {
        return await this.postJSON("/api/compose/do", req)
    }
}

export default Api