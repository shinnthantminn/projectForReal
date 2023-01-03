import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, ImageBackground, Text, ScrollView } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Badge, Accordion, Spinner } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import CommonConstants from '../../modules/constants.common.js'

import SettingModule from '../../services/setting.module'
import NetInfo from "@react-native-community/netinfo"
import ModalAppVersionForceUpdate from '../../components/modal-app-version-force-update.js'

class FaqScreenLeft extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            forceRender: false,
            loading: true,
            isConnected: true
        }

        this.settingModule = new SettingModule

        this.faqs = []
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

        this.faqs = []
        this.settingModule.getFaq().then((response) => {
            _.each(response.data.data, (faq) => {
                if(i18n.language != 'en' && faq.question_l10n && faq.question_l10n[i18n.language]) {
                    faq.question = faq.question_l10n[i18n.language]
                }

                if(i18n.language != 'en' && faq.answer_l10n && faq.answer_l10n[i18n.language]) {
                    faq.answer = faq.answer_l10n[i18n.language]
                }

                this.faqs.push({
                    title: faq.question,
                    content: faq.answer
                })
            })

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
        const { t, i18n } = this.props
        const { width, height } = Dimensions.get('window')
        const LOGGEDIN_USER = this.LOGGEDIN_USER
        const modalAlert = this.modalAlert

        const logo_image = require('../../assets/images/panthee-logo-no-text.png')
        const background_image = require('../../assets/images/pannthee-bg.jpg')

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
                            (this.state.isConnected && this.state.loading == true) && (
                                <Box style={{
                                    marginTop: 10
                                }}>
                                    <Spinner color={COLORS.THEME} />
                                </Box>
                            )
                        }

                        {
                            (this.state.isConnected && this.state.loading != true && this.faqs.length > 0) && (
                                <ScrollView>
                                    <Box style={{
                                        marginTop: COMMON_STYLE.PADDING,
                                        paddingLeft: COMMON_STYLE.PADDING,
                                        paddingRight: COMMON_STYLE.PADDING
                                    }}>
                                        <Accordion index={0} defaultIndex={0}>
                                            {
                                                this.faqs.map((faq) => {
                                                    return (
                                                        <Accordion.Item>
                                                            <Accordion.Summary _expanded={{
                                                                _text: { 
                                                                    color: COLORS.BLACK
                                                                }
                                                            }} style={{
                                                                backgroundColor: 'transparent',
                                                                color: COLORS.BLACK
                                                            }}>
                                                                <Text style={[
                                                                    COMMON_STYLES[i18n.language].bold,
                                                                    {
                                                                        color: COLORS.BLACK,
                                                                        width: ((width <= 360? (width - 30): (width - 50)) - 70)
                                                                    }
                                                                ]}>{ faq.title }</Text>
                                                                <Accordion.Icon color={COLORS.BLACK} />
                                                            </Accordion.Summary>
                                                            <Accordion.Details style={{
                                                                backgroundColor: 'transparent',
                                                                marginLeft: 10,
                                                                color: COLORS.GRAY_20
                                                            }}>
                                                                <Text style={[
                                                                    COMMON_STYLES[i18n.language].regular,
                                                                    {
                                                                        color: COLORS.BLACK
                                                                    }
                                                                ]}>{ faq.content }</Text>
                                                            </Accordion.Details>
                                                        </Accordion.Item>
                                                    )
                                                })
                                            }
                                            
                                        </Accordion>
                                    </Box>
                                </ScrollView>
                            )
                        }

                        {
                            (this.state.isConnected && this.state.loading != true && this.faqs.length == 0) && (
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
        Navigation.pop(this.props.componentId)
    }
}

export default withTranslation()(FaqScreenLeft)