import React, { Fragment } from 'react'
import { StyleSheet, KeyboardAvoidingView, ScrollView, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, TouchableHighlight, BackHandler, FlatList, StatusBar, Linking, RefreshControl, ActivityIndicator, ImageBackground, ActionSheetIOS, Keyboard } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Spinner, HStack, VStack, Input } from 'native-base'
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
import { series } from 'async'
import Share from 'react-native-share'

import VideoPlayer from 'react-native-video-controls'
import Orientation from 'react-native-orientation'
import RNPreventScreenshot from 'react-native-prevent-screenshot'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'
import ReadMore from '@fawazahmed/react-native-read-more'

class NewsfeedDetailScreen extends React.PureComponent {
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

        this.orientation = Orientation.getInitialOrientation()
        this.backHandler = false

        this.LOGGEDIN_USER = false

        this.newsfeed_detail = {
            id: props.item.id,
            newsfeed_type: props.item.newsfeed_type,
            title: props.item.title,
            content: props.item.content,
            image: props.item.image,
            video_url: props.item.video_url,
            tutorial_id: props.item.tutorial_id,
            tutorial: props.item.tutorial,
            sequence: props.item.sequence,
            key: props.item.id.toString(),
            has_liked: props.item.has_liked,
            is_liking_in_progress: false,
            total_liked_count: props.item.total_liked_count || 0,
            has_shared: props.item.has_shared,
            total_shared_count: props.item.total_shared_count || 0,
            newsfeed_comment_count: props.item.newsfeed_comment_count || 0,
            created_at_display: props.item.created_at_display,
            created_at_ago_display: props.item.created_at_ago_display,
            comments: []
        }

        this.digiedModule = new DigiedModule
        
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.form = {
            comment: ''
        }

        this.page = 1

        // default is to show comment box because user click comment to come to this screen
        this.show_write_comment = true

        this.selectedComment = false

        this.commenting_in_progress = false

        this.videoPlayer = {
            player: false,
            paused: true,
            showPlayIcon: true
        }

        this.timeBeforeScreenOrientationChange = 0;

        this.commentRef = false
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
            this.load(true)
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
            this.newsfeed_detail.comments = []
        }

        this.digiedModule.getNewsfeedComments({ newsfeed_id: this.props.item.id, page: this.page, per_page: 10, include_sub_comments_per_page: 5 })
            .then((response) => {
                _.each(response.data.data, (data, index) => {
                    let comment = {
                        id: data._id,
                        newsfeed_id: data.newsfeed_id,
                        parent_comment_id: data.parent_comment_id,
                        commented_by_type: data.commented_by_type,
                        created_by: data.created_by,
                        comment: data.comment,
                        total_liked_count: data.total_liked_count,
                        has_liked: data.has_liked,
                        is_liking_in_progress: false,
                        sub_comments: [],
                        sub_comment_page: 1,
                        sub_comment_has_next: false,
                        is_sub_comment_loading: false,
                        created_at_display: data.created_at_display,
                        created_at_ago_display: data.created_at_ago_display
                    }

                    comment.created_by_user = _.find(response.data.created_by_users, (created_by_user) => {
                        return created_by_user.id == comment.created_by
                    })

                    if(comment.created_by_user && comment.created_by_user.profile_image) {
                        comment.created_by_user = _.clone(comment.created_by_user)
                        comment.created_by_user.profile_image = CommonConstants.storage_endpoint + '/' + comment.created_by_user.profile_image
                    }

                    let sub_comment_total = _.find(response.data.sub_comment_total_counts, (sub_comment_total_count) => {
                        return sub_comment_total_count.parent_comment_id == comment.id
                    })

                    if(sub_comment_total) {
                        let sub_comments = _.filter(response.data.sub_comments, (sub_comment) => {
                            return sub_comment.parent_comment_id == comment.id
                        })

                        if(sub_comment_total.count > 5) {
                            comment.sub_comment_has_next = true
                        }

                        _.each(sub_comments, (sub_comment) => {
                            let subcomment = {
                                id: sub_comment._id,
                                newsfeed_id: sub_comment.newsfeed_id,
                                parent_comment_id: sub_comment.parent_comment_id,
                                commented_by_type: sub_comment.commented_by_type,
                                created_by: sub_comment.created_by,
                                comment: sub_comment.comment,
                                total_liked_count: sub_comment.total_liked_count,
                                has_liked: sub_comment.has_liked,
                                is_liking_in_progress: false,
                                created_at_display: sub_comment.created_at_display,
                                created_at_ago_display: sub_comment.created_at_ago_display
                            }

                            subcomment.created_by_user = _.find(response.data.created_by_users, (created_by_user) => {
                                return created_by_user.id == subcomment.created_by
                            })

                            if(subcomment.created_by_user && subcomment.created_by_user.profile_image) {
                                subcomment.created_by_user = _.clone(subcomment.created_by_user)
                                subcomment.created_by_user.profile_image = CommonConstants.storage_endpoint + '/' + subcomment.created_by_user.profile_image
                            }

                            comment.sub_comments.push(subcomment)
                        })
                    }
                    
                    this.newsfeed_detail.comments.push(comment)
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
                this.setState({
                    loading: false,
                    refreshing: false,
                    loading_more: false,
                    forceRender: !this.state.forceRender
                })
            })
    }

    _onLoadMoreSubcomments = (comment) => () => {
    
        if(comment.is_sub_comment_loading == true) {
            return false
        }
        if(comment.sub_comment_has_next == false) {
            return false
        }
        comment.is_sub_comment_loading = true
        comment.sub_comment_page = comment.sub_comment_page + 1

        this.setState({
            forceRefresh: !this.state.forceRefresh
        })

        this.loadSubComments(comment)
    }

    loadSubComments = (comment, forceRefresh) => {
        const { i18n } = this.props
        
        if(forceRefresh == true) {
            comment.sub_comment_page = 1
            comment.sub_comments = []
        }

        this.digiedModule.getNewsfeedComments({ newsfeed_id: this.props.item.id, parent_comment_id: comment.id, page: comment.sub_comment_page, per_page: 5 })
            .then((response) => {
                _.each(response.data.data, (data, index) => {
                    let subcomment = {
                        id: data._id,
                        newsfeed_id: data.newsfeed_id,
                        parent_comment_id: data.parent_comment_id,
                        commented_by_type: data.commented_by_type,
                        created_by: data.created_by,
                        comment: data.comment,
                        total_liked_count: data.total_liked_count,
                        has_liked: data.has_liked,
                        is_liking_in_progress: false,
                        sub_comments: [],
                        sub_comment_page: 1,
                        is_sub_comment_loading: false
                    }

                    subcomment.created_by_user = _.find(response.data.created_by_users, (created_by_user) => {
                        return created_by_user.id == subcomment.created_by
                    })

                    if(subcomment.created_by_user && subcomment.created_by_user.profile_image) {
                        subcomment.created_by_user = _.clone(subcomment.created_by_user)
                        subcomment.created_by_user.profile_image = CommonConstants.storage_endpoint + '/' + subcomment.created_by_user.profile_image
                    }

                    comment.sub_comments.push(subcomment)
                })

                if((response.data.meta.current_page * response.data.meta.per_page) < response.data.meta.total) {
                    comment.sub_comment_has_next = true
                } else {
                    comment.sub_comment_has_next = false
                }

                comment.is_sub_comment_loading = false

                this.setState({
                    forceRender: !this.state.forceRender
                })
            }).catch((error) => {
                comment.is_sub_comment_loading = false
                this.setState({
                    forceRender: !this.state.forceRender
                })
            })
    }

    renderNewsfeedComment = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props
        const logo_image = require('../assets/images/panthee-logo-no-text.png')

        const finalWidth = width - ((COMMON_STYLE.PADDING * 2) + 10 + ((item.parent_comment_id? 10: 0)))

        renderItem = (
            
            <Fragment>
                <Box style={{
                    width: finalWidth,
                    minHeight: 100,
                    paddingLeft: COMMON_STYLE.PADDING,
                    paddingRight: COMMON_STYLE.PADDING,
                    paddingTop: COMMON_STYLE.PADDING,
                    paddingBottom: COMMON_STYLE.PADDING,
                    marginLeft: COMMON_STYLE.PADDING + 10 + (item.parent_comment_id? 10: 0),
                    marginRight: COMMON_STYLE.PADDING,
                    marginTop: 5,
                    backgroundColor: COLORS.WHITE,
                    borderWidth: 1,
                    borderColor: COLORS.WHITE,
                    borderRadius: 12
                }}>
                    <Grid>
                        <Row>
                            <Col style={{
                                width: 40,
                                alignItems: 'center'
                            }}>
                                {
                                    (item.commented_by_type == 1 && item.created_by_user && item.created_by_user.profile_image) && (
                                        <Box style={{
                                            backgroundColor: 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 20,
                                            width: 40,
                                            height: 40,
                                            overflow: 'hidden'
                                        }}>
                                            <FastImage source={{
                                                uri: item.created_by_user.profile_image
                                            }} style={{
                                                width: 40,
                                                height: 40
                                            }} resizeMode={"cover"} />
                                        </Box>
                                    )
                                }

                                {
                                    (item.commented_by_type == 2 || !item.created_by_user || (item.created_by_user && !item.created_by_user.profile_image)) && (
                                        <Box style={{
                                            backgroundColor: item.commented_by_type == 2? COLORS.WHITE: COLORS.GREEN,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 20,
                                            width: 40,
                                            height: 40
                                        }}>
                                            {
                                                (item.commented_by_type == 2) && (
                                                    <Image source={logo_image} style={{
                                                        width: 40,
                                                        height: 45,
                                                    }} />
                                                )
                                            }

                                            {
                                                (item.commented_by_type != 2) && (
                                                    <FontAwesomeIcon icon={faUser} size={20} style={
                                                        { 
                                                            color: COLORS.WHITE
                                                        }
                                                    } />
                                                )
                                            }
                                        </Box>
                                    )   
                                }
                            </Col>

                            <Col style={{
                                paddingLeft: 10
                            }}>
                                <VStack space={1}>
                                    {
                                        (item.commented_by_type == 2) && (
                                            <Text style={[
                                                COMMON_STYLES['en'].regular,
                                                {
                                                    color: COLORS.BLACK,
                                                    marginBottom: 0,
                                                    paddingBottom: 0,
                                                    textAlignVertical: 'center'
                                                }
                                            ]} numberOfLines={1}>Pann Thee Education</Text>
                                        )
                                    }

                                    {
                                        (item.commented_by_type == 1 && item.created_by_user) && (
                                            <Text style={[
                                                COMMON_STYLES['en'].bold,
                                                {
                                                    color: COLORS.BLACK,
                                                    marginBottom: 0,
                                                    paddingBottom: 0,
                                                    textAlignVertical: 'center'
                                                }
                                            ]} numberOfLines={1}>{ item.created_by_user.first_name } { item.created_by_user.last_name }</Text>
                                        )
                                    }

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
                                        numberOfLines={Platform.OS == 'android'? 2: 1}>{ item.comment }</ReadMore>
                                    </Box>
                                </VStack>
                            </Col>
                        </Row>

                        <Row style={{
                            marginTop: COMMON_STYLE.PADDING
                        }}>
                            <Col>
                                <Grid style={{
                                    borderTopWidth: 1,
                                    borderTopColor: COLORS.BLACK_OPACITY_25
                                }}>
                                    <Row style={{
                                        marginTop: COMMON_STYLE.PADDING
                                    }}>
                                        <Col style={{
                                            width: 60
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
                                            ]} numberOfLines={1}>{ item.created_at_ago_display }</Text>
                                        </Col>
                                        <Col style={{
                                            width: 90
                                        }}>
                                            <TouchableOpacity onPress={this._onClickedNewsfeedCommentLike(item)}>
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
                                                        (item.is_liking_in_progress == false) && (
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
                                            {
                                                (!item.parent_comment_id) && (
                                                    <TouchableOpacity onPress={this._onClickedNewsfeedCommentReply(item)}>
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
                                                            ]} numberOfLines={1}>{ t('Reply') }</Text>
                                                        </HStack>
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </Col>
                                    </Row>
                                </Grid>
                            </Col>
                        </Row>
                    </Grid>
                </Box>

                {
                    (item.sub_comments && item.sub_comments.length > 0) && (
                        <FlatList
                            keyExtractor={ (item, index) => 'newsfeeds_subcomment_' + index.toString() }
                            data={ item.sub_comments }
                            renderItem={ this.renderNewsfeedComment }
                            numColumns={1}
                            extraData={this.state}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={5}
                            
                            ListFooterComponent={
                                (item.sub_comment_has_next) && (
                                    <Box style={{
                                        marginTop: 10,
                                        marginBottom: 10
                                    }}>
                                        {
                                            (item.is_sub_comment_loading == true) && (
                                                <AnimatableBox transition="fadeInDown">
                                                    <ActivityIndicator size={15} color={COLORS.THEME} />
                                                </AnimatableBox>
                                            )
                                        }

                                        {
                                            (item.is_sub_comment_loading != true) && (
                                                <TouchableOpacity onPress={this._onLoadMoreSubcomments(item)}>
                                                    <Text style={[
                                                        COMMON_STYLES[i18n.language].regular,
                                                        {
                                                            color: COLORS.BLACK,
                                                            textAlign: 'center'
                                                        }
                                                    ]}>{ t('view older comments') }</Text>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </Box>
                                )
                            }
                        />
                    )
                }
            </Fragment>
        )

        return renderItem
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
        Orientation.addOrientationListener(this._orientationDidChange);
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove();
        }

        if(this.netInfoEventListener) {
            this.netInfoEventListener()
        }

        Orientation.removeOrientationListener(this._orientationDidChange);
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

        if(this.videoPlayer.player != false) {
            this.timeBeforeScreenOrientationChange = this.videoPlayer.player.calculateTimeFromSeekerPosition()    
        }

        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    componentDidAppear() {
        this.newsfeed_detail = {
            id: this.props.item.id,
            newsfeed_type: this.props.item.newsfeed_type,
            title: this.props.item.title,
            content: this.props.item.content,
            image: this.props.item.image,
            video_url: this.props.item.video_url,
            tutorial_id: this.props.item.tutorial_id,
            tutorial: this.props.item.tutorial,
            sequence: this.props.item.sequence,
            key: this.props.item.id.toString(),
            has_liked: this.props.item.has_liked,
            is_liking_in_progress: false,
            total_liked_count: this.props.item.total_liked_count || 0,
            newsfeed_comment_count: this.props.item.newsfeed_comment_count || 0,
            has_shared: this.props.item.has_shared,
            total_shared_count: this.props.item.total_shared_count || 0,
            created_at_display: this.props.item.created_at_display,
            created_at_ago_display: this.props.item.created_at_ago_display,
            comments: []
        }

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

        const finalWidth = width - (COMMON_STYLE.PADDING * 2)
        const imageWidth = (this.newsfeed_detail && this.newsfeed_detail.image? (finalWidth - (COMMON_STYLE.PADDING * 2)): 0)

        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')
        const comment_send_image = require('../assets/images/comment-send.png')
        const play_icon = require('../assets/images/play1.png')

        let finalVideoWidth = (finalWidth - (COMMON_STYLE.PADDING * 2))
        let finalVideoHeight = height

        if(finalVideoWidth > finalVideoHeight) {
            finalVideoWidth = height
            finalVideoHeight = width
        }

        // because we dont want black background on top and bottom of the video
        const portraitVideoHeight = finalWidth/1.8

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
                        {
                            (this.orientation == "PORTRAIT") && (
                                <Box style={{ 
                                    paddingRight: COMMON_STYLE.PADDING,
                                    height: 60, 
                                    overflow: 'hidden',
                                    borderBottomWidth: 1,
                                    borderBottomColor: COLORS.THEME
                                }}>
                                    <Grid style={{ alignItems: 'flex-end' }}>
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
                                                justifyContent: 'center',
                                                marginRight: 10
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
                            )
                        }
                        
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
                            (isConnected && loading == false && !this.newsfeed_detail) && (
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
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{
                              flex: 1
                            }}
                            keyboardVerticalOffset={50}
                        >
                            {
                                (isConnected && loading == false && this.newsfeed_detail && this.orientation == "PORTRAIT") && (
                                    <Fragment>
                                        <FlatList
                                            keyExtractor={ (item, index) => 'newsfeeds_comment_' + index.toString() }
                                            data={ this.newsfeed_detail.comments }
                                            renderItem={ this.renderNewsfeedComment }
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
                                            ListHeaderComponent={
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
                                                    <Box style={{
                                                        height: 40
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
                                                                        ]} numberOfLines={1}>{ this.newsfeed_detail.created_at_display }</Text>
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
                                                        </Grid>
                                                    </Box>

                                                    <Box style={{
                                                        marginTop: COMMON_STYLE.PADDING
                                                    }}>
                                                        <Text style={[
                                                            COMMON_STYLES['en'].regular,
                                                            {
                                                                color: COLORS.BLACK,
                                                                marginBottom: 0,
                                                                paddingBottom: 0,
                                                                textAlignVertical: 'center'
                                                            }
                                                        ]}>{ this.newsfeed_detail.content }</Text>
                                                    </Box>

                                                    {
                                                        (this.newsfeed_detail.video_url == '' && this.newsfeed_detail.image != '') && (
                                                            <Row style={{
                                                                marginTop: COMMON_STYLE.PADDING
                                                            }}>
                                                                <Col style={{
                                                                    justifyContent: 'flex-start'
                                                                }}>
                                                                    <FastImage source={{
                                                                        uri: this.newsfeed_detail.image
                                                                    }} style={{
                                                                        width: '100%',
                                                                        height: portraitVideoHeight
                                                                    }} resizeMode={"cover"} />
                                                                </Col>
                                                            </Row>
                                                        )
                                                    }

                                                    {
                                                        (this.newsfeed_detail.video_url != '') && (
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
                                                                                uri: this.newsfeed_detail.video_url
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
                                                                            onHideControls={() => {
                                                                                if(this.videoPlayer.showPlayIcon == false) {
                                                                                    this.videoPlayer.showPlayIcon = true
                                                                                    this.setState({
                                                                                        forceRender: !this.state.forceRender
                                                                                    })
                                                                                }
                                                                            }}
                                                                            onShowControls={() => {
                                                                                if(this.videoPlayer.showPlayIcon == true) {
                                                                                    this.videoPlayer.showPlayIcon = false
                                                                                    this.setState({
                                                                                        forceRender: !this.state.forceRender
                                                                                    })
                                                                                }
                                                                            }}
                                                                            ignoreSilentSwitch="ignore"
                                                                            disableBack={true}
                                                                            disableVolume={true}
                                                                            resizeMode={this.orientation == "PORTRAIT"? "contain": "contain"}
                                                                            controls={false}
                                                                            navigator={false}
                                                                            disableFullscreen={false}

                                                                            onEnterFullscreen={this._onEnterFullscreen}
                                                                            onExitFullscreen={this._onExitFullscreen}

                                                                            timerText={[
                                                                                COMMON_STYLES[i18n.language].regular,
                                                                                {
                                                                                    fontSize: 12
                                                                                }
                                                                            ]}

                                                                            style={{
                                                                                width: '100%',
                                                                                marginLeft: 'auto',
                                                                                marginRight: 'auto'
                                                                            }}

                                                                            videoStyle={{
                                                                                // width: finalVideoWidth,
                                                                                height: portraitVideoHeight
                                                                            }} />

                                                                            {
                                                                                (this.videoPlayer.paused == true && this.newsfeed_detail.image != '') && (
                                                                                    <FastImage source={{
                                                                                        uri: this.newsfeed_detail.image
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
                                                                                (this.videoPlayer.paused == true && this.videoPlayer.showPlayIcon == true) && (
                                                                                    <Box style={{
                                                                                        position: 'absolute',
                                                                                        zIndex: 1,
                                                                                        // backgroundColor: COLORS.BLACK_OPACITY_25
                                                                                    }}>
                                                                                        <TouchableOpacity onPress={this._onClickedPlayVideo}>
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

                                                    <Box style={{
                                                        marginTop: (COMMON_STYLE.PADDING * 2),
                                                        height: 55
                                                    }}> 
                                                        <Grid>
                                                            <Row>
                                                                <Col style={{
                                                                    width: 90
                                                                }}>
                                                                    
                                                                </Col>

                                                                <Col style={{
                                                                    alignItems: 'flex-end',
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
                                                                        ]} numberOfLines={1}>{ this.newsfeed_detail.newsfeed_comment_count } { t('Comments') }</Text>
                                                                    
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
                                                                        ]} numberOfLines={1}>{ this.newsfeed_detail.total_shared_count } { t('Shares') }</Text>
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
                                                                    <TouchableOpacity onPress={this._onClickedNewsfeedLike}>
                                                                        <HStack space={1}>
                                                                            {
                                                                                (this.newsfeed_detail.is_liking_in_progress == true) && (
                                                                                    <Spinner color={COLORS.GREEN} style={{
                                                                                        transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
                                                                                        height: 15
                                                                                    }} />
                                                                                )
                                                                            }

                                                                            {
                                                                                (this.newsfeed_detail.is_liking_in_progress == false) && (
                                                                                    <FontAwesomeIcon icon={this.newsfeed_detail.has_liked? faHeart: farHeart} size={15} style={
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
                                                                                    lineHeight: 12,
                                                                                    marginBottom: 0,
                                                                                    paddingBottom: 0,
                                                                                    textAlignVertical: 'center'
                                                                                }
                                                                            ]} numberOfLines={1}>{ this.newsfeed_detail.total_liked_count } { t('Likes') }</Text>
                                                                        </HStack>
                                                                    </TouchableOpacity>
                                                                </Col>

                                                                <Col style={{
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <TouchableOpacity onPress={this._onClickedNewsfeedComment()}>
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
                                                                                    lineHeight: 12,
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
                                                                    <TouchableOpacity onPress={this._onClickedNewsfeedShare}>
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
                                                    </Box>
                                                </Box>
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
                                        
                                        <Box style={{
                                            height: this.show_write_comment == true? 20: 5
                                        }}>
                                        </Box>

                                        {
                                            (this.show_write_comment == true) && (
                                                
                                                <Box style={{
                                                    marginLeft: 5,
                                                    marginBottom: 5,
                                                    height: 40,
                                                    width: width - 5,
                                                    borderTopWidth: 0,
                                                    borderTopColor: COLORS.BLACK_OPACITY_25
                                                }}> 
                                                    {
                                                        (this.commenting_in_progress == true) && (
                                                            <Spinner color={COLORS.GREEN} style={{
                                                                transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
                                                                height: 15
                                                            }} />
                                                        )
                                                    }

                                                    {
                                                        (this.commenting_in_progress != true) && (
                                                            <Box style={{
                                                                flex: 1,
                                                                flexDirection: 'row'
                                                            }}>
                                                                <Input 
                                                                    ref={(ref) => { this.commentRef = ref }}
                                                                    defaultValue={this.form.comment}
                                                                    isFullWidth={false}
                                                                    multiline={true}
                                                                    blurOnSubmit={false}
                                                                    onChangeText={(value) => {
                                                                        this.form.comment = value
                                                                    }}
                                                                    placeholder="write a comment" 
                                                                    placeholderTextColor={COLORS.BLACK_OPACITY_50}

                                                                    _focus={
                                                                        style={
                                                                            borderWidth: 0
                                                                        }
                                                                    }

                                                                    pt={Platform.OS=='android'? 1:3}
                                                                    pl={5}
                                                                    pb={0}
                                                                    pr={5}

                                                                    style={[
                                                                        COMMON_STYLES[i18n.language].input, 
                                                                        {
                                                                            width: width - 60,
                                                                            height: 40,
                                                                            borderWidth: 0,
                                                                            borderRadius: 25,
                                                                            backgroundColor: COLORS.GRAY
                                                                        }
                                                                    ]}

                                                                    keyboardType="default"
                                                                    returnKeyType="done"

                                                                    />

                                                                <TouchableOpacity onPress={this._onClickedNewsfeedCommentSubmit} style={{
                                                                    width: 60,
                                                                    height: 40,
                                                                    padding: 5,
                                                                    borderRadius: 0,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    <Image source={comment_send_image} style={{
                                                                        width: 40,
                                                                        height: 40
                                                                    }} />
                                                                </TouchableOpacity>
                                                            </Box>
                                                        )
                                                    }
                                                </Box>
                                                
                                            )
                                        }
                                        
                                    </Fragment>
                                )
                            }
                        </KeyboardAvoidingView>

                        {
                            (isConnected && loading == false && this.newsfeed_detail && this.orientation == "LANDSCAPE") && (
                                <Box style={{
                                    width: finalVideoHeight,
                                    height: '100%',
                                    backgroundColor: COLORS.BLACK,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                }}>
                                    <VideoPlayer source={{
                                            uri: this.newsfeed_detail.video_url
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
                                        onHideControls={() => {
                                            if(this.videoPlayer.showPlayIcon == false) {
                                                this.videoPlayer.showPlayIcon = true
                                                this.setState({
                                                    forceRender: !this.state.forceRender
                                                })
                                            }
                                        }}
                                        onShowControls={() => {
                                            if(this.videoPlayer.showPlayIcon == true) {
                                                this.videoPlayer.showPlayIcon = false
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

                                        {
                                            (this.videoPlayer.paused == true && this.newsfeed_detail.image != '') && (
                                                <FastImage source={{
                                                    uri: this.newsfeed_detail.image
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
                                            (this.videoPlayer.paused == true && this.videoPlayer.showPlayIcon == true) && (
                                                <Box style={{
                                                    position: 'absolute',
                                                    zIndex: 1,
                                                    // backgroundColor: COLORS.BLACK_OPACITY_25
                                                }}>
                                                    <TouchableOpacity onPress={this._onClickedPlayVideo}>
                                                        <Image source={ play_icon } style={{
                                                            width: 50,
                                                            height: 50
                                                        }} />
                                                    </TouchableOpacity>
                                                </Box>
                                            )
                                        }
                                </Box>
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

    _onClickedNewsfeedLike = () => {
        if(this.newsfeed_detail.is_liking_in_progress == true) {
            return false
        }
        const { t, i18n } = this.props

        this.newsfeed_detail.is_liking_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        if(this.newsfeed_detail.has_liked) {
            this.digiedModule.unlikeNewsfeed({ newsfeed_id: this.newsfeed_detail.id })
                .then((response) => {
                    this.newsfeed_detail.is_liking_in_progress = false
                    this.newsfeed_detail.has_liked = false
                    this.newsfeed_detail.total_liked_count = Number(this.newsfeed_detail.total_liked_count) - 1
                    
                    if(this.newsfeed_detail.total_liked_count <= 0) {
                        this.newsfeed_detail.total_liked_count = 0
                    }
                    
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                
                }).catch((error) => {
                    this.newsfeed_detail.is_liking_in_progress = false
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
            this.digiedModule.likeNewsfeed({ newsfeed_id: this.newsfeed_detail.id })
                .then((response) => {
                    this.newsfeed_detail.is_liking_in_progress = false
                    this.newsfeed_detail.has_liked = true
                    this.newsfeed_detail.total_liked_count = Number(this.newsfeed_detail.total_liked_count) + 1
                    
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                
                }).catch((error) => {
                    this.newsfeed_detail.is_liking_in_progress = false
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

    _onClickedNewsfeedShare = () => {
        const { t, i18n } = this.props
        let url = CommonConstants.weblink + '?_t=newsfeed&_id=' + this.newsfeed_detail.id
        
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
                    this.digiedModule.shareNewsfeed({ newsfeed_id: this.newsfeed_detail.id })    
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
                        this.digiedModule.shareNewsfeed({ newsfeed_id: this.newsfeed_detail.id })    
                    } catch(error) {
                        console.log('Error updating share status')
                        console.log(error)
                    }
                }
            )
        }
    }

    _onClickedNewsfeedCommentLike = (item) => () => {
        if(item.is_liking_in_progress == true) {
            return false
        }
        const { t, i18n } = this.props

        item.is_liking_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        if(item.has_liked) {
            this.digiedModule.unlikeNewsfeedComment({ newsfeed_id: item.newsfeed_id, newsfeed_comment_id: item.id })
                .then((response) => {
                    item.is_liking_in_progress = false
                    
                    item.has_liked = false
                    item.total_liked_count = Number(item.total_liked_count) - 1

                    if(item.total_liked_count <= 0) {
                        item.total_liked_count = 0
                    }
                    
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                
                }).catch((error) => {
                    item.is_liking_in_progress = false
                    var msg = t("Unable to like the newsfeed comment")
                    if(error.response.data && error.response.data.length > 0) {
                        msg = error.response.data.join('\n')
                    }
                    this.modalAlert = {
                        visible: true,
                        title: t("Like Newsfeed Comment"),
                        description: msg
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                })
        } else {
            this.digiedModule.likeNewsfeedComment({ newsfeed_id: item.newsfeed_id, newsfeed_comment_id: item.id })
                .then((response) => {
                    item.is_liking_in_progress = false
                    
                    item.has_liked = 1
                    item.total_liked_count = Number(item.total_liked_count) + 1
                    
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                
                }).catch((error) => {
                    item.is_liking_in_progress = false
                    var msg = t("Unable to like the newsfeed comment")
                    if(error.response.data && error.response.data.length > 0) {
                        msg = error.response.data.join('\n')
                    }
                    this.modalAlert = {
                        visible: true,
                        title: t("Like Newsfeed Comment"),
                        description: msg
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                })
        }
    }

    _onClickedNewsfeedComment = () => () => {
        this.show_write_comment = true

        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    _onClickedNewsfeedCommentReply = (item) => () => {
        this.selectedComment = item
        this.show_write_comment = true

        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    _onClickedNewsfeedCommentSubmit = () => {
        if(this.commenting_in_progress == true) {
            return false
        }

        if(!this.form.comment) {
            return false
        }

        const { t, i18n } = this.props

        let newsfeed_id = this.newsfeed_detail.id
        let newsfeed_comment_id = false
        
        if(this.selectedComment) {
            if(this.selectedComment.parent_comment_id) {
                newsfeed_comment_id = this.selectedComment.parent_comment_id
            } else {
                newsfeed_comment_id = this.selectedComment.id    
            }
        }

        this.commenting_in_progress = true
        this.digiedModule.replyComment({ newsfeed_id: newsfeed_id, newsfeed_comment_id: newsfeed_comment_id, comment: this.form.comment })
            .then((response) => {
                this.commenting_in_progress = false
                this.form.comment = ''
                this.selectedComment = false
                this.show_write_comment = true

                let data = response.data.data
                let comment = {
                    id: data._id,
                    newsfeed_id: data.newsfeed_id,
                    parent_comment_id: data.parent_comment_id,
                    commented_by_type: data.commented_by_type,
                    created_by: data.created_by,
                    comment: data.comment,
                    total_liked_count: 0,
                    has_liked: 0,
                    is_liking_in_progress: false,
                    sub_comments: [],
                    sub_comment_page: 1,
                    is_sub_comment_loading: false,
                    created_at_ago_display: 'just now'
                }

                comment.created_by_user = _.find(response.data.created_by_users, (created_by_user) => {
                    return created_by_user.id == comment.created_by
                })

                if(comment.created_by_user && comment.created_by_user.profile_image) {
                    comment.created_by_user = _.clone(comment.created_by_user)
                    comment.created_by_user.profile_image = CommonConstants.storage_endpoint + '/' + comment.created_by_user.profile_image
                }

                if(!newsfeed_comment_id) {
                    this.newsfeed_detail.comments.push(comment)    
                } else {
                    let parentComment = _.find(this.newsfeed_detail.comments, (parentComment) => {
                        return parentComment.id == newsfeed_comment_id
                    })

                    if(parentComment) {
                        parentComment.sub_comments.push(comment)
                    }
                }

                if(this.commentRef) {
                    this.commentRef.setNativeProps({ text: '' })    
                }
                
                Keyboard.dismiss()

                this.setState({
                    forceRender: !this.state.forceRender
                })
            
            }).catch((error) => {
                this.commenting_in_progress = false
                this.show_write_comment = true

                Keyboard.dismiss()

                var msg = t("Unable to comment")
                if(error.response.data && error.response.data.length > 0) {
                    msg = error.response.data.join('\n')
                }
                this.modalAlert = {
                    visible: true,
                    title: t("Newsfeed Comment"),
                    description: msg
                }
                this.setState({
                    forceRender: !this.state.forceRender
                })
            })
    }

    _onClickedHome = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTabs: {
                currentTabIndex: 0
            }
        })
    }

    _onEnterFullscreen = () => {
        Orientation.lockToLandscape()
    }

    _onExitFullscreen = () => {
        Orientation.lockToPortrait()
    }

    _onClickedPlayVideo = () => {
        this.videoPlayer.paused = false
        this.setState({
            forceRefresh: !this.state.forceRefresh
        })
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(NewsfeedDetailScreen));
