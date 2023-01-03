import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, TouchableOpacity, Linking, ImageBackground } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Container, Box, Text } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFileContract, faQuestionCircle, faSignOutAlt, faInfo, faNewspaper, faBell, faHome } from '@fortawesome/free-solid-svg-icons'
import { faFacebookMessenger } from '@fortawesome/free-brands-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CommonConstants from '../modules/constants.common.js'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {connect} from 'react-redux'
import ModalAlert from './modal-alert'

import DigiedModule from '../services/digied.module'

class SidebarLeft extends React.PureComponent {
    constructor(props){
        super(props)

        this.LOGGEDIN_USER = false

        this.state = {
            forceRender: false,
            login_changed: false
        }
        
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.isUnreadNotificationCountLoadingInProgress = false
    }

    onModalAlertPress = () => {
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }
        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    componentDidMount() {
        let digiedModule = new DigiedModule
        this.screenEventListener = Navigation.events().registerComponentDidAppearListener(({ componentId, componentName, passProps }) => {
            if(this.isUnreadNotificationCountLoadingInProgress == false) {
                this.isUnreadNotificationCountLoadingInProgress = true
                digiedModule.getUnreadNotificationCount().then((response) => {
                    global.total_unread_notification_count = response.data.count
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                    this.isUnreadNotificationCountLoadingInProgress = false
                }).catch((error) => {
                    console.log(error)
                    this.isUnreadNotificationCountLoadingInProgress = false
                })
                // DO REFRESH WHATEVER SCREEN SHOWS due to login and open again option
                AsyncStorage.multiGet([
                    CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER
                ]).then((storedData) => {
                    if(storedData) {
                        if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                            let LOGGEDIN_USER = JSON.parse(storedData[0][1])
                            if(!this.LOGGEDIN_USER && LOGGEDIN_USER) {
                                this.LOGGEDIN_USER = LOGGEDIN_USER
                                this.setState({
                                    forceRender: !this.state.forceRender
                                })
                            } else if(this.LOGGEDIN_USER && !LOGGEDIN_USER) {
                                this.LOGGEDIN_USER = LOGGEDIN_USER
                                this.setState({
                                    forceRender: !this.state.forceRender
                                })
                            } else if(this.LOGGEDIN_USER.id != LOGGEDIN_USER.id) {
                                this.LOGGEDIN_USER = LOGGEDIN_USER
                                this.setState({
                                    forceRender: !this.state.forceRender
                                })
                            }
                        } else {
                            this.LOGGEDIN_USER = false
                            this.setState({
                                forceRender: !this.state.forceRender
                            })
                        }
                    } else {
                        this.LOGGEDIN_USER = false
                        this.setState({
                            forceRender: !this.state.forceRender
                        })
                    }
                })
            }
        })
    }

    componentWillUnmount() {
        if (this.screenEventListener) {
            this.screenEventListener.remove();
        }
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n } = this.props
        const { width, height } = Dimensions.get('window')
        const LOGGEDIN_USER = this.LOGGEDIN_USER
        const modalAlert = this.modalAlert

        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')

        return (
            <NativeBaseProvider>
                <SafeAreaView style={
                    { flex: 0, backgroundColor: COLORS.THEME, height: statusBarCurrentHeight }
                } />
                <SafeAreaView style={
                    COMMON_STYLES.SAFE_AREA_SECTION,
                    {
                        flex: 1
                    }
                }>

                        <ModalAlert modalAlert={modalAlert} onPress={this.onModalAlertPress}></ModalAlert>
                        <ImageBackground source={background_image} style={{
                            flex: 1,
                            width: '100%',
                            height: height
                        }} imageStyle={{
                            opacity: (Platform.OS == "android"? 0.5: 1)
                        }}>
                            <Box style={{ 
                                paddingRight: COMMON_STYLE.PADDING,
                                height: 60, 
                                overflow: 'hidden',
                                borderBottomWidth: 1,
                                borderBottomColor: COLORS.THEME
                            }}>
                                <Grid style={{ alignItems: 'flex-end' }}>
                                    <Col style={{ width: 60 }}>
                                    </Col>
                                    <Col style={{
                                        height: 60,
                                        alignItems: 'flex-start',
                                        justifyContent: 'center'
                                    }}>
                                        <Box style={{
                                            flex: 1,
                                            flexDirection: 'row'
                                        }}>
                                            <TouchableOpacity onPress={this._onClickedHome} style={{
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 10
                                            }}>
                                                <Image source={logo_image} style={{
                                                    width: 40,
                                                    height: 45,
                                                }} />
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={this._onClickedHome}>
                                                <Text style={[
                                                    COMMON_STYLES['en'].bold,
                                                    {
                                                        color: COLORS.BLACK,
                                                        fontSize: 16,
                                                        lineHeight: 60,
                                                        marginBottom: 0,
                                                        paddingBottom: 0,
                                                        textAlign: 'center',
                                                        textAlignVertical: 'center',
                                                        height: 60,
                                                        letterSpacing: 3
                                                    }
                                                ]} numberOfLines={1}>{ CommonConstants.app_name_short }</Text>
                                            </TouchableOpacity>
                                        </Box>
                                    </Col>
                                </Grid>
                            </Box>

                            <Box style={{
                                marginTop: COMMON_STYLE.PADDING,
                                paddingLeft: COMMON_STYLE.PADDING,
                                paddingRight: COMMON_STYLE.PADDING
                            }}>
                                <Box style={
                                    styles.item
                                }>
                                    <TouchableOpacity onPress={() => this._onClickedActions("home")}>
                                        <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                            <FontAwesomeIcon icon={faHome} size={16} style={{
                                                marginTop: (Platform.OS == "ios"? 10: 5),
                                                marginRight: 15,
                                                color: COLORS.THEME
                                            }} />
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    color: COLORS.BLACK
                                                }
                                            ]}>{ t('Home Page') }</Text>
                                        </Box>
                                    </TouchableOpacity>
                                </Box>

                                <Box style={
                                    styles.item
                                }>
                                    <TouchableOpacity onPress={() => this._onClickedActions("newsfeed")}>
                                        <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                            <FontAwesomeIcon icon={faNewspaper} size={16} style={{
                                                marginTop: (Platform.OS == "ios"? 10: 5),
                                                marginRight: 15,
                                                color: COLORS.THEME
                                            }} />
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    color: COLORS.BLACK
                                                }
                                            ]}>{ t('Newsfeed') }</Text>
                                        </Box>
                                    </TouchableOpacity>
                                </Box>

                                <Box style={
                                    styles.item
                                }>
                                    <TouchableOpacity onPress={() => this._onClickedActions("notification")}>
                                        <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                            <FontAwesomeIcon icon={faBell} size={16} style={{
                                                marginTop: (Platform.OS == "ios"? 10: 5),
                                                marginRight: 15,
                                                color: COLORS.THEME
                                            }} />
                                            <Box style={{
                                                flex: 1,
                                                justifyContent: 'space-between',
                                                flexDirection: 'row'
                                            }}>
                                                <Text style={[
                                                    COMMON_STYLES[i18n.language].regular,
                                                    {
                                                        color: COLORS.BLACK
                                                    }
                                                ]}>{ t('Notification') }</Text>
                                                {
                                                    (global.total_unread_notification_count > 0) && (
                                                        <Box style={{
                                                            marginRight: 20,
                                                            width: 30,
                                                            height: 30,
                                                            borderRadius: 15,
                                                            backgroundColor: COLORS.RED,
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Text style={[
                                                                COMMON_STYLES[i18n.language].regular,
                                                                {
                                                                    color: COLORS.WHITE
                                                                }
                                                            ]}>{ global.total_unread_notification_count }</Text>
                                                        </Box>
                                                    )
                                                }
                                            </Box>
                                        </Box>
                                    </TouchableOpacity>
                                </Box>

                                <Box style={
                                    styles.item
                                }>
                                    <TouchableOpacity onPress={() => this._onClickedActions("tnc")}>
                                        <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                            <FontAwesomeIcon icon={faFileContract} size={16} style={{
                                                marginTop: (Platform.OS == "ios"? 10: 5),
                                                marginRight: 15,
                                                color: COLORS.THEME
                                            }} />
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    color: COLORS.BLACK
                                                }
                                            ]}>{ t('Terms and Conditions') }</Text>
                                        </Box>
                                    </TouchableOpacity>
                                </Box>

                                <Box style={
                                    styles.item
                                }>
                                    <TouchableOpacity onPress={() => this._onClickedActions("faq")}>
                                        <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                            <FontAwesomeIcon icon={faQuestionCircle} size={16} style={{
                                                marginTop: (Platform.OS == "ios"? 10: 5),
                                                marginRight: 15,
                                                color: COLORS.THEME
                                            }} />
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    color: COLORS.BLACK
                                                }
                                            ]}>{ t('FAQ') }</Text>
                                        </Box>
                                    </TouchableOpacity>
                                </Box>

                                <Box style={
                                    styles.item
                                }>
                                    <TouchableOpacity onPress={() => this._onClickedActions("technical-support")}>
                                        <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                            <FontAwesomeIcon icon={faFacebookMessenger} size={16} style={{
                                                marginTop: (Platform.OS == "ios"? 10: 5),
                                                marginRight: 15,
                                                color: COLORS.THEME
                                            }} />
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    color: COLORS.BLACK
                                                }
                                            ]} numberOfLines={2}>{ t('Technical Support') }</Text>
                                        </Box>
                                    </TouchableOpacity>
                                </Box>

                                <Box style={
                                    styles.item
                                }>
                                    <TouchableOpacity onPress={() => this._onClickedActions("logout")}>
                                        <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                            <FontAwesomeIcon icon={faSignOutAlt} size={16} style={{
                                                marginTop: (Platform.OS == "ios"? 10: 5),
                                                marginRight: 15,
                                                color: COLORS.THEME
                                            }} />
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    color: COLORS.BLACK
                                                }
                                            ]} numberOfLines={2}>{ t('Logout') }</Text>
                                        </Box>
                                    </TouchableOpacity>
                                </Box>

                                <Box style={
                                    styles.item
                                }>
                                    <Box style={{
                                            flexDirection: 'row'
                                        }}>
                                        <FontAwesomeIcon icon={faInfo} size={16} style={{
                                            marginTop: (Platform.OS == "ios"? 10: 5),
                                            marginRight: 15,
                                            color: COLORS.THEME
                                        }} />
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].regular,
                                            {
                                                color: COLORS.BLACK_OPACITY_50
                                            }
                                        ]}>{ t('Version') } { CommonConstants.version }</Text>
                                    </Box>
                                </Box>
                                
                            </Box>
                        </ImageBackground>

                </SafeAreaView>
            </NativeBaseProvider>
        )
    }

    _onClickedHome = () => {
        Navigation.popToRoot('LEFT_STACK')
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: false
                }
            }
        })
    }

    _onClickedActions = (type) => {
        const { t } = this.props

        if(type == "logout") {
            this.LOGGEDIN_USER = false
            AsyncStorage.multiRemove([
                CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER
            ])

            this.props.updateLoginChanged(this.LOGGEDIN_USER)

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
        } else if(type == "faq") {
            Navigation.push("LEFT_STACK", {
                component: {
                    name: 'sidebar.panntheefoundation.FaqScreenLeft',
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
                        }
                    }
                }
            })
        } else if(type == "tnc") {
            Navigation.push("LEFT_STACK", {
                component: {
                    name: 'sidebar.panntheefoundation.TermsAndConditionsScreenLeft',
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
                        }
                    }
                }
            })
        } else if(type == "technical-support") {
            Linking.canOpenURL('fb-messenger://').then(supported => {
                if (!supported) {
                    // open in webpage
                    Linking.openURL("https://m.me/" + CommonConstants.TECHNICAL_SUPPORT_FB_MESSENGER_ID)
                } else {
                    Linking.openURL("fb-messenger://user-thread/" + CommonConstants.TECHNICAL_SUPPORT_FB_MESSENGER_ID)
                }
            }).catch((err) => {
                Linking.openURL("https://m.me/" + CommonConstants.TECHNICAL_SUPPORT_FB_MESSENGER_ID)
            });
        } else if(type == "newsfeed") {
            Navigation.popToRoot('home')

            Navigation.push("home", {
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
        } else if(type == "notification") {
            Navigation.popToRoot('home')

            Navigation.push("home", {
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
                        },
                        bottomTabs: {
                            currentTabIndex: 0
                        }
                    }
                }
            })
        } else if(type == "home") {
            Navigation.popToRoot('LEFT_STACK')
            Navigation.popToRoot('home')
            Navigation.mergeOptions('home', {
                sideMenu: {
                    left: {
                        visible: false
                    }
                },
                bottomTabs: {
                    currentTabIndex: 0
                }
            })
        }
    }
}

const styles = StyleSheet.create({
    item: {
        marginTop: 20,
        marginBottom: 20
    },
});

function mapStateToProps(state) {
    return {
        login_changed: state.login_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateLoginChanged: (LOGGEDIN_USER) => dispatch({ type: 'LOGIN_CHANGED', payload: LOGGEDIN_USER })
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SidebarLeft));
// export default withTranslation()(SidebarLeft)

