import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Appearance, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, StatusBar, Linking, ImageBackground } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Button, Spinner, VStack } from 'native-base'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBars, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS } from '../modules/styles.common.js'

import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {connect} from 'react-redux'
import AppIntroSlider from 'react-native-app-intro-slider'
import * as Animatable from 'react-native-animatable'

import SidebarEn from "../modules/sidebar/en"
import SidebarMm from "../modules/sidebar/mm"
import SidebarZg from "../modules/sidebar/zg"
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

AnimatableBox = Animatable.createAnimatableComponent(Box);

const slides = [
    {
        key: 'one',
        image: require('../assets/images/intro-screen-1.png')
    },
    {
        key: 'two',
        image: require('../assets/images/intro-screen-2.gif')
    },
    {
        key: 'choose_language',
        title: 'Choose Language',
        languages: [
            {
                title: 'English',
                description: 'I can read this',
                lang: 'en'
            },
            {
                title: 'Myanmar Unicode',
                description: 'I can read this',
                lang: 'mm'
            },
            {
                title: 'Myanmar Zawgyi',
                description: 'I can read this',
                lang: 'zg'
            }
        ]
    }
];


class IntroScreen extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            login_changed: false,
            language_changed: false,
            forceRender: false
        }

        this.LOGGEDIN_USER = false

        this.autoslideInterval = false
        this.slider = false
        this.currentSlideIndex = 0

        this.selectedLanguage = false
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);

        this.autoslideInterval = setTimeout(() => {
            this.tickAutoSlide();
        }, 3000)
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove();
        }

        if(this.autoslideInterval) {
            clearTimeout(this.autoslideInterval)
        }
    }

    tickAutoSlide = () => {
        if(this.currentSlideIndex == 0) {
            this.slider.goToSlide(1);
            if(this.autoslideInterval) {
                clearTimeout(this.autoslideInterval)
            }
            this.currentSlideIndex = 1
            this.autoslideInterval = setTimeout(() => {
                this.tickAutoSlide()
            }, 5000)
        } else if(this.currentSlideIndex == 1) {
            this.slider.goToSlide(2);
            if(this.autoslideInterval) {
                clearTimeout(this.autoslideInterval)
            }
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
        })

        // Linking.addEventListener('url', handleSharedUrl)
    }

    componentDidDisappear() {
        // Linking.removeEventListener('url', handleSharedUrl)
    }

    _renderItem = ({ item }) => {
        const { t, i18n } = this.props
        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')

        const { width, height } = Dimensions.get('window')

        return (
            <AnimatableBox style={styles.slide} animation="flipInY">
                <ModalAppVersionForceUpdate />

                {
                    (item.key == 'one' || item.key == 'two') && (
                        <Image source={item.image} resizeMode="contain" style={{
                            width: width,
                            backgroundColor: COLORS.WHITE
                        }} />
                    )
                }

                {
                    (item.key == 'choose_language') && (
                        <ImageBackground source={background_image}  style={{
                            flex: 1,
                            width: width,
                            height: height,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }} imageStyle={{
                            opacity: (Platform.OS == "android"? 0.5: 1)
                        }}>
                            <Box style={{
                                marginBottom: 40,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Image source={logo_image} style={{
                                    width: 120,
                                    height: 135
                                }} />
                            </Box>

                            <Text style={[
                                COMMON_STYLES[i18n.language].regular,
                                styles.title
                            ]}>{item.title}</Text>

                            <VStack style={{
                                width: 250,
                                marginTop: 20,
                                marginLeft: 0,
                                paddingLeft: 0,
                                marginRight: 0,
                                paddingRight: 0
                            }}>
                                {
                                    item.languages.map((language, index) => {
                                        return (
                                            <Box key={index} style={{
                                                borderBottomWidth: 1,
                                                borderBottomColor: COLORS.BLACK,
                                                marginBottom: 10,
                                                paddingBottom: 10,
                                                marginLeft: 0,
                                                paddingLeft: 0,
                                                marginRight: 0,
                                                paddingRight: 0
                                            }}>
                                                <TouchableOpacity onPress={this._onClickedLanguage(language)}>
                                                    <Text style={[
                                                        COMMON_STYLES[language.lang].bold,
                                                        {
                                                            color: COLORS.BLACK
                                                        }
                                                    ]}>{language.title}</Text>
                                                    <Text style={[
                                                        COMMON_STYLES[language.lang].regular,
                                                        {
                                                            color: COLORS.BLACK
                                                        }
                                                    ]}>{t(language.description, { lng: language.lang })}</Text>
                                                </TouchableOpacity>
                                            </Box>
                                        )
                                    })
                                }
                            </VStack>
                        </ImageBackground>
                    )
                
                }
            </AnimatableBox>
        );
    }

    _onClickedLanguage = (language) => () => {
        const { i18n } = this.props
        this.selectedLanguage = language
        AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE, language.lang)

        this.props.updateLanguageChanged(language.lang)

        setTimeout(() => {
            i18n.changeLanguage(language.lang).then((t) => {
                this._onDone() 
            })
        }, 300)
    }

    _onSlideChange = (index) => {
        this.currentSlideIndex = index
    }

    _onDone = () => {
        // User finished the introduction. Show real app through
        AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.IS_INTRO_FINISHED, "1")

        if(this.LOGGEDIN_USER) {
            if(this.selectedLanguage == "mm") {
                Navigation.setRoot({
                    root: {
                        sideMenu: SidebarMm
                    }
                })
            } else if(this.selectedLanguage == "zg") {
                Navigation.setRoot({
                    root: {
                        sideMenu: SidebarZg
                    }
                })
            } else {
                Navigation.setRoot({
                    root: {
                        sideMenu: SidebarEn
                    }
                })
            }
        } else {
            Navigation.setRoot({
                root: {
                    stack: {
                        children: [
                            {
                                component: {
                                    name: 'navigation.panntheefoundation.LoginScreen',
                                    options: {
                                        topBar: {
                                            height: 0,
                                            visible: false
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            })
        }
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

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
                    <AppIntroSlider 
                        ref={ref => this.slider = ref}
                        renderItem={this._renderItem} 
                        data={slides} 
                        showSkipButton={false}
                        showDoneButton={false}
                        showPrevButton={true}
                        onDone={this._onDone}
                        onSkip={this._onDone}
                        renderPrevButton={this._renderPrevButton}
                        renderNextButton={this._renderNextButton}
                        onSlideChange={this._onSlideChange}
                        activeDotStyle={{
                            backgroundColor: COLORS.THEME
                        }} />
                </SafeAreaView>

            </NativeBaseProvider>
        )
    }

    _renderPrevButton = () => {
        const { t, i18n } = this.props

        return (
            <Text style={[
                COMMON_STYLES[i18n.language].regular,
                {
                    color: COLORS.BLACK
                }
            ]}>{ t('Back') }</Text>
        );
    }

    _renderNextButton = () => {
        const { t, i18n } = this.props

        return (
            <Text style={[
                COMMON_STYLES[i18n.language].regular,
                {
                    color: COLORS.BLACK
                }
            ]}>{ t('Next') }</Text>
        );
    }
}

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    image: {
        width: 320,
        height: 320,
        marginVertical: 32
    },
    text: {
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center'
    },
    title: {
        fontSize: 25,
        lineHeight: 35,
        color: COLORS.THEME,
        textAlign: 'center'
    },
});


function mapStateToProps(state) {
    return {
        login_changed: state.login_changed,
        language_changed: state.language_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateLanguageChanged: (LANGUAGE_CODE) => dispatch({ type: 'LANGUAGE_CHANGED', payload: LANGUAGE_CODE })
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(IntroScreen));
