import api from "./index.js"
import CommonConstants from '../modules/constants.common.js'

let instance = null

class AnalyticsModule {
    constructor() {
        if(!instance){
            instance = api;
        }
    }

    jaOpenApp(params) {
        let url = '/analytics-module/cloud/'+ CommonConstants.api_key +'/app-statistics/ja/app-open'
        return instance.post(url, params)
    }

    jaDeviceInfo(params) {
        let url = '/analytics-module/cloud/'+ CommonConstants.api_key +'/app-statistics/ja/app-device-info'
        console.log(url)
        console.log(params)
        return instance.post(url, params)
    }
}

export default AnalyticsModule;