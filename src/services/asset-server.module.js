import api from "./index.js"
import CommonConstants from '../modules/constants.common.js'

let instance = null

class AssetServerModule {
    constructor() {
        if(!instance){
            instance = api;
        }
    }

    getOrganizationInfo() {
        let url = '/user-module/cloud/organization/check-organization/'+ CommonConstants.api_key
        return instance.get(url)
    }

    getActiveHawkAssetServer() {
        let url = '/user-module/cloud/organization/organization-asset-server/'+ CommonConstants.api_key
        return instance.get(url)
    }

    selectActiveHawkAssetServer() {
        let url = '/user-module/cloud/organization/organization-asset-server/'+ CommonConstants.api_key
        instance.get(url).then((response) => {
            if(response && response.data && response.data.data && response.data.data.asset_server_endpoint) {
                CommonConstants.storage_endpoint = response.data.data.asset_server_endpoint + '/' + response.data.data.organization_id
            }
        })
    }
}

export default AssetServerModule;