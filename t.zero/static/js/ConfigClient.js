
class ConfigClient {

    constructor(){

    }

    /**
     * list all configs available for current user, including
     *    configs belongs to current user
     *    configs shared to this users role
     */
    listConfig(){

    }

    getConfig(key){

    }

    /**
     *
     * @param key
     * @param val
     * @return
     */
    updateConfig(key,val){

    }

    /**
     * remove the config if there is such one, or nothing
     * @param key
     */
    removeConfig(key){

    }

    /**
     * get all roles assigned to current user
     */
    roles(){

    }


}

var CFG_CLIENT = new ConfigClient()
