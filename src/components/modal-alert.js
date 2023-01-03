import React from 'react'
import { SafeAreaView, Platform, Dimensions, Image, TouchableOpacity } from 'react-native'

import { Box, Text, Button } from 'native-base'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Navigation } from 'react-native-navigation'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import Modal from 'react-native-modal'
import { WebView } from 'react-native-webview'

class ModalAlert extends React.PureComponent {
    constructor(props){
        super(props)
    }

    render() {
        const { modalAlert, onPress, t, i18n } = this.props
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { width, height } = Dimensions.get('window')
        
        return (
            <Modal 
                isVisible={modalAlert.visible}
                propagateSwipe={modalAlert.isHtml != true? false: true}
                onSwipeComplete={onPress}
                swipeDirection={ modalAlert.isHtml != true? ['down']: null}
                style={{
                    justifyContent: 'flex-end',
                    margin: 0
                }}
            >
                <Box style={{
                    backgroundColor: COLORS.WHITE,
                    padding: COMMON_STYLE.PADDING
                }}>
                    <Text style={[
                        COMMON_STYLES[i18n.language].bold,
                        {
                            fontSize: 18
                        }
                    ]} numberOfLines={2}>{ modalAlert.title }</Text>
                    {
                        (modalAlert.isHtml != true) && (
                            <Text style={[
                                COMMON_STYLES[i18n.language].regular,
                                {
                                    fontSize: 14,
                                    marginTop: 10
                                }
                            ]}>{ modalAlert.description }</Text>
                        )
                    }
                    
                    {
                        (modalAlert.isHtml == true) && (
                            <Box style={{
                                marginTop: 10,
                                height: height - (60 + statusBarCurrentHeight + 40 + 40)
                            }}>
                                <WebView
                                    scrollEnabled={true}
                                    useWebKit={true}
                                    textZoom={100}
                                    originWhitelist={['*']} 
                                    source={{ html: '<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><style media="screen" type="text/css">*{margin:0;padding:0;font-family:'+ (i18n.language == 'en'? 'RobotoMono-Regular': (i18n.language == 'mm'? 'Pyidaungsu-Regular': 'Zawgyi-One')) +';font-size: '+ (Platform.OS == 'android'? (i18n.language == 'en'? '16px': '18px'): (i18n.language == 'en'? '16px': '18px')) +';}</style></head><body>'+ modalAlert.description +'</body></html>' }} 
                                    style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            backgroundColor: 'transparent'
                                        }
                                    ]} />
                            </Box>
                        )
                    }

                    <Box style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end'
                    }}>
                        {
                            modalAlert.showReset == true && (
                                <Button transparent onPress={ modalAlert.onPressReset } style={{
                                    justifyContent: 'flex-end'
                                }}>
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            color: COLORS.RED
                                        }
                                    ]}>{ t('Reset') }</Text>
                                </Button>
                            )
                        }

                        <Button transparent onPress={ modalAlert.onPress? modalAlert.onPress: onPress } style={{
                            justifyContent: 'flex-end',
                            backgroundColor: COLORS.THEME
                        }}>
                            <Text style={[
                                COMMON_STYLES[i18n.language].regular,
                                {
                                    color: COLORS.WHITE
                                }
                            ]}>{ t('OK') }</Text>
                        </Button>
                    </Box>
                </Box>

            </Modal>
        )
    }
}

export default withTranslation()(ModalAlert)