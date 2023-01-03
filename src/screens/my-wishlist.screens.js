import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, TouchableHighlight, BackHandler, FlatList, StatusBar, Linking, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faHeart } from '@fortawesome/free-solid-svg-icons'
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
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class MyWishlistScreen extends React.PureComponent {
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
            // loading: true,
            loading: false,
            loading_more: false,
            refreshing: false,
            isConnected: true
        }

        this.backHandler = false

        this.LOGGEDIN_USER = false

        this.favourited_tutorials = []

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
            this.favourited_tutorials = []
        }

        this.digiedModule.getFavouritedTutorials({ page: this.page, per_page: 10 })
            .then((response) => {
                _.each(response.data.data, (data, index) => {
                    let favourited_tutorial = {
                        id: data._id,
                        tutorial_id: data.tutorial_id,
                        sequence: (index + 1),
                        key: data._id.toString()
                    }

                    favourited_tutorial.tutorial = _.find(response.data.tutorials, (tutorial) => {
                        return tutorial.id == data.tutorial_id
                    })

                    if(favourited_tutorial.tutorial) {
                        favourited_tutorial.tutorial.tutorial_title = favourited_tutorial.tutorial.tutorial_title

                        if(i18n.language != 'en' && favourited_tutorial.tutorial.tutorial_title_l10n && favourited_tutorial.tutorial.tutorial_title_l10n[i18n.language]) {
                            favourited_tutorial.tutorial.tutorial_title = favourited_tutorial.tutorial.tutorial_title_l10n[i18n.language]
                        }

                        favourited_tutorial.tutorial.description = favourited_tutorial.tutorial.tutorial_description

                        if(i18n.language != 'en' && favourited_tutorial.tutorial.tutorial_description_l10n && favourited_tutorial.tutorial.tutorial_description_l10n[i18n.language]) {
                            favourited_tutorial.tutorial.description = favourited_tutorial.tutorial.tutorial_description_l10n[i18n.language]
                        }

                        if(favourited_tutorial.tutorial.tutorial_image) {
                            favourited_tutorial.tutorial.tutorial_image = CommonConstants.storage_endpoint + '/' + favourited_tutorial.tutorial.tutorial_image
                        }

                        if(favourited_tutorial.tutorial.chapter) {
                            favourited_tutorial.tutorial.chapter_no = favourited_tutorial.tutorial.chapter.chapter_no

                            if(i18n.language != 'en' && favourited_tutorial.tutorial.chapter.chapter_no_l10n && favourited_tutorial.tutorial.chapter.chapter_no_l10n[i18n.language]) {
                                favourited_tutorial.tutorial.chapter_no = favourited_tutorial.tutorial.chapter.chapter_no_l10n[i18n.language]
                            }

                            favourited_tutorial.tutorial.chapter_title = favourited_tutorial.tutorial.chapter.chapter_title

                            if(i18n.language != 'en' && favourited_tutorial.tutorial.chapter.chapter_title_l10n && favourited_tutorial.tutorial.chapter.chapter_title_l10n[i18n.language]) {
                                favourited_tutorial.tutorial.chapter_title = favourited_tutorial.tutorial.chapter.chapter_title_l10n[i18n.language]
                            }

                            if(favourited_tutorial.tutorial.chapter.subject) {
                                favourited_tutorial.tutorial.subject_title = favourited_tutorial.tutorial.chapter.subject.subject_name

                                if(i18n.language != 'en' && favourited_tutorial.tutorial.chapter.subject.subject_name_l10n && favourited_tutorial.tutorial.chapter.subject.subject_name_l10n[i18n.language]) {
                                    favourited_tutorial.tutorial.subject_title = favourited_tutorial.tutorial.chapter.subject.subject_name_l10n[i18n.language]
                                }

                                if(favourited_tutorial.tutorial.chapter.subject.course) {
                                    favourited_tutorial.tutorial.course_title = favourited_tutorial.tutorial.chapter.subject.course.course_name

                                    if(i18n.language != 'en' && favourited_tutorial.tutorial.chapter.subject.course.course_name_l10n && favourited_tutorial.tutorial.chapter.subject.course.course_name_l10n[i18n.language]) {
                                        favourited_tutorial.tutorial.course_title = favourited_tutorial.tutorial.chapter.subject.course.course_name_l10n[i18n.language]
                                    }

                                    if(favourited_tutorial.tutorial.chapter.subject.course.course_category) {
                                        favourited_tutorial.tutorial.course_category_title = favourited_tutorial.tutorial.chapter.subject.course.course_category.course_category_name

                                        if(i18n.language != 'en' && favourited_tutorial.tutorial.chapter.subject.course.course_category.course_category_name_l10n && favourited_tutorial.tutorial.chapter.subject.course.course_category.course_category_name_l10n[i18n.language]) {
                                            favourited_tutorial.tutorial.course_category_title = favourited_tutorial.tutorial.chapter.subject.course.course_category.course_category_name_l10n[i18n.language]
                                        }
                                    }
                                }
                            }
                        }

                        if(favourited_tutorial.tutorial.tutorial_video_file) {
                            // favourited_tutorial.tutorial.video_url = CommonConstants.streaming_endpoint + '/digied-module/tutorials/' + favourited_tutorial.tutorial.tutorial_hash_ref + '.m3u8'
                            favourited_tutorial.tutorial.video_url = CommonConstants.storage_endpoint + '/digied-module/tutorials/' + favourited_tutorial.tutorial.tutorial_hash_ref + '.m3u8'                            
                        }

                        if(favourited_tutorial.tutorial.tutorial_summary_pdf_file) {
                            favourited_tutorial.tutorial.tutorial_summary_pdf_file = CommonConstants.storage_endpoint + '/' + favourited_tutorial.tutorial.tutorial_summary_pdf_file
                        }

                        favourited_tutorial.tutorial.favourited_info = {
                            _id: data._id,
                            tutorial_id: data.tutorial_id
                        }

                        favourited_tutorial.tutorial.is_favourting_in_progress = false
                        favourited_tutorial.tutorial.total_favourited_count = response.data.total_favourited_count_by_id[data.tutorial_id.toString()]
                        favourited_tutorial.tutorial.total_favourited_count_display = response.data.total_favourited_count_by_id_display[data.tutorial_id.toString()]
                    }

                    favourited_tutorial.is_unfavourting_in_progress = false

                    this.favourited_tutorials.push(favourited_tutorial)
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
             <Box>
                <TouchableOpacity onPress={this._onClickedTutorial(item)}>
                    <Box style={{
                        // height: (i18n.language == "mm" || i18n.language == "zg")? 90: 120,
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
                                    (item.tutorial && item.tutorial.tutorial_image) && (
                                        <FastImage source={{
                                            uri: item.tutorial.tutorial_image
                                        }} style={{
                                            width: 110,
                                            height: '100%'
                                        }} resizeMode={"contain"} />
                                    )
                                }

                                {
                                    (!item.tutorial && !item.tutorial.tutorial_image) && (
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
                                            ]} numberOfLines={2}>{item.tutorial.course_title} , {item.tutorial.subject_title}</Text>
                                        )
                                    }

                                    {
                                        (i18n.language != 'en') && (
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].regular,
                                                {
                                                    color: COLORS.BLACK
                                                }
                                            ]} numberOfLines={2}>{item.tutorial.course_title} ၊ {item.tutorial.subject_title}</Text>
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
                                    ]} numberOfLines={2}>{item.tutorial.chapter_no} {item.tutorial.tutorial_title}</Text>
                                </Box>
                            </Col>
                            <Col style={{
                                width: 40,
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                paddingTop: 5
                            }}>
                                {
                                    (item.is_unfavourting_in_progress == true) && (
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
                                    (item.is_unfavourting_in_progress == false) && (
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
            </Box>
        )

        return renderItem
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
            const { t } = this.props
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
                            (isConnected && loading == false && this.favourited_tutorials.length == 0) && (
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
                                    ]}>{ t('No tutorial in your favorite list yet!') }</Text>
                                </Box>
                            )
                        }

                        <FlatList
                            keyExtractor={ (item, index) => 'tutorials_' + index.toString() }
                            data={ this.favourited_tutorials }
                            renderItem={ this.renderTutorial }
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

    _onClickedTutorial = (item) => () => {
        Navigation.push("wishlist", {
            component: {
                name: 'navigation.panntheefoundation.MainPlayerScreen',
                passProps: {
                    item: item.tutorial
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

    _onClickedUnfavourite = (item) => () => {
        const { t, i18n } = this.props

        item.is_unfavourting_in_progress = true
        this.setState({
            forceRender: !this.state.forceRender
        })

        this.digiedModule.unfavouriteTutorial({ tutorial_id: item.tutorial_id })
            .then((response) => {
                item.is_unfavourting_in_progress = false
                response.data.data.status = 2
                this.props.updateWishlistChanged(response.data.data)

                this.favourited_tutorials = _.filter(this.favourited_tutorials, (favourited_tutorial) => {
                    return favourited_tutorial.tutorial_id != item.tutorial_id
                })
                
                item.tutorial.total_favourited_count = response.data.total_favourited_count
                item.tutorial.total_favourited_count_display = response.data.total_favourited_count_display

                this.load(true)

                this.page = 1
                this.setState({
                    loading: true,
                    forceRender: !this.state.forceRender
                })
            
            }).catch((error) => {
                item.is_unfavourting_in_progress = false
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
        wishlist_changed: state.wishlist_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateWishlistChanged: (wishlist_changed) => dispatch({ type: 'WISHLIST_CHANGED', payload: wishlist_changed })
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(MyWishlistScreen));
