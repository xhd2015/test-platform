class AdUtils {


    static makeRequestId(suffix){
        return "" + new Date().getTime() + "_" + (suffix || "TEST")
    }

}
