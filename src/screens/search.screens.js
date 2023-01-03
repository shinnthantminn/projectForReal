import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, Linking, StatusBar, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Input, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import DigiedModule from '../services/digied.module'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

Input.defaultProps = Text.defaultProps || {}
Input.defaultProps.allowFontScaling = false

import * as Animatable from 'react-native-animatable'

import NetInfo from "@react-native-community/netinfo"
import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { handleSharedUrl, onBackButtonPressAndroid } from '../modules/utils.common.js'
import FastImage from 'react-native-fast-image'
import ModalAlert from '../components/modal-alert'

AnimatableBox = Animatable.createAnimatableComponent(Box)
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class SearchScreen extends React.PureComponent {
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
            loading_more: false,
            refreshing: false,
            forceRender: false
        }

        this.backHandler = false

        this.keywords = ''

        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.searchKeys = [
            {
                title: 'all',
                key: 'all'
            },
            {
                title: 'course',
                key: 'course'
            },
            {
                title: 'subject',
                key: 'subject'
            },
            {
                title: 'chapter',
                key: 'chapter'
            },
            {
                title: 'tutorial',
                key: 'tutorial'
            }
        ]

        this.selectedSearchKey = this.searchKeys[0]

        this.recentKeywords = []

        this.has_next = false
        this.showSearchResult = false
        this.total_search_result = 0
        this.last_loaded_page = 1
        this.results = []

        this.page = 1
        this.digiedModule = new DigiedModule
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
        if(this.keywords && this.results.length > 0) {
            this.showSearchResult = true
        }
        AsyncStorage.multiGet([
            CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER,
            CommonConstants.PERSISTENT_STORAGE_KEY.SEARCH_RECENT_KEYWORDS
        ]).then((storedData) => {
            if(storedData) {
                if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                    let LOGGEDIN_USER = JSON.parse(storedData[0][1])
                    this.LOGGEDIN_USER = LOGGEDIN_USER
                }

                if(storedData[1] && storedData[1][1] != null && storedData[1][1] != false) {
                    let SEARCH_RECENT_KEYWORDS = JSON.parse(storedData[1][1])
                    this.recentKeywords = SEARCH_RECENT_KEYWORDS
                }

                this.setState({
                    forceRender: !this.state.forceRender
                })
            }
        })

        if(this.backHandler == false) {
            const { t } = this.props
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => onBackButtonPressAndroid(t))
        }
        
        Linking.addEventListener('url', handleSharedUrl)
    }

    componentDidDisappear() {
        this.showSearchResult = false
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
        const default_image = require('../assets/images/panthee-logo.png')

        if(this.state.refreshing == true || forceRefresh == true) {
            this.results = []
        }

        this.digiedModule.search({ page: this.page, per_page: 10, search_type: this.selectedSearchKey.key, keywords: this.keywords })
            .then((response) => {
                this.total_search_result = response.data.total_display
                this.has_next = (response.data.has_more == 1)
                _.each(response.data.data, (data, index) => {
                    let result = data

                    if(result.title_l10n) {
                        try {
                            let title_l10n = JSON.parse(result.title_l10n)
                            result.title_l10n = title_l10n
                        } catch(e) {

                        }
                    }

                    if(i18n.language != 'en' && result.title_l10n && result.title_l10n[i18n.language]) {
                        result.title = result.title_l10n[i18n.language]
                    }

                    result.sequence = result.chapter_no

                    if(result.chapter_no_l10n) {
                        try {
                            let chapter_no_l10n = JSON.parse(result.chapter_no_l10n)
                            result.sequence = chapter_no_l10n
                        } catch(e) {

                        }
                    }
                    
                    result.sequence = result.chapter_no

                    if(i18n.language != 'en' && result.chapter_no_l10n && result.chapter_no_l10n[i18n.language]) {
                        result.sequence = result.chapter_no_l10n[i18n.language]
                    }

                    if(result.image) {
                        result.image = {
                            uri: CommonConstants.storage_endpoint + '/' + result.image
                        }
                    } else {
                        result.image = default_image
                    }

                    if(data.type == 'tutorial') {
                        let tutorial = _.find(response.data.tutorials, (tutorial) => {
                            return tutorial.id == result.id
                        })

                        if(tutorial) {
                            if(tutorial.tutorial_video_file) {
                                // tutorial.video_url = CommonConstants.streaming_endpoint + '/digied-module/tutorials/' + tutorial.tutorial_hash_ref + '.m3u8'
                                tutorial.video_url = CommonConstants.storage_endpoint + '/digied-module/tutorials/' + tutorial.tutorial_hash_ref + '.m3u8'
                            }

                            if(tutorial.tutorial_summary_pdf_file) {
                                tutorial.tutorial_summary_pdf_file = CommonConstants.storage_endpoint + '/' + tutorial.tutorial_summary_pdf_file
                            }

                            tutorial.favourited_info = _.find(response.data.favourited_tutorials, (favourited_tutorial) => {
                                return favourited_tutorial.tutorial_id == tutorial.id
                            })

                            tutorial.total_favourited_count = response.data.total_favourited_count
                            tutorial.total_favourited_count_display = response.data.total_favourited_count_display

                            result.tutorial = tutorial
                        }
                    }

                    this.results.push(result)
                })
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


    _onClickedSearch = () => {
        const { t } = this.props
        if(!this.keywords) {
            this.modalAlert = {
                visible: true,
                title: t("Search Keywords Required"),
                description: t("Please provide search keywords")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false
        }
        this.showSearchResult = true

        let recentKeywords = _.filter(this.recentKeywords, (recentKeyword) => {
            return recentKeyword.toString().toLowerCase() != this.keywords.toString().toLowerCase()
        })

        this.recentKeywords = recentKeywords

        if(this.recentKeywords.length >= 10) {
            this.recentKeywords.shift()
        }

        this.recentKeywords.push({
            keywords: this.keywords
        })

        AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.SEARCH_RECENT_KEYWORDS, JSON.stringify(this.recentKeywords))
        
        this.setState({
            loading: true,
            forceRender: !this.state.forceRender
        })

        this.page = 1
        this.load(true)
    }

    _onClickedSearchKey = (item) => () => {
        this.selectedSearchKey = item
        this.setState({
            forceRender: !this.state.forceRender
        })
        this.page = 1
        this._onClickedSearch()
    }

    renderSearchKey = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <TouchableOpacity onPress={this._onClickedSearchKey(item)}>
                <AnimatableBox animation={"fadeIn"} style={{
                    backgroundColor: (this.selectedSearchKey && this.selectedSearchKey.key == item.key? COLORS.THEME: COLORS.BLACK),
                    borderRadius: 15,
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 5,
                    paddingBottom: 5,
                    marginLeft: 5
                }}>
                    <Text style={[
                        COMMON_STYLES[i18n.language].regular,
                        {
                            color: (this.selectedSearchKey && this.selectedSearchKey.key == item.key? COLORS.BLACK: COLORS.WHITE)
                        }
                    ]} numberOfLines={1}>{item.title}</Text>
                </AnimatableBox>
            </TouchableOpacity>
        )

        return renderItem
    }

    _onClickedRecentKeywords = (item) => () => {
        this.keywords = item.keywords
        this.setState({
            forceRender: !this.state.forceRender
        })

        this._onClickedSearch()
    }

    renderRecentKeywords = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <TouchableOpacity onPress={this._onClickedRecentKeywords(item)}>
                <AnimatableBox animation={"fadeIn"} style={{
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.GRAY,
                    paddingTop: COMMON_STYLE.PADDING,
                    paddingBottom: COMMON_STYLE.PADDING
                }}>
                    <Text style={[
                        COMMON_STYLES[i18n.language].regular,
                        {
                            color: COLORS.BLACK
                        }
                    ]} numberOfLines={1}>{item.keywords}</Text>
                </AnimatableBox>
            </TouchableOpacity>
        )

        return renderItem
    }

    _onClickedSearchResultItem = (item) => () => {
        if(item.type == 'course') {
            item.description = item.title
            Navigation.push(this.props.componentId, {
                component: {
                    name: 'navigation.panntheefoundation.SubjectsListingScreen',
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
                            // right: {
                            //     visible: false
                            // }
                        }
                    }
                }
            })
        } else if(item.type == 'subject') {
            item.description = item.title
            Navigation.push(this.props.componentId, {
                component: {
                    name: 'navigation.panntheefoundation.SubjectDetailScreen',
                    passProps: {
                        item: item
                    },
                    options: {
                        animations: {
                            push: {
                                waitForRender: true
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
                            // right: {
                            //     visible: false
                            // }
                        }
                    }
                }
            })
        } else if(item.type == 'chapter') {
            item.name = item.title
            item.description = item.title
            item.chapter_banner_image = item.image
            Navigation.push(this.props.componentId, {
                component: {
                    name: 'navigation.panntheefoundation.ChapterDetailScreen',
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
                            // right: {
                            //     visible: false
                            // }
                        }
                    }
                }
            })
        } else if(item.type == 'tutorial') {
            let newItem = {
                id: item.id,
                title: item.title,
                title_l10n: item.title_l10n,
                description: item.title
            }
            if(item.tutorial) {
                newItem.video_url = item.tutorial.video_url
                newItem.tutorial_summary_pdf_file = item.tutorial.tutorial_summary_pdf_file
                newItem.favourited_info = item.tutorial.favourited_info
                newItem.total_favourited_count = item.tutorial.total_favourited_count
                newItem.total_favourited_count_display = item.tutorial.total_favourited_count_display
            }
            Navigation.push("search", {
                component: {
                    name: 'navigation.panntheefoundation.MainPlayerScreen',
                    passProps: {
                        item: newItem
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
    }

    renderSearchResult = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <TouchableOpacity onPress={this._onClickedSearchResultItem(item)}>
                <AnimatableBox animation={"fadeIn"} style={{
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.GRAY,
                    paddingTop: COMMON_STYLE.PADDING,
                    paddingBottom: COMMON_STYLE.PADDING
                }}>
                    <Grid>
                        <Row>
                            <Col style={{
                                width: 60,
                                marginRight: 10
                            }}>
                                <FastImage source={ item.image } style={{
                                    height: 60,
                                    width: 60
                                }} />
                            </Col>
                            <Col style={{
                                justifyContent: 'center'
                            }}>
                                <Box>
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].bold,
                                        {
                                            color: COLORS.BLACK
                                        }
                                    ]} numberOfLines={1}>{item.title}</Text>
                                </Box>
                            </Col>
                        </Row>
                    </Grid>
                </AnimatableBox>
            </TouchableOpacity>
        )

        return renderItem
    }
    
    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n } = this.props
        const { width, height } = Dimensions.get('window')
        const modalAlert = this.modalAlert

        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')

        if(this.recentKeywords && this.recentKeywords.length > 0) {
            this.recentKeywords = this.recentKeywords.reverse()    
        }

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

                        <Box style={{
                            height: height
                        }}>
                            <Box style={{
                                marginTop: 10,
                                marginLeft: COMMON_STYLE.PADDING,
                                marginRight: COMMON_STYLE.PADDING
                            }}>
                                <Input 
                                    InputLeftElement={
                                        <FontAwesomeIcon icon={faSearch} size={20} style={
                                            { 
                                                marginLeft: 5,
                                                color: COLORS.BLACK
                                            }
                                        } />
                                    }
                                    defaultValue={ this.keywords }
                                    onChangeText={(text) => {
                                        let previousKeywords = this.keywords
                                        this.keywords = text

                                        if(previousKeywords == '' || this.keywords == '') {
                                            this.setState({
                                                forceRender: !this.state.forceRender
                                            })
                                        }
                                    }}
                                    placeholder="Course, subject, chapter, tutorial" 
                                    placeholderTextColor={COLORS.BLACK}
                                    returnKeyType={"search"}
                                    onSubmitEditing={this._onClickedSearch}
                                    style={[
                                        COMMON_STYLES[i18n.language].input
                                    ]} />

                                {
                                    (this.keywords != '') && (
                                        <AnimatableBox transition="fadeIn" style={{
                                            position: 'absolute',
                                            top: 15,
                                            right: 10
                                        }}>
                                            <TouchableOpacity onPress={this._onClickedClearSearchKeywords}>
                                                <FontAwesomeIcon icon={faTimes} size={20} style={
                                                    { 
                                                        color: COLORS.GRAY
                                                    }
                                                } />
                                            </TouchableOpacity>
                                        </AnimatableBox>
                                    )
                                }
                            </Box>

                            <Box style={{
                                marginLeft: COMMON_STYLE.PADDING,
                                marginTop: 20
                            }}>
                                <FlatList
                                    keyExtractor={ (item, index) => 'key_' + index.toString() }
                                    data={ this.searchKeys }
                                    renderItem={ this.renderSearchKey }
                                    numColumns={1}
                                    extraData={this.state}
                                    scrollEnabled={true}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    horizontal={true}
                                    initialNumToRender={10}
                                />
                            </Box>

                            {
                                (this.showSearchResult == false && this.recentKeywords && this.recentKeywords.length > 0) && (
                                    <Box style={{
                                        marginLeft: COMMON_STYLE.PADDING,
                                        marginRight: COMMON_STYLE.PADDING,
                                        marginTop: 20,
                                        height: (height - 230)
                                    }}>
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].bold,
                                            {
                                                color: COLORS.BLACK
                                            }
                                        ]}>{ t('Recent keywords') }</Text>

                                        <FlatList
                                            keyExtractor={ (item, index) => 'keywords_' + index.toString() }
                                            data={ this.recentKeywords }
                                            renderItem={ this.renderRecentKeywords }
                                            numColumns={1}
                                            extraData={this.state}
                                            scrollEnabled={true}
                                            showsVerticalScrollIndicator={false}
                                            horizontal={false}
                                            initialNumToRender={10}
                                        />
                                    </Box>
                                )
                            }

                            {
                                (this.showSearchResult == true && this.state.loading == true) && (
                                    <Box style={{
                                        marginTop: 20
                                    }}>
                                        <Spinner color={COLORS.THEME} />
                                    </Box>
                                )
                            }

                            {
                                (this.showSearchResult == true && this.state.loading == false && this.results && this.results.length > 0) && (
                                    <Box style={{
                                        marginLeft: COMMON_STYLE.PADDING,
                                        marginRight: COMMON_STYLE.PADDING,
                                        marginTop: 20,
                                        height: (height - 230),
                                    }}>
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].bold,
                                            {
                                                color: COLORS.BLACK
                                            }
                                        ]}>{ t('Search result found') } - { this.total_search_result }</Text>

                                        <FlatList
                                            keyExtractor={ (item, index) => 'results_' + index.toString() }
                                            data={ this.results }
                                            renderItem={ this.renderSearchResult }
                                            numColumns={1}
                                            extraData={this.state}
                                            scrollEnabled={true}
                                            showsVerticalScrollIndicator={false}
                                            horizontal={false}
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
                                                        <ActivityIndicator size={35} color={COLORS.BLACK} />
                                                    </AnimatableBox>
                                                )

                                            }
                                        />
                                    </Box>
                                )
                            }

                            {
                                (this.showSearchResult == true && this.state.loading == false&& this.results && this.results.length == 0) && (
                                    <Box style={{
                                            marginLeft: COMMON_STYLE.PADDING,
                                            marginRight: COMMON_STYLE.PADDING,
                                            marginTop: 20
                                        }}>
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].regular,
                                            {
                                                color: COLORS.BLACK
                                            }
                                        ]}>{ t('No result found') }</Text>
                                    </Box>
                                )
                            }
                        </Box>
                    </ImageBackground>
                        
                </SafeAreaView>
            </NativeBaseProvider>
        )
    }

    _onClickedHome = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTabs: {
                currentTabIndex: 0
            }
        })
    }

    _onClickedClearSearchKeywords = () => {
        this.keywords = ''
        this.results = []

        this.setState({
            forceRender: !this.state.forceRender
        })
    }
}

export default withTranslation()(SearchScreen)