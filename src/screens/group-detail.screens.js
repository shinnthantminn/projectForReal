import React, { Fragment } from 'react'
import { StyleSheet, SafeAreaView, Platform, Dimensions, Image, Animated, 
    TouchableOpacity, FlatList, StatusBar, Linking, ImageBackground, RefreshControl, ActivityIndicator, BackHandler } from 'react-native'

import { Navigation } from 'react-native-navigation'

import { NativeBaseProvider, Box, Text, Badge, Button, Spinner } from 'native-base'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faChevronRight, faBook } from '@fortawesome/free-solid-svg-icons'

import { withTranslation } from "react-i18next"

import COMMON_STYLES, { COLORS, FONTS, COMMON_STYLE } from '../modules/styles.common.js'
import { handleSharedUrl } from '../modules/utils.common.js'

import _ from 'lodash'
import {Grid,Row,Col} from 'react-native-easy-grid'

import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper'
import DigiedModule from '../services/digied.module'

import TextBookSubject from '../components/textbook-subject'

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

import {connect} from 'react-redux'
import NetInfo from "@react-native-community/netinfo"

import * as Animatable from 'react-native-animatable'
import ModalAppVersionForceUpdate from '../components/modal-app-version-force-update.js'

AnimatableBox = Animatable.createAnimatableComponent(Box);

class GroupDetailScreen extends React.PureComponent {
    constructor(props){
        super(props)

        this.state = {
            login_changed: false,
            
            forceRender: false,
            // loading: true,
            loading: false,
            loading_more: false,
            refreshing: false,
            isConnected: true
        }

        this.page = 1
        this.last_loaded_page = 0
        this.has_next = false
        
        this.LOGGEDIN_USER = false

        this.selectedGroup = props.item

        this.grades = []

        this.digiedModule = new DigiedModule
        this.backHandler = false
    }

    load = (forceRefresh) => {
        const { i18n } = this.props

        if(this.state.refreshing == true || forceRefresh == true) {
            this.grades = []
        }
        
        this.digiedModule.getCourseAndSubjectByCourseCategory({ page: this.page, per_page: 3, course_category_id: this.selectedGroup.id })
            .then((response) => {
                const image = require('../assets/images/panthee-logo.png')

                _.each(response.data.data, (data, index) => {
                    let grade = {
                        id: data.id,
                        name: data.course_name,
                        description: data.course_description
                    }

                    if(i18n.language != 'en' && data.course_name_l10n && data.course_name_l10n[i18n.language]) {
                        grade.name = data.course_name_l10n[i18n.language]
                    }

                    if(i18n.language != 'en' && data.course_description_l10n && data.course_description_l10n[i18n.language]) {
                        grade.description = data.course_description_l10n[i18n.language]
                    }

                    if(data.subjects && data.subjects.length > 0) {
                        grade.subjects = []
                        let grouped_subjects = _.chunk(data.subjects, 2)
                        _.each(grouped_subjects, (grouped_subject_items) => {
                            let new_grouped_subject_items = []
                            _.each(grouped_subject_items, (grouped_subject_item) => {
                                let new_grouped_subject_item = {
                                    id: grouped_subject_item.id,
                                    name: grouped_subject_item.subject_name,
                                    description: '',
                                    total_chapter: grouped_subject_item.total_chapter
                                }

                                if(i18n.language != 'en' && grouped_subject_item.subject_name_l10n && grouped_subject_item.subject_name_l10n[i18n.language]) {
                                    new_grouped_subject_item.name = grouped_subject_item.subject_name_l10n[i18n.language]
                                }

                                if(grouped_subject_item.subject_image) {
                                    new_grouped_subject_item.image = {
                                        uri: CommonConstants.storage_endpoint + '/' + grouped_subject_item.subject_image
                                    }
                                } else {
                                    new_grouped_subject_item.image = image
                                }

                                if(grouped_subject_item.subject_cover_image) {
                                    new_grouped_subject_item.cover_image = {
                                        uri: CommonConstants.storage_endpoint + '/' + grouped_subject_item.subject_cover_image
                                    }
                                } else {
                                    new_grouped_subject_item.cover_image = image
                                }

                                if(grouped_subject_item.subject_banner_image) {
                                    new_grouped_subject_item.subject_banner_image = {
                                        uri: CommonConstants.storage_endpoint + '/' + grouped_subject_item.subject_banner_image
                                    }
                                } else {
                                    new_grouped_subject_item.subject_banner_image = image
                                }
                                
                                new_grouped_subject_item.course = {
                                    id: data.id,
                                    course_name: data.course_name
                                }

                                if(i18n.language != 'en' && data.course_name_l10n && data.course_name_l10n[i18n.language]) {
                                    new_grouped_subject_item.course.course_name = data.course_name_l10n[i18n.language]
                                }

                                new_grouped_subject_items.push(new_grouped_subject_item)
                            })

                            if(new_grouped_subject_items.length > 0) {
                                grade.subjects.push({
                                    items: new_grouped_subject_items
                                })    
                            }
                        })
                    }
                    
                    this.grades.push(grade)
                })

                if((response.data.meta.current_page * response.data.meta.per_page) < response.data.meta.total) {
                    this.has_next = true
                } else {
                    this.has_next = false
                }

                this.last_loaded_page = this.page

                this.setState({
                    loading: false,
                    refreshing: false,
                    loading_more: false,
                    forceRender: !this.state.forceRender
                })
            }).catch((error) => {
                this.setState({
                    loading: false,
                    refreshing: false,
                    loading_more: false,
                    forceRender: !this.state.forceRender
                })
            })
    }

    _onLoadRefresh = () => {
        if(this.state.refreshing == true) {
            return false
        }
        this.page = 1
        this.setState({
            refreshing: true
        }, () => {
            this.load()
        })
        
        // reload the page
    }

    _onLoadMore = () => {
        if(this.state.loading_more == true) {
            return false
        }
        if(this.has_next == false) {
            return false
        }
        this.setState({
            loading_more: true
        })
        this.page = this.page + 1
        this.load()
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this._onClickedBack())
        this.netInfoEventListener = NetInfo.addEventListener((netInfoState) => {
            if(this.state.isConnected != netInfoState.isConnected) {
                this.setState({ isConnected: netInfoState.isConnected })
            }
        })

        const { item } = this.props

        this.selectedGroup = item

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
        
        Linking.getInitialURL().then((url) => handleSharedUrl({url: url}))
    }

    componentWillUnmount() {
        if (this.navigationEventListener) {
            this.navigationEventListener.remove();
        }

        if(this.netInfoEventListener) {
            this.netInfoEventListener()
        }
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

    _onClickedGradeSeeAll = (item) => () => {
        Navigation.push("home", {
            component: {
                name: 'navigation.panntheefoundation.SubjectsListingScreen',
                passProps: {
                    item: item
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

    renderGradeSubject = ({item, index}) => {
        const { width, height } = Dimensions.get('window');
        let theWidth = (width - 67) / 2
        let renderItem;
        let itemsRender = item.items.map((dataItem, indexItem) => {
            return (
                <Col key={ 'subject_item_' + indexItem } style={{
                    width: theWidth,
                    marginLeft: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    marginRight: 5,
                    borderRadius: 6
                }}>
                    <TextBookSubject item={dataItem} screenComponentId={this.props.componentId} />
                </Col>
            )
        })

        renderItem = (
            <Grid key={ 'subject_' + index } style={{
                width: item.items.length == 2? (width - 57): ((width/2) - 28.5),
                marginRight: 0
            }}>
                {itemsRender}
            </Grid>
        )

        return renderItem
    }

    renderGrade = ({ item, index}) => {
        let renderItem
        const { width, height } = Dimensions.get('window')
        const { t, i18n } = this.props

        renderItem = (
            <Box style={{
                marginBottom: 10,
                backgroundColor: '#d9fed2',
                borderRadius: 6,
                paddingTop: COMMON_STYLE.PADDING,
            }}>
                <Grid style={{
                    paddingLeft: COMMON_STYLE.PADDING,
                    paddingRight: COMMON_STYLE.PADDING
                }}>
                    <Row>
                        <Col>
                            <Box style={{
                                flex: 1,
                                flexDirection: 'row'
                            }}>
                                <FontAwesomeIcon icon={faBook} size={25} style={
                                    { 
                                        color: COLORS.THEME,
                                        marginTop: (Platform.OS == "ios"? 10: 0)
                                    }
                                } />

                                <Box style={{
                                    marginLeft: 10
                                }}>
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].bold,
                                        {
                                            color: COLORS.THEME
                                        }
                                    ]} numberOfLines={2}>{item.name}</Text>
                                </Box>
                            </Box>
                        </Col>
                        {/*<Col style={{
                            width: 120,
                            alignItems: 'flex-end'
                        }}>
                            <TouchableOpacity onPress={this._onClickedGradeSeeAll(item)}>
                                <Box style={{
                                    width: 120,
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end'
                                }}>
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            color: COLORS.THEME
                                        }
                                    ]} numberOfLines={1}>{ t('see all') }</Text>
                                    <FontAwesomeIcon icon={faChevronRight} size={20} style={
                                        { 
                                            color: COLORS.THEME,
                                            marginLeft: 10,
                                            marginTop: 2
                                        }
                                    } />
                                    </Box>
                            </TouchableOpacity>
                        </Col>*/}
                    </Row>
                </Grid>

                <Box style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginTop: COMMON_STYLE.PADDING,
                    paddingBottom: COMMON_STYLE.PADDING
                }}>
                    <FlatList
                        keyExtractor={ (gradeItem, gradeIndex) => 'grade_subjects_' + gradeIndex.toString() }
                        data={ item.subjects }
                        renderItem={ this.renderGradeSubject }
                        numColumns={1}
                        extraData={this.state}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        initialNumToRender={10}
                    />
                </Box>
            </Box>
        )

        return renderItem
    }

    render() {
        const statusBarCurrentHeight = getStatusBarHeight(true)
        const state = this.state
        const { width, height } = Dimensions.get('window')
        const { isConnected, loading, loading_collection } = this.state
        const { t, i18n } = this.props

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
                    <ModalAppVersionForceUpdate />
                    
                    <ImageBackground source={background_image}  style={{
                        flex: 1,
                        width: width,
                        height: loading == true? height: 'auto'
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

                        <Box style={{
                            paddingTop: 10,
                            paddingLeft: COMMON_STYLE.PADDING,
                            paddingRight: COMMON_STYLE.PADDING,
                            flex: 1
                        }}>
                            {
                                isConnected != true && (
                                    <Text style={[
                                        COMMON_STYLES[i18n.language].regular,
                                        {
                                            color: COLORS.BLACK,
                                            textAlign: 'center'
                                        }
                                    ]}>{ t('No Internet Connection') }</Text>
                                )
                            }

                            {
                                (isConnected && loading == true) && (
                                    <Spinner color={COLORS.THEME} />
                                )
                            }

                            {
                                (isConnected && loading == false && this.grades.length > 0) && (
                                    <FlatList
                                        keyExtractor={ (item, index) => 'grades_' + index.toString() }
                                        data={ this.grades }
                                        renderItem={ this.renderGrade }
                                        numColumns={1}
                                        extraData={this.state}
                                        scrollEnabled={true}
                                        showsVerticalScrollIndicator={false}
                                        initialNumToRender={3}

                                        onEndReached={this._onLoadMore}
                                        onEndReachedThreshold={0.5}
                                        refreshControl={
                                            <RefreshControl
                                                progressViewOffset={-height}
                                                refreshing={this.state.refreshing}
                                                onRefresh={this._onLoadRefresh}
                                            />
                                        }
                                        ListFooterComponent={
                                            (this.state.loading_more) && (
                                                <AnimatableBox transition="fadeInDown" style={{
                                                    paddingTop: 10,
                                                    paddingBottom: 10
                                                }}>
                                                    <ActivityIndicator size={35} color={COLORS.WHITE} />
                                                </AnimatableBox>
                                            )

                                        }
                                    />
                                )
                            }
                        </Box>
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
        Navigation.popToRoot("home")
    }
}

function mapStateToProps(state) {
    return {
        login_changed: state.login_changed
    }
}

function mapDispatchToProps(dispatch) {
    return {
        
    }
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(GroupDetailScreen));
