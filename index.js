import { Navigation } from "react-native-navigation"
import { Platform, Dimensions } from 'react-native'

import "./src/screens"
import AssetServerModule from "./src/services/asset-server.module"
import AnalyticsModule from "./src/services/analytics.module"
import DigiedModule from "./src/services/digied.module"

import SidebarEn from "./src/modules/sidebar/en"
import SidebarMm from "./src/modules/sidebar/mm"
import SidebarZg from "./src/modules/sidebar/zg"

import COMMON_STYLES, { COLORS } from './src/modules/styles.common.js'
import { getBrand, getSystemName, getSystemVersion, getCarrier } from 'react-native-device-info'
import { parallel } from 'async'
import Geolocation from '@react-native-community/geolocation'
import PushNotificationService from './src/modules/push-notification-service.js'
import messaging from '@react-native-firebase/messaging'
import { utils } from '@react-native-firebase/app'
import CommonConstants from './src/modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'

global.organization = false
global.total_unread_notification_count = 0

let assetServerModule = new AssetServerModule
assetServerModule.selectActiveHawkAssetServer()
assetServerModule.getOrganizationInfo().then((response) => {
    global.organization = response.data.data
})

new PushNotificationService

let analyticsModule = new AnalyticsModule

Geolocation.getCurrentPosition((position) => {
    analyticsModule.jaOpenApp({
        lat: position.coords.latitude,
        lng: position.coords.longitude
    })
},
(error) => {
    analyticsModule.jaOpenApp()
},
{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000});

let digiedModule = new DigiedModule
digiedModule.getUnreadNotificationCount().then((response) => {
    global.total_unread_notification_count = response.data.count
})

let animations = {}

if(Platform.OS == "android") {
    const { width, height } = Dimensions.get('window')
    animations = {
        topBar: {
            height: 0,
            visible: false,
            animate: false,
            backButton: {
                visible: false
            }
        },
        setRoot: {
            alpha: {
                from: 0,
                to: 1,
                duration: 0
            }
        },
        dismissModal: {
            waitForRender: false,
            y: {
                from: 0,
                to: height * 2,
                duration: height,
                interpolation: 'decelerate'
            }
        },
        _showModal: {
            waitForRender: false,
            topBar: {
                id: 'topBar',
                alpha: {
                    from: 0,
                    to: 1,
                    duration: 300,
                    interpolation: 'accelerate'
                }
            },
            content: {
                y: {
                    from: 1000,
                    to: 1,
                    duration: 300,
                    interpolation: 'accelerate',
                },
                alpha: {
                    from: 0,
                    to: 1,
                    duration: 300,
                    interpolation: 'accelerate'
                }
            }
        },
        push: {
            waitForRender: false,
            topBar: {
                x: {
                    from: width,
                    to: 0,
                    duration: 300,
                    interpolation: 'accelerate',
                },
                alpha: {
                    from: 0,
                    to: 1,
                    duration: 300,
                    interpolation: 'accelerate'
                }
            },
            content: {
                x: {
                    from: width,
                    to: 0,
                    duration: 300,
                    interpolation: 'accelerate',
                },
                alpha: {
                    from: 0,
                    to: 1,
                    duration: 300,
                    interpolation: 'accelerate'
                }
            },
            bottomTabs: {
                x: {
                    from: width,
                    to: 0,
                    duration: 300,
                    interpolation: 'accelerate',
                },
                alpha: {
                    from: 0,
                    to: 1,
                    duration: 300,
                    interpolation: 'accelerate'
                }
            },
        },                
        pop: {
            waitForRender: false,
            topBar: {
                x: {
                    from: 1,
                    to: width,
                    duration: 250,
                    interpolation: 'accelerate',
                },
                alpha: {
                    from: 1,
                    to: 0,
                    duration: 250,
                    interpolation: 'accelerate'
                }
            },
            content: {
                x: {
                    from: 1,
                    to: width,
                    duration: 250,
                    interpolation: 'accelerate',
                },
                alpha: {
                    from: 1,
                    to: 0,
                    duration: 250,
                    interpolation: 'accelerate'
                }
            },
            bottomTabs: {
                x: {
                    from: 1,
                    to: width,
                    duration: 250,
                    interpolation: 'accelerate',
                },
                alpha: {
                    from: 1,
                    to: 0,
                    duration: 250,
                    interpolation: 'accelerate'
                }
            },
        }
    }
}

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setDefaultOptions({
        setRoot: {
            alpha: {
                from: 0,
                to: 1,
                duration: 0
            }
        },
        statusBar: {
            visible: true,
            backgroundColor: COLORS.LIGHT_GRAY,
            color: COLORS.BLACK,
            drawBehind: true,
            style: 'dark'
        },
        layout: {
            backgroundColor: COLORS.LIGHT_GRAY,
            direction: 'ltr',
            orientation: Platform.OS == "ios"? ['portrait', 'landscape']: ['portrait']
        },
        bottomTabs: {
            backgroundColor: COLORS.THEME,
            currentTabIndex: 0,
            animate: false,
            drawBehind: false,
            titleDisplayMode: 'alwaysShow'
        },
        bottomTab: {
            animate: false,
            textColor: COLORS.BLACK,
            selectedIconColor: COLORS.WHITE,
            selectedTextColor: COLORS.WHITE,
            selectedFontSize: 12,
            fontSize: 12,
            drawBehind: false,
            badgeColor: 'red',
            dotIndicator: {
                visible: false
            }
        },
        animations: animations
    })

    AsyncStorage.multiGet([
        CommonConstants.PERSISTENT_STORAGE_KEY.IS_INTRO_FINISHED,
        CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER,
        CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE,
        CommonConstants.PERSISTENT_STORAGE_KEY.TRACKED_ONCE
    ]).then((storedData) => {
        if(storedData) {
            let LOGGEDIN_USER = false
            if(storedData[1] && storedData[1][1] != null) {
                LOGGEDIN_USER = JSON.parse(storedData[1][1])
            }

            // AsyncStorage.remove(CommonConstants.PERSISTENT_STORAGE_KEY.TRACKED_ONCE)
            if(!storedData[3] || (storedData[3] && storedData[3][1] == null)
                || (LOGGEDIN_USER && storedData[3] && storedData[3][1] != LOGGEDIN_USER.id.toString())
                || (!LOGGEDIN_USER && storedData[3] && storedData[3][1] != 'tracked_once')) {
                // TRACK device info and all

                parallel([
                    (cb) => {
                        cb(null, getBrand())
                    },
                    (cb) => {
                        cb(null, getSystemName() + ' ' + getSystemVersion())
                    },
                    (cb) => {
                        getCarrier().then((carrier) => {
                            cb(null, carrier)
                        }).catch((error) => {
                            cb(error, null)
                        })
                    }
                ],
                (err, results) => {
                    if(err == null && results) {
                        let params = {}
                        if(results[0]) {
                            params.device_name = results[0]
                        }
                        if(results[1]) {
                            params.device_os = results[1]
                        }
                        if(results[2]) {
                            params.device_carrier = results[2]
                        }
                        
                        analyticsModule.jaDeviceInfo(params)
                        if(LOGGEDIN_USER) {
                            AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.TRACKED_ONCE, LOGGEDIN_USER.id.toString())
                        } else {
                            AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.TRACKED_ONCE, 'tracked_once')
                        }
                    }
                })
            }

            if(storedData[0] && storedData[0][1] != null) {
                // if loggedin
                if(storedData[1] && storedData[1][1] != null) {

                    if(storedData[2] && storedData[2][1] == "mm") {
                        Navigation.setRoot({
                            root: {
                                sideMenu: SidebarMm
                            }
                        })
                    } else if(storedData[2] && storedData[2][1] == "zg") {
                        Navigation.setRoot({
                            root: {
                                sideMenu: SidebarZg
                            }
                        })
                    } else {
                        Navigation.setRoot({
                            root: {
                                sideMenu: SidebarEn
                            }
                        })
                    }

                    Navigation.events().registerBottomTabSelectedListener((tab) => {
                        global.backHandlerClickCount = 1
                        if(tab && tab.selectedTabIndex == 0) {
                            // home
                            Navigation.popToRoot('home')
                        }
                    })

                    if(messaging && typeof(messaging) == 'function') {
                        const { isAvailable } = utils().playServicesAvailability
                        if(isAvailable) {
                            messaging()
                                .getInitialNotification()
                                .then(message => {
                                    if(message) {
                                        let language = 'en';
                                        if(storedData[2] && storedData[2][1]) {
                                            language = storedData[2][1]
                                        }
                                        if(message.data.notification_type == 2 && message.data.tutorial_id) {
                                            // get tutorial info
                                            digiedModule.getTutorialsByIds({ page: 'all', ids: message.data.tutorial_id }).
                                            then((response) => {
                                                const image = require('./src/assets/images/panthee-logo.png')

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

                                                    Navigation.push("home", {
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
                                                        Navigation.push("home", {
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
                                                    }).catch((error) => {
                                                        console.log(error)
                                                        Navigation.push("home", {
                                                            component: {
                                                                name: 'navigation.panntheefoundation.NotificationScreen',
                                                                options: {
                                                                    animations: {
                                                                        push: {
                                                                            waitForRender: true,
                                                                        }
                                                                    },
                                                                    topBar: {
                                                                        height: 0,
                                                                        visible: false
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    })
                                                }
                                            }).catch((error) => {
                                                console.log(error)
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
                                                    Navigation.push("home", {
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
                                                }).catch((error) => {
                                                    console.log(error)
                                                    Navigation.push("home", {
                                                        component: {
                                                            name: 'navigation.panntheefoundation.NotificationScreen',
                                                            options: {
                                                                animations: {
                                                                    push: {
                                                                        waitForRender: true,
                                                                    }
                                                                },
                                                                topBar: {
                                                                    height: 0,
                                                                    visible: false
                                                                }
                                                            }
                                                        }
                                                    })
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
                                                    Navigation.push("home", {
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
                                                }).catch((error) => {
                                                    console.log(error)
                                                    Navigation.push("home", {
                                                        component: {
                                                            name: 'navigation.panntheefoundation.NotificationScreen',
                                                            options: {
                                                                animations: {
                                                                    push: {
                                                                        waitForRender: true,
                                                                    }
                                                                },
                                                                topBar: {
                                                                    height: 0,
                                                                    visible: false
                                                                }
                                                            }
                                                        }
                                                    })
                                                })
                                        }
                                    }
                                })
                        }
                    }
                } else {
                    Navigation.setRoot({
                        root: {
                            stack: {
                                children: [
                                    {
                                        component: {
                                            name: 'navigation.panntheefoundation.LoginScreen',
                                            options: {
                                                topBar: {
                                                    height: 0,
                                                    visible: false
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    })
                }
                
            } else {
                Navigation.setRoot({
                    root: {
                        stack: {
                            children: [
                                {
                                    component: {
                                        name: 'navigation.panntheefoundation.IntroScreen',
                                        options: {
                                            topBar: {
                                                height: 0,
                                                visible: false
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                })
            }
        }
    }).catch(() => {
        Navigation.setRoot({
            root: {
                stack: {
                    children: [
                        {
                            component: {
                                name: 'navigation.panntheefoundation.IntroScreen',
                                options: {
                                    topBar: {
                                        height: 0,
                                        visible: false
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        })
    })
})