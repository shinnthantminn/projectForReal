import React from 'react'
import { Platform, Dimensions, TouchableOpacity, Linking } from 'react-native'

import { Box, Text, VStack } from 'native-base'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import Modal from 'react-native-modal'
import CommonConstants from '../modules/constants.common.js'
import AssetServerModule from "../services/asset-server.module"
import RNExitApp from 'react-native-exit-app'

class ModalAppVersionForceUpdate extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            forceRender: false
        }
        
        this.forceUpdate = {
            visible: false
        }

        this.assetServerModule = new AssetServerModule
    }

    componentDidMount() {
        if(this.forceUpdate.visible == false && global.organization && global.organization.minimum_app_version_numeric && global.organization.minimum_app_version_numeric > CommonConstants.version_number) {
            this.forceUpdate.visible = true
            this.setState({
                forceRender: !this.state.forceRender
            })
        }

        if(global.organization == false) {
            this.assetServerModule.getOrganizationInfo().then((response) => {
                global.organization = response.data.data

                if(this.forceUpdate.visible == false && global.organization && global.organization.minimum_app_version_numeric && global.organization.minimum_app_version_numeric > CommonConstants.version_number) {
                    this.forceUpdate.visible = true
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }
            })
        }
    }

    render() {
        const { t, i18n } = this.props
        const { width, height } = Dimensions.get('window')

        return (
            <Modal isVisible={this.forceUpdate.visible}>
                <Box style={{ 
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Box style={{
                        width: width - (COMMON_STYLE.PADDING * 4),
                        backgroundColor: COLORS.WHITE,
                        borderRadius: 6,
                        paddingLeft: COMMON_STYLE.PADDING,
                        paddingRight: COMMON_STYLE.PADDING
                    }}>
                        <VStack space={5} style={{
                            marginTop: (COMMON_STYLE.PADDING * 2)
                        }}>
                            <Text style={[
                                COMMON_STYLES[i18n.language].bold,
                                {
                                    textAlign: 'center',
                                    color: COLORS.BLACK,
                                    textTransform: i18n.language == 'en'? 'uppercase': 'none'
                                }
                            ]}>{ t('new_version_available', {version_number: global.organization.minimum_app_version_numeric && global.organization.minimum_app_version}) }</Text>

                            <Text style={[
                                COMMON_STYLES[i18n.language].regular,
                                {
                                    textAlign: 'center',
                                    color: COLORS.BLACK
                                }
                            ]}>{ t('Please update new version of Pann Thee application to use the latest features') }</Text>
                        </VStack>

                        <VStack space={3} style={{
                            alignItems: 'center',
                            marginTop: COMMON_STYLE.PADDING,
                            marginBottom: (COMMON_STYLE.PADDING * 2)
                        }}>
                            <TouchableOpacity onPress={() => {
                                Linking.canOpenURL(Platform.OS == "android"? CommonConstants.play_store_url: CommonConstants.app_store_url).then(supported => {
                                    if (!supported) {
                                        // open in webpage
                                        Linking.openURL(Platform.OS == "android"? CommonConstants.play_store_web_url: CommonConstants.app_store_web_url)
                                    } else {
                                        Linking.openURL(Platform.OS == "android"? CommonConstants.play_store_url: CommonConstants.app_store_url)
                                    }
                                }).catch((err) => {
                                    Linking.openURL(Platform.OS == "android"? CommonConstants.play_store_web_url: CommonConstants.app_store_web_url)
                                })
                                
                            }} style={{
                                backgroundColor: COLORS.THEME,
                                width: 200,
                                borderRadius: COMMON_STYLE.PADDING * 2,
                                paddingTop: COMMON_STYLE.PADDING,
                                paddingLeft: COMMON_STYLE.PADDING,
                                paddingBottom: COMMON_STYLE.PADDING,
                                paddingRight: COMMON_STYLE.PADDING
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        textAlign: 'center',
                                        color: COLORS.WHITE
                                    }
                                ]}>{ Platform.OS == 'android'? t('Go to Play Store'): t('Go to App Store') }</Text>

                            </TouchableOpacity>

                            {
                                (Platform.OS == 'android') && (
                                    <TouchableOpacity onPress={() => {
                                        Linking.openURL(CommonConstants.apk_download_web_url)
                                    }} style={{
                                        backgroundColor: COLORS.THEME,
                                        width: 200,
                                        borderRadius: COMMON_STYLE.PADDING * 2,
                                        paddingTop: COMMON_STYLE.PADDING,
                                        paddingLeft: COMMON_STYLE.PADDING,
                                        paddingBottom: COMMON_STYLE.PADDING,
                                        paddingRight: COMMON_STYLE.PADDING
                                    }}>
                                        <Text style={[
                                            COMMON_STYLES[i18n.language].regular,
                                            {
                                                textAlign: 'center',
                                                color: COLORS.WHITE
                                            }
                                        ]}>{ t('Direct Download') }</Text>

                                    </TouchableOpacity>
                                )
                            }

                            <TouchableOpacity onPress={() => {
                                this.forceUpdate.visible = false
                                this.setState({
                                    forceRender: !this.state.forceRender
                                }, () => {
                                    RNExitApp.exitApp()
                                })
                            }} style={{
                                backgroundColor: COLORS.THEME,
                                width: 200,
                                borderRadius: COMMON_STYLE.PADDING * 2,
                                paddingTop: COMMON_STYLE.PADDING,
                                paddingLeft: COMMON_STYLE.PADDING,
                                paddingBottom: COMMON_STYLE.PADDING,
                                paddingRight: COMMON_STYLE.PADDING
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        textAlign: 'center',
                                        color: COLORS.WHITE
                                    }
                                ]}>{ t('Quit') }</Text>

                            </TouchableOpacity>
                        </VStack>
                    </Box>
                </Box>
            </Modal>
        )
    }
}

export default withTranslation()(ModalAppVersionForceUpdate)