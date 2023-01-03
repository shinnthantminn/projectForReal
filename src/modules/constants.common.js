export default {
    version: '2.0.2',
    version_number: 202,
    app_name: 'Pann Thee Education',
    app_name_short: 'Pann Thee',

    app_store_url: 'itms-apps://apps.apple.com/tr/app/pann-thee/id1558406058?l=tr',
    app_store_web_url: 'https://apps.apple.com/us/app/pann-thee/id1558406058',

    play_store_url: 'market://details?id=com.panntheefoundation',
    play_store_web_url: 'https://play.google.com/store/apps/details?id=com.panntheefoundation',

    apk_download_web_url: 'https://pannthee-cdn.hawkinventory.com/1/apk-download/com.panntheefoundation-2.0.0.apk',
    // staging
    // weblink: 'https://panntheefoundation.org/shop/view-post/',
    // live
    weblink: 'https://panntheefoundation.org/shop/view-post/',
    
    // staging
    // api_key: "ed966ede2a56a34d22ce52b35b4a9fa7",
    // live
    api_key: "ed966ede2a56a34d22ce52b35b4a9fa7",
    // staging
    // api_endpoint: "http://157.230.192.167/api/v1",
    // live
    api_endpoint: "https://cloud-api.panntheefoundation.org/api/v1",
    // staging
    // storage_endpoint: "http://157.230.192.167:9000/pannthee-staging/1",
    // live
    storage_endpoint: "https://pannthee-cdn.hawkinventory.com/1",
    // staging
    // streaming_endpoint: "https://streaming1.hawkinventory.com/pannthee/1",
    // live
    streaming_endpoint: "https://streaming1.hawkinventory.com/pannthee/1",
    // staging
    // upload_endpoint: "http://157.230.192.167/api/v1",
    // live
    upload_endpoint: "https://streaming1.hawkinventory.com/uploads-pannthee/api/v1",
    
    PERSISTENT_STORAGE_KEY: {
        LOGGEDIN_USER: 'com_panntheefoundation.loggedin_user',
        STORAGE_ENDPOINT: 'com_panntheefoundation.storage_endpoint',
        LANGUAGE: 'com_panntheefoundation.language',
        IS_INTRO_FINISHED: 'com_panntheefoundation.is_intro_finished',
        SEARCH_RECENT_KEYWORDS: 'com_panntheefoundation.search_keywords',
        RECENT_TUTORIALS: 'com_panntheefoundation.recent_tutorials',
        TRACKED_ONCE: 'com_panntheefoundation.tracked_once'
    },

    TECHNICAL_SUPPORT_FB_MESSENGER_ID: 699177337178768,
    ENABLE_OTP_VERIFICATION: false,
    HAWK_SCHEME: 'pannthee'
};
