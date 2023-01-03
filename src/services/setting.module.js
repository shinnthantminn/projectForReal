import api from "./index.js"
import CommonConstants from '../modules/constants.common.js'

let instance = null

class SettingModule {
    constructor() {
        if(!instance){
            instance = api;
        }
    }

    getTnc() {
        let url = '/setting-module/cloud/'+ CommonConstants.api_key + '/tnc'
        console.log(url)
        return instance.get(url)
    }

    getFaq() {
        let url = '/setting-module/cloud/'+ CommonConstants.api_key + '/faq'
        console.log(url)
        return instance.get(url)
    }
}

export default SettingModule;