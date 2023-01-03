import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, 
    TouchableOpacity, BackHandler, FlatList, StatusBar, Linking, ImageBackground, RefreshControl, ActivityIndicator, ScrollView } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Button, Spinner, Select } from 'native-base'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faEdit, faUser, faPhone, faEnvelope, faLanguage } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import { handleSharedUrl, onBackButtonPressAndroid } from '../modules/utils.common.js'

import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import UserModule from '../services/user.module'

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {connect} from 'react-redux'
import NetInfo from "@react-native-community/netinfo"
import PhotoUpload from 'react-native-photo-upload'
import SpinnerOverlay from 'react-native-loading-spinner-overlay'
import ModalAlert from '../components/modal-alert'
import FastImage from 'react-native-fast-image'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

class ProfileScreen extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            login_changed: false,
            
            forceRender: false,
            loading: false,
            isConnected: true,
            modalBlockingSpinner: {
                visible: false
            }
        }

        this.backHandler = false
        
        this.LOGGEDIN_USER = false

        this.user = false

        this.userModule = new UserModule

        this.modalAlert = {
            visible: false,
            title: "",
            description: ""
        }

        this.profileImageFile = false
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

    load = (forceRefresh) => {
        const { i18n } = this.props
        
        this.user = false

        this.userModule.getProfile({ userId: this.LOGGEDIN_USER.id })
            .then((response) => {
                this.user = response.data.data

                this.setState({
                    loading: false,
                    forceRender: !this.state.forceRender
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                    forceRender: !this.state.forceRender
                })
            })
    }

    componentDidMount() {
        const { t } = this.props
        this.navigationEventListener = Navigation.events().bindComponent(this)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => onBackButtonPressAndroid(t))
        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
        })

        Linking.getInitialURL().then((url) => handleSharedUrl({url: url}))
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove()
        }

        if(this.netInfoEventListener) {
            this.netInfoEventListener()
        }

        if(this.backHandler) {
            this.backHandler.remove()
            this.backHandler = false
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

            this.setState({
                loading: true
            })
            this.load()
        }).catch(() => {
            this.setState({
                loading: true
            })
            this.load()
        })

        if(this.backHandler == false) {
            const { t } = this.props
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => onBackButtonPressAndroid(t))
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
        const state = this.state
        const { width, height } = Dimensions.get('window')
        const { isConnected, loading } = this.state
        const { t, i18n } = this.props
        
        const logo_image = require('../assets/images/panthee-logo-no-text.png')
        const profile_image = require('../assets/images/profile.jpeg')
        const background_image = require('../assets/images/pannthee-bg.jpg')
        const user = this.user
        const modalAlert = this.modalAlert

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
                
                <ImageBackground source={background_image} style={{
                    flex: 1,
                    width: width,
                    height: loading == true? height: 'auto'
                }} imageStyle={{
                    opacity: (Platform.OS == "android"? 0.5: 1)
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
                                        justifyContent: 'center',
                                    }}>
                                        <Image source={logo_image} style={{
                                            width: 40,
                                            height: 45
                                        }} />
                                    </TouchableOpacity>
                                </Box>
                            </Col>
                        </Grid>
                    </Box>
                    {
                        isConnected != true && (
                            <Box style={{
                                paddingRight: COMMON_STYLE.PADDING,
                                paddingLeft: COMMON_STYLE.PADDING
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        color: COLORS.BLACK,
                                        textAlign: 'center'
                                    }
                                ]}>{ t('No Internet Connection') }</Text>
                            </Box>
                        )
                    }

                    {
                        (isConnected && loading == true) && (
                            <Spinner color={COLORS.THEME} />
                        )
                    }

                    {
                        (isConnected && loading == false && this.user == false) && (
                            <Box style={{
                                marginTop: 30,
                                paddingRight: COMMON_STYLE.PADDING,
                                paddingLeft: COMMON_STYLE.PADDING
                            }}>
                                <Text style={[
                                    COMMON_STYLES[i18n.language].regular,
                                    {
                                        color: COLORS.BLACK
                                    }
                                ]}>{ t('No user found') }</Text>
                            </Box>
                        )
                    }

                    {
                        (isConnected && loading == false && this.user != false) && (
                            <ScrollView>
                                <Box style={{
                                    marginTop: 30,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Box style={{
                                        width: 150,
                                        height: 150,
                                        borderRadius: 100,
                                        backgroundColor: COLORS.WHITE,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <PhotoUpload
                                            height={200}
                                            width={200}
                                            quality={100}
                                            onPhotoSelect={image => {
                                                if (image) {
                                                    this.userModule.uploadProfilePhoto({
                                                        folder_name: 'user-module', 
                                                        file_name: this.profileImageFile.file_name, 
                                                        file_type: this.profileImageFile.file_type, 
                                                        size: this.profileImageFile.size,
                                                        file: image
                                                    }).then((response) => {                                                        
                                                        let profile_image_path = response.data.data.path
                                                        this.userModule.updateProfile({ userId: this.LOGGEDIN_USER.id, form: {
                                                            profile_image: profile_image_path
                                                        }}).then((response) => {
                                                            this.profileImageFile = false
                                                            this.user.profile_image = profile_image_path

                                                            this.setState({
                                                                modalBlockingSpinner: {
                                                                    visible: false
                                                                }
                                                            })
                                                        }).catch((error) => {
                                                            console.log(error)
                                                            this.profileImageFile = false
                                                            this.setState({
                                                                modalBlockingSpinner: {
                                                                    visible: false
                                                                }
                                                            }, () => {
                                                                this.modalAlert = {
                                                                    visible: true,
                                                                    title: t("Update Profile Photo Failed"),
                                                                    description: "Updating profile photo failed"
                                                                }
                                                                this.setState({
                                                                    forceRender: !this.state.forceRender
                                                                })
                                                            })
                                                        })
                                                    }).catch((error) => {
                                                        console.log(error)
                                                        this.profileImageFile = false
                                                        this.setState({
                                                            modalBlockingSpinner: {
                                                                visible: false
                                                            }
                                                        }, () => {
                                                            this.modalAlert = {
                                                                visible: true,
                                                                title: t("Upload Profile Photo Failed"),
                                                                description: "Uploading profile photo failed"
                                                            }
                                                            this.setState({
                                                                forceRender: !this.state.forceRender
                                                            })
                                                        })
                                                    })
                                                } else {
                                                    this.setState({
                                                        modalBlockingSpinner: {
                                                            visible: false
                                                        }
                                                    })
                                                }
                                            }}

                                            onResponse={image => {
                                                // delete image.data
                                                if(image) {
                                                    this.profileImageFile = {
                                                        file_name: image.fileName || ((Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)) + ".jpg"), 
                                                        file_type: image.type || "image/jpeg", 
                                                        size: image.fileSize        
                                                    }

                                                    this.setState({
                                                        modalBlockingSpinner: {
                                                            visible: true
                                                        }
                                                    })
                                                } else {
                                                    this.setState({
                                                        modalBlockingSpinner: {
                                                            visible: false
                                                        }
                                                    })
                                                }
                                            }}
                                        >
                                            {
                                                (user.profile_image) && (
                                                    <FastImage
                                                        source={{
                                                            uri: CommonConstants.storage_endpoint + '/' + user.profile_image
                                                        }}
                                                        style={{
                                                            width: 130,
                                                            height: 130,
                                                            borderRadius: 65
                                                        }}
                                                    />
                                                )
                                            }

                                            {
                                                (!user.profile_image) && (
                                                    <Image source={profile_image} style={{
                                                        width: 130,
                                                        height: 130,
                                                        borderRadius: 65
                                                    }} />
                                                )
                                            }
                                            
                                            <Box style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                backgroundColor: COLORS.BLACK,
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FontAwesomeIcon icon={faEdit} size={30} style={
                                                    { 
                                                        color: COLORS.WHITE
                                                    }
                                                } />
                                            </Box>
                                        </PhotoUpload>
                                    </Box>

                                    {
                                        /*
                                            <Box style={{
                                                alignSelf: 'flex-end',
                                                marginRight: COMMON_STYLE.PADDING
                                            }}>
                                                <TouchableOpacity onPress={this._onClickedLogout}>
                                                    <Text style={[
                                                        COMMON_STYLES[i18n.language].regular,
                                                        {
                                                            color: COLORS.BLACK,
                                                            textDecorationLine: 'underline'
                                                        }
                                                    ]}>{ t('Logout') }</Text>
                                                </TouchableOpacity>
                                            </Box>
                                        */
                                    }
                                </Box>

                                <Box style={{
                                    marginTop: 20,
                                    backgroundColor: COLORS.WHITE,
                                    borderTopLeftRadius: 50,
                                    borderTopRightRadius: 50,
                                    paddingBottom: 20,
                                    height: height > 740? height - (210 + statusBarCurrentHeight): '100%',
                                    flex: 1
                                }}>

                                    <Box style={{
                                        marginTop: 30,
                                        height: Platform.OS == "android"? 300: 360
                                    }}>

                                        <Grid>
                                            <Row style={{
                                                height: 60,
                                                marginBottom: 10
                                            }}>
                                                <Col style={{
                                                    width: 60,
                                                    alignItems: 'center'
                                                }}>
                                                    <FontAwesomeIcon icon={faUser} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK,
                                                            marginTop: 18
                                                        }
                                                    } />
                                                </Col>
                                                <Col>
                                                    <Box style={{
                                                        marginTop: 10
                                                    }}>
                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].bold,
                                                            {
                                                                color: COLORS.BLACK
                                                            }
                                                        ]}>{ t('Name') }</Text>

                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].regular,
                                                            {
                                                                color: COLORS.BLACK
                                                            }
                                                        ]}>{ user.first_name }</Text>
                                                    </Box>
                                                </Col>
                                            </Row>

                                            <Row style={{
                                                height: 60,
                                                marginBottom: 10
                                            }}>
                                                <Col style={{
                                                    width: 60,
                                                    alignItems: 'center'
                                                }}>
                                                    <FontAwesomeIcon icon={faPhone} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK,
                                                            marginTop: 18
                                                        }
                                                    } />
                                                </Col>
                                                <Col>
                                                    <Box style={{
                                                        marginTop: 10
                                                    }}>
                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].bold,
                                                            {
                                                                color: COLORS.BLACK
                                                            }
                                                        ]}>{ t('Phone No') }</Text>

                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].regular,
                                                            {
                                                                color: COLORS.BLACK
                                                            }
                                                        ]}>{ user.phone }</Text>
                                                    </Box>
                                                </Col>
                                            </Row>

                                            <Row style={{
                                                height: 60,
                                                marginBottom: 10
                                            }}>
                                                <Col style={{
                                                    width: 60,
                                                    alignItems: 'center'
                                                }}>
                                                    <FontAwesomeIcon icon={faEnvelope} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK,
                                                            marginTop: 18
                                                        }
                                                    } />
                                                </Col>
                                                <Col>
                                                    <Box style={{
                                                        marginTop: 10
                                                    }}>
                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].bold,
                                                            {
                                                                color: COLORS.BLACK
                                                            }
                                                        ]}>{ t('Email Address') }</Text>

                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].regular,
                                                            {
                                                                color: COLORS.BLACK
                                                            }
                                                        ]}>{ user.email }</Text>
                                                    </Box>
                                                </Col>
                                            </Row>

                                            <Row style={{
                                                height: 60
                                            }}>
                                                <Col style={{
                                                    width: 60,
                                                    alignItems: 'center'
                                                }}>
                                                    <FontAwesomeIcon icon={faLanguage} size={20} style={
                                                        { 
                                                            color: COLORS.BLACK,
                                                            marginTop: 18
                                                        }
                                                    } />
                                                </Col>
                                                <Col>
                                                    <Box style={{
                                                        marginTop: 10
                                                    }}>
                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].bold,
                                                            {
                                                                color: COLORS.BLACK,
                                                                marginBottom: 10
                                                            }
                                                        ]}>{ t('Language') }</Text>

                                                        <Select
                                                            dropdownIcon={<Box />}
                                                            placeholder={ t('Choose Language') }
                                                            placeholderTextColor={COLORS.BLACK}
                                                            _item={{
                                                                _text: COMMON_STYLES[i18n.language].regular
                                                            }}
                                                            style={[
                                                                COMMON_STYLES[i18n.language].input
                                                            ]}
                                                            maxWidth={250}
                                                            selectedValue={ user.language }
                                                            onValueChange={this._onLanguageValueChange.bind(this)}
                                                        >
                                                            <Select.Item key="en" label={ t('English') } value="en" />
                                                            <Select.Item key="mm" label={ t('Myanmar Unicode') } value="mm" />
                                                            <Select.Item key="zg" label={ t('Myanmar Zawgyi') } value="zg" />

                                                        </Select>

                                                    </Box>
                                                </Col>
                                            </Row>
                                        </Grid>
                                    </Box>

                                    <Box style={{
                                        marginTop: 40,
                                        height: 80
                                    }}>
                                        <Grid>
                                            <Col style={{
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <TouchableOpacity onPress={this._onClickedUpdateProfile}>
                                                    <Box style={{
                                                        backgroundColor: COLORS.THEME,
                                                        borderRadius: 20,
                                                        width: 160,
                                                        height: 60,
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={[
                                                            COMMON_STYLES[i18n.language].regular,
                                                            {
                                                                color: COLORS.WHITE,
                                                                textAlign: 'center'
                                                            }
                                                        ]} numberOfLines={1}>{ t('Edit Profile') }</Text>
                                                    </Box>
                                                </TouchableOpacity>
                                            </Col>
                                        </Grid>
                                    </Box>

                                </Box>
                            </ScrollView>
                        )
                    }
                    </ImageBackground>
                        
                </SafeAreaView>

            </NativeBaseProvider>
        )
    }

    _onClickedHome = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTabs: {
                currentTabIndex: 0
            }
        })
    }

    _onClickedUpdateProfile = () => {
        Navigation.push("profile", {
            component: {
                name: 'navigation.panntheefoundation.UpdateProfileScreen',
                passProps: {
                    user: this.user
                },
                options: {
                    animations: {
                        push: {
                            waitForRender: true,
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
                        // right: {
                        //     visible: false
                        // }
                    }
                }
            }
        })
    }

    _onClickedChangePassword = () => {
        Navigation.push("profile", {
            component: {
                name: 'navigation.panntheefoundation.ChangePasswordScreen',
                passProps: {
                    
                },
                options: {
                    animations: {
                        push: {
                            waitForRender: true,
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
                        // right: {
                        //     visible: false
                        // }
                    }
                }
            }
        })
    }

    _onClickedLogout = () => {
        this.LOGGEDIN_USER = false
        AsyncStorage.multiRemove([
            CommonConstants.PERSISTENT_STORAGE_KEY.LOGGEDIN_USER,
            CommonConstants.PERSISTENT_STORAGE_KEY.SEARCH_RECENT_KEYWORDS
        ])

        this.props.updateLoginChanged(this.LOGGEDIN_USER)

        setTimeout(() => {
            Navigation.setRoot({
                root: {
                    stack: {
                        children: [
                            {
                                component: {
                                    name: 'navigation.panntheefoundation.LoginScreen',
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
                }
            })
        }, 150)
    }

    _onLanguageValueChange(value: string) {
        const { t, i18n } = this.props

        this.setState({
            modalBlockingSpinner: {
                visible: true
            }
        })

        this.userModule.updateProfile({ userId: this.LOGGEDIN_USER.id, form: {
            language: value
        }}).then((response) => {
            this.setState({
                modalBlockingSpinner: {
                    visible: false
                }
            }, () => {
                setTimeout(() => {
                    this.user.language = value

                    i18n.changeLanguage(value).then((t) => {
                        AsyncStorage.setItem(CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE, i18n.language)
                        this.modalAlert = {
                            visible: true,
                            title: t("Language updated successfully")
                        }
                        this.setState({
                            forceRender: !this.state.forceRender
                        })
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
                    if(error && error.response && error.response.data && error.response.data.message) {
                        this.modalAlert = {
                            visible: true,
                            title: t("Update Profile Failed"),
                            description: error.response.data.message? t(error.response.data.message): t(error.response.data[0])
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ProfileScreen));
