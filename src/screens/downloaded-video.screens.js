import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, StatusBar, ImageBackground, Linking } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

// Text.defaultProps.allowFontScaling = false

import CommonConstants from '../modules/constants.common.js'
import NetInfo from "@react-native-community/netinfo"

import { handleSharedUrl } from '../modules/utils.common.js'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class DownloadedVideoScreen extends React.PureComponent {
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
            isConnected: true
        }

        this.downloaded_tutorials = []

        this.backHandler = false
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this)
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

    renderTutorial = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <TouchableOpacity onPress={this._onClickedTutorial(item)}>
                <Box style={{
                    height: 70,
                    paddingLeft: COMMON_STYLE.PADDING,
                    paddingRight: COMMON_STYLE.PADDING,
                    paddingTop: COMMON_STYLE.PADDING,
                    paddingBottom: COMMON_STYLE.PADDING,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.WHITE
                }}>
                    <Grid>
                        <Col style={{
                            width: 60,
                            justifyContent: 'center'
                        }}>
                            <Text style={[
                                COMMON_STYLES[i18n.language].bold,
                                {
                                    color: COLORS.WHITE
                                }
                            ]} numberOfLines={1}>{item.sequence}</Text>
                        </Col>
                        <Col style={{
                            justifyContent: 'center'
                        }}>
                            <Text style={[
                                COMMON_STYLES[i18n.language].regular,
                                {
                                    color: COLORS.WHITE
                                }
                            ]} numberOfLines={3}>{item.description}</Text>
                        </Col>
                    </Grid>
                </Box>
            </TouchableOpacity>
        )

        return renderItem
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n } = this.props
        const { loading, isConnected } = this.state
        const { width, height } = Dimensions.get('window')

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
                                <Col style={{ width: 45 }}></Col>
                            </Grid>
                        </Box>

                        {
                            (isConnected && loading == false && this.downloaded_tutorials.length == 0) && (
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
                                    ]}>{ t('No downloaded record') }</Text>
                                </Box>
                            )
                        }

                        <FlatList
                            keyExtractor={ (item, index) => 'tutorials_' + index.toString() }
                            data={ this.downloaded_tutorials }
                            renderItem={ this.renderTutorial }
                            numColumns={1}
                            extraData={self.state}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}
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

    _onClickedTutorial = (item) => () => {
        // show popup screen and play the video
        Navigation.showModal({
            stack: {
                children: [ 
                    {
                        component: {
                            name: 'navigation.panntheefoundation.MainPlayerScreen',
                            passProps: {
                                item: item
                            },
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

export default withTranslation()(DownloadedVideoScreen)