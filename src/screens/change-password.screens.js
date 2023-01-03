import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, StatusBar, Image, Animated, TouchableOpacity, BackHandler, FlatList, ImageBackground, Text, ScrollView} from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Badge, FormControl, Stack, Input, Button } from 'native-base'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import SpinnerOverlay from 'react-native-loading-spinner-overlay';

import UserModule from '../services/user.module'

import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonConstants from '../modules/constants.common.js'

import ModalAlert from '../components/modal-alert'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class ChangePasswordScreen extends React.PureComponent {
    constructor(props){
        super(props)

        this.userModule = new UserModule
        this.LOGGEDIN_USER = false

        this.state = {
            forceRender: false,
            modalBlockingSpinner: {
                visible: false
            }
        }

        this.form = {
            current_password: '',
            password: '',
            password_confirmation: ''
        }
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.showCurrentPassword = false
        this.showPassword = false
        this.showConfirmPassword = false
    }

    onModalAlertPress = () => {
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }
        this.setState({
            forceRender: !this.state.forceRender
        })
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove()
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
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const { width, height } = Dimensions.get('window')
        const { firebaseConfirmationResult, registerForm, source, t, i18n } = this.props
        const state = this.state
        const modalAlert = this.modalAlert

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
                    <ModalAlert modalAlert={modalAlert} onPress={this.onModalAlertPress}></ModalAlert>
                    <ModalAppVersionForceUpdate />

                    <ImageBackground source={background_image}  style={{
                        flex: 1,
                        width: width,
                        height: 'auto'
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

                        <ScrollView>
                            <Box style={{
                                backgroundColor: COLORS.WHITE,
                                paddingLeft: COMMON_STYLE.PADDING,
                                paddingRight: COMMON_STYLE.PADDING,
                                paddingTop: 50,
                                paddingBottom: 50,
                                height: height - (90 + statusBarCurrentHeight)
                                // flex: 1
                            }}>
                                <SpinnerOverlay
                                    visible={state.modalBlockingSpinner.visible}
                                    textContent={t("Loading")}
                                    textStyle={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            textAlign: 'center', 
                                            color: COLORS.WHITE,
                                            fontWeight: ''
                                        }
                                    ]}
                                    animation={"fade"}
                                    overlayColor={"rgba(0, 0, 0, 0.75)"}
                                />

                                <FormControl isRequired style={{
                                    height: 80,
                                    marginBottom: 20
                                }}>
                                    <Stack mx={2}>
                                        <FormControl.Label>
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].bold
                                            ]}>{ t('Current Password') }</Text>
                                        </FormControl.Label>

                                        <Box>
                                            <Input 
                                                InputLeftElement={
                                                    <FontAwesomeIcon icon={faLock} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK
                                                        }
                                                    } />
                                                }
                                                InputRightElement={
                                                    <TouchableOpacity onPress={ () => {
                                                        this.showCurrentPassword = !this.showCurrentPassword

                                                        this.setState({
                                                            forceRender: !this.state.forceRender
                                                        })
                                                    } }>
                                                        <FontAwesomeIcon icon={ this.showCurrentPassword == true? faEye: faEyeSlash } size={20} style={
                                                            { 
                                                                color: COLORS.BLACK
                                                            }
                                                        } />
                                                    </TouchableOpacity>
                                                }
                                                secureTextEntry={!this.showCurrentPassword} 
                                                onChangeText={(text) => this.form.current_password = text} 
                                                variant="underlined"
                                                style={[
                                                    COMMON_STYLES[i18n.language].input
                                                ]} />
                                        </Box>
                                    </Stack>
                                </FormControl>

                                <FormControl isRequired style={{
                                    height: 80,
                                    marginBottom: 20
                                }}>
                                    <Stack mx={2}>
                                        <FormControl.Label>
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].bold
                                            ]}>{ t('Password') }</Text>
                                        </FormControl.Label>

                                        <Box>
                                            <Input 
                                                InputLeftElement={
                                                    <FontAwesomeIcon icon={faLock} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK
                                                        }
                                                    } />
                                                }
                                                InputRightElement={
                                                    <TouchableOpacity onPress={ () => {
                                                        this.showPassword = !this.showPassword

                                                        this.setState({
                                                            forceRender: !this.state.forceRender
                                                        })
                                                    } }>
                                                        <FontAwesomeIcon icon={ this.showPassword == true? faEye: faEyeSlash } size={20} style={
                                                            { 
                                                                color: COLORS.BLACK
                                                            }
                                                        } />
                                                    </TouchableOpacity>
                                                }
                                                secureTextEntry={!this.showPassword} 
                                                onChangeText={(text) => this.form.password = text} 
                                                variant="underlined"
                                                style={[
                                                    COMMON_STYLES[i18n.language].input
                                                ]} />
                                        </Box>
                                    </Stack>
                                </FormControl>

                                <FormControl isRequired style={{
                                    height: 80,
                                    marginBottom: 20
                                }}>
                                    <Stack mx={2}>
                                        <FormControl.Label>
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].bold
                                            ]}>{ t('Confirm Password') }</Text>
                                        </FormControl.Label>

                                        <Box>
                                            <Input 
                                                InputLeftElement={
                                                    <FontAwesomeIcon icon={faLock} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK
                                                        }
                                                    } />
                                                }
                                                InputRightElement={
                                                    <TouchableOpacity onPress={ () => {
                                                        this.showConfirmPassword = !this.showConfirmPassword

                                                        this.setState({
                                                            forceRender: !this.state.forceRender
                                                        })
                                                    } }>
                                                        <FontAwesomeIcon icon={ this.showConfirmPassword == true? faEye: faEyeSlash } size={20} style={
                                                            { 
                                                                color: COLORS.BLACK
                                                            }
                                                        } />
                                                    </TouchableOpacity>
                                                }
                                                secureTextEntry={!this.showConfirmPassword} 
                                                onChangeText={(text) => this.form.password_confirmation = text} 
                                                variant="underlined"
                                                style={[
                                                    COMMON_STYLES[i18n.language].input
                                                ]} />
                                        </Box>
                                    </Stack>
                                </FormControl>
                           
                                <Button block onPress={this._onChangePassword} style={[
                                    COMMON_STYLES.THEME_BUTTON,
                                    {
                                        backgroundColor: COLORS.THEME
                                    }
                                ]}>
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            color: COLORS.WHITE
                                        }
                                    ]}>{ t('Save') }</Text>
                                </Button>
                                    
                            </Box>
                        </ScrollView>
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

    _onClickedHome = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTabs: {
                currentTabIndex: 0
            }
        })
    }

    _onChangePassword = () => {
        const { t } = this.props

        if(!this.form.current_password) {
            this.modalAlert = {
                visible: true,
                title: t("Current Password Required"),
                description: t("Please provide current password")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })

            return false
        }

        if(!this.form.password) {
            this.modalAlert = {
                visible: true,
                title: t("Password Required"),
                description: t("Please provide password")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false
        }

        if(!this.form.password_confirmation) {
            this.modalAlert = {
                visible: true,
                title: t("Confirm Password Required"),
                description: t("Please provide confirm password")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false
        }

        if(this.form.password != this.form.password_confirmation) {
            this.modalAlert = {
                visible: true,
                title: t("Invalid Password"),
                description: t("Password and confirm password does not match")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false
        }

        this.setState({
            modalBlockingSpinner: {
                visible: true
            }
        })

        this.userModule.changePassword(this.LOGGEDIN_USER.id, {
            password: this.form.current_password,
            new_password: this.form.password_confirmation
        }).then((response) => {
            this.form = {
                current_password: '',
                password: '',
                password_confirmation: ''
            }
            this.setState({
                modalBlockingSpinner: {
                    visible: false
                }
            }, () => {
                setTimeout(() => {
                    // this.modalAlert = {
                    //     visible: true,
                    //     title: t("Change Password Successful"),
                    //     description: t("Password has been changed successfully")
                    // }
                    // this.setState({
                    //     forceRender: !this.state.forceRender
                    // })
                    Navigation.popToRoot('profile')
                }, 150)
            })
        }).catch((error) => {
            this.setState({
                modalBlockingSpinner: {
                    visible: false
                }
            }, () => {
                setTimeout(() => {
                    if(error && error.response && error.response.data && error.response.data.message) {
                        this.modalAlert = {
                            visible: true,
                            title: t("Change Password Failed"),
                            description: t(error.response.data.message)
                        }
                        this.setState({
                            forceRender: !this.state.forceRender
                        })

                    } else {
                        this.modalAlert = {
                            visible: true,
                            title: t("Change Password Failed"),
                            description: t("Unable to change your account password")
                        }
                        this.setState({
                            forceRender: !this.state.forceRender
                        })
                    }
                }, 150)
            })
        })
    }
}

export default withTranslation()(ChangePasswordScreen)

