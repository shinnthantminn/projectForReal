import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, TouchableHighlight, BackHandler, FlatList, StatusBar, Linking, RefreshControl, ActivityIndicator, ImageBackground, ActionSheetIOS } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Spinner, HStack } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faHeart, faCircle, faEllipsisH, faComment, faShare, faUser } from '@fortawesome/free-solid-svg-icons'
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

AnimatableBox = Animatable.createAnimatableComponent(Box);
import FastImage from 'react-native-fast-image'
import Share from 'react-native-share'
import ReadMore from '@fawazahmed/react-native-read-more'

import VideoPlayer from 'react-native-video-controls'
// import Orientation from 'react-native-orientation'
import RNPreventScreenshot from 'react-native-prevent-screenshot'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class NewsfeedScreen extends React.PureComponent {
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
            login_changed: false,
            wishlist_changed: false,
            
            forceRender: false,
            loading: true,
            loading_more: false,
            refreshing: false,
            isConnected: true
        }

        // this.orientation = Orientation.getInitialOrientation()
        this.backHandler = false

        this.LOGGEDIN_USER = false

        this.newsfeeds = []

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

    _onLoadRefresh = () => {
        if(this.state.refreshing == true) {
            return false
        }
        this.page = 1
        this.setState({
            refreshing: true
        }, () => {
            this.load()
        })
        
        // reload the page
    }

    _onLoadMore = () => {
    
        if(this.state.loading_more == true) {
            return false
        }
        if(this.has_next == false) {
            return false
        }
        this.setState({
            loading_more: true
        })
        this.page = this.page + 1
        this.load()
    }

    load = (forceRefresh) => {
        const { i18n } = this.props
        
        if(this.state.refreshing == true || forceRefresh == true) {
            this.page = 1
            this.newsfeeds = []
        }

        this.digiedModule.getNewsfeeds({ page: this.page, per_page: 10 })
            .then((response) => {
                _.each(response.data.data, (data, index) => {
                    let newsfeed = {
                        id: data._id,
                        newsfeed_type: data.newsfeed_type,
                        title: data.title,
                        content: data.content,
                        tutorial_id: data.tutorial_id,
                        sequence: (index + 1),
                        key: data._id.toString(),
                        has_liked: data.has_liked,
                        total_liked_count: data.total_liked_count || 0,
                        has_shared: data.has_shared,
                        total_shared_count: data.total_shared_count || 0,
                        newsfeed_comment_count: data.newsfeed_comment_count || 0,
                        is_liking_in_progress: false,
                        created_at_display: data.created_at_display,
                        created_at_ago_display: data.created_at_ago_display,
                        video_url: '',
                        image: ''
                    }

                    newsfeed.videoPlayer = {
                        player: false,
                        paused: true,
                        showPlayIcon: true
                    }

                    if(data.image) {
                        newsfeed.image = CommonConstants.storage_endpoint + '/' + data.image
                    }

                    if(i18n.language != 'en' && data.title_l10n && data.title_l10n[i18n.language]) {
                        newsfeed.title = data.title_l10n[i18n.language]
                    }

                    if(i18n.language != 'en' && data.content_l10n && data.content_l10n[i18n.language]) {
                        newsfeed.content = data.content_l10n[i18n.language]
                    }

                    if(data.has_video == 1 && data.newsfeed_hash_ref) {
                        newsfeed.video_url = CommonConstants.storage_endpoint + '/digied-module/newsfeeds/' + data.newsfeed_hash_ref + '.m3u8'    
                    }
                    
                    newsfeed.tutorial = _.find(response.data.tutorials, (tutorial) => {
                        return tutorial.id == data.tutorial_id
                    })

                    if(newsfeed.tutorial) {
                        newsfeed.tutorial.tutorial_title = newsfeed.tutorial.tutorial_title

                        if(i18n.language != 'en' && newsfeed.tutorial.tutorial_title_l10n && newsfeed.tutorial.tutorial_title_l10n[i18n.language]) {
                            newsfeed.tutorial.tutorial_title = newsfeed.tutorial.tutorial_title_l10n[i18n.language]
                        }

                        if(newsfeed.tutorial.tutorial_video_file) {
                            newsfeed.video_url = CommonConstants.storage_endpoint + '/digied-module/tutorials/teasers/' + newsfeed.tutorial.tutorial_hash_ref + '.m3u8'
                        }
                    }

                    this.newsfeeds.push(newsfeed)
                })

                if((response.data.meta.current_page * response.data.meta.per_page) < response.data.meta.total) {
                    this.has_next = true
                } else {
                    this.has_next = false
                }

                this.last_loaded_page = this.page

                this.setState({
                    loading: false,
                    refreshing: false,
                    loading_more: false,
                    forceRender: !this.state.forceRender
                })
            }).catch((error) => {
                console.log(error)
                this.setState({
                    loading: false,
                    refreshing: false,
                    loading_more: false,
                    forceRender: !this.state.forceRender
                })
            })
    }

    renderNewsfeed = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props
        const finalWidth = width - (COMMON_STYLE.PADDING * 2)
        
        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const play_icon = require('../assets/images/play1.png')

        const imageWidth = (item.image? (finalWidth - (COMMON_STYLE.PADDING * 2)): 0)
        let finalVideoWidth = (finalWidth - (COMMON_STYLE.PADDING * 2))
        let finalVideoHeight = height

        if(finalVideoWidth > finalVideoHeight) {
            finalVideoWidth = height
            finalVideoHeight = width
        }

        // because we dont want black background on top and bottom of the video
        const portraitVideoHeight = finalWidth/1.8
        renderItem = (
            
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
                <Grid>
                    <Row>
                        <Col style={{
                            width: 40,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Box style={{
                                backgroundColor: COLORS.WHITE,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 20,
                                width: 40,
                                height: 40
                            }}>
                                <Image source={logo_image} style={{
                                    width: 40,
                                    height: 45,
                                }} />
                            </Box>
                        </Col>

                        <Col style={{
                            justifyContent: 'center',
                            paddingLeft: COMMON_STYLE.PADDING
                        }}>
                            <Text style={[
                                COMMON_STYLES['en'].regular,
                                {
                                    color: COLORS.BLACK,
                                    marginBottom: 0,
                                    paddingBottom: 0,
                                    textAlignVertical: 'center'
                                }
                            ]} numberOfLines={1}>Pann Thee Education</Text>
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
                                ]} numberOfLines={1}>{ item.created_at_display }</Text>
                            </Box>
                        </Col>

                        {
                            /*
                            <Col style={{
                                width: 20,
                                alignItems: 'flex-end',
                                justifyContent: 'center'
                            }}>
                                <TouchableOpacity>
                                    <FontAwesomeIcon icon={faEllipsisH} size={15} style={
                                        { 
                                            color: COLORS.GREEN
                                        }
                                    } />
                                </TouchableOpacity>
                            </Col>
                            */
                        }
                        
                    </Row>
                    <Row style={{
                        marginTop: COMMON_STYLE.PADDING
                    }}>
                        <Col style={{
                            justifyContent: 'flex-start'
                        }}>
                            <Box style={{
                                flex: 1
                            }}>
                                <ReadMore style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        color: COLORS.BLACK,
                                        marginBottom: 0,
                                        paddingBottom: 0,
                                        textAlignVertical: 'center'
                                    }
                                ]}
                                seeMoreStyle={{
                                    color: COLORS.GRAY
                                }}
                                seeLessStyle={{
                                    color: COLORS.GRAY
                                }}
                                numberOfLines={2}>{ item.content }</ReadMore>
                            </Box>
                        </Col>
                    </Row>

                    {
                        (item.video_url == '' && item.image != '') && (
                            <Row style={{
                                marginTop: COMMON_STYLE.PADDING
                            }}>
                                <Col style={{
                                    justifyContent: 'flex-start'
                                }}>
                                    <Box>
                                        <FastImage source={{
                                            uri: item.image
                                        }} style={{
                                            width: '100%',
                                            height: portraitVideoHeight
                                        }} resizeMode={"cover"} />
                                    </Box>
                                </Col>
                            </Row>
                        )
                    }

                    {
                        (item.video_url != '') && (
                            <Row style={{
                                marginTop: COMMON_STYLE.PADDING
                            }}>
                                <Col style={{
                                    justifyContent: 'flex-start'
                                }}>
                                    <Box style={{
                                        // width: finalVideoWidth,
                                        height: portraitVideoHeight,
                                        backgroundColor: COLORS.BLACK,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1
                                    }}>
                                        <VideoPlayer source={{
                                                uri: item? item.video_url: ''
                                            }}
                                            ref={ (ref) => item.videoPlayer.player = ref}
                                            showOnStart={false}
                                            controlTimeout={4000}
                                            showTimeRemaining={false}
                                            toggleResizeModeOnFullscreen={false}
                                            tapAnywhereToPause={false}
                                            paused={item.videoPlayer.paused}
                                            onError={this._onVideoError}               // Callback when video cannot be loaded
                                            // onLoad={() => {
                                            //     if(item.timeBeforeScreenOrientationChange >= 0) {
                                            //         item.videoPlayer.player.seekTo(item.timeBeforeScreenOrientationChange)    
                                            //     }
                                            // }}
                                            onPause={() => {
                                                item.videoPlayer.paused = true

                                                this.setState({
                                                    forceRender: !this.state.forceRender
                                                })
                                            }}
                                            onPlay={() => {
                                                item.videoPlayer.paused = false

                                                this.setState({
                                                    forceRender: !this.state.forceRender
                                                })
                                            }}
                                            onHideControls={() => {
                                                if(item.videoPlayer.showPlayIcon == false) {
                                                    item.videoPlayer.showPlayIcon = true
                                                    this.setState({
                                                        forceRender: !this.state.forceRender
                                                    })
                                                }
                                            }}
                                            onShowControls={() => {
                                                if(item.videoPlayer.showPlayIcon == true) {
                                                    item.videoPlayer.showPlayIcon = false
                                                    this.setState({
                                                        forceRender: !this.state.forceRender
                                                    })
                                                }
                                            }}
                                            ignoreSilentSwitch="ignore"
                                            disableBack={true}
                                            disableVolume={true}
                                            resizeMode={"contain"}
                                            controls={false}
                                            navigator={false}
                                            disableFullscreen={true}

                                            onEnterFullscreen={this._onEnterFullscreen}
                                            onExitFullscreen={this._onExitFullscreen}

                                            timerText={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    fontSize: 12
                                                }
                                            ]}

                                            style={{
                                                flex: 1,
                                                width: '100%',
                                                marginLeft: 'auto',
                                                marginRight: 'auto'
                                            }}

                                            videoStyle={{
                                                // width: finalVideoWidth,
                                                height: portraitVideoHeight
                                            }} />

                                            {
                                                (item.videoPlayer.paused == true && item.image != '') && (
                                                    <FastImage source={{
                                                        uri: item.image
                                                    }} style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: portraitVideoHeight
                                                    }} resizeMode={"cover"} />
                                                )
                                            }

                                            {
                                                (item.videoPlayer.paused == true && item.videoPlayer.showPlayIcon == true) && (
                                                    <Box style={{
                                                        position: 'absolute',
                                                        zIndex: 1,
                                                        // backgroundColor: COLORS.BLACK_OPACITY_25
                                                    }}>
                                                        <TouchableOpacity onPress={this._onClickedPlayVideo(item)}>
                                                            <Image source={ play_icon } style={{
                                                                width: 50,
                                                                height: 50
                                                            }} />
                                                        </TouchableOpacity>
                                                    </Box>
                                                )
                                            }
                                    </Box>
                                </Col>
                            </Row>
                        )
                    }

                    <Row style={{
                        marginTop: COMMON_STYLE.PADDING
                    }}>
                        <Col>
                            <Grid>
                                <Row style={{
                                    marginTop: COMMON_STYLE.PADDING,
                                    marginBottom: COMMON_STYLE.PADDING
                                }}>
                                    <Col style={{
                                        width: 90
                                    }}>
                                        
                                    </Col>

                                    <Col style={{
                                        alignItems: 'flex-end'
                                    }}>
                                        <HStack space={5}>
                                            <Text style={[
                                                COMMON_STYLES['en'].regular,
                                                {
                                                    color: COLORS.BLACK,
                                                    fontSize: 12,
                                                    lineHeight: Platform.OS == 'android'? 12: 14,
                                                    marginBottom: 0,
                                                    paddingBottom: 0,
                                                    textAlignVertical: 'center'
                                                }
                                            ]} numberOfLines={1}>{ item.newsfeed_comment_count } { t('Comments') }</Text>
                                        
                                            <Text style={[
                                                COMMON_STYLES['en'].regular,
                                                {
                                                    color: COLORS.BLACK,
                                                    fontSize: 12,
                                                    lineHeight: Platform.OS == 'android'? 12: 14,
                                                    marginBottom: 0,
                                                    paddingBottom: 0,
                                                    textAlignVertical: 'center'
                                                }
                                            ]} numberOfLines={1}>{ item.total_shared_count } { t('Shares') }</Text>
                                        </HStack>
                                    </Col>
                                </Row>
                            </Grid>

                            <Grid style={{
                                borderTopWidth: 1,
                                borderTopColor: COLORS.BLACK_OPACITY_25
                            }}>
                                <Row style={{
                                    marginTop: COMMON_STYLE.PADDING
                                }}>
                                    <Col style={{
                                        width: 90
                                    }}>
                                        <TouchableOpacity onPress={this._onClickedNewsfeedLike(item)} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                                            <HStack space={1}>
                                                {
                                                    (item.is_liking_in_progress == true) && (
                                                        <Spinner color={COLORS.GREEN} style={{
                                                            transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
                                                            height: 15
                                                        }} />
                                                    )
                                                }

                                                {
                                                    (item.is_liking_in_progress != true) && (
                                                        <FontAwesomeIcon icon={item.has_liked? faHeart: farHeart} size={15} style={
                                                            { 
                                                                color: COLORS.GREEN
                                                            }
                                                        } />
                                                    )
                                                }

                                                <Text style={[
                                                    COMMON_STYLES['en'].regular,
                                                    {
                                                        color: COLORS.BLACK,
                                                        fontSize: 12,
                                                        lineHeight: Platform.OS == 'android'? 12: 14,
                                                        marginBottom: 0,
                                                        paddingBottom: 0,
                                                        textAlignVertical: 'center'
                                                    }
                                                ]} numberOfLines={1}>{ item.total_liked_count } { t('Likes') }</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    </Col>

                                    <Col style={{
                                        alignItems: 'center'
                                    }}>
                                        <TouchableOpacity onPress={this._onClickedNewsfeedComment(item)} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                                            <HStack space={1}>
                                                <FontAwesomeIcon icon={faComment} size={15} style={
                                                    { 
                                                        color: COLORS.GREEN
                                                    }
                                                } />
                                                <Text style={[
                                                    COMMON_STYLES['en'].regular,
                                                    {
                                                        color: COLORS.BLACK,
                                                        fontSize: 12,
                                                        lineHeight: Platform.OS == 'android'? 12: 14,
                                                        marginBottom: 0,
                                                        paddingBottom: 0,
                                                        textAlignVertical: 'center'
                                                    }
                                                ]} numberOfLines={1}>{ t('Comment') }</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    </Col>

                                    <Col style={{
                                        width: 90,
                                        alignItems: 'flex-end'
                                    }}>
                                        <TouchableOpacity onPress={this._onClickedNewsfeedShare(item)} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                                            <HStack space={1}>
                                                <FontAwesomeIcon icon={faShare} size={15} style={
                                                    { 
                                                        color: COLORS.GREEN
                                                    }
                                                } />
                                                <Text style={[
                                                    COMMON_STYLES['en'].regular,
                                                    {
                                                        color: COLORS.BLACK,
                                                        fontSize: 12,
                                                        lineHeight: 12,
                                                        marginBottom: 0,
                                                        paddingBottom: 0,
                                                        textAlignVertical: 'center'
                                                    }
                                                ]} numberOfLines={1}>{ t('Share') }</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    </Col>
                                </Row>
                            </Grid>
                        </Col>
                    </Row>
                </Grid>
            </Box>
        )

        return renderItem
    }

    componentDidMount() {
        RNPreventScreenshot.enabled(true)
        this.navigationEventListener = Navigation.events().bindComponent(this);
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
        })

        Linking.getInitialURL().then((url) => handleSharedUrl({url: url}))
        // Orientation.addOrientationListener(this._orientationDidChange);
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

    // _orientationDidChange = (orientation) => {
    //     this.orientation = orientation
    //     if(orientation == "LANDSCAPE") {
    //         Navigation.mergeOptions(this.props.componentId, {
    //             bottomTabs: {
    //                 visible: false
    //             }
    //         })
    //     } else {
    //         Navigation.mergeOptions(this.props.componentId, {
    //             bottomTabs: {
    //                 visible: true
    //             }
    //         })
    //     }

    //     this.timeBeforeScreenOrientationChange = this.videoPlayer.player.calculateTimeFromSeekerPosition()

    //     this.setState({
    //         forceRender: !this.state.forceRender
    //     })
    // }

    componentWillUnmount() {
        RNPreventScreenshot.enabled(false)
        if (this.navigationEventListener) {
            this.navigationEventListener.remove();
        }

        if(this.netInfoEventListener) {
            this.netInfoEventListener()
        }

        // Orientation.removeOrientationListener(this._orientationDidChange);
    }

    componentDidAppear() {
        RNPreventScreenshot.enabled(true)
        AsyncStorage.multiGet([
            CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER
        ]).then((storedData) => {
            if(storedData) {
                if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                    let LOGGEDIN_USER = JSON.parse(storedData[0][1])
                    this.LOGGEDIN_USER = LOGGEDIN_USER
                }
            }

            this.setState({
                loading: true
            })
            this.load(true)
        }).catch(() => {
            this.setState({
                loading: true
            })
            this.load(true)
        })

        if(this.backHandler == false) {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
        }
        
        Linking.addEventListener('url', handleSharedUrl)
    }

    componentDidDisappear() {
        RNPreventScreenshot.enabled(false)
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
        const { isConnected, loading } = this.state
        const modalAlert = this.modalAlert

        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')

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
                            (isConnected && loading == true) && (
                                <Spinner color={COLORS.THEME} />
                            )
                        }

                        {
                            (isConnected && loading == false && this.newsfeeds.length == 0) && (
                                <Box style={{
                                    marginTop: 30,
                                    paddingRight: COMMON_STYLE.PADDING,
                                    paddingLeft: COMMON_STYLE.PADDING
                                }}>
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            color: COLORS.THEME
                                        }
                                    ]}>{ t('No newsfeed yet!') }</Text>
                                </Box>
                            )
                        }

                        <FlatList
                            keyExtractor={ (item, index) => 'newsfeeds_' + index.toString() }
                            data={ this.newsfeeds }
                            renderItem={ this.renderNewsfeed }
                            numColumns={1}
                            extraData={this.state}
                            scrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}

                            onEndReached={this._onLoadMore}
                            onEndReachedThreshold={0.5}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onLoadRefresh}
                                />
                            }
                            ListFooterComponent={
                                (this.state.loading_more) && (
                                    <AnimatableBox transition="fadeInDown" style={{
                                        paddingTop: 10,
                                        paddingBottom: 10
                                    }}>
                                        <ActivityIndicator size={35} color={COLORS.WHITE} />
                                    </AnimatableBox>
                                )
                            }
                        />
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

    _onClickedNewsfeedLike = (item) => () => {
        if(item.is_liking_in_progress == true) {
            return false
        }
        const { t, i18n } = this.props

        item.is_liking_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        if(item.has_liked) {
            this.digiedModule.unlikeNewsfeed({ newsfeed_id: item.id })
                .then((response) => {
                    item.is_liking_in_progress = false
                    
                    item.has_liked = 0
                    item.total_liked_count = Number(item.total_liked_count) - 1

                    if(item.total_liked_count <= 0) {
                        item.total_liked_count = 0
                    }
                    
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                
                }).catch((error) => {
                    item.is_liking_in_progress = false
                    var msg = t("Unable to like the newsfeed")
                    if(error.response.data && error.response.data.length > 0) {
                        msg = error.response.data.join('\n')
                    }
                    this.modalAlert = {
                        visible: true,
                        title: t("Like Newsfeed"),
                        description: msg
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                })
        } else {
            this.digiedModule.likeNewsfeed({ newsfeed_id: item.id })
                .then((response) => {
                    item.is_liking_in_progress = false
                    
                    item.has_liked = 1
                    item.total_liked_count = Number(item.total_liked_count) + 1
                    
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                
                }).catch((error) => {
                    item.is_liking_in_progress = false
                    var msg = t("Unable to like the newsfeed")
                    if(error.response.data && error.response.data.length > 0) {
                        msg = error.response.data.join('\n')
                    }
                    this.modalAlert = {
                        visible: true,
                        title: t("Like Newsfeed"),
                        description: msg
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                })
        }
    }

    _onClickedNewsfeedComment = (item) => () => {
        Navigation.push(this.props.componentId, {
            component: {
                name: 'navigation.panntheefoundation.NewsfeedDetailScreen',
                passProps: {
                    item: item
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
    }

    _onClickedNewsfeedShare = (item) => () => {
        const { t, i18n } = this.props
        let url = CommonConstants.weblink + '?_t=newsfeed&_id=' + item.id
        
        if(Platform.OS == "android") {
            const shareOptions = {
                title: CommonConstants.app_name,
                url: url,
                social: "generic"
            };

            Share.shareSingle(shareOptions)
            .then((response) => {
                console.log('shared successfully')

                try {
                    this.digiedModule.shareNewsfeed({ newsfeed_id: item.id })    
                } catch(error) {
                    console.log('Error updating share status')
                    console.log(error)
                }
            })
            .catch(() => {
                this.modalAlert = {
                    visible: true,
                    title: t("Unable to share"),
                    description: t("Unable to share the product. Please contact support team")
                }
                this.setState({
                    forceRender: !this.state.forceRender
                })
            })
        } else {
            ActionSheetIOS.showShareActionSheetWithOptions(
                {
                    title: CommonConstants.app_name,
                    message: url
                }, () => {
                    this.modalAlert = {
                        visible: true,
                        title: t("Unable to share"),
                        description: t("Unable to share the product. Please contact support team")
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }, (result, method) => {
                    console.log('shared successfully')

                    try {
                        this.digiedModule.shareNewsfeed({ newsfeed_id: item.id })
                    } catch(error) {
                        console.log('Error updating share status')
                        console.log(error)
                    }
                }
            )
        }
    }

    _onClickedHome = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTabs: {
                currentTabIndex: 0
            }
        })
    }

    _onClickedPlayVideo = (item) => () => {
        item.videoPlayer.paused = false
        this.setState({
            forceRefresh: !this.state.forceRefresh
        })
    }

    // _onEnterFullscreen = () => {
    //     Orientation.lockToLandscape()
    // }

    // _onExitFullscreen = () => {
    //     Orientation.lockToPortrait()
    // }
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(NewsfeedScreen));
