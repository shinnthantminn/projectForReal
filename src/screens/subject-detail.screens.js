import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, ScrollView, Dimensions, Image, Animated, TouchableOpacity, TouchableHighlight, BackHandler, FlatList, StatusBar, Linking, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

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

import { SwipeListView } from 'react-native-swipe-list-view';
import ModalAlert from '../components/modal-alert'

import * as Animatable from 'react-native-animatable'

AnimatableBox = Animatable.createAnimatableComponent(Box)
import FastImage from 'react-native-fast-image'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class SubjectDetailScreen extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            login_changed: false,
            
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

        this.selectedSubject = props.item

        this.chapters = []

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

    load = () => {
        const { i18n } = this.props
        
        this.chapters = []
        
        this.digiedModule.getChaptersBySubjectId({ page: 'all', subject_id: this.selectedSubject.id })
            .then((response) => {
                const image = require('../assets/images/panthee-logo.png')

                _.each(response.data.data, (data, index) => {
                    let chapter = {
                        id: data.id,
                        sequence: data.chapter_no,
                        description: data.chapter_title
                    }

                    if(i18n.language != 'en' && data.chapter_no_l10n && data.chapter_no_l10n[i18n.language]) {
                        chapter.sequence = data.chapter_no_l10n[i18n.language]
                    }

                    if(i18n.language != 'en' && data.chapter_title_l10n && data.chapter_title_l10n[i18n.language]) {
                        chapter.description = data.chapter_title_l10n[i18n.language]
                    }

                    if(data.chapter_banner_image) {
                        chapter.chapter_banner_image = {
                            uri: CommonConstants.storage_endpoint + '/' + data.chapter_banner_image
                        }
                    } else {
                        chapter.chapter_banner_image = image
                    }

                    if(data.subject) {
                        chapter.subject = {
                            id: data.subject.id,
                            subject_name: data.subject.subject_name
                        }

                        if(i18n.language != 'en' && data.subject.subject_name_l10n && data.subject.subject_name_l10n[i18n.language]) {
                            chapter.subject.subject_name = data.subject.subject_name_l10n[i18n.language]
                        }

                        if(data.subject.subject_cover_image) {
                            chapter.subject.cover_image = {
                                uri: CommonConstants.storage_endpoint + '/' + data.subject.subject_cover_image
                            }
                        } else {
                            chapter.subject.cover_image = image
                        }

                        if(data.subject.course) {
                            chapter.course = {
                                id: data.subject.course.id,
                                course_name: data.subject.course.course_name
                            }

                            if(i18n.language != 'en' && data.subject.course.course_name_l10n && data.subject.course.course_name_l10n[i18n.language]) {
                                chapter.course.course_name = data.subject.course.course_name_l10n[i18n.language]
                            }
                        }
                    }

                    this.chapters.push(chapter)
                })

                this.setState({
                    loading: false,
                    forceRender: !this.state.forceRender
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                    forceRender: !this.state.forceRender
                })
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

        this.selectedSubject = item

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

    _onClickedChapter = (item) => () => {
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
                    }
                }
            }
        })
    }

    renderChapter = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <TouchableOpacity onPress={this._onClickedChapter(item)}>
                <Box style={{
                    minHeight: 90,
                    paddingLeft: COMMON_STYLE.PADDING,
                    paddingRight: COMMON_STYLE.PADDING,
                    paddingTop: COMMON_STYLE.PADDING,
                    paddingBottom: COMMON_STYLE.PADDING,
                    marginLeft: COMMON_STYLE.PADDING,
                    marginRight: COMMON_STYLE.PADDING,
                    marginBottom: COMMON_STYLE.PADDING,
                    backgroundColor: 'rgba(243,245,242,0.25)',
                    borderWidth: 1,
                    borderColor: 'rgba(243,245,242,0.25)',
                    borderRadius: 12
                }}>
                    <Grid>
                        <Row>
                            <Col style={{
                                justifyContent: 'flex-start'
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].bold,
                                    {
                                        color: COLORS.THEME,
                                        textAlignVertical: 'center'
                                    }
                                ]} numberOfLines={1}>{item.sequence}</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{
                                justifyContent: 'flex-start'
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        color: COLORS.THEME,
                                        textAlignVertical: 'center'
                                    }
                                ]} numberOfLines={3}>{item.description}</Text>
                            </Col>
                        </Row>
                    </Grid>
                </Box>
            </TouchableOpacity>
        )

        return renderItem
    }

    render() {
        const { width, height } = Dimensions.get('window')
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n } = this.props
        const { isConnected, loading } = this.state
        const modalAlert = this.modalAlert

        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')

        const selectedSubject = this.selectedSubject

        const theCoverImageHeight = (width)/1.8

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
                            (isConnected && loading == false && this.chapters.length == 0) && (
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
                                    ]}>{ t('More coming soon!') }</Text>
                                </Box>
                            )
                        }

                        {
                            (isConnected && loading == false && this.chapters.length > 0) && (

                                <Fragment>
                                    <Box style={{
                                        width: width,
                                        height: theCoverImageHeight,
                                        marginTop: 20,
                                        marginBottom: 0
                                    }}>
                                        {
                                            (selectedSubject.subject_banner_image) && (
                                                <FastImage source={selectedSubject.subject_banner_image} style={{
                                                    width: (width - 20),
                                                    height: theCoverImageHeight,
                                                    marginLeft: 'auto',
                                                    marginRight: 'auto'
                                                }} resizeMode={"contain"} />
                                            )
                                        }

                                        <Box style={{
                                            position: 'absolute',
                                            top: theCoverImageHeight/3,
                                            zIndex: 1
                                        }}>
                                            <Grid style={{
                                                width: width
                                            }}>
                                                <Col style={{
                                                    justifyContent: 'flex-end',
                                                    alignItems: 'center',
                                                    marginLeft: COMMON_STYLE.PADDING,
                                                    flex: 1
                                                }}>
                                                    <Box style={{
                                                        marginBottom: 50
                                                    }}>
                                                        {
                                                            (selectedSubject && selectedSubject.course && selectedSubject.course.course_name != '') && (
                                                                <Fragment>
                                                                    <Text style={[
                                                                        COMMON_STYLES[i18n.language].bold,
                                                                        {
                                                                            fontSize: 20,
                                                                            lineHeight: 40,
                                                                            color: COLORS.WHITE,
                                                                            textAlign: 'center'
                                                                        }
                                                                    ]}>
                                                                        {selectedSubject.name}
                                                                    </Text>

                                                                    <Text style={[
                                                                        COMMON_STYLES[i18n.language].bold,
                                                                        {
                                                                            fontSize: 15,
                                                                            lineHeight: 30,
                                                                            color: COLORS.WHITE,
                                                                            textAlign: 'center'
                                                                        }
                                                                    ]}>
                                                                        {selectedSubject.course.course_name}
                                                                    </Text>
                                                                </Fragment>
                                                            )
                                                        }
                                                    </Box>
                                                </Col>
                                            </Grid>
                                        </Box>
                                    </Box>

                                    <FlatList
                                        keyExtractor={ (item, index) => 'chapters_' + index.toString() }
                                        data={ this.chapters }
                                        renderItem={ this.renderChapter }
                                        numColumns={1}
                                        extraData={this.state}
                                        scrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                        initialNumToRender={10}
                                    />
                                </Fragment>

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
        Navigation.popToRoot("home")
    }
}

function mapStateToProps(state) {
    return {
        login_changed: state.login_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SubjectDetailScreen));
