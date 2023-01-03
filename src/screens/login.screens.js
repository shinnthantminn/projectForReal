import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, StatusBar, ImageBackground, ScrollView } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import Login from "../components/login"

import COMMON_STYLES, { COLORS, FONTS } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class LoginScreen extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            forceRender: false
        }
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n } = this.props
        const { width, height } = Dimensions.get('window')
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
                        width: width
                    }} imageStyle={{
                        opacity: (Platform.OS == "android"? 0.5: 1)
                    }}>
                        <ScrollView>
                            <Login screenComponentId={this.props.componentId} />
                        </ScrollView>
                    </ImageBackground>
                    
                </SafeAreaView>
            </NativeBaseProvider>
        )
    }

    _onClickedBackNavigator = () => {
        Navigation.pop(this.props.componentId)
    }

}

export default withTranslation()(LoginScreen)