import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, TouchableOpacity, BackHandler, FlatList, StatusBar, Text } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Badge } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import { WebView } from 'react-native-webview'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class TutorialSummaryScreen extends React.PureComponent {
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

        // this.state = {
        //     password: ""
        // }
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n, item } = this.props
        const { width, height } = Dimensions.get('window')

        let summary_p_count = 0

        if(item && item.summary) {
            summary_p_count = (item.summary.match(/<\/p>/g) || []).length
        }

        return (
            <NativeBaseProvider>
                <ModalAppVersionForceUpdate />
                <Box style={{
                    backgroundColor: 'transparent',
                    height: height,
                    justifyContent: 'flex-end'
                }}>
                    <Box style={{
                        height: 400,
                        paddingTop: COMMON_STYLE.PADDING,
                        paddingBottom: COMMON_STYLE.PADDING,
                        paddingLeft: COMMON_STYLE.PADDING,
                        paddingRight: COMMON_STYLE.PADDING,
                        zIndex: 1
                    }}>
                        <Box style={{
                            width: 60, 
                            height: 60,
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 1
                        }}>
                            <TouchableOpacity 
                                onPress={this._onClickedCloseSummary} 
                                style={{ 
                                    width: 60, 
                                    height: 60, 
                                    alignItems: 'flex-end',
                                    justifyContent: 'flex-start', 
                                    zIndex: 1
                                }}>
                                <FontAwesomeIcon icon={faTimes} size={25} style={
                                    { 
                                        color: COLORS.WHITE
                                    }
                                } />
                            </TouchableOpacity>
                        </Box>

                        <Box>
                            <Text style={[
                                COMMON_STYLES[i18n.language].bold,
                                {
                                    color: COLORS.WHITE
                                }
                            ]} numberOfLines={1}>Summary</Text>

                            {
                                (item && item.summary) && (
                                    <Box style={{
                                        marginTop: 10,
                                        height: '100%',
                                        paddingBottom: 10
                                    }}>
                                        <WebView 
                                            showsHorizontalScrollIndicator={false}
                                            useWebKit={true}
                                            originWhitelist={['*']} 
                                            source={{ html: '<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><style media="screen" type="text/css">*{margin:0;padding:0;font-family:'+ (i18n.language == 'en'? 'Arial_MT': 'Pyidaungsu') +';font-size:20px;color:#ffffff;}</style></head><body>' + item.summary + '</body></html>' }} 
                                            style={{ 
                                                // no of p + chracters rows and 20px per row
                                                height: ((20 * (item.summary.length/width) + (20 * summary_p_count))),
                                                backgroundColor: 'transparent',
                                                color: COLORS.WHITE,
                                                marginBottom: 45
                                            }} />
                                    </Box>
                                )
                            }
                        </Box>
                    </Box>

                </Box>
            </NativeBaseProvider>
        )
    }

    _onClickedCloseSummary = () => {
        Navigation.dismissModal(this.props.componentId)
    }

}

export default withTranslation()(TutorialSummaryScreen)