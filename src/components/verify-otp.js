import React, { Fragment } from 'react'
import { SafeAreaView, Platform, Dimensions, Image, TouchableOpacity } from 'react-native'

import { NativeBaseProvider, Box, Text, Input, FormControl, Stack, Button } from 'native-base'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import UserModule from '../services/user.module'
import CommonConstants from '../modules/constants.common.js'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

// import auth from '@react-native-firebase/auth'
import SpinnerOverlay from 'react-native-loading-spinner-overlay';
import { Navigation } from 'react-native-navigation'

import {connect} from 'react-redux'
import ModalAlert from './modal-alert'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faEye, faEyeSlash, faUser, faEnvelope, faLock, faSms } from '@fortawesome/free-solid-svg-icons'

import SmsRetriever from 'react-native-sms-retriever'

import SidebarEn from "../modules/sidebar/en"
import SidebarMm from "../modules/sidebar/mm"
import SidebarZg from "../modules/sidebar/zg"

class VerifyOtp extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            login_changed: false,
            forceRender: false,
            modalBlockingSpinner: {
                visible: false
            }
        }

        this.LOGGEDIN_USER = false

        this.userModule = new UserModule

        this.resendOtpCountdownSeconds = 60 // 1 min

        this.form = {
            otp: '',
            password: '',
            password_confirmation: ''
        }

        this.startResendOtpCountDownTimer()
        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.showPassword = false
        this.showConfirmPassword = false
        this.showOtp = false

        this.selectedLanguage = false
    }

    componentDidMount() {
        if(Platform.OS == "android") {
            SmsRetriever.requestPhoneNumber().then((phoneNumber) => {
                
            }).catch((error) => {
                console.log(error)
            })    
        }

        AsyncStorage.multiGet([
            CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE
        ]).then((storedData) => {
            if(storedData) {
                if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                    this.selectedLanguage = storedData[0][1]
                }
            }
        })
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

    render() {
        const statusBarCurrentHeight = getStatusBarHeight()
        const state = this.state
        const { source, t, i18n } = this.props

        const modalAlert = this.modalAlert

        return (
            <NativeBaseProvider>
                <Box style={{
                    paddingLeft: COMMON_STYLE.PADDING,
                    paddingRight: COMMON_STYLE.PADDING
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
                    <ModalAlert modalAlert={modalAlert} onPress={this.onModalAlertPress}></ModalAlert>
                    {
                        (source && source == "forgot_password") && (
                            <Fragment>
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
                            </Fragment>
                        )
                    }

                    <FormControl style={{
                        height: 80,
                        marginBottom: 20
                    }}>
                        <Stack mx={2}>
                            <FormControl.Label>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].bold
                                ]}>{ t('OTP Code') }</Text>
                            </FormControl.Label>

                            <Box>
                                <Input 
                                    InputLeftElement={
                                        <FontAwesomeIcon icon={faSms} size={20} style={
                                            { 
                                                color: COLORS.BLACK
                                            }
                                        } />
                                    }
                                    InputRightElement={
                                        <TouchableOpacity onPress={ () => {
                                            this.showOtp = !this.showOtp

                                            this.setState({
                                                forceRender: !this.state.forceRender
                                            })
                                        } }>
                                            <FontAwesomeIcon icon={ this.showOtp == true? faEye: faEyeSlash } size={20} style={
                                                { 
                                                    color: COLORS.BLACK
                                                }
                                            } />
                                        </TouchableOpacity>
                                    }
                                    textContentType="oneTimeCode"
                                    secureTextEntry={!this.showOtp} 
                                    keyboardType={'numeric'} 
                                    onChangeText={(text) => this.form.otp = text} 
                                    variant="underlined"
                                    style={[
                                        COMMON_STYLES[i18n.language].input
                                    ]}
                                    maxLength={6} />
                            </Box>
                        </Stack>
                    </FormControl>

                    <Button block onPress={this._onVerify} style={COMMON_STYLES.LOGIN_BUTTON}>
                        <Text style={[
                            COMMON_STYLES[i18n.language].regular,
                            {
                                color: COLORS.WHITE
                            }
                        ]}>{ t('Verify') }</Text>
                    </Button>

                    {
                        this.resendOtpCountdownSeconds <= 0 && (
                            <Button transparent block onPress={this._onResendOtp} style={{ marginTop: 10 }} style={{
                                backgroundColor: 'transparent'
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular
                                ]}>{ t('Resend Otp Code') }</Text>
                            </Button>
                        )
                    }

                    {
                        this.resendOtpCountdownSeconds > 0 && (
                            <Button transparent block disabled style={{ marginTop: 10 }} style={{
                                backgroundColor: 'transparent'
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular
                                ]}>{ t('Resend Otp Code') } ({ this.resendOtpCountdownSeconds })</Text>
                            </Button>
                        )
                    }
                    
                </Box>
            </NativeBaseProvider>
        )
    }

    _onVerify = () => {
        const { t } = this.props
        if(!this.form.otp) {
            this.modalAlert = {
                visible: true,
                title: t("OTP Required"),
                description: t("Please provide otp code")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })

            return false
        }

        const { screenComponentId, registerForm, source } = this.props

        if(source == "forgot_password") {
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
        }

        this.setState({
            modalBlockingSpinner: {
                visible: true
            }
        })

        if(source == "forgot_password") {
            this.userModule.resetOnlineUserPasswordByMobileNumberAndOtp({
                phone: registerForm.phone,
                otp: this.form.otp,
                password: this.form.password,
                password_confirmation: this.form.password_confirmation
            }).then((response) => {
                this.setState({
                    modalBlockingSpinner: {
                        visible: false
                    }
                }, () => {
                    this.LOGGEDIN_USER = response.data.data
                    AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER, JSON.stringify(this.LOGGEDIN_USER))
                    if(this.intervalResendOtpCountDownTimer) {
                        clearInterval(this.intervalResendOtpCountDownTimer)
                        this.intervalResendOtpCountDownTimer = false    
                    }
                    this.props.updateLoginChanged(this.LOGGEDIN_USER)
                    Navigation.popToRoot(screenComponentId)
                })
            }).catch((error) => {
                this.setState({
                    modalBlockingSpinner: {
                        visible: false
                    }
                }, () => {
                    setTimeout(() => {
                        this.modalAlert = {
                            visible: true,
                            title: t("Reset Password Failed"),
                            description: error.response && error.response.data? t(error.response.data): t("Reset password was not successful")
                        }
                        this.setState({
                            forceRender: !this.state.forceRender
                        })
                    }, 150)
                })
            })
        } else if(source == "login_with_otp") {
            this.userModule.loginWithOtp({
                phone: registerForm.phone,
                otp: this.form.otp
            }).then((response) => {
                this.setState({
                    modalBlockingSpinner: {
                        visible: false
                    }
                }, () => {
                    this.LOGGEDIN_USER = response.data.data
                    AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER, JSON.stringify(this.LOGGEDIN_USER))
                    if(this.intervalResendOtpCountDownTimer) {
                        clearInterval(this.intervalResendOtpCountDownTimer)
                        this.intervalResendOtpCountDownTimer = false    
                    }
                    setTimeout(() => {
                        this.props.updateLoginChanged(this.LOGGEDIN_USER)
                        
                        if(this.selectedLanguage == "mm") {
                            Navigation.setRoot({
                                root: {
                                    sideMenu: SidebarMm
                                }
                            })
                        } else if(this.selectedLanguage == "zg") {
                            Navigation.setRoot({
                                root: {
                                    sideMenu: SidebarZg
                                }
                            })
                        } else {
                            Navigation.setRoot({
                                root: {
                                    sideMenu: SidebarEn
                                }
                            })
                        }

                        Navigation.events().registerBottomTabSelectedListener((tab) => {
                            global.backHandlerClickCount = 1
                            if(tab && tab.selectedTabIndex == 0) {
                                // home
                                Navigation.popToRoot('home')
                            }
                        })
                    }, 450)
                })
            }).catch((error) => {
                this.setState({
                    modalBlockingSpinner: {
                        visible: false
                    }
                }, () => {
                    setTimeout(() => {
                        this.modalAlert = {
                            visible: true,
                            title: t("Login Failed"),
                            description: error.response && error.response.data? t(error.response.data): t("Login was not successful")
                        }
                        this.setState({
                            forceRender: !this.state.forceRender
                        })
                    }, 150)
                })
            })
        } else {
            // verify the user
            this.userModule.verifyOtpAndActivateOnlineUser({
                phone: registerForm.phone,
                otp: this.form.otp
            }).then((response) => {
                this.setState({
                    modalBlockingSpinner: {
                        visible: false
                    }
                }, () => {
                    this.LOGGEDIN_USER = response.data.data
                    AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER, JSON.stringify(this.LOGGEDIN_USER))
                    if(this.intervalResendOtpCountDownTimer) {
                        clearInterval(this.intervalResendOtpCountDownTimer)
                        this.intervalResendOtpCountDownTimer = false    
                    }
                    setTimeout(() => {
                        this.props.updateLoginChanged(this.LOGGEDIN_USER)
                        
                        if(this.selectedLanguage == "mm") {
                            Navigation.setRoot({
                                root: {
                                    sideMenu: SidebarMm
                                }
                            })
                        } else if(this.selectedLanguage == "zg") {
                            Navigation.setRoot({
                                root: {
                                    sideMenu: SidebarZg
                                }
                            })
                        } else {
                            Navigation.setRoot({
                                root: {
                                    sideMenu: SidebarEn
                                }
                            })
                        }

                        Navigation.events().registerBottomTabSelectedListener((tab) => {
                            global.backHandlerClickCount = 1
                            if(tab && tab.selectedTabIndex == 0) {
                                // home
                                Navigation.popToRoot('home')
                            }
                        })
                    }, 450)
                })
            }).catch((error) => {
                this.setState({
                    modalBlockingSpinner: {
                        visible: false
                    }
                }, () => {
                    setTimeout(() => {
                        this.modalAlert = {
                            visible: true,
                            title: t("Registration Failed"),
                            description: error.response && error.response.data? t(error.response.data): t("Registration was not successful")
                        }
                        this.setState({
                            forceRender: !this.state.forceRender
                        })
                    }, 150)
                })
            })
        }
    }

    _onResendOtp = () => {
        const { t } = this.props
        if(this.resendOtpCountdownSeconds > 0) {
            this.modalAlert = {
                visible: true,
                title: t("Unable to send OTP"),
                description: t("Please wait few more seconds until you can resend OTP code")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false;
        }

        const { registerForm } = this.props

        this.setState({
            modalBlockingSpinner: {
                visible: true
            }
        })

        if(Platform.OS == "android") {
            SmsRetriever.requestPhoneNumber().then((phoneNumber) => {
                
            }).catch((error) => {
                console.log(error)
            })
        }

        this.userModule.resentOtpBySms({
            phone: registerForm.phone
        }).then((response) => {
            this.resendOtpCountdownSeconds = 60
            this.setState({
                modalBlockingSpinner: {
                    visible: false
                }
            }, () => {
                setTimeout(() => {
                    this.startResendOtpCountDownTimer()
                    this.form.otp = ""
                    this.modalAlert = {
                        visible: true,
                        title: t("Resend OTP"),
                        description: t("We had resend OTP code SMS to you mobile number")
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }, 150)
            })
        }).catch((error) => {
            this.setState({
                modalBlockingSpinner: {
                    visible: false
                }
            }, () => {
                setTimeout(() => {
                    this.modalAlert = {
                        visible: true,
                        title: t("Registration Failed"),
                        description: error.response && error.response.data? t(error.response.data): t("Registration was not successful")
                    }
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }, 150)
            })
        })
    }

    startResendOtpCountDownTimer = () => {
        if(this.resendOtpCountdownSeconds > 0) {
            this.intervalResendOtpCountDownTimer = setInterval(() => {
                if(this.resendOtpCountdownSeconds > 0) {
                    this.resendOtpCountdownSeconds = this.resendOtpCountdownSeconds - 1
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                } else {
                    clearInterval(this.intervalResendOtpCountDownTimer)
                    this.intervalResendOtpCountDownTimer = false
                    this.resendOtpCountdownSeconds = 0
                    this.setState({
                        forceRender: !this.state.forceRender
                    })
                }
            }, 1000)
        } else if(this.intervalResendOtpCountDownTimer) {
            clearInterval(this.intervalResendOtpCountDownTimer)
            this.intervalResendOtpCountDownTimer = false
        }
    }

    _onSmsListenerPressed = async () => {
        try {
            const registered = await SmsRetriever.startSmsRetriever();
            if (registered) {
                SmsRetriever.addSmsListener(event => {
                    let otpcode = event.message.toString().substring(0,6)
                    if(otpcode) {
                        this.form.otp = otpcode
                        this.setState({
                            forceRender: !this.state.forceRender
                        })
                    }
                    SmsRetriever.removeSmsListener();
                });
            }
        } catch (error) {
            console.log(JSON.stringify(error));
        }
    }

}

function mapStateToProps(state) {
    return {
        login_changed: state.login_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateLoginChanged: (LOGGEDIN_USER) => dispatch({ type: 'LOGIN_CHANGED', payload: LOGGEDIN_USER }),
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(VerifyOtp));
