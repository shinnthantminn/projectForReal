    import api from "./index.js"
import CommonConstants from '../modules/constants.common.js'

let instance = null

class DigiedModule {
    constructor() {
        if(!instance){
            instance = api;
        }
    }

    getCourseCategory({ page: page, include_home_banner_setting: include_home_banner_setting }) {
        if(!page) {
            page = 1
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/course-category?status=1&page=' + page

        if(include_home_banner_setting) {
            url += '&include_home_banner_setting=' + include_home_banner_setting
        }
        console.log(url)
        return instance.get(url)
    }

    getCourseAndSubjectByCourseCategory({ page: page, per_page: per_page, course_category_id: course_category_id }) {
        if(!page) {
            page = 1
        }

        if(!course_category_id) {
            course_category_id = ''
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/course?status=1&page=' + page + '&per_page=' + per_page + '&course_category_id=' + course_category_id
        console.log(url)
        return instance.get(url)
    }

    getSubjectsByCourse({ page: page, per_page: per_page, course_id: course_id }) {
        if(!page) {
            page = 1
        }

        if(!course_id) {
            course_id = ''
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/subject?status=1&page=' + page + '&per_page=' + per_page + '&course_id=' + course_id
        console.log(url)
        return instance.get(url)
    }

    getChaptersBySubjectId({page: page, subject_id: subject_id}) {
        if(!page) {
            page = 1
        }

        if(!subject_id) {
            subject_id = ''
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/chapter?status=1&page=' + page + '&subject_id=' + subject_id
        console.log(url)
        return instance.get(url)
    }

    getTutorialsByChapterId({page: page, chapter_id: chapter_id}) {
        if(!page) {
            page = 1
        }

        if(!chapter_id) {
            chapter_id = ''
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/tutorial?status=1&page=' + page + '&chapter_id=' + chapter_id
        console.log(url)
        return instance.get(url)
    }

    getTutorialsByIds({page: page, ids: ids}) {
        if(!page) {
            page = 1
        }

        if(!ids) {
            ids = ''
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/tutorial?status=1&page=' + page + '&ids=' + ids
        console.log(url)
        return instance.get(url)
    }

    favouriteTutorial({ tutorial_id: tutorial_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/tutorial/' + tutorial_id + '/favourite'
        console.log(url)
        return instance.post(url)
    }

    unfavouriteTutorial({ tutorial_id: tutorial_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/tutorial/' + tutorial_id + '/unfavourite'
        console.log(url)
        return instance.post(url)
    }

    updateViewCount({ tutorial_id: tutorial_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/tutorial/' + tutorial_id + '/update-view-count'
        console.log(url)
        return instance.post(url)
    }

    getFavouritedTutorials({page: page, per_page: per_page}) {
        if(!page) {
            page = 1
        }

        if(!per_page) {
            per_page = 10
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/tutorial/get-favourited-list?page=' + page + '&per_page=' + per_page
        console.log(url)
        return instance.get(url)
    }

    search({search_type: search_type, keywords: keywords, page: page, per_page: per_page}) {
        if(!page) {
            page = 1
        }

        if(!per_page) {
            per_page = 10
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/tutorial/search?search_type='+ search_type +'&keywords='+ keywords +'&page=' + page + '&per_page=' + per_page
        console.log(url)
        return instance.get(url)
    }

    getNotifications({page: page, per_page: per_page, ids: ids}) {
        if(!page) {
            page = 1
        }

        if(!per_page) {
            per_page = 10
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/notification?page=' + page + '&per_page=' + per_page

        if(ids) {
            url += '&ids=' + ids
        }
        console.log(url)
        return instance.get(url)
    }

    markNotificationAsRead({ notification_id: notification_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/notification/' + notification_id + '/mark-as-read'
        console.log(url)
        return instance.post(url)
    }

    getNewsfeeds({page: page, per_page: per_page, ids: ids}) {
        if(!page) {
            page = 1
        }

        if(!per_page) {
            per_page = 10
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed?page=' + page + '&per_page=' + per_page

        if(ids) {
            url += '&ids=' + ids
        }

        console.log(url)
        return instance.get(url)
    }

    likeNewsfeed({ newsfeed_id: newsfeed_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed/' + newsfeed_id + '/like'
        console.log(url)
        return instance.post(url)
    }

    unlikeNewsfeed({ newsfeed_id: newsfeed_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed/' + newsfeed_id + '/unlike'
        console.log(url)
        return instance.post(url)
    }

    shareNewsfeed({ newsfeed_id: newsfeed_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed/' + newsfeed_id + '/share'
        console.log(url)
        return instance.post(url)
    }

    getNewsfeedComments({newsfeed_id: newsfeed_id, parent_comment_id: parent_comment_id, page: page, per_page: per_page, include_sub_comments_per_page: include_sub_comments_per_page}) {
        if(!page) {
            page = 1
        }

        if(!per_page) {
            per_page = 10
        }

        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed/'+ newsfeed_id + '/comment?page=' + page + '&per_page=' + per_page

        if(parent_comment_id) {
            if(parent_comment_id) {
                url += '&parent_comment_id=' + parent_comment_id
            }
        }
        
        if(include_sub_comments_per_page) {
            url += '&include_sub_comments_per_page=' + include_sub_comments_per_page
        }

        console.log(url)
        return instance.get(url)
    }

    likeNewsfeedComment({ newsfeed_id: newsfeed_id, newsfeed_comment_id: newsfeed_comment_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed/' + newsfeed_id + '/comment/' + newsfeed_comment_id + '/like'
        console.log(url)
        return instance.post(url)
    }

    unlikeNewsfeedComment({ newsfeed_id: newsfeed_id, newsfeed_comment_id: newsfeed_comment_id }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed/' + newsfeed_id + '/comment/' + newsfeed_comment_id + '/unlike'
        console.log(url)
        return instance.post(url)
    }

    replyComment({ newsfeed_id: newsfeed_id, newsfeed_comment_id: newsfeed_comment_id, comment: comment }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/newsfeed/' + newsfeed_id + '/comment/reply'
        console.log(url)
        return instance.post(url, {
            newsfeed_comment_id: newsfeed_comment_id,
            comment: comment
        })
    }

    registerFCMToken({ fcm_token: fcm_token }) {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/notification/register-fcm-token'
        console.log(url)
        return instance.post(url, {
            fcm_token: fcm_token
        })
    }

    getUnreadNotificationCount() {
        let url = '/digied-module/cloud/'+ CommonConstants.api_key +'/notification/get-unread-notification-count'
        console.log(url)
        return instance.get(url)
    }
}

export default DigiedModule