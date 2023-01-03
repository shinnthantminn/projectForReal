import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, TouchableHighlight, BackHandler, FlatList, StatusBar, Linking, RefreshControl, ActivityIndicator, ImageBackground, ScrollView } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faHeart, faCircle } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import { handleSharedUrl, onBackButtonPressAndroid } from '../modules/utils.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import DigiedModule from '../services/digied.module'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {connect} from 'react-redux'
import NetInfo from "@react-native-community/netinfo"

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

import ModalAlert from '../components/modal-alert'

import * as Animatable from 'react-native-animatable'

AnimatableBox = Animatable.createAnimatableComponent(Box)

import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class NotificationDetailScreen extends React.PureComponent {
    // static options(passProps) {
    //     return {
    //         sideMenu: {
    //             left: {
    //                 visible: true
    //             }
    //         }
    //     }
    // }

    constructor(props){
        super(props)

        this.state = {
            forceRender: false,
            isConnected: true
        }

        this.backHandler = false

        this.LOGGEDIN_USER = false

        this.notification_detail = {
            id: props.item.id,
            title: props.item.title,
            content: props.item.content,
            created_at_display: props.item.created_at_display,
            created_at_ago_display: props.item.created_at_ago_display
        }

        this.digiedModule = new DigiedModule
        
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.page = 1
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
        this.navigationEventListener = Navigation.events().bindComponent(this);
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
        })

        Linking.getInitialURL().then((url) => handleSharedUrl({url: url}))
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove();
        }

        if(this.netInfoEventListener) {
            this.netInfoEventListener()
        }
    }

    componentDidAppear() {
        this.notification_detail = {
            id: this.props.item.id,
            title: this.props.item.title,
            content: this.props.item.content,
            created_at_display: this.props.item.created_at_display,
            created_at_ago_display: this.props.item.created_at_ago_display
        }

        this.digiedModule.markNotificationAsRead({ notification_id: this.props.item.id })
            .then((response) => {
                this.digiedModule.getUnreadNotificationCount().then((response) => {
                    global.total_unread_notification_count = response.data.count
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }).catch((error) => {
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                })
            })

        AsyncStorage.multiGet([
            CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER
        ]).then((storedData) => {
            if(storedData) {
                if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                    let LOGGEDIN_USER = JSON.parse(storedData[0][1])
                    this.LOGGEDIN_USER = LOGGEDIN_USER
                }
            }
        })
        
        if(this.backHandler == false) {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
        }

        Linking.addEventListener('url', handleSharedUrl)
    }

    componentDidDisappear() {
        if(this.backHandler) {
            this.backHandler.remove()
            this.backHandler = false
        }
        Linking.removeEventListener('url', handleSharedUrl)
    }

    render() {
        const { width, height } = Dimensions.get('window')
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n } = this.props
        const { isConnected } = this.state
        const modalAlert = this.modalAlert

        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')

        const finalWidth = width - (COMMON_STYLE.PADDING * 2)

        return (
            <NativeBaseProvider>
                <SafeAreaView style={
                    { flex: 0, backgroundColor: COLORS.WHITE, height: statusBarCurrentHeight }
                } />
                <SafeAreaView style={
                    COMMON_STYLES.SAFE_AREA_SECTION,
                    {
                        flex: 1
                    }
                }>
                    <StatusBar barStyle="dark-content" backgroundColor={ COLORS.WHITE } />
                    <ModalAlert modalAlert={modalAlert} onPress={this.onModalAlertPress}></ModalAlert>
                    <ModalAppVersionForceUpdate />
                    
                    <ImageBackground source={background_image} style={{
                        flex: 1,
                        width: width,
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
                            <Grid style={{ 
                                alignItems: 'flex-end',
                                width: width
                            }}>
                                <Col style={{ width: 60 }}>
                                    <TouchableOpacity onPress={this._onClickedBack} style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: 60
                                    }}>
                                        <FontAwesomeIcon icon={faChevronLeft} size={30} style={
                                            { 
                                                color: COLORS.THEME
                                            }
                                        } />
                                    </TouchableOpacity>
                                </Col>
                                <Col style={{
                                    height: 60,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <TouchableOpacity onPress={this._onClickedHome} style={{
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Image source={logo_image} style={{
                                            width: 40,
                                            height: 45,
                                        }} />
                                    </TouchableOpacity>
                                </Col>
                                <Col style={{ width: 45 }}></Col>
                            </Grid>
                        </Box>

                        {
                            isConnected != true && (
                                <Box style={{
                                    paddingRight: COMMON_STYLE.PADDING,
                                    paddingLeft: COMMON_STYLE.PADDING
                                }}>
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            color: COLORS.BLACK,
                                            textAlign: 'center'
                                        }
                                    ]}>{ t('No Internet Connection') }</Text>
                                </Box>
                            )
                        }

                        {
                            (isConnected == true && this.notification_detail) && (
                                <ScrollView>
                                    <Box style={{
                                        width: finalWidth,
                                        paddingLeft: COMMON_STYLE.PADDING,
                                        paddingRight: COMMON_STYLE.PADDING,
                                        paddingTop: COMMON_STYLE.PADDING,
                                        paddingBottom: COMMON_STYLE.PADDING,
                                        marginLeft: COMMON_STYLE.PADDING,
                                        marginRight: COMMON_STYLE.PADDING,
                                        marginTop: COMMON_STYLE.PADDING,
                                        backgroundColor: COLORS.WHITE,
                                        borderWidth: 1,
                                        borderColor: COLORS.WHITE,
                                        borderRadius: 12
                                    }}>

                                        <Text style={[
                                            COMMON_STYLES[i18n.language].bold,
                                            {
                                                color: COLORS.BLACK
                                            }
                                        ]}>{this.notification_detail.title}</Text>

                                        <Box style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Text style={[
                                                COMMON_STYLES['en'].regular,
                                                {
                                                    fontSize: 12,
                                                    lineHeight: 12,
                                                    color: COLORS.GRAY,
                                                    marginBottom: 0,
                                                    paddingBottom: 0,
                                                    textAlignVertical: 'center'
                                                }
                                            ]} numberOfLines={1}>{ this.notification_detail.created_at_display }</Text>
                                        </Box>

                                        {
                                            (this.notification_detail.content != null && this.notification_detail.content != '') && (
                                                <Text style={[
                                                    COMMON_STYLES[i18n.language].regular,
                                                    {
                                                        color: COLORS.BLACK,
                                                        marginTop: 10
                                                    }
                                                ]}>{this.notification_detail.content}</Text>
                                            )
                                        }
                                    </Box>
                                </ScrollView>
                            )
                        }
                        
                    </ImageBackground>
                        
                </SafeAreaView>
            </NativeBaseProvider>
        )
    }

    _onClickedBack = () => {
        global.backHandlerClickCount = 1
        Navigation.pop(this.props.componentId)
        return true
    }

    _onClickedHome = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTabs: {
                currentTabIndex: 0
            }
        })
    }
}

function mapStateToProps(state) {
    return {
        
    }
}

function mapDispatchToProps(dispatch) {
    return {
        
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(NotificationDetailScreen));
