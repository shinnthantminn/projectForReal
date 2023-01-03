import axios from "axios";
import axiosRetry from 'axios-retry';

import CommonConstants from '../modules/constants.common.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Navigation } from 'react-native-navigation';

const instance = axios.create({
    baseURL: CommonConstants.api_endpoint
});

// to retry up to 5 times if there is timeout, 5x5 = over 25 seconds with delay
// https://developers.google.com/analytics/devguides/reporting/core/v3/errors#backoff
axiosRetry(instance, { 
    retries: 5,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: function(e) {
        // 504 gateway timeout only
        return e && e.response && e.response.status == 504
    }
});

instance.interceptors.request.use(function (config) {
    getloggedinUser = async () => {
        try {
            let LOGGEDIN_USER = await AsyncStorage.getItem(CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER);
            
            if (LOGGEDIN_USER) {
                LOGGEDIN_USER = JSON.parse(LOGGEDIN_USER);
                config.headers.authorization = 'Bearer ' + LOGGEDIN_USER.api_token;
            }
        } catch (error) {
            
        }
        
        return Promise.resolve(config);
    };

    return getloggedinUser();

}, function (error) {
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if(error && error.response && error.response.status == 403) {
        removeloggedinUser = async () => {
            try {
                await AsyncStorage.removeItem(CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER);
            } catch (error) {
                
            }
        };

        removeloggedinUser();
    }
    return Promise.reject(error);
});

export default instance;