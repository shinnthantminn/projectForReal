import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, 
    TouchableOpacity, BackHandler, FlatList, StatusBar, Linking, ActionSheetIOS, ImageBackground, RefreshControl } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Button, Spinner } from 'native-base'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faShare, faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import { handleSharedUrl } from '../modules/utils.common.js'

import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import DigiedModule from '../services/digied.module'

import TextBookSubject from '../components/textbook-subject'

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {connect} from 'react-redux'
import NetInfo from "@react-native-community/netinfo"

import ReactNativeParallaxHeader from 'react-native-parallax-header'
import Share from 'react-native-share'
import ModalAlert from '../components/modal-alert'
import FastImage from 'react-native-fast-image'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 44 : 20) : 0;
const HEADER_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 88 : 64) : 64;
const NAV_BAR_HEIGHT = HEADER_HEIGHT - STATUS_BAR_HEIGHT;

const renderHeader = (self, selectedChapter) => ()  => {
    const { t, i18n } = self.props
    const logo_image = require('../assets/images/panthee-logo-no-text.png')

    return (
        <Box style={{ 
            marginTop: 4,
            paddingRight: COMMON_STYLE.PADDING,
            height: 60, 
            borderBottomWidth: 0,
            borderBottomColor: COLORS.BLACK,
            shadowColor: COLORS.BLACK,
            overflow: 'hidden',
            shadowOffset: { 
                width: 0, height: 1
            },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2
        }}>
            <Grid style={{ 
                alignItems: 'flex-end',
                width: width
            }}>
                <Col style={{ width: 60 }}>
                    <TouchableOpacity onPress={self._onClickedBack} style={{
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
                        <TouchableOpacity onPress={self._onClickedHome} style={{
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

const renderContent = (self, selectedChapter) => () => {
    const { t, i18n } = self.props
    
    return (
        <Box>
            {
                (self.state.isConnected && self.state.loading == true) && (
                    <Box style={{
                        marginTop: 10
                    }}>
                        <Spinner color={COLORS.THEME} />
                    </Box>
                )
            }

            {
                (self.state.isConnected && self.state.loading == false && self.tutorials.length == 0) && (
                    <Box style={{
                        marginLeft: COMMON_STYLE.PADDING,
                        marginRight: COMMON_STYLE.PADDING,
                        marginTop: 20
                    }}>
                    <Text style={[
                        COMMON_STYLES[i18n.language].regular,
                        {
                            color: COLORS.THEME
                        }
                    ]}>{ t('More coming soon!') }</Text>
                </Box>
                )
            }
            
            {
                (self.state.isConnected && self.state.loading == false && self.tutorials && self.tutorials.length > 0) && (
                    <FlatList
                        keyExtractor={ (item, index) => 'tutorials_' + index.toString() }
                        data={ self.tutorials }
                        renderItem={ self.renderTutorial }
                        numColumns={1}
                        extraData={self.state}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                    />
                )
            }
            
        </Box>
    )
}

const renderTitle = (self, selectedChapter) => {
    const { t, i18n } = self.props
    const statusBarCurrentHeight = getStatusBarHeight(true)
    const { width, height } = Dimensions.get('window')

    return (
        <Grid style={{
            zIndex: 1
        }}>
            <Col style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 15,
                marginRight: 15,
                flex: 1
            }}>
                <Fragment>
                    {
                        (selectedChapter && selectedChapter.sequence != '') && (
                            <Text style={[
                                COMMON_STYLES[i18n.language].bold,
                                {
                                    color: COLORS.WHITE,
                                    fontSize: 20,
                                    lineHeight: 40,
                                    textAlign: 'center'
                                }
                            ]}>
                                {selectedChapter.sequence }
                            </Text>
                        )
                    }

                    {
                        (selectedChapter && selectedChapter.description != '') && (
                            <Box style={{
                                flexDirection: 'row',
                                width: '100%',
                                height: (selectedChapter.description.length > 45 ? 60: 'auto')
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        color: COLORS.WHITE,
                                        width: '100%',
                                        fontSize: 15,
                                        lineHeight: 30,
                                        textAlign: 'center',
                                        flex: 1, 
                                        flexWrap: 'wrap'
                                    }
                                ]}>
                                    {selectedChapter.description}
                                </Text>
                            </Box>
                        )
                    }

                    <Text style={[
                        COMMON_STYLES[i18n.language].regular,
                        {
                            fontSize: 15,
                            lineHeight: 30,
                            color: COLORS.WHITE,
                            textAlign: 'center'
                        }
                    ]}>
                        { t('Tutorials') }
                    </Text>
                </Fragment>
            </Col>
        </Grid>
    )
}

class ChapterDetailScreen extends React.PureComponent {
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

        this.page = 1
        this.last_loaded_page = 0
        this.has_next = false
        
        this.LOGGEDIN_USER = false

        this.selectedChapter = props.item

        this.tutorials = []

        this.digiedModule = new DigiedModule
        
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

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
        this.navigationEventListener = Navigation.events().bindComponent(this)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())

        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
        })

        const { item } = this.props

        this.selectedChapter = item

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
            this.load()
        }).catch(() => {
            this.setState({
                loading: true
            })
            this.load()
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

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.wishlist_changed && (this.state.wishlist_changed != nextProps.wishlist_changed)) {
            let theTutorial = _.find(this.tutorials, (tutorial) => {
                return tutorial && tutorial.id == nextProps.wishlist_changed.tutorial_id
            })
            if(theTutorial) {
                if(nextProps.wishlist_changed.status == 2) {
                    theTutorial.favourited_info = false    
                } else {
                    theTutorial.favourited_info = nextProps.wishlist_changed    
                }
            }
        }
        return true
    }

    load = () => {
        const { i18n, item } = this.props
        
        this.tutorials = []
        
        this.digiedModule.getTutorialsByChapterId({ page: 'all', chapter_id: item.id })
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
                    this.tutorials.push(tutorial)
                })

                this.setState({
                    loading: false,
                    refreshing: false,
                    forceRender: !this.state.forceRender
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                    refreshing: false,
                    forceRender: !this.state.forceRender
                })
            })
    }

    componentDidAppear() {
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

    _onClickedTutorial = (item) => () => {
        Navigation.push(this.props.componentId, {
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

    renderTutorial = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props
        const logo_image = require('../assets/images/panthee-logo-no-text.png')

        renderItem = (
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
        const state = this.state
        const { width, height } = Dimensions.get('window')
        const { isConnected, loading, loading_collection } = this.state
        const { t, i18n } = this.props
        const selectedChapter = this.selectedChapter
        const modalAlert = this.modalAlert
        const headerMaxHeight = width/1.8
        // const headerMaxHeight = width/1.9
        
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
                    
                    <ImageBackground source={background_image}  style={{
                        flex: 1,
                        width: width,
                        height: loading == true? height: 'auto'
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

                        <ReactNativeParallaxHeader
                            backgroundColor={COLORS.BLACK}
                            backgroundImage={ selectedChapter? selectedChapter.chapter_banner_image: false }
                            backgroundImageScale={1.2}
                            headerMinHeight={headerMaxHeight}
                            headerMaxHeight={headerMaxHeight}
                            extraScrollHeight={headerMaxHeight}
                            statusBarColor={COLORS.WHITE}
                            navbarColor={COLORS.BLACK}
                            title={renderTitle(this, selectedChapter)}
                            renderNavBar={() => {
                                if(selectedChapter && selectedChapter.chapter_banner_image) {
                                    return (
                                        <FastImage source={selectedChapter.chapter_banner_image} style={{
                                            width: null,
                                            height: headerMaxHeight
                                        }} />
                                    )
                                } else {
                                    return (
                                        <Box />
                                    )
                                }
                            }}
                            renderContent={renderContent(this, selectedChapter)}
                            alwaysShowTitle={true}
                            alwaysShowNavBar={false}
                            containerStyle={[
                                COMMON_STYLES.CONTAINER_SECTION,
                                {
                                    backgroundColor: 'transparent'
                                }
                            ]}
                            headerTitleStyle={{
                                zIndex: 1
                            }}
                            scrollViewProps={{ 
                                refreshControl: <RefreshControl refreshing={this.state.refreshing} onRefresh={this._onLoadRefresh} /> 
                            }}
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

    _onClickedShare = () => {
        const { t, i18n } = this.props
        
        if(Platform.OS == "android") {
            const shareOptions = {
                title: CommonConstants.app_name,
                message: 'Studying ' + this.selectedChapter.name,
                // url: CommonConstants.weblink + i18n.language.toLowerCase() + "/products/" + product_link + "/?sku=" + (this.product.sku? this.product.sku: "") + '#' + hash_link,
                social: "generic"
            };

            Share.shareSingle(shareOptions).catch(() => {
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
                    message: 'Studying ' + this.selectedChapter.name
                }, () => {
                    this.modalAlert = {
                        visible: true,
                        title: t("Unable to share"),
                        description: t("Unable to share the product. Please contact support team")
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }, () => {
                    
                }
            )
        }
    }

    _onClickedHome = () => {
        Navigation.popToRoot("home")
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

                AsyncStorage.multiGet([
                    CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS
                ]).then((storedData) => {
                    if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                        let recent_tutorials = JSON.parse(storedData[0][1])

                        if(!recent_tutorials) {
                            recent_tutorials = []
                        }

                        recent_tutorials = _.filter(recent_tutorials, (recent_tutorial) => {
                            return recent_tutorial.id != item.id
                        })

                        recent_tutorials.push(item)

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

                AsyncStorage.multiGet([
                    CommonConstants.PERSISTENT_STORAGE_KEY.RECENT_TUTORIALS
                ]).then((storedData) => {
                    if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                        let recent_tutorials = JSON.parse(storedData[0][1])

                        if(!recent_tutorials) {
                            recent_tutorials = []
                        }

                        recent_tutorials = _.filter(recent_tutorials, (recent_tutorial) => {
                            return recent_tutorial.id != item.id
                        })

                        recent_tutorials.push(item)

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

    _onLoadRefresh = () => {
        if(this.state.refreshing == true) {
            return false
        }

        this.page = 1
        this.setState({
            loading: true,
            refreshing: true
        }, () => {
            this.load()
        })
    
        // reload the page
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ChapterDetailScreen));
