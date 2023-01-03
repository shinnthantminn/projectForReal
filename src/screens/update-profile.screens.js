import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, StatusBar, Image, Animated, TouchableOpacity, BackHandler, FlatList, ImageBackground, Text, ScrollView } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Badge, FormControl, Stack, Input, Button, Picker } from 'native-base'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faUser, faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import SpinnerOverlay from 'react-native-loading-spinner-overlay'

import UserModule from '../services/user.module'

import AsyncStorage from '@react-native-async-storage/async-storage'
import CommonConstants from '../modules/constants.common.js'

import ModalAlert from '../components/modal-alert'
import PhoneInput from 'react-native-phone-input'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class UpdateProfileScreen extends React.PureComponent {
    static options(passProps) {
        return {
            sideMenu: {
                left: {
                    visible: true
                }
            }
        }
    }

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
            first_name: '',
            phone: '',
            email: '',
            language: ''
        }

        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.mobileCountryCodeRef = false
        this.backHandler = false
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
        this.navigationEventListener = Navigation.events().bindComponent(this)

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove()
        }
    }

    componentDidAppear() {
        this.form.first_name = this.props.user.first_name || ''
        this.form.phone = this.props.user.phone || ''
        this.form.email = this.props.user.email || ''
        this.form.language = this.props.user.language || ''

        AsyncStorage.multiGet([
            CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER
        ]).then((storedData) => {
            if(storedData) {
                if(storedData[0] && storedData[0][1] != null && storedData[0][1] != false) {
                    let LOGGEDIN_USER = JSON.parse(storedData[0][1])
                    this.LOGGEDIN_USER = LOGGEDIN_USER
                }
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
        }).catch(() => {
            this.setState({
                forceRender: !this.state.forceRender
            })
        })

        if(this.backHandler == false) {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
        }
    }

    componentDidDisappear() {
        if(this.backHandler) {
            this.backHandler.remove()
            this.backHandler = false
        }
    }

    render() {
        const statusBarCurrentHeight =getStatusBarHeight(true)
        const { width, height } = Dimensions.get('window')
        const { firebaseConfirmationResult, registerForm, source, t, i18n } = this.props
        const state = this.state
        const modalAlert = this.modalAlert

        const logo_image = require('../assets/images/panthee-logo.png')
        const background_image = require('../assets/images/pannthee-bg.jpg')

        const form_phone = this.form.phone
        const validatedFormPhone = parsePhoneNumberFromString(form_phone)

        if(validatedFormPhone) {
            this.form.phone = validatedFormPhone.format('NATIONAL')    
        }

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
                                            ]}>{ t('Name') }</Text>
                                        </FormControl.Label>

                                        <Box>
                                            <Input 
                                                InputLeftElement={
                                                    <FontAwesomeIcon icon={faUser} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK
                                                        }
                                                    } />
                                                }
                                                defaultValue={ this.form.first_name }
                                                onChangeText={(text) => this.form.first_name = text} 
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
                                            ]}>{ t('Phone') }</Text>
                                        </FormControl.Label>

                                        <Box>
                                            <Input 
                                                InputLeftElement={
                                                    <Box>
                                                        <PhoneInput 
                                                            ref={(ref) => { this.mobileCountryCodeRef = ref }}
                                                            initialCountry='mm' 
                                                            flagStyle={{ width: 40, height: 25, borderWidth:0 }} 
                                                            confirmText={ t('Confirm') }
                                                            cancelText={ t('Cancel') }
                                                            textStyle={[
                                                                COMMON_STYLES[i18n.language].regular,
                                                                {
                                                                    color: COLORS.BLACK
                                                                }
                                                            ]}
                                                            countriesList={require('../assets/config/custom-countries.json')} />
                                                    </Box>
                                                }
                                                defaultValue={ this.form.phone }
                                                onChangeText={(value) => {
                                                    this.form.phone = value
                                                }}
                                                placeholder="09xxxxxxx" 
                                                placeholderTextColor={COLORS.BLACK}
                                                
                                                keyboardType={'numeric'}
                                                variant="underlined"
                                                style={[
                                                    COMMON_STYLES[i18n.language].input
                                                ]} />
                                        </Box>

                                    </Stack>
                                </FormControl>

                                <FormControl style={{
                                    height: 80,
                                    marginBottom: 20
                                }}>
                                    <Stack mx={2}>
                                        <FormControl.Label>
                                            <Text style={[
                                                COMMON_STYLES[i18n.language].bold
                                            ]}>{ t('Email') }</Text>
                                        </FormControl.Label>

                                        <Box>
                                            <Input 
                                                InputLeftElement={
                                                    <FontAwesomeIcon icon={faEnvelope} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK
                                                        }
                                                    } />
                                                }
                                                defaultValue={ this.form.email }
                                                onChangeText={(text) => this.form.email = text} 
                                                variant="underlined"
                                                style={[
                                                    COMMON_STYLES[i18n.language].input
                                                ]} />
                                        </Box>
                                    </Stack>
                                </FormControl>

                                <Button block onPress={this._onUpdateProfile} style={[
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

    _onLanguageValueChange(value: string) {
        this.form.language = value
        
        this.setState({
            forceRender: !this.state.forceRender
        });
    }

    _onUpdateProfile = () => {
        const { t } = this.props

        if(!this.form.first_name) {
            this.modalAlert = {
                visible: true,
                title: t("Name Required"),
                description: t("Please provide name")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })

            return false
        }

        if(!this.form.phone) {
            this.modalAlert = {
                visible: true,
                title: t("Phone Required"),
                description: t("Please provide mobile number")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false
        }

        if(this.form.phone.startsWith('+') || this.form.phone.startsWith('+' + this.mobileCountryCodeRef.getCountryCode())) {
            this.modalAlert = {
                visible: true,
                title: t("Invalid Mobile Number"),
                description: t("Please provide valid mobile number")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false
        }

        const mobile_number = "+" + this.mobileCountryCodeRef.getCountryCode() + this.form.phone
        const validatedPhoneNumber = parsePhoneNumberFromString(mobile_number)

        if(!validatedPhoneNumber || !validatedPhoneNumber.country || !validatedPhoneNumber.isValid() || validatedPhoneNumber.country.toLowerCase() != this.mobileCountryCodeRef.getISOCode()) {
            this.modalAlert = {
                visible: true,
                title: t("Invalid Mobile Number"),
                description: t("Please provide valid mobile number")
            }
            this.setState({
                forceRender: !this.state.forceRender
            })
            return false
        }

        if(this.form.email) {
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if(!emailRegex.test(this.form.email)) {
                this.modalAlert = {
                    visible: true,
                    title: t("Invalid Email"),
                    description: t("Please enter a valid email address")
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

        let form = _.clone(this.form)

        form.phone = validatedPhoneNumber.format("E.164")

        this.userModule.updateProfile({ userId: this.LOGGEDIN_USER.id, form: form}).then((response) => {
            this.setState({
                modalBlockingSpinner: {
                    visible: false
                }
            }, () => {
                setTimeout(() => {
                    // this.modalAlert = {
                    //     visible: true,
                    //     title: t("Update Profile Successful"),
                    //     description: t("Profile has been updated successfully")
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
                    if(error && error.response && error.response.data) {
                        let msg = false
                        if(error.response.data.toString().indexOf("is already registered. Please use a different Phone") > -1) {                                
                            msg = t('phone_already_registered', {
                                phone: form.phone
                            })
                        } else if(error.response.data.toString().indexOf("is already registered. Please use a different Email") > -1) {                                
                            msg = t('email_already_registered', {
                                email: form.email
                            })
                        } else {
                            msg = t(error.response.data)
                        }

                        this.modalAlert = {
                            visible: true,
                            title: t("Update Profile Failed"),
                            description: msg? msg: (error.response.data.message? t(error.response.data.message): t(error.response.data[0]))
                        }
                        this.setState({
                            forceRender: !this.state.forceRender
                        })

                    } else {
                        this.modalAlert = {
                            visible: true,
                            title: t("Update Profile Failed"),
                            description: t("Unable to update your profile. Please contact support team")
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

export default withTranslation()(UpdateProfileScreen)

