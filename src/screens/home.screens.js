import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, 
    TouchableOpacity, BackHandler, FlatList, StatusBar, Linking, ImageBackground, ScrollView, Alert } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Container, Box, Text, Badge, Button, Spinner, VStack } from 'native-base'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBars, faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import { handleSharedUrl, onBackButtonPressAndroid } from '../modules/utils.common.js'

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
import FastImage from 'react-native-fast-image'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

AnimatableBox = Animatable.createAnimatableComponent(Box)

import Carousel from 'react-native-snap-carousel'

class HomeScreen extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            login_changed: false,
            language_changed: props.i18n.language,
            
            forceRender: false,
            // loading: true,
            loading: false,
            loading_more: false,
            refreshing: false,
            isConnected: true
        }

        this.backHandler = false
        this.page = 1
        this.last_loaded_page = 0
        this.has_next = false
        
        this.LOGGEDIN_USER = false

        const group_image = require('../assets/images/panthee-group-background.png')

        this.groups = []

        this.digiedModule = new DigiedModule

        this.forceUpdate = {
            visible: false
        }

        this.banners = []
        this.banner_carousel = false
    }

    componentDidMount() {
        const { t, i18n } = this.props
        this.navigationEventListener = Navigation.events().bindComponent(this)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => onBackButtonPressAndroid(t))

        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
        })

        AsyncStorage.multiGet([
            CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER,
            CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE
        ]).then((storedData) => {
            let language = i18n.language
            if(storedData) {
                if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                    let LOGGEDIN_USER = JSON.parse(storedData[0][1])
                    this.LOGGEDIN_USER = LOGGEDIN_USER
                }

                if(storedData[1] && storedData[1][1] != null && storedData[1][1] != false) {
                    language = storedData[1][1]
                }
            }

            this.setState({
                language_changed: language,
                loading: true
            })
            this.load()
        }).catch(() => {
            this.setState({
                loading: true
            })
            this.load()
        })
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove()
        }

        if(this.netInfoEventListener) {
            this.netInfoEventListener()
        }

        if(this.backHandler) {
            this.backHandler.remove()
            this.backHandler = false
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.i18n.language && this.state.language_changed && (this.state.language_changed != this.props.i18n.language)) {
            this.load()
            return false
        }
        return true
    }

    load = () => {
        const { i18n } = this.props
        
        this.groups = []
        this.banners = []
        
        this.digiedModule.getCourseCategory({ page: 'all', include_home_banner_setting: 1 })
            .then((response) => {
                _.each(response.data.data, (data, index) => {
                    let group = {
                        id: data.id,
                        name: data.course_category_code,
                        description: data.course_category_name,
                        is_coming_soon: data.is_coming_soon
                    }

                    if(i18n.language != 'en' && data.course_category_name_l10n && data.course_category_name_l10n[i18n.language]) {
                        group.description = data.course_category_name_l10n[i18n.language]
                    }

                    if(data.course_category_image) {
                        group.image = CommonConstants.storage_endpoint + '/' + data.course_category_image
                    }
                    
                    this.groups.push(group)
                })

                if(response.data.home_banner_setting) {
                    if(response.data.home_banner_setting.banner_image_1) {
                        this.banners.push({
                            image: CommonConstants.storage_endpoint + '/' + response.data.home_banner_setting.banner_image_1
                        });
                    }

                    if(response.data.home_banner_setting.banner_image_2) {
                        this.banners.push({
                            image: CommonConstants.storage_endpoint + '/' + response.data.home_banner_setting.banner_image_2
                        });
                    }

                    if(response.data.home_banner_setting.banner_image_3) {
                        this.banners.push({
                            image: CommonConstants.storage_endpoint + '/' + response.data.home_banner_setting.banner_image_3
                        });
                    }

                    if(response.data.home_banner_setting.banner_image_4) {
                        this.banners.push({
                            image: CommonConstants.storage_endpoint + '/' + response.data.home_banner_setting.banner_image_4
                        });
                    }

                    if(response.data.home_banner_setting.banner_image_5) {
                        this.banners.push({
                            image: CommonConstants.storage_endpoint + '/' + response.data.home_banner_setting.banner_image_5
                        });
                    }
                }

                this.setState({
                    loading: false,
                    language_changed: i18n.language,
                    forceRender: !this.state.forceRender
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                    forceRender: !this.state.forceRender
                })
            })
    }

    componentDidAppear() {
        
        if(this.backHandler == false) {
            const { t } = this.props            
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => onBackButtonPressAndroid(t))    
        }
        
        Linking.getInitialURL().then((url) => handleSharedUrl({url: url}))
        Linking.addEventListener('url', handleSharedUrl)
    }

    componentDidDisappear() {
        if(this.backHandler) {
            this.backHandler.remove()
            this.backHandler = false
        }
        Linking.removeEventListener('url', handleSharedUrl)
    }

    _onClickedGroup = (item) => () => {
        Navigation.push("home", {
            component: {
                name: 'navigation.panntheefoundation.GroupDetailScreen',
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
                    }
                }
            }
        })
    }

    renderGroup = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props
        const theWidth = (width - (COMMON_STYLE.PADDING * 2.5))/2
        const theHeight = theWidth * 0.75 // 1024x768
        
        renderItem = (
            <TouchableOpacity onPress={this._onClickedGroup(item)} disabled={item.is_coming_soon == 1}>
                <AnimatableBox style={{
                    // height: 240,
                    height: (theHeight + 60),
                    backgroundColor: COLORS.THEME,
                    borderRadius: 12,
                    marginTop: 10,
                    marginRight: index%2 == 0? COMMON_STYLE.PADDING/2: 0,
                    justifyContent: "center",
                    overflow: 'hidden',
                    width: theWidth
                }} animation={"fadeIn"}>
                    <Box style={{
                        // flex: 0.75,
                        height: theHeight,
                        backgroundColor: 'transparent'
                    }}>
                        <FastImage source={{ uri: item.image }} style={{
                            width: null,
                            height: '100%',
                            opacity: 1
                        }} />
                    </Box>

                    <Box style={{
                        // flex: 0.25,
                        // height: 60,
                        borderTopWidth: 1,
                        borderTopColor: COLORS.LIGHT_GRAY,
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Text style={[
                            COMMON_STYLES[i18n.language].bold,
                            {
                                textAlign: 'center',
                                color: COLORS.WHITE,
                                marginLeft: 2,
                                marginRight: 2,
                                lineHeight: (Platform.OS == "ios"? 30: (i18n.language == 'mm'? 28: 26))
                            }
                        ]} numberOfLines={2}>{item.description}</Text>
                    </Box>
                </AnimatableBox>
            </TouchableOpacity>
        )

        return renderItem
    }

    renderBanners = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        
        renderItem = (
            <Box style={{
                marginRight: 5
            }}>
                <FastImage source={{ uri: item.image }} style={{
                    width: null,
                    height: (width > 360? 280: 250),
                    borderRadius: 0
                }} resizeMode={"contain"} />
            </Box>
        )

        return renderItem
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const state = this.state
        const { width, height } = Dimensions.get('window')
        const { isConnected, loading, loading_collection } = this.state
        const { t, i18n } = this.props
        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')
        const digital_learning_platform_image = require('../assets/images/digital-learning-platform.jpg')
        
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
                                <Col style={{
                                    width: 60,
                                    height: 60,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <TouchableOpacity onPress={this._onClickedMenu} style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 10
                                    }}>
                                        <FontAwesomeIcon icon={faBars} size={30} style={
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

                                        {/*<TouchableOpacity onPress={this._onClickedHome}>
                                            <Text style={[
                                                COMMON_STYLES['en'].bold,
                                                {
                                                    color: COLORS.BLACK,
                                                    fontSize: 16,
                                                    lineHeight: 60,
                                                    marginBottom: 0,
                                                    paddingBottom: 0,
                                                    textAlignVertical: 'center',
                                                    height: 60,
                                                    letterSpacing: 3
                                                }
                                            ]}>{ CommonConstants.app_name }</Text>
                                        </TouchableOpacity>
                                        */}
                                    </Box>
                                </Col>
                                <Col style={{ width: 45 }}></Col>
                            </Grid>
                        </Box>

                        <ScrollView>
                            <Box style={{
                                marginTop: 20,
                                marginBottom: 20,
                                paddingLeft: COMMON_STYLE.PADDING,
                                paddingRight: COMMON_STYLE.PADDING
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
                                    (isConnected && loading == false && this.groups.length > 0) && (
                                        <Fragment>
                                            <Box style={{
                                                height: (width > 360? 280: 250),
                                                borderRadius: 12
                                            }}>
                                                {
                                                    this.banners.length > 0 && (
                                                        <Carousel
                                                            ref={(carousel) => { this.banner_carousel = carousel }}
                                                            data={this.banners}
                                                            renderItem={this.renderBanners.bind(this)}
                                                            sliderWidth={width - (COMMON_STYLE.PADDING * 1.8)}
                                                            itemWidth={width - (COMMON_STYLE.PADDING * 2)}
                                                            firstItem={0}
                                                            enableMomentum={false}
                                                            loop={true}
                                                            autoplay={true}
                                                            loopClonesPerSide={5}

                                                            lockScrollWhileSnapping={true}
                                                            autoplayInterval={5000}
                                                            swipeThreshold={0}
                                                            enableSnap={true}

                                                            decelerationRate={"fast"}
                                                            activeSlideAlignment={'center'}
                                                            inactiveSlideScale={1}
                                                            inactiveSlideOpacity={1}

                                                        />
                                                    )
                                                }

                                                {
                                                    this.banners.length == 0 && (
                                                        <Image source={digital_learning_platform_image} style={{
                                                            width: null,
                                                            height: (width > 360? 280: 250),
                                                            borderRadius: 0
                                                        }} resizeMode={"contain"} />
                                                    )
                                                }
                                            </Box>
                                            <Box>
                                                <Text style={[
                                                    COMMON_STYLES[i18n.language].bold,
                                                    {
                                                        color: COLORS.BLACK,
                                                        marginTop: 10,
                                                        marginBottom: 5,
                                                        marginLeft: 5
                                                    }
                                                ]}>{ t('Categories') }</Text>

                                                <Text style={[
                                                    COMMON_STYLES[i18n.language].regular,
                                                    {
                                                        color: COLORS.BLACK,
                                                        marginLeft: 5,
                                                        fontSize: (i18n.language == 'en'? 14: (i18n.language == 'mm'? 16: 14)),
                                                        lineHeight: (i18n.language == 'en'? (Platform.OS == "ios"? 32: 20): (i18n.language == 'mm'? (Platform.OS == "ios"? 32: 26): (Platform.OS == "ios"? 32: 24)))
                                                    }
                                                ]}>{ t('Choose your Grade to start Study') }</Text>
                                            </Box>
                                            <FlatList
                                                keyExtractor={ (item, index) => 'groups_' + index.toString() }
                                                data={ this.groups }
                                                renderItem={ this.renderGroup }
                                                numColumns={2}
                                                extraData={this.state}
                                                scrollEnabled={false}
                                                showsVerticalScrollIndicator={false}
                                                initialNumToRender={10}
                                            />
                                        </Fragment>
                                    )
                                }
                            </Box>
                        </ScrollView>
                    </ImageBackground>

                </SafeAreaView>

            </NativeBaseProvider>
        )
    }

    _onClickedSearch = () => {
        const { width, height } = Dimensions.get('window')

        Navigation.showModal({
            stack: {
                children: [ 
                    {
                        component: {
                            name: 'navigation.panntheefoundation.SearchScreen',
                            passProps: {
                                
                            },
                            options: {
                                topBar: {
                                    height: 0,
                                    visible: false
                                },
                                layout: {
                                    backgroundColor: 'transparent',
                                    componentBackgroundColor: 'transparent',
                                },
                                screenBackgroundColor: 'red',
                                modalPresentationStyle: 'overCurrentContext',
                                animations: {
                                    showModal: {
                                        alpha: {
                                            from: 0,
                                            to: 1,
                                            duration: 500,
                                        },
                                    },
                                    dismissModal: {
                                        alpha: {
                                            from: 1,
                                            to: 0,
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

    _onClickedMenu = () => {
        Navigation.popToRoot('LEFT_STACK')
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: true
                }
            }
        })
    }

    _onClickedHome = () => {
        Navigation.popToRoot("home")
    }
}

function mapStateToProps(state) {
    return {
        login_changed: state.login_changed,
        language_changed: state.language_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(HomeScreen));
