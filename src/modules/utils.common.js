import { Navigation } from 'react-native-navigation'
import CommonConstants from './constants.common.js'
import { ToastAndroid } from 'react-native'
import DigiedModule from '../services/digied.module'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import RNExitApp from 'react-native-exit-app'

export function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, '');

    // Make the string lowercase  
    str = str.toLowerCase();

    // Remove accents, swap ñ for n, etc
    var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
    var to   = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    // Remove invalid chars
    str = str.replace(/[^a-z0-9 -]/g, '') 
    .replace(/-+/g, '')
    // Collapse whitespace and replace by -
    .replace(/\s+/g, '-') 
    // Collapse dashes
    .replace(/-+/g, '-'); 

    return str;
}

export function handleSharedUrl(data) {
    // data.url = 'pannthee://open.app/newsfeed/61a45f9714602e51ef0a6d22'
    if (data.url != null 
        && data.url.startsWith(CommonConstants.HAWK_SCHEME + '://open.app/newsfeed/') 
        && global.RECENT_HAWK_LOADED_URL != data.url) {
        const newsfeedId = data.url.split('/').pop() //get last part
        if(newsfeedId) {
            global.RECENT_HAWK_LOADED_URL = data.url
            let currentComponentId = 'home'
            let screenEventListener = Navigation.events().registerComponentDidAppearListener(({ componentId, componentName, passProps }) => {
                if(componentName != 'sidebar.panntheefoundation.Left' && componentName != 'sidebar.panntheefoundation.TermsAndConditionsScreenLeft' && componentName != 'sidebar.panntheefoundation.FaqScreenLeft') {
                    currentComponentId = componentId
                }
            })

            let digiedModule = new DigiedModule
            
            digiedModule.getNewsfeeds({ ids: newsfeedId, page: 1, per_page: 1})
            .then((response) => {
                let func = (language) => {
                    let data = response.data.data[0]
                    let newsfeed = {
                        id: data._id,
                        newsfeed_type: data.newsfeed_type,
                        title: data.title,
                        content: data.content,
                        tutorial_id: data.tutorial_id,
                        sequence: 1,
                        key: data._id.toString(),
                        has_liked: data.has_liked,
                        total_liked_count: data.total_liked_count || 0,
                        is_liking_in_progress: false
                    }

                    if(data.image) {
                        newsfeed.image = CommonConstants.storage_endpoint + '/' + data.image
                    }

                    if(language != 'en' && data.title_l10n && data.title_l10n[language]) {
                        newsfeed.title = data.title_l10n[language]
                    }

                    if(language != 'en' && data.content_l10n && data.content_l10n[language]) {
                        newsfeed.content = data.content_l10n[language]
                    }

                    if(data.newsfeed_hash_ref) {
                        newsfeed.video_url = CommonConstants.storage_endpoint + '/digied-module/newsfeeds/' + data.newsfeed_hash_ref + '.m3u8'    
                    }

                    newsfeed.tutorial = _.find(response.data.tutorials, (tutorial) => {
                        return tutorial.id == data.tutorial_id
                    })

                    if(newsfeed.tutorial) {
                        newsfeed.tutorial.tutorial_title = newsfeed.tutorial.tutorial_title

                        if(language != 'en' && newsfeed.tutorial.tutorial_title_l10n && newsfeed.tutorial.tutorial_title_l10n[language]) {
                            newsfeed.tutorial.tutorial_title = newsfeed.tutorial.tutorial_title_l10n[language]
                        }
                    }

                    Navigation.push(currentComponentId, {
                        component: {
                            name: 'navigation.panntheefoundation.NewsfeedDetailScreen',
                            passProps: {
                                item: newsfeed
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
                                },
                                bottomTabs: {
                                    currentTabIndex: 0
                                }
                            }
                        }
                    })
                }

                if(screenEventListener) {
                    screenEventListener.remove()
                }

                let language = "en"

                AsyncStorage.multiGet([
                    CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE,
                ]).then((storedData) => {
                    if(storedData && storedData[0] && storedData[0][1] != null) {
                        language = storedData[0][1]
                    }

                    func(language)
                }).catch(() => {
                    func(language)
                })
            }).catch((error) => {
                Navigation.push(currentComponentId, {
                    component: {
                        name: 'navigation.panntheefoundation.NewsfeedScreen',
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
                            },
                            bottomTabs: {
                                currentTabIndex: 0
                            }
                        }
                    }
                })

                if(screenEventListener) {
                    screenEventListener.remove()
                }
            })
        }
    }
}

export function onBackButtonPressAndroid(t) {
    if(global.backHandlerClickCount >= 2) {
        RNExitApp.exitApp()
        return true;
    }

    ToastAndroid.show(t('Click again to return to your home screen'), 2000);
    
    setTimeout(() => {
        global.backHandlerClickCount = 1
    }, 2000)
    global.backHandlerClickCount++;
    return true;
}