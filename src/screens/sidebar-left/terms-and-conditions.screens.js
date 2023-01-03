import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, Linking, ImageBackground, Text } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Badge, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faTimes } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import CommonConstants from '../../modules/constants.common.js'
import SettingModule from '../../services/setting.module'
import { WebView } from 'react-native-webview'
import NetInfo from "@react-native-community/netinfo"
import ModalAppVersionForceUpdate from '../../components/modal-app-version-force-update.js'

class TermsAndConditionsScreenLeft extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            forceRender: false,

            loading: true,
            isConnected: true
        }

        this.settingModule = new SettingModule

        this.tnc = false
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            global.backHandlerClickCount = 1
            Navigation.pop(this.props.componentId)
        })
        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
        })

        const { i18n } = this.props

        this.settingModule.getTnc().then((response) => {
            this.tnc = response.data.data

            if(i18n.language != 'en' && this.tnc.tnc_l10n && this.tnc.tnc_l10n[i18n.language]) {
                this.tnc.tnc = this.tnc.tnc_l10n[i18n.language]
            }

            this.setState({
                loading: false,
                forceRender: !this.state.forceRender
            })
        })
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
            const { t } = this.props
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                global.backHandlerClickCount = 1
                Navigation.pop(this.props.componentId)
            })
        }
    }

    componentDidDisappear() {
        if(this.backHandler) {
            this.backHandler.remove()
            this.backHandler = false
        }
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n, isModal } = this.props
        const { loading } = this.state
        const { width, height } = Dimensions.get('window')
        const LOGGEDIN_USER = this.LOGGEDIN_USER
        const modalAlert = this.modalAlert

        const logo_image = require('../../assets/images/panthee-logo-no-text.png')
        const background_image = require('../../assets/images/pannthee-bg.jpg')

        const zawgyiOnefontUrl = Platform.select({
            ios: "Zawgyi-One.ttf",
            android: "file:///android_asset/fonts/Zawgyi-One.ttf"
        });

        const pyidaungsufontUrl = Platform.select({
            ios: "Pyidaungsu-Regular",
            android: "file:///android_asset/fonts/Pyidaungsu-Regular.ttf",
        });

        const robotomonoRegularfontUrl = Platform.select({
            ios: "RobotoMono-Regular",
            android: "file:///android_asset/fonts/RobotoMono-Regular.ttf",
        });

        return (
            <NativeBaseProvider>
                <SafeAreaView style={
                    { flex: 0, backgroundColor: COLORS.THEME, height: statusBarCurrentHeight }
                } />
                <SafeAreaView style={
                    COMMON_STYLES.SAFE_AREA_SECTION,
                    {
                        flex: 1
                    }
                }>
                    <ModalAppVersionForceUpdate />
                    <ImageBackground source={background_image} style={{
                        flex: 1,
                        width: '100%',
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
                                        <FontAwesomeIcon icon={ isModal == true? faTimes : faChevronLeft} size={30} style={
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
                            (this.state.isConnected && this.state.loading == true) && (
                                <Box style={{
                                    marginTop: 10
                                }}>
                                    <Spinner color={COLORS.THEME} />
                                </Box>
                            )
                        }

                        {
                            (this.state.isConnected && this.state.loading != true && this.tnc != false && this.tnc.tnc) && (
                                <WebView 
                                    useWebKit={true}
                                    originWhitelist={['*']} 
                                    source={{ html: '<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><style media="screen" type="text/css">@font-face{font-family:"Zawgyi-One";src:url("' + zawgyiOnefontUrl +'")} @font-face{font-family:"Pyidaungsu-Regular";src:url("' + pyidaungsufontUrl +'")} @font-face{font-family:"RobotoMono-Regular";src:url("' + robotomonoRegularfontUrl +'")} *{margin:0;padding:0;font-family:'+ (i18n.language == 'en'? "RobotoMono-Regular": (i18n.language == 'mm'? "Pyidaungsu-Regular": "Zawgyi-One")) +';font-size: '+ (Platform.OS == 'android'? (i18n.language == 'en'? '16px': '18px'): (i18n.language == 'en'? '16px': '18px')) +';}</style></head><body>' + this.tnc.tnc + '</body></html>', baseUrl: '' }} 
                                    style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            backgroundColor: 'transparent',                                                            
                                            height: height - (60 + statusBarCurrentHeight),
                                            marginTop: COMMON_STYLE.PADDING,
                                            marginBottom: COMMON_STYLE.PADDING,
                                            marginLeft: COMMON_STYLE.PADDING,
                                            marginRight: COMMON_STYLE.PADDING
                                        }
                                    ]} />
                            )
                        }

                        {
                            (this.state.isConnected && this.state.loading != true && !this.tnc) && (
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
                        
                    </ImageBackground>
                        
                </SafeAreaView>
            </NativeBaseProvider>
        )
    }

    _onClickedBack = () => {
        const { isModal } = this.props
        if(isModal == true) {
            Navigation.dismissModal(this.props.componentId)
        } else {
            Navigation.pop(this.props.componentId)
        }
    }

    _onClickedHome = () => {
        Navigation.popToRoot('LEFT_STACK')
    }

    _onMakePhoneCall =() => {
        Linking.openURL("tel:095102449");
    }

    _onOpenPageMessenger = () => {
        Linking.canOpenURL('fb-messenger://').then(supported => {
            if (!supported) {
                Linking.openURL("https://www.facebook.com/messages/t/the-name");
            } else {
                Linking.openURL("fb-messenger://user-thread/" + "the-name");
            }
        })
    }
}

export default withTranslation()(TermsAndConditionsScreenLeft)