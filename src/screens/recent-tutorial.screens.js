import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, StatusBar, ImageBackground, Linking, RefreshControl, ActivityIndicator } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from "@react-native-community/netinfo"

import { handleSharedUrl, onBackButtonPressAndroid } from '../modules/utils.common.js'
import FastImage from 'react-native-fast-image'
import DigiedModule from '../services/digied.module'

import {connect} from 'react-redux'

import * as Animatable from 'react-native-animatable'

AnimatableBox = Animatable.createAnimatableComponent(Box);
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class RecentTutorialScreen extends React.PureComponent {
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
            loading: false,
            isConnected: true,
            login_changed: false,
            wishlist_changed: false
        }

        this.digiedModule = new DigiedModule
        this.recent_tutorial_ids = []
        this.recent_tutorials = []
    }

    componentDidMount() {
        const { t } = this.props
        this.navigationEventListener = Navigation.events().bindComponent(this);
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => onBackButtonPressAndroid(t))    
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
        const { t, i18n } = this.props
        
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
                    this.recent_tutorial_ids = _.map(RECENT_TUTORIALS, 'id')
                }

                if(this.recent_tutorial_ids && this.recent_tutorial_ids.length > 0) {
                    this.load(true)    
                }
                
                this.setState({
                    loading: true,
                    forceRender: !this.state.forceRender
                })
            }
        })

        if(this.backHandler == false) {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => onBackButtonPressAndroid(t))    
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
            this.recent_tutorials = []
        }

        this.digiedModule.getTutorialsByIds({ page: this.page, ids: this.recent_tutorial_ids.join(',') })
            .then((response) => {
                const image = require('../assets/images/panthee-logo.png')

                _.each(response.data.data, (data, index) => {
                    let tutorial = {
                        id: data.id,
                        sequence: (index + 1),
                        title: data.tutorial_title,
                        title_en: data.tutorial_title,
                        description: data.tutorial_description,
                        description_en: data.tutorial_description,
                        tutorial_hash_ref: data.tutorial_hash_ref
                    }

                    if(data.tutorial_image) {
                        tutorial.tutorial_image = CommonConstants.storage_endpoint + '/' + data.tutorial_image
                    }

                    if(i18n.language != 'en' && data.tutorial_title_l10n && data.tutorial_title_l10n[i18n.language]) {
                        tutorial.title = data.tutorial_title_l10n[i18n.language]
                        tutorial.tutorial_title_l10n = data.tutorial_title_l10n
                    }

                    if(i18n.language != 'en' && data.tutorial_description_l10n && data.tutorial_description_l10n[i18n.language]) {
                        tutorial.description = data.tutorial_description_l10n[i18n.language]
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

                        if(i18n.language != 'en' && data.chapter.chapter_no_l10n && data.chapter.chapter_no_l10n[i18n.language]) {
                            tutorial.chapter_no = data.chapter.chapter_no_l10n[i18n.language]
                            tutorial.chapter_no_l10n = data.chapter.chapter_no_l10n
                        }

                        tutorial.chapter_title = data.chapter.chapter_title
                        tutorial.chapter_title_en = data.chapter.chapter_title

                        if(i18n.language != 'en' && data.chapter.chapter_title_l10n && data.chapter.chapter_title_l10n[i18n.language]) {
                            tutorial.chapter_title = data.chapter.chapter_title_l10n[i18n.language]
                            tutorial.chapter_title_l10n = data.chapter.chapter_title_l10n
                        }

                        if(data.chapter.subject) {
                            tutorial.subject_title = data.chapter.subject.subject_name
                            tutorial.subject_title_en = data.chapter.subject.subject_name

                            if(i18n.language != 'en' && data.chapter.subject.subject_name_l10n && data.chapter.subject.subject_name_l10n[i18n.language]) {
                                tutorial.subject_title = data.chapter.subject.subject_name_l10n[i18n.language]
                                tutorial.subject_name_l10n = data.chapter.subject.subject_name_l10n
                            }

                            if(data.chapter.subject.course) {
                                tutorial.course_title = data.chapter.subject.course.course_name
                                tutorial.course_title_en = data.chapter.subject.course.course_name

                                if(i18n.language != 'en' && data.chapter.subject.course.course_name_l10n && data.chapter.subject.course.course_name_l10n[i18n.language]) {
                                    tutorial.course_title = data.chapter.subject.course.course_name_l10n[i18n.language]
                                    tutorial.course_name_l10n = data.chapter.subject.course.course_name_l10n
                                }

                                if(data.chapter.subject.course.course_category) {
                                    tutorial.course_category_title = data.chapter.subject.course.course_category.course_category_name
                                    tutorial.course_category_title_en = data.chapter.subject.course.course_category.course_category_name

                                    if(i18n.language != 'en' && data.chapter.subject.course.course_category.course_category_name_l10n && data.chapter.subject.course.course_category.course_category_name_l10n[i18n.language]) {
                                        tutorial.course_category_title = data.chapter.subject.course.course_category.course_category_name_l10n[i18n.language]
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
                    this.recent_tutorials.push(tutorial)
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
    
    renderTutorial = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props
        const logo_image = require('../assets/images/panthee-logo-no-text.png')

        renderItem = (
            <TouchableOpacity onPress={this._onClickedTutorial(item)}>
                <Box style={{
                    paddingLeft: COMMON_STYLE.PADDING,
                    paddingRight: COMMON_STYLE.PADDING,
                    paddingTop: COMMON_STYLE.PADDING,
                    paddingBottom: COMMON_STYLE.PADDING,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.BLACK
                }}>
                    <Grid>
                        <Col style={{
                            width: 120,
                            justifyContent: 'flex-start'
                        }}>
                            {
                                (item.tutorial_image) && (
                                    <FastImage source={{
                                        uri: item.tutorial_image
                                    }} style={{
                                        width: 110,
                                        height: '100%'
                                    }} resizeMode={"contain"} />
                                )
                            }

                            {
                                (!item.tutorial_image) && (
                                    <Image source={logo_image} style={{
                                        width: null,
                                        height: 50
                                    }} resizeMode={"contain"} />
                                )
                            }
                        </Col>
                        <Col style={{
                            justifyContent: 'flex-start',
                            marginLeft: 5
                        }}>
                            <Box>
                                {
                                    (i18n.language == 'en') && (
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].regular,
                                            {
                                                color: COLORS.BLACK
                                            }
                                        ]} numberOfLines={2}>{item.course_title} , {item.subject_title}</Text>
                                    )
                                }

                                {
                                    (i18n.language != 'en') && (
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].regular,
                                            {
                                                color: COLORS.BLACK
                                            }
                                        ]} numberOfLines={2}>{item.course_title} ၊ {item.subject_title}</Text>
                                    )
                                }
                            </Box>

                            <Box style={{
                                marginTop: 5
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        color: COLORS.BLACK
                                    }
                                ]} numberOfLines={2}>{item.chapter_no} {item.title}</Text>
                            </Box>
                        </Col>
                        <Col style={{
                            width: 40,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingTop: 5
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
                                    <TouchableOpacity onPress={this._onClickedFavourite(item)} style={{ 
                                        width: 30, 
                                        height: 30, 
                                        justifyContent: 'flex-start', 
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
                                    <TouchableOpacity onPress={this._onClickedUnfavourite(item)} style={{ 
                                        width: 30, 
                                        height: 30, 
                                        justifyContent: 'flex-start', 
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
                </Box>
            </TouchableOpacity>
        )

        return renderItem
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n } = this.props
        const { loading, isConnected } = this.state
        const { width, height } = Dimensions.get('window')

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
                            </Grid>
                        </Box>

                        {
                            (isConnected && loading == false && this.recent_tutorials.length == 0) && (
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
                                    ]}>{ t('No recent record') }</Text>
                                </Box>
                            )
                        }

                        <FlatList
                            keyExtractor={ (item, index) => 'tutorials_' + index.toString() }
                            data={ this.recent_tutorials }
                            renderItem={ this.renderTutorial }
                            numColumns={1}
                            extraData={self.state}
                            scrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}

                            onEndReached={this._onLoadMore}
                            onEndReachedThreshold={0.5}
                            refreshControl={
                                <RefreshControl
                                    progressViewOffset={-height}
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

    _onClickedTutorial = (item) => () => {
        // show popup screen and play the video
        Navigation.push("recent", {
            component: {
                name: 'navigation.panntheefoundation.MainPlayerScreen',
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

    _onClickedHome = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTabs: {
                currentTabIndex: 0
            }
        })
    }

    _onClickedFavourite = (item) => () => {
        const { t, i18n } = this.props

        item.is_favourting_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        this.digiedModule.favouriteTutorial({ tutorial_id: item.id })
            .then((response) => {
                item.is_favourting_in_progress = false
                this.props.updateWishlistChanged(response.data.data)

                item.favourited_info = response.data.data
                item.total_favourited_count = response.data.total_favourited_count
                item.total_favourited_count_display = response.data.total_favourited_count_display

                this.setState({
                    forceRender: !this.state.forceRender
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

    _onClickedUnfavourite = (item) => () => {
        const { t, i18n } = this.props

        item.is_favourting_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        this.digiedModule.unfavouriteTutorial({ tutorial_id: item.id })
            .then((response) => {
                item.is_favourting_in_progress = false
                response.data.data.status = 2
                this.props.updateWishlistChanged(response.data.data)
                
                item.favourited_info = false
                item.total_favourited_count = response.data.total_favourited_count
                item.total_favourited_count_display = response.data.total_favourited_count_display
                
                this.setState({
                    forceRender: !this.state.forceRender
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
}

function mapStateToProps(state) {
    return {
        login_changed: state.login_changed,
        wishlist_changed: state.wishlist_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateWishlistChanged: (wishlist_changed) => dispatch({ type: 'WISHLIST_CHANGED', payload: wishlist_changed })
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(RecentTutorialScreen));
