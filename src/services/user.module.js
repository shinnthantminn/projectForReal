import api from "./index.js"
import CommonConstants from '../modules/constants.common.js'

let instance = null

class UserModule {
    constructor() {
        if(!instance){
            instance = api;
        }
    }

    getProfile({ userId: userId }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/' + userId
        return instance.get(url)
    }

    uploadProfilePhoto({ folder_name: folder_name, file_name: file_name, file_type: file_type, file: file, size: size }) {
        let url = CommonConstants.upload_endpoint + '/common-library-module/cloud/'+ CommonConstants.api_key +'/upload'
        return instance.post(url, {
            folder_name: folder_name, 
            original_filename: file_name, 
            mimetype: file_type, 
            file: file,
            size: size
        })
    }

    updateProfile({ userId: userId, form: form }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/' + userId
        return instance.post(url, form)
    }

    register({ phone: phone, first_name: first_name, last_name: last_name, registration_source: registration_source,
        is_verified: is_verified,
        firebase_otp_ref_uid: firebase_otp_ref_uid, facebook_id: facebook_id, facebook_auth_response: facebook_auth_response, email: email,
        apple_id: apple_id, apple_auth_response: apple_auth_response, google_id: google_id, google_auth_response: google_auth_response, language: language }) {
        
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/register'
        return instance.post(url, {
            phone: phone,
            first_name: first_name,
            last_name: last_name,
            language: language,
            registration_source: registration_source,
            is_verified: is_verified,
            firebase_otp_ref_uid: firebase_otp_ref_uid,
            facebook_id: facebook_id,
            facebook_auth_response: facebook_auth_response,
            email: email,
            apple_id: apple_id,
            apple_auth_response: apple_auth_response,
            google_id: google_id,
            google_auth_response: google_auth_response
        })
    }

    login({ phone: phone, password: password }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/login'
        return instance.post(url, {
            phone: phone,
            password: password
        })
    }

    loginWithOtp({ phone: phone, otp: otp }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/login-with-otp'
        return instance.post(url, {
            phone: phone,
            otp: otp
        })
    }

    resetOnlineUserPasswordByFirebaseOtp(params) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/reset-online-user-password-by-firebase-otp'
        return instance.post(url, params)
    }

    resetOnlineUserPasswordByMobileNumber(params) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/reset-online-user-password-by-mobile-number'
        return instance.post(url, params)
    }

    changePassword(id, params) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/' + id + '/change-password'
        return instance.post(url, params)
    }

    verifyOtpAndActivateOnlineUser({ phone: phone, otp: otp }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/verify-otp-and-activate-user'
        return instance.post(url, {
            mobile_number: phone,
            otp: otp
        })
    }

    resentOtpBySms({ phone: phone }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/resend-otp-by-sms'
        return instance.post(url, {
            mobile_number: phone
        })
    }

    generateOtpBySms({ phone: phone }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/generate-otp-by-sms'
        return instance.post(url, {
            mobile_number: phone
        })
    }

    resetOnlineUserPasswordByMobileNumberAndOtp({ phone: phone, otp: otp, password: password, password_confirmation: password_confirmation }) {
        let url = '/user-module/cloud/'+ CommonConstants.api_key +'/online-user/reset-online-user-password-by-mobile-number-and-otp'
        return instance.post(url, {
            mobile_number: phone,
            otp: otp,
            password: password,
            password_confirmation: password_confirmation
        })
    }
}

export default UserModule