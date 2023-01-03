import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, 
    TouchableOpacity, BackHandler, FlatList, StatusBar, Linking, ImageBackground, RefreshControl, ActivityIndicator, Text } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Badge, Button, Spinner } from 'native-base'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import { handleSharedUrl } from '../modules/utils.common.js'

import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import DigiedModule from '../services/digied.module'

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {connect} from 'react-redux'
import NetInfo from "@react-native-community/netinfo"

import * as Animatable from 'react-native-animatable'
AnimatableBox = Animatable.createAnimatableComponent(Box)
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class SubjectsListingScreen extends React.PureComponent {
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

        this.subjects = []

        this.digiedModule = new DigiedModule

        this.backHandler = false
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
        const { i18n, item } = this.props
        
        if(this.state.refreshing == true || forceRefresh == true) {
            this.subjects = []
        }

        this.digiedModule.getSubjectsByCourse({ page: this.page, per_page: 5, course_id: item.id })
            .then((response) => {
                const image = require('../assets/images/panthee-logo.png')

                _.each(response.data.data, (data, index) => {
                    let subject = {
                        id: data.id,
                        name: data.subject_name,
                        description: ''
                    }

                    if(i18n.language != 'en' && data.subject_name_l10n && data.subject_name_l10n[i18n.language]) {
                        subject.name = data.subject_name_l10n[i18n.language]
                    }

                    if(data.image) {
                        subject.image = {
                            uri: CommonConstants.storage_endpoint + '/' + data.image
                        }
                    } else {
                        subject.image = image
                    }

                    if(data.subject_cover_image) {
                        subject.cover_image = {
                            uri: CommonConstants.storage_endpoint + '/' + data.subject_cover_image
                        }
                    } else {
                        subject.cover_image = image
                    }

                    if(data.subject_banner_image) {
                        subject.subject_banner_image = {
                            uri: CommonConstants.storage_endpoint + '/' + data.subject_banner_image
                        }
                    } else {
                        subject.subject_banner_image = image
                    }
                    
                    if(data.course) {
                        subject.course = {
                            id: data.course.id,
                            course_name: data.course.course_name
                        }

                        if(i18n.language != 'en' && data.course.course_name_l10n && data.course.course_name_l10n[i18n.language]) {
                            subject.course.course_name = data.course.course_name_l10n[i18n.language]
                        }
                    }

                    this.subjects.push(subject)
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

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())

        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
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

    _onClickedSubject = (item) => () => {
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
                    }
                }
            }
        })
    }

    renderSubject = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <TouchableOpacity onPress={this._onClickedSubject(item)}>
                <Box style={{
                    height: 200,
                    backgroundColor: COLORS.WHITE,
                    borderRadius: 6,
                    marginBottom: 10,
                    justifyContent: "center",
                    overflow: 'hidden'
                }}>
                    <ImageBackground source={item.cover_image} style={{
                        flex: 1,
                        resizeMode: "cover",
                        width: (width/2),
                        height: 200,
                        position: 'absolute',
                        bottom: 0,
                        right: 0
                    }}>

                    </ImageBackground>

                    <Box style={{
                        paddingLeft: COMMON_STYLE.PADDING,
                        paddingRight: COMMON_STYLE.PADDING,
                        height: 50,
                        width: (width - (width/2.5) - (COMMON_STYLE.PADDING * 2))
                    }}>
                        <Text style={[
                            COMMON_STYLES[i18n.language].bold
                        ]} numberOfLines={2}>{item.name}</Text>
                    </Box>
                </Box>
            </TouchableOpacity>
        )

        return renderItem
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const state = this.state
        const { width, height } = Dimensions.get('window')
        const { isConnected, loading } = this.state
        const { t, i18n, item } = this.props
        
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
                    
                    <ImageBackground source={background_image}  style={{
                        flex: 1,
                        width: width,
                        height: loading == true? height: 'auto'
                    }} imageStyle={{
                        opacity: (Platform.OS == "android"? 0.5: 1)
                    }}>
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

                        <Box style={{
                            paddingTop: 10,
                            paddingLeft: COMMON_STYLE.PADDING,
                            paddingRight: COMMON_STYLE.PADDING,
                            flex: 1
                        }}>
                            {
                                isConnected != true && (
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            color: COLORS.BLACK,
                                            textAlign: 'center'
                                        }
                                    ]}>{ t('No Internet Connection') }</Text>
                                )
                            }

                            {
                                (isConnected && loading == true) && (
                                    <Spinner color={COLORS.THEME} />
                                )
                            }

                            {
                                (isConnected && loading == false && this.subjects.length > 0) && (
                                    <FlatList
                                        keyExtractor={ (item, index) => 'subjects_' + index.toString() }
                                        data={ this.subjects }
                                        renderItem={ this.renderSubject }
                                        numColumns={1}
                                        extraData={this.state}
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
                                )
                            }
                        </Box>
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
        Navigation.pop(this.props.componentId)
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SubjectsListingScreen));
