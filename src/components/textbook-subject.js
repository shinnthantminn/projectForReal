import React, { Fragment } from 'react'
import { SafeAreaView, Platform, Dimensions, Image, TouchableOpacity } from 'react-native'

import { Box, Text, Form, Item, Input, Label, Button, Badge } from 'native-base'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation'
import CommonConstants from '../modules/constants.common.js'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {Grid,Row,Col} from 'react-native-easy-grid'

import _ from 'lodash'

import {connect} from 'react-redux'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

class TextBookSubject extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            forceRender: false
        }

        this.LOGGEDIN_USER = false
    }

    _onClickedSubject = (item) => () => {
        const { screenComponentId } = this.props
        Navigation.push(screenComponentId, {
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

    render() {
        const statusBarCurrentHeight = getStatusBarHeight()
        const state = this.state
        const { t, i18n, item } = this.props

        return (
            <TouchableOpacity onPress={this._onClickedSubject(item)}>
                <Box style={{
                    // height: 200,
                    height: 220,
                    backgroundColor: COLORS.THEME,
                    borderRadius: 12
                }}>
                    <Box style={{
                        // flex: 0.75,
                        height: 160,
                        overflow: 'hidden'
                    }}>
                        <Image source={{ uri: item.cover_image.uri }} style={{
                            width: null,
                            height: '100%',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12
                        }} />
                    </Box>

                    <Box style={{
                        // flex: 0.25,
                        // flex: 0.30,
                        // height: 60,
                        borderTopWidth: 1,
                        borderTopColor: COLORS.LIGHT_GRAY,
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 60,
                        height: 60
                    }}>
                        <Text style={[
                            COMMON_STYLES[i18n.language].bold,
                            {
                                textAlign: 'center',
                                color: COLORS.WHITE,
                                marginLeft: 5,
                                marginRight: 5,
                                lineHeight: (Platform.OS == "ios"? 30: (i18n.language == 'mm'? 28: 26))
                            }
                        ]} numberOfLines={2}>{item.name}</Text>
                    </Box>
                </Box>
            </TouchableOpacity>
        )
    }
}

function mapStateToProps(state) {
    return {
    
    }
}

function mapDispatchToProps(dispatch) {
    return {
        
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(TextBookSubject));

