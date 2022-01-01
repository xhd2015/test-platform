import Api from "../api"
import message from "./messge"
import { API_BASE_URL } from "../config/stub"

const api = new Api(API_BASE_URL, (errMsg) => {
    message.showError(errMsg)
})

export default api
