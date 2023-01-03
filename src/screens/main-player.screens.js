import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, TouchableWithoutFeedback, BackHandler, FlatList, StatusBar, ActionSheetIOS, ScrollView, TextInput, ImageBackground } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faShare, faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'

import { withTranslation } from "react-i18next"

import Login from "../components/login"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Share from 'react-native-share'
import VideoPlayer from 'react-native-video-controls'

import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import DigiedModule from '../services/digied.module'

import ModalAlert from '../components/modal-alert'
import {connect} from 'react-redux'
import Orientation from 'react-native-orientation'
import { WebView } from 'react-native-webview'
import RNPreventScreenshot from 'react-native-prevent-screenshot'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class MainPlayerScreen extends React.PureComponent {
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
            wishlist_changed: false,
            forceRender: false
        }
        this.orientation = Orientation.getInitialOrientation()
        this.selectedTutorial = props.item

        this.digiedModule = new DigiedModule

        this.hasErrorDisplay = false
        
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.videoPlayer = {
            player: false,
            paused: false
        }

        this.LOGGEDIN_USER = false
        this.recentTutorials = false

        this.timeBeforeScreenOrientationChange = 0
        this.backHandler = false
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
        RNPreventScreenshot.enabled(true)
        this.navigationEventListener = Navigation.events().bindComponent(this)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())

        this.hasErrorDisplay = false
        // add into recent tutorials
        // if exists remove

        AsyncStorage.multiGet([
            CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER,
            CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS
        ]).then((storedData) => {
            if(storedData) {
                if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                    let LOGGEDIN_USER = JSON.parse(storedData[0][1])
                    this.LOGGEDIN_USER = LOGGEDIN_USER
                }

                if(storedData[1] && storedData[1][1] != null && storedData[1][1] != false) {
                    let RECENT_TUTORIALS = JSON.parse(storedData[1][1])
                    this.recentTutorials = RECENT_TUTORIALS
                }

                let recentTutorials = _.filter(this.recentTutorials, (recentTutorial) => {
                    return recentTutorial.id != this.props.item.id
                })

                if(!recentTutorials) {
                    recentTutorials = []
                }

                recentTutorials.push({
                    id: this.props.item.id
                })

                // max recent is 100
                if(recentTutorials.length >= 100) {
                    recentTutorials.pop()    
                }

                AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS, JSON.stringify(recentTutorials))

                // no need because no need to render
                // this.setState({
                //     forceRender: !this.state.forceRender
                // })
            }
        })

        if(this.props.item && this.props.item.id) {
            this.digiedModule.updateViewCount({ tutorial_id: this.props.item.id })
        }

        Orientation.addOrientationListener(this._orientationDidChange);
    }

    componentWillUnmount() {
        RNPreventScreenshot.enabled(false)
        if (this.navigationEventListener) {
            this.navigationEventListener.remove();
        }

        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    componentDidAppear() {
        RNPreventScreenshot.enabled(true)
        if(this.backHandler == false) {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
        }

        this.videoPlayer.paused = false
        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    componentDidDisappear() {
        RNPreventScreenshot.enabled(false)
        if(this.backHandler) {
            this.backHandler.remove()
            this.backHandler = false
        }
        
        this.videoPlayer.paused = true
        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    _orientationDidChange = (orientation) => {
        this.orientation = orientation
        if(orientation == "LANDSCAPE") {
            Navigation.mergeOptions(this.props.componentId, {
                bottomTabs: {
                    visible: false
                }
            })
        } else {
            Navigation.mergeOptions(this.props.componentId, {
                bottomTabs: {
                    visible: true
                }
            })
        }

        this.timeBeforeScreenOrientationChange = this.videoPlayer.player.calculateTimeFromSeekerPosition()

        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.wishlist_changed && (this.state.wishlist_changed != nextProps.wishlist_changed)) {
            if(this.item && this.item.id == nextProps.wishlist_changed.tutorial_id) {
                if(nextProps.wishlist_changed.status == 2) {
                    this.item.favourited_info = false    
                } else {
                    this.item.favourited_info = nextProps.wishlist_changed    
                }
            }
        }
        return true
    }

    render() {
        const { width, height } = Dimensions.get('window')

        let finalWidth = width
        let finalHeight = height

        if(finalWidth > finalHeight) {
            finalWidth = height
            finalHeight = width
        }

        // because we dont want black background on top and bottom of the video
        const portraitVideoHeight = finalWidth/1.8
        
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n, item } = this.props
        
        const modalAlert = this.modalAlert
        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')
        const pdf_icon_image = require('../assets/images/pdf-icon.png')

        // item.description = "<p style='font-family:Zawgyi-One'>ကိဳးစားၿပီးရွာေဖြရေအာင္</p>"
        let tutorial_description_p_count = 0

        if(item && item.description) {
            tutorial_description_p_count = (item.description.match(/<\/p>/g) || []).length

            tutorial_description_p_count += (item.description.match(/<br \/>/g) || []).length

            tutorial_description_p_count += (item.description.match(/<\/li>/g) || []).length
        }

        const webviewHeight = (((i18n.language == 'en'? 40: 80) * (item.description.length/finalWidth) + ((i18n.language == 'en'? 60: 100) * tutorial_description_p_count)))
        const zawgyiOnefontUrl = Platform.select({
            ios: "Zawgyi-One.ttf",
            android: "file:///android_asset/fonts/Zawgyi-One.ttf"
        });

        const pyidaungsufontUrl = Platform.select({
            ios: "Pyidaungsu-Regular",
            android: "file:///android_asset/fonts/Pyidaungsu-Regular.ttf",
        });

        const robotomonoRegularfontUrl = Platform.select({
            ios: "RobotoMono-Regular",
            android: "file:///android_asset/fonts/RobotoMono-Regular.ttf",
        });

        return (
            <NativeBaseProvider>
                <SafeAreaView style={
                    { flex: 0, backgroundColor: COLORS.WHITE, height: this.orientation == "PORTRAIT"? statusBarCurrentHeight: 0 }
                } />

                <Box style={
                    COMMON_STYLES.SAFE_AREA_SECTION,
                    {
                        flex: 1,
                        paddingTop: (Platform.OS == "android" && this.orientation == "LANDSCAPE")? statusBarCurrentHeight: 0
                    }
                }>
                    <StatusBar barStyle="dark-content" backgroundColor={ COLORS.WHITE } />
                    <ModalAlert modalAlert={modalAlert} onPress={this.onModalAlertPress}></ModalAlert>
                    <ModalAppVersionForceUpdate />
                     
                    <ImageBackground source={background_image}  style={{
                        flex: 1,
                        width: this.orientation == "PORTRAIT"? finalWidth: finalHeight,
                        height: this.orientation == "PORTRAIT"? portraitVideoHeight: '100%'
                    }} imageStyle={{
                        opacity: (Platform.OS == "android"? 0.5: 1)
                    }}>
                        {
                            this.orientation == "PORTRAIT" && (
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
                                            <Box style={{
                                                flex: 1,
                                                flexDirection: 'row'
                                            }}>
                                                <TouchableOpacity onPress={this._onClickedHome} style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Image source={logo_image} style={{
                                                        width: 40,
                                                        height: 45
                                                    }} />
                                                </TouchableOpacity>
                                            </Box>
                                        </Col>
                                        <Col style={{ width: 45 }}></Col>
                                    </Grid>
                                </Box>
                            )
                        }

                        {
                            this.orientation == "PORTRAIT" && (
                                <Box style={{
                                    width: finalWidth,
                                    height: portraitVideoHeight,
                                    backgroundColor: COLORS.BLACK,
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    zIndex: 1
                                }}>
                                    <VideoPlayer source={{
                                            uri: item? item.video_url: ''
                                        }}
                                        ref={ (ref) => this.videoPlayer.player = ref}
                                        showOnStart={false}
                                        controlTimeout={4000}
                                        showTimeRemaining={false}
                                        toggleResizeModeOnFullscreen={false}
                                        tapAnywhereToPause={false}
                                        paused={this.videoPlayer.paused}
                                        onError={this._onVideoError}               // Callback when video cannot be loaded
                                        onLoad={() => {
                                            if(this.timeBeforeScreenOrientationChange >= 0) {
                                                this.videoPlayer.player.seekTo(this.timeBeforeScreenOrientationChange)    
                                            }
                                        }}
                                        onPause={() => {
                                            this.videoPlayer.paused = true

                                            this.setState({
                                                forceRender: !this.state.forceRender
                                            })
                                        }}
                                        onPlay={() => {
                                            this.videoPlayer.paused = false

                                            this.setState({
                                                forceRender: !this.state.forceRender
                                            })
                                        }}
                                        ignoreSilentSwitch="ignore"
                                        disableBack={true}
                                        disableVolume={true}
                                        resizeMode={this.orientation == "PORTRAIT"? "contain": "contain"}
                                        controls={false}
                                        navigator={false}

                                        onEnterFullscreen={this._onEnterFullscreen}
                                        onExitFullscreen={this._onExitFullscreen}

                                        timerText={[
                                            COMMON_STYLES[i18n.language].regular,
                                            {
                                                fontSize: 12
                                            }
                                        ]}

                                        style={{
                                            width: this.orientation == "PORTRAIT"? finalWidth: '100%',
                                            marginLeft: 'auto',
                                            marginRight: 'auto'
                                        }}

                                        videoStyle={{
                                            width: finalWidth,
                                            height: portraitVideoHeight
                                        }} />
                                </Box>
                            )
                        }

                        {
                            this.orientation == "LANDSCAPE" && (
                                <Box style={{
                                    width: finalHeight,
                                    height: '100%',
                                    backgroundColor: COLORS.BLACK,
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    zIndex: 1
                                }}>
                                    <VideoPlayer source={{
                                            uri: item? item.video_url: ''
                                        }}
                                        ref={ (ref) => this.videoPlayer.player = ref}
                                        toggleResizeModeOnFullscreen={false}
                                        tapAnywhereToPause={false}
                                        showOnStart={false}
                                        controlTimeout={4000}
                                        paused={this.videoPlayer.paused}
                                        onError={this._onVideoError}               // Callback when video cannot be loaded
                                        onLoad={() => {
                                            if(this.timeBeforeScreenOrientationChange >= 0) {
                                                this.videoPlayer.player.seekTo(this.timeBeforeScreenOrientationChange)    
                                            }
                                        }}
                                        onPause={() => {
                                            this.videoPlayer.paused = true

                                            this.setState({
                                                forceRender: !this.state.forceRender
                                            })
                                        }}
                                        onPlay={() => {
                                            this.videoPlayer.paused = false

                                            this.setState({
                                                forceRender: !this.state.forceRender
                                            })
                                        }}
                                        ignoreSilentSwitch="ignore"
                                        disableBack={true}
                                        disableVolume={true}
                                        resizeMode={"contain"}
                                        controls={false}
                                        navigator={false}

                                        onEnterFullscreen={this._onEnterFullscreen}
                                        onExitFullscreen={this._onExitFullscreen}

                                        timerText={
                                            COMMON_STYLES[i18n.language].regular
                                        }

                                        style={{
                                            width: '100%',
                                            marginLeft: 'auto',
                                            marginRight: 'auto'
                                        }}

                                        videoStyle={{
                                            width: '100%',
                                            height: '100%'
                                        }} />
                                </Box>
                            )
                        }

                        {
                            this.orientation == "PORTRAIT" && (
                                <Box style={{
                                    backgroundColor: COLORS.WHITE,
                                    marginTop: 10,
                                    paddingTop: COMMON_STYLE.PADDING,
                                    paddingBottom: COMMON_STYLE.PADDING,
                                    paddingLeft: COMMON_STYLE.PADDING,
                                    paddingRight: COMMON_STYLE.PADDING,
                                    flex: 1
                                }}>
                                    <ScrollView>
                                        {
                                            (this.selectedTutorial && this.selectedTutorial.chapter_title != '') && (
                                                <Grid>
                                                    <Col style={{
                                                        alignItems: 'center'
                                                    }}>
                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].regular,
                                                            COMMON_STYLES.TEXT_HEADING_FORM,
                                                            {
                                                                fontSize: 20,
                                                                lineHeight: (Platform.OS == "ios"? 40: 35),
                                                                color: COLORS.BLACK,
                                                                textAlign: 'left',
                                                                width: '100%'
                                                            }
                                                        ]} numberOfLines={2}>
                                                            {this.selectedTutorial.chapter_title}
                                                        </Text>
                                                    </Col>

                                                    <Col style={{
                                                        width: 80,
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start'
                                                    }}>
                                                        {
                                                            (item.is_favourting_in_progress == true) && (
                                                                <Box style={{
                                                                    width: 40, 
                                                                    height: 30,
                                                                    justifyContent: 'flex-start', 
                                                                    alignItems: 'flex-end'
                                                                }}>
                                                                    <Spinner color={COLORS.RED} style={{
                                                                        transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
                                                                        height: 20
                                                                    }} />
                                                                </Box>
                                                            )
                                                        }

                                                        {
                                                            (item.is_favourting_in_progress == false && !item.favourited_info) && (
                                                                <TouchableOpacity onPress={this._onClickedFavourite} style={{ 
                                                                    width: 30, 
                                                                    height: 30, 
                                                                    justifyContent: 'center', 
                                                                    alignItems: 'flex-end'
                                                                }}>
                                                                    <FontAwesomeIcon icon={farHeart} size={20} style={
                                                                        { 
                                                                            color: COLORS.RED
                                                                        }
                                                                    } />
                                                                </TouchableOpacity>
                                                            )
                                                        }

                                                        {
                                                            (item.is_favourting_in_progress == false && item.favourited_info && item.favourited_info._id) && (
                                                                <TouchableOpacity onPress={this._onClickedUnfavourite} style={{ 
                                                                    width: 30, 
                                                                    height: 30, 
                                                                    justifyContent: 'center', 
                                                                    alignItems: 'flex-end'
                                                                }}>
                                                                    <FontAwesomeIcon icon={faHeart} size={20} style={
                                                                        { 
                                                                            color: COLORS.RED
                                                                        }
                                                                    } />
                                                                </TouchableOpacity>
                                                            )
                                                        }
                                                    </Col>
                                                </Grid>
                                            )
                                        }

                                        {
                                            (item && item.description != null && item.description != '') && (
                                                <WebView 
                                                    useWebKit={true}
                                                    originWhitelist={['*']} 
                                                    source={{ html: '<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><style media="screen" type="text/css">@font-face{font-family:"Zawgyi-One";src:url("' + zawgyiOnefontUrl +'")} @font-face{font-family:"Pyidaungsu-Regular";src:url("' + pyidaungsufontUrl +'")} @font-face{font-family:"RobotoMono-Regular";src:url("' + robotomonoRegularfontUrl +'")} *{margin:0;padding:0;font-family:'+ (i18n.language == 'en'? "RobotoMono-Regular": (i18n.language == 'mm'? "Pyidaungsu-Regular": "Zawgyi-One")) +';font-size: '+ (Platform.OS == 'android'? (i18n.language == 'en'? '16px': '18px'): (i18n.language == 'en'? '16px': '18px')) +';}</style></head><body>' + item.description + '</body></html>', baseUrl: '' }} 
                                                    style={[
                                                        COMMON_STYLES[i18n.language].regular,
                                                        {
                                                            backgroundColor: 'transparent',                                                            
                                                            height: webviewHeight
                                                        }
                                                    ]} />
                                            )
                                        }

                                        {
                                            (item && item.tutorial_summary_pdf_file && item.tutorial_summary_pdf_file != false && item.tutorial_summary_pdf_file != '') && (
                                                <Box style={{
                                                    borderBottomWidth: 0
                                                }}>
                                                    <TouchableOpacity onPress={this._onClickedSummary}>
                                                        <Box style={{
                                                            height: 200,
                                                            backgroundColor: COLORS.THEME,
                                                            borderRadius: 12,
                                                            width: 120
                                                        }}>
                                                            <Box style={{
                                                                backgroundColor: COLORS.WHITE,
                                                                flex: 0.75,
                                                                overflow: 'hidden'
                                                            }}>
                                                                <Image source={ pdf_icon_image } style={{
                                                                    width: 120,
                                                                    height: 147
                                                                }} />
                                                            </Box>

                                                            <Box style={{
                                                                flex: 0.25,
                                                                paddingLeft: COMMON_STYLE.PADDING,
                                                                paddingRight: COMMON_STYLE.PADDING,
                                                                borderTopWidth: 1,
                                                                borderTopColor: COLORS.LIGHT_GRAY,
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <Text style={[
                                                                    COMMON_STYLES[i18n.language].bold,
                                                                    {
                                                                        textAlign: 'center',
                                                                        color: COLORS.WHITE
                                                                    }
                                                                ]} numberOfLines={1}>{item.title}</Text>
                                                            </Box>
                                                        </Box>
                                                    </TouchableOpacity>

                                                </Box>
                                            )
                                        }
                                    </ScrollView> 
                                
                                </Box>
                            )
                        }
                            
                    </ImageBackground>
                            
                </Box>
            </NativeBaseProvider>
        )
    }

    _onVideoError = (e) => {
        if(this.hasErrorDisplay == false) {
            const { t, i18n } = this.props
            this.hasErrorDisplay = true
            this.modalAlert = {
                visible: true,
                title: t("Unable to play tutorial video"),
                description: t("Unable to play the tutorial video. Please contact support team")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })    
        }
    }

    _onClickedShare = () => {
        const { t, i18n } = this.props
        
        if(Platform.OS == "android") {
            const shareOptions = {
                title: CommonConstants.app_name,
                message: 'Studying ' + this.selectedTutorial.name,
                // url: CommonConstants.weblink + i18n.language.toLowerCase() + "/products/" + product_link + "/?sku=" + (this.product.sku? this.product.sku: "") + '#' + hash_link,
                social: "generic"
            };

            Share.shareSingle(shareOptions).catch(() => {
                this.modalAlert = {
                    visible: true,
                    title: t("Unable to share"),
                    description: t("Unable to share the tutorial. Please contact support team")
                }
                this.setState({
                    forceRender: !this.state.forceRender
                })
            })
        } else {
            ActionSheetIOS.showShareActionSheetWithOptions(
                {
                    title: CommonConstants.app_name,
                    message: 'Studying ' + this.selectedTutorial.name
                }, () => {
                    this.modalAlert = {
                        visible: true,
                        title: t("Unable to share"),
                        description: t("Unable to share the tutorial. Please contact support team")
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }, () => {
                    
                }
            )
        }
    }

    _onClickedSummary = () => {
        const { item } = this.props
        const encodedUrl = encodeURIComponent(item.tutorial_summary_pdf_file)
        const url = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`

        this.videoPlayer.paused = true

        this.setState({
            forceRender: !this.state.forceRender
        }, () => {
            InAppBrowser.open(url)    
        })

        // Navigation.showModal({
        //     stack: {
        //         children: [ 
        //             {
        //                 component: {
        //                     name: 'navigation.panntheefoundation.TutorialSummaryScreen',
        //                     passProps: {
        //                         item: this.selectedTutorial
        //                     },
        //                     options: {
        //                         topBar: {
        //                             height: 0,
        //                             visible: false
        //                         },
        //                         layout: {
        //                             backgroundColor: COLORS.BLACK_OPACITY_25,
        //                             componentBackgroundColor: COLORS.BLACK_OPACITY_25,
        //                         },
        //                         screenBackgroundColor: COLORS.BLACK_OPACITY_25,
        //                         modalPresentationStyle: 'overCurrentContext',
        //                         animations: {
        //                             showModal: {
        //                                 y: {
        //                                     from: height,
        //                                     to: 0,
        //                                     duration: 500,
        //                                 },
        //                             },
        //                             dismissModal: {
        //                                 y: {
        //                                     from: 0,
        //                                     to: height,
        //                                     duration: 500,
        //                                 }
        //                             }
        //                         }

        //                     }
        //                 }
        //             }
        //         ]
        //     }
        // })
    }

    _onClickedComment = () => {
        const { width, height } = Dimensions.get('window')

        Navigation.showModal({
            stack: {
                children: [ 
                    {
                        component: {
                            name: 'navigation.panntheefoundation.TutorialCommentScreen',
                            passProps: {
                                item: this.selectedTutorial
                            },
                            options: {
                                topBar: {
                                    height: 0,
                                    visible: false
                                },
                                layout: {
                                    backgroundColor: COLORS.BLACK_OPACITY_25,
                                    componentBackgroundColor: COLORS.BLACK_OPACITY_25,
                                },
                                screenBackgroundColor: COLORS.BLACK_OPACITY_25,
                                modalPresentationStyle: 'overCurrentContext',
                                animations: {
                                    showModal: {
                                        y: {
                                            from: height,
                                            to: 0,
                                            duration: 500,
                                        },
                                    },
                                    dismissModal: {
                                        y: {
                                            from: 0,
                                            to: height,
                                            duration: 500,
                                        }
                                    }
                                }

                            }
                        }
                    }
                ]
            }
        })
    }

    _onClickedFavourite = () => {
        const { item, t, i18n } = this.props
        
        item.is_favourting_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        this.digiedModule.favouriteTutorial({ tutorial_id: item.id })
            .then((response) => {
                item.is_favourting_in_progress = false
                this.props.updateWishlistChanged(response.data.data)

                this.props.item.favourited_info = response.data.data
                this.props.item.total_favourited_count = response.data.total_favourited_count
                this.props.item.total_favourited_count_display = response.data.total_favourited_count_display

                AsyncStorage.multiGet([
                    CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS
                ]).then((storedData) => {
                    if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                        let recent_tutorials = JSON.parse(storedData[0][1])

                        if(!recent_tutorials) {
                            recent_tutorials = []
                        }

                        recent_tutorials = _.filter(recent_tutorials, (recent_tutorial) => {
                            return recent_tutorial.id != this.props.item.id
                        })

                        recent_tutorials.push(this.props.item)

                        AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS, JSON.stringify(recent_tutorials))
                    }

                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }).catch(() => {
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                })
            }).catch((error) => {
                item.is_favourting_in_progress = false
                var msg = t("Unable to remove tutorial from wishlist")
                if(error.response.data) {
                    msg = error.response.data.join('\n')
                }
                this.modalAlert = {
                    visible: true,
                    title: t("Favourite Tutorial"),
                    description: msg
                }
                this.setState({
                    forceRender: !this.state.forceRender
                })
            })
    }

    _onClickedUnfavourite = () => {
        const { item, t, i18n } = this.props

        item.is_favourting_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        this.digiedModule.unfavouriteTutorial({ tutorial_id: item.id })
            .then((response) => {
                item.is_favourting_in_progress = false
                response.data.data.status = 2
                this.props.updateWishlistChanged(response.data.data)
                
                this.props.item.favourited_info = false
                this.props.item.total_favourited_count = response.data.total_favourited_count
                this.props.item.total_favourited_count_display = response.data.total_favourited_count_display

                AsyncStorage.multiGet([
                    CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS
                ]).then((storedData) => {
                    if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                        let recent_tutorials = JSON.parse(storedData[0][1])

                        if(!recent_tutorials) {
                            recent_tutorials = []
                        }

                        recent_tutorials = _.filter(recent_tutorials, (recent_tutorial) => {
                            return recent_tutorial.id != this.props.item.id
                        })

                        recent_tutorials.push(this.props.item)

                        AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS, JSON.stringify(recent_tutorials))
                    }

                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }).catch(() => {
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                })
            }).catch((error) => {
                item.is_favourting_in_progress = false
                var msg = t("Unable to remove tutorial from wishlist")
                if(error.response.data) {
                    msg = error.response.data.join('\n')
                }
                this.modalAlert = {
                    visible: true,
                    title: t("Unfavourite Tutorial"),
                    description: msg
                }
                this.setState({
                    forceRender: !this.state.forceRender
                })
            })
    }

    _onClickedBack = () => {
        global.backHandlerClickCount = 1
        if(this.orientation == "LANDSCAPE") {
            Orientation.lockToPortrait()
        } else {
            Navigation.pop(this.props.componentId)    
        }
        
        return true
    }

    _onClickedHome = () => {
        Navigation.popToRoot("home")
    }

    _onEnterFullscreen = () => {
        Orientation.lockToLandscape()
    }

    _onExitFullscreen = () => {
        Orientation.lockToPortrait()
    }
}

function mapStateToProps(state) {
    return {
        wishlist_changed: state.wishlist_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateWishlistChanged: (wishlist_changed) => dispatch({ type: 'WISHLIST_CHANGED', payload: wishlist_changed })
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MainPlayerScreen));

