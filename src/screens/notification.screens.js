import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, TouchableHighlight, BackHandler, FlatList, StatusBar, Linking, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native'

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

class NotificationScreen extends React.PureComponent {
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

        this.backHandler = false

        this.LOGGEDIN_USER = false

        this.notifications = []

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
            this.notifications = []
        }

        this.digiedModule.getUnreadNotificationCount().then((response) => {
            global.total_unread_notification_count = response.data.count
        }).catch((error) => {
            console.log(error)
        })

        this.digiedModule.getNotifications({ page: this.page, per_page: 10 })
            .then((response) => {
                _.each(response.data.data, (data, index) => {
                    let notification = {
                        id: data._id,
                        notification_type: data.notification_type,
                        title: data.title,
                        content: data.content,
                        tutorial_id: data.tutorial_id,
                        sequence: (index + 1),
                        key: data._id.toString(),
                        has_read: data.has_read,
                        created_at_display: data.created_at_display,
                        created_at_ago_display: data.created_at_ago_display
                    }

                    if(i18n.language != 'en' && data.title_l10n && data.title_l10n[i18n.language]) {
                        notification.title = data.title_l10n[i18n.language]
                    }

                    if(i18n.language != 'en' && data.content_l10n && data.content_l10n[i18n.language]) {
                        notification.content = data.content_l10n[i18n.language]
                    }

                    notification.tutorial = _.find(response.data.tutorials, (tutorial) => {
                        return tutorial.id == data.tutorial_id
                    })

                    if(notification.tutorial) {
                        notification.tutorial.tutorial_title = notification.tutorial.tutorial_title

                        if(i18n.language != 'en' && notification.tutorial.tutorial_title_l10n && notification.tutorial.tutorial_title_l10n[i18n.language]) {
                            notification.tutorial.tutorial_title = notification.tutorial.tutorial_title_l10n[i18n.language]
                        }
                    }

                    this.notifications.push(notification)
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

    renderNotification = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props
        const finalWidth = width - (COMMON_STYLE.PADDING * 2)

        renderItem = (
            <TouchableOpacity onPress={this._onClickedNotification(item)}>
                <Box style={{
                    width: finalWidth,
                    minHeight: 80,
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
                                justifyContent: 'flex-start'
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].bold,
                                    {
                                        color: COLORS.BLACK
                                    }
                                ]} numberOfLines={2}>{item.title}</Text>
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
                                {
                                    (item.has_read != true) && (
                                        <Box style={{
                                            position: 'absolute',
                                            top: COMMON_STYLE.PADDING - 10,
                                            right: 0
                                        }}>
                                            <FontAwesomeIcon icon={faCircle} size={8} style={
                                                { 
                                                    color: COLORS.GREEN
                                                }
                                            } />
                                        </Box>
                                    )
                                }
                            </Col>
                        </Row>
                        {
                            (item && item.content != null && item.content != '') && (
                                <Row style={{
                                    marginTop: 10
                                }}>
                                    <Col style={{
                                        justifyContent: 'flex-start'
                                    }}>
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].regular,
                                            {
                                                color: COLORS.BLACK
                                            }
                                        ]} numberOfLines={2}>{item.content}</Text>
                                    </Col>
                                </Row>
                            )
                        }
                    </Grid>
                </Box>

            </TouchableOpacity>
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
                            (isConnected && loading == false && this.notifications.length == 0) && (
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
                                    ]}>{ t('No notification yet!') }</Text>
                                </Box>
                            )
                        }

                        <FlatList
                            keyExtractor={ (item, index) => 'notifications_' + index.toString() }
                            data={ this.notifications }
                            renderItem={ this.renderNotification }
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

    _onClickedNotification = (item) => () => {
        Navigation.push(this.props.componentId, {
            component: {
                name: 'navigation.panntheefoundation.NotificationDetailScreen',
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(NotificationScreen));
