import { utils } from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'
import DigiedModule from '../services/digied.module'
import { Notifications } from 'react-native-notifications'
import { Navigation } from 'react-native-navigation'
import CommonConstants from './constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'

export default class PushNotificationService {

    constructor() { 
        this.currentComponentId = false

        if(messaging && typeof(messaging) == 'function') {
            const { isAvailable } = utils().playServicesAvailability
            if(isAvailable) {
                this.checkPermission()
                this.createNotificationListeners()

                this.screenEventListener = Navigation.events().registerComponentDidAppearListener(({ componentId, componentName, passProps }) => {
                    if(this.currentComponentId != "home-fixed" && componentName != 'sidebar.panntheefoundation.Left' && componentName != 'sidebar.panntheefoundation.TermsAndConditionsScreenLeft' && componentName != 'sidebar.panntheefoundation.FaqScreenLeft') {
                        this.currentComponentId = componentId
                    }
                })
            }
        }
    }

    async checkPermission() {
        const enabled = await messaging().hasPermission()
        if (enabled) {
            this.getToken()
        } else {
            this.requestPermission()
        }
    }

    async getToken() {
        fcmToken = await messaging().getToken()
        
        if (fcmToken) {
            let digiedModule = new DigiedModule

            digiedModule.registerFCMToken({
                fcm_token: fcmToken
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    async requestPermission() {
        try {
            const authStatus = await messaging().requestPermission()
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL

            if(enabled) {
                this.getToken()
            }
        } catch (error) {
            // User has rejected permissions
        }
    }

    async createNotificationListeners() {
        let funcOnRemoteAndLocalNotificationOpen = (message, language, completion) => {
            if(this.currentComponentId == false || this.currentComponentId == 'home-fixed') {
                this.currentComponentId = 'home'
            }
            if(message && message.data) {
                let digiedModule = new DigiedModule
                if(message.data.notification_type == 2 && message.data.tutorial_id) {
                    // get tutorial info
                    digiedModule.getTutorialsByIds({ page: 'all', ids: message.data.tutorial_id }).
                    then((response) => {
                        const image = require('../assets/images/panthee-logo.png')

                        if(response.data.data && response.data.data.length > 0) {
                            let data = response.data.data[0]

                            let tutorial = {
                                id: data.id,
                                sequence: 1,
                                title: data.tutorial_title,
                                title_en: data.tutorial_title,
                                description: data.tutorial_description,
                                description_en: data.tutorial_description,
                                tutorial_hash_ref: data.tutorial_hash_ref
                            }

                            if(data.tutorial_image) {
                                tutorial.tutorial_image = CommonConstants.storage_endpoint + '/' + data.tutorial_image
                            }

                            if(language != 'en' && data.tutorial_title_l10n && data.tutorial_title_l10n[language]) {
                                tutorial.title = data.tutorial_title_l10n[language]
                                tutorial.tutorial_title_l10n = data.tutorial_title_l10n
                            }

                            if(language != 'en' && data.tutorial_description_l10n && data.tutorial_description_l10n[language]) {
                                tutorial.description = data.tutorial_description_l10n[language]
                                tutorial.tutorial_description_l10n = data.tutorial_description_l10n
                            }

                            if(data.tutorial_video_file) {
                                // tutorial.video_url = CommonConstants.streaming_endpoint + '/digied-module/tutorials/' + data.tutorial_hash_ref + '.m3u8'
                                tutorial.video_url = CommonConstants.storage_endpoint + '/digied-module/tutorials/' + data.tutorial_hash_ref + '.m3u8'
                            }

                            if(data.tutorial_summary_pdf_file) {
                                tutorial.tutorial_summary_pdf_file = CommonConstants.storage_endpoint + '/' + data.tutorial_summary_pdf_file
                            }

                            if(data.chapter) {
                                tutorial.chapter_no = data.chapter.chapter_no
                                tutorial.chapter_no_en = data.chapter.chapter_no

                                if(language != 'en' && data.chapter.chapter_no_l10n && data.chapter.chapter_no_l10n[language]) {
                                    tutorial.chapter_no = data.chapter.chapter_no_l10n[language]
                                    tutorial.chapter_no_l10n = data.chapter.chapter_no_l10n
                                }

                                tutorial.chapter_title = data.chapter.chapter_title
                                tutorial.chapter_title_en = data.chapter.chapter_title

                                if(language != 'en' && data.chapter.chapter_title_l10n && data.chapter.chapter_title_l10n[language]) {
                                    tutorial.chapter_title = data.chapter.chapter_title_l10n[language]
                                    tutorial.chapter_title_l10n = data.chapter.chapter_title_l10n
                                }

                                if(data.chapter.subject) {
                                    tutorial.subject_title = data.chapter.subject.subject_name
                                    tutorial.subject_title_en = data.chapter.subject.subject_name

                                    if(language != 'en' && data.chapter.subject.subject_name_l10n && data.chapter.subject.subject_name_l10n[language]) {
                                        tutorial.subject_title = data.chapter.subject.subject_name_l10n[language]
                                        tutorial.subject_name_l10n = data.chapter.subject.subject_name_l10n
                                    }

                                    if(data.chapter.subject.course) {
                                        tutorial.course_title = data.chapter.subject.course.course_name
                                        tutorial.course_title_en = data.chapter.subject.course.course_name

                                        if(language != 'en' && data.chapter.subject.course.course_name_l10n && data.chapter.subject.course.course_name_l10n[language]) {
                                            tutorial.course_title = data.chapter.subject.course.course_name_l10n[language]
                                            tutorial.course_name_l10n = data.chapter.subject.course.course_name_l10n
                                        }

                                        if(data.chapter.subject.course.course_category) {
                                            tutorial.course_category_title = data.chapter.subject.course.course_category.course_category_name
                                            tutorial.course_category_title_en = data.chapter.subject.course.course_category.course_category_name

                                            if(language != 'en' && data.chapter.subject.course.course_category.course_category_name_l10n && data.chapter.subject.course.course_category.course_category_name_l10n[language]) {
                                                tutorial.course_category_title = data.chapter.subject.course.course_category.course_category_name_l10n[language]
                                                tutorial.course_category_name_l10n = data.chapter.subject.course.course_category.course_category_name_l10n
                                            }
                                        }
                                    }
                                }
                            }

                            tutorial.favourited_info = _.find(response.data.favourited_tutorials, (favourited_tutorial) => {
                                return favourited_tutorial.tutorial_id == data.id
                            })

                            tutorial.total_favourited_count = response.data.total_favourited_count
                            tutorial.total_favourited_count_display = response.data.total_favourited_count_display

                            tutorial.is_favourting_in_progress = false

                            Navigation.push(this.currentComponentId, {
                                component: {
                                    name: 'navigation.panntheefoundation.MainPlayerScreen',
                                    passProps: {
                                        item: tutorial
                                    },
                                    options: {
                                        animations: {
                                            push: {
                                                waitForRender: true,
                                            }
                                        },
                                        topBar: {
                                            height: 0,
                                            visible: false
                                        },
                                        sideMenu: {
                                            left: {
                                                visible: false
                                            }
                                        }
                                    }
                                }
                            })

                            if(completion && typeof completion == 'function') {
                                completion()
                            }
                        } else {
                            digiedModule.getNotifications({ids: message.data.notification_id, page: 1, per_page: 1})
                            .then((response) => {
                                let data = response.data.data[0]

                                let notification = {
                                    id: data._id,
                                    notification_type: data.notification_type,
                                    title: data.title,
                                    content: data.content,
                                    tutorial_id: data.tutorial_id,
                                    sequence: 1,
                                    key: data._id.toString(),
                                    has_read: data.has_read
                                }

                                if(language != 'en' && data.title_l10n && data.title_l10n[language]) {
                                    notification.title = data.title_l10n[language]
                                }

                                if(language != 'en' && data.content_l10n && data.content_l10n[language]) {
                                    notification.content = data.content_l10n[language]
                                }

                                notification.tutorial = _.find(response.data.tutorials, (tutorial) => {
                                    return tutorial.id == data.tutorial_id
                                })

                                if(notification.tutorial) {
                                    notification.tutorial.tutorial_title = notification.tutorial.tutorial_title

                                    if(language != 'en' && notification.tutorial.tutorial_title_l10n && notification.tutorial.tutorial_title_l10n[language]) {
                                        notification.tutorial.tutorial_title = notification.tutorial.tutorial_title_l10n[language]
                                    }
                                }

                                Navigation.push(this.currentComponentId, {
                                    component: {
                                        name: 'navigation.panntheefoundation.NotificationDetailScreen',
                                        passProps: {
                                            item: notification
                                        },
                                        options: {
                                            animations: {
                                                push: {
                                                    waitForRender: true,
                                                }
                                            },
                                            topBar: {
                                                height: 0,
                                                visible: false
                                            },
                                            sideMenu: {
                                                left: {
                                                    visible: false
                                                }
                                            }
                                        }
                                    }
                                })

                                if(completion && typeof completion == 'function') {
                                    completion()
                                }
                            }).catch((error) => {
                                 Navigation.push(this.currentComponentId, {
                                    component: {
                                        name: 'navigation.panntheefoundation.NotificationScreen',
                                        passProps: {
                                            item: notification
                                        },
                                        options: {
                                            animations: {
                                                push: {
                                                    waitForRender: true,
                                                }
                                            },
                                            topBar: {
                                                height: 0,
                                                visible: false
                                            },
                                            sideMenu: {
                                                left: {
                                                    visible: false
                                                }
                                            }
                                        }
                                    }
                                })

                                if(completion && typeof completion == 'function') {
                                    completion()
                                }
                            })
                        }
                    }).catch((error) => {
                        digiedModule.getNotifications({ids: message.data.notification_id, page: 1, per_page: 1})
                        .then((response) => {
                            let data = response.data.data[0]

                            let notification = {
                                id: data._id,
                                notification_type: data.notification_type,
                                title: data.title,
                                content: data.content,
                                tutorial_id: data.tutorial_id,
                                sequence: 1,
                                key: data._id.toString(),
                                has_read: data.has_read
                            }

                            if(language != 'en' && data.title_l10n && data.title_l10n[language]) {
                                notification.title = data.title_l10n[language]
                            }

                            if(language != 'en' && data.content_l10n && data.content_l10n[language]) {
                                notification.content = data.content_l10n[language]
                            }

                            notification.tutorial = _.find(response.data.tutorials, (tutorial) => {
                                return tutorial.id == data.tutorial_id
                            })

                            if(notification.tutorial) {
                                notification.tutorial.tutorial_title = notification.tutorial.tutorial_title

                                if(language != 'en' && notification.tutorial.tutorial_title_l10n && notification.tutorial.tutorial_title_l10n[language]) {
                                    notification.tutorial.tutorial_title = notification.tutorial.tutorial_title_l10n[language]
                                }
                            }

                            Navigation.push(this.currentComponentId, {
                                component: {
                                    name: 'navigation.panntheefoundation.NotificationDetailScreen',
                                    passProps: {
                                        item: notification
                                    },
                                    options: {
                                        animations: {
                                            push: {
                                                waitForRender: true,
                                            }
                                        },
                                        topBar: {
                                            height: 0,
                                            visible: false
                                        },
                                        sideMenu: {
                                            left: {
                                                visible: false
                                            }
                                        }
                                    }
                                }
                            })

                            if(completion && typeof completion == 'function') {
                                completion()
                            }
                        }).catch((error) => {
                            Navigation.push(this.currentComponentId, {
                                component: {
                                    name: 'navigation.panntheefoundation.NotificationScreen',
                                    passProps: {
                                        item: notification
                                    },
                                    options: {
                                        animations: {
                                            push: {
                                                waitForRender: true,
                                            }
                                        },
                                        topBar: {
                                            height: 0,
                                            visible: false
                                        },
                                        sideMenu: {
                                            left: {
                                                visible: false
                                            }
                                        }
                                    }
                                }
                            })

                            if(completion && typeof completion == 'function') {
                                completion()
                            }
                        })
                    })
                } else {
                    digiedModule.getNotifications({ids: message.data.notification_id, page: 1, per_page: 1})
                    .then((response) => {
                        let data = response.data.data[0]

                        let notification = {
                            id: data._id,
                            notification_type: data.notification_type,
                            title: data.title,
                            content: data.content,
                            tutorial_id: data.tutorial_id,
                            sequence: 1,
                            key: data._id.toString(),
                            has_read: data.has_read
                        }

                        if(language != 'en' && data.title_l10n && data.title_l10n[language]) {
                            notification.title = data.title_l10n[language]
                        }

                        if(language != 'en' && data.content_l10n && data.content_l10n[language]) {
                            notification.content = data.content_l10n[language]
                        }

                        notification.tutorial = _.find(response.data.tutorials, (tutorial) => {
                            return tutorial.id == data.tutorial_id
                        })

                        if(notification.tutorial) {
                            notification.tutorial.tutorial_title = notification.tutorial.tutorial_title

                            if(language != 'en' && notification.tutorial.tutorial_title_l10n && notification.tutorial.tutorial_title_l10n[language]) {
                                notification.tutorial.tutorial_title = notification.tutorial.tutorial_title_l10n[language]
                            }
                        }

                        Navigation.push(this.currentComponentId, {
                            component: {
                                name: 'navigation.panntheefoundation.NotificationDetailScreen',
                                passProps: {
                                    item: notification
                                },
                                options: {
                                    animations: {
                                        push: {
                                            waitForRender: true,
                                        }
                                    },
                                    topBar: {
                                        height: 0,
                                        visible: false
                                    },
                                    sideMenu: {
                                        left: {
                                            visible: false
                                        }
                                    }
                                }
                            }
                        })

                        if(completion && typeof completion == 'function') {
                            completion()
                        }
                    }).catch((error) => {
                        console.log(error)
                        Navigation.push(this.currentComponentId, {
                            component: {
                                name: 'navigation.panntheefoundation.NotificationScreen',
                                passProps: {
                                    
                                },
                                options: {
                                    animations: {
                                        push: {
                                            waitForRender: true,
                                        }
                                    },
                                    topBar: {
                                        height: 0,
                                        visible: false
                                    },
                                    sideMenu: {
                                        left: {
                                            visible: false
                                        }
                                    }
                                }
                            }
                        })

                        if(completion && typeof completion == 'function') {
                            completion()
                        }
                    })
                }
            }
        }

        Notifications.registerRemoteNotifications()

        Notifications.events().registerNotificationOpened((notification, completion, action) => {
            let language = 'mm'
            AsyncStorage.multiGet([
                CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE,
            ]).then((storedData) => {
                if(storedData) {
                    if(storedData[0] && storedData[0][1] != null) {
                        language = storedData[0][1]
                    }
                }

                funcOnRemoteAndLocalNotificationOpen(notification.payload, language, completion)
            }).catch((error) => {
                funcOnRemoteAndLocalNotificationOpen(notification.payload, language, completion)
            })
        })

        // for ios
        Notifications.events().registerNotificationReceivedForeground((notification, completion: (response) => void) => {
            // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
            completion({alert: true, sound: true, badge: false})
        })

        // for ios
        Notifications.events().registerNotificationReceivedBackground((notification, completion: (response) => void) => {
            // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
            completion({alert: true, sound: true, badge: false})
        })

        messaging().onNotificationOpenedApp((message) => {
            this.currentComponentId = "home-fixed"
            let language = 'mm'
            AsyncStorage.multiGet([
                CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE,
            ]).then((storedData) => {
                if(storedData) {
                    if(storedData[0] && storedData[0][1] != null) {
                        language = storedData[0][1]
                    }
                }

                funcOnRemoteAndLocalNotificationOpen(message, language)
            }).catch((error) => {
                funcOnRemoteAndLocalNotificationOpen(message, language)
            })
        });

        messaging().onMessage((message) => {
            //process data message
            const sendAt = new Date()
            const sendAtSeconds = sendAt.getSeconds() + 1 // in 1 secs
            sendAt.setSeconds(sendAtSeconds);

            Notifications.postLocalNotification({
                collapseKey: message.collapseKey,
                data: message.data,
                messageId: message.messageId,
                from: message.from,
                body: message.notification.body,
                title: message.notification.title,
                silent: false,
                fireDate: sendAt.toISOString()
            })

            let digiedModule = new DigiedModule
            digiedModule.getUnreadNotificationCount().then((response) => {
                global.total_unread_notification_count = response.data.count
            }).catch((error) => {
                console.log(error)
            })
        });

        messaging().setBackgroundMessageHandler(async message => {
            let digiedModule = new DigiedModule
            digiedModule.getUnreadNotificationCount().then((response) => {
                global.total_unread_notification_count = response.data.count
            }).catch((error) => {
                console.log(error)
            })
        })
    }
}