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
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class TutorialCommentScreen extends React.PureComponent {
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

        this.backHandler = false

        this.comments = [
            {
                comment_by: {
                    name: 'Jack'
                },
                comment: 'this is comment 1'
            },
            {
                comment_by: {
                    name: 'John Doe'
                },
                comment: 'this is comment 2'
            },
            {
                comment_by: {
                    name: 'Aung Aung'
                },
                comment: 'this is comment 3'
            },
            {
                comment_by: {
                    name: 'Phyu Phyu'
                },
                comment: 'this is comment 4'
            },
            {
                comment_by: {
                    name: 'Maung Maung'
                },
                comment: 'this is comment 5'
            },
            {
                comment_by: {
                    name: 'Jack'
                },
                comment: 'this is comment 6'
            },
            {
                comment_by: {
                    name: 'John Doe'
                },
                comment: 'this is comment 7'
            },
            {
                comment_by: {
                    name: 'Aung Aung'
                },
                comment: 'this is comment 8'
            },
            {
                comment_by: {
                    name: 'Phyu Phyu'
                },
                comment: 'this is comment 9'
            },
            {
                comment_by: {
                    name: 'Maung Maung'
                },
                comment: 'this is comment 10'
            }
        ]
    }

    renderComment = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <Box style={{
                marginBottom: 10,
                backgroundColor: COLORS.WHITE,
                borderRadius: 6,
                paddingTop: COMMON_STYLE.PADDING,
                paddingBottom: COMMON_STYLE.PADDING
            }}>
                <Grid style={{
                    paddingLeft: COMMON_STYLE.PADDING,
                    paddingRight: COMMON_STYLE.PADDING
                }}>
                    <Row>
                        <Col>
                            <Box>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].bold,
                                    {
                                        color: COLORS.BLACK
                                    }
                                ]} numberOfLines={1}>{item.comment_by.name}</Text>

                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        color: COLORS.BLACK
                                    }
                                ]} numberOfLines={4}>{item.comment}</Text>
                            </Box>
                        </Col>
                    </Row>
                </Grid>
            </Box>
        )

        return renderItem
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

        Orientation.removeOrientationListener(this._orientationDidChange);
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

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { t, i18n, item } = this.props
        const { width, height } = Dimensions.get('window')

        return (
            <NativeBaseProvider>
                <Box style={{
                    backgroundColor: 'transparent',
                    height: height,
                    justifyContent: 'flex-end'
                }}>
                    <ModalAppVersionForceUpdate />
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

                        <Box style={{
                            marginBottom: 30
                        }}>
                            <Text style={[
                                COMMON_STYLES[i18n.language].bold,
                                {
                                    color: COLORS.WHITE
                                }
                            ]} numberOfLines={1}>Comments</Text>

                            <Box style={{
                                paddingTop: 10
                            }}>
                                <FlatList
                                    keyExtractor={ (item, index) => 'comments_' + index.toString() }
                                    data={ this.comments }
                                    renderItem={ this.renderComment }
                                    numColumns={1}
                                    extraData={this.state}
                                    scrollEnabled={true}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    horizontal={false}
                                    initialNumToRender={10}
                                />
                            </Box>

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

export default withTranslation()(TutorialCommentScreen)