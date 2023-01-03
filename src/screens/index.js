import React from 'react'

import i18next from '../locales'

import { Navigation } from 'react-native-navigation'

import SidebarLeft from '../components/sidebar.left'
import TermsAndConditionsScreenLeft from './sidebar-left/terms-and-conditions.screens'
import FaqScreenLeft from './sidebar-left/faq.screens'

import LoginScreen from './login.screens'
import RegisterScreen from './register.screens'

import HomeScreen from './home.screens'
import IntroScreen from './intro.screens'
import GroupDetailScreen from './group-detail.screens'
import SubjectsListingScreen from './subjects-listing.screens'
import SubjectDetailScreen from './subject-detail.screens'
import ChapterDetailScreen from './chapter-detail.screens'
import MainPlayerScreen from './main-player.screens'
import TutorialSummaryScreen from './tutorial-summary.screens'
import TutorialCommentScreen from './tutorial-comment.screens'
import DownloadedVideoScreen from './downloaded-video.screens'
import MyWishlistScreen from './my-wishlist.screens'
import SearchScreen from './search.screens'
import ChangePasswordScreen from './change-password.screens'
import ProfileScreen from './profile.screens'
import UpdateProfileScreen from './update-profile.screens'
import RecentTutorialScreen from './recent-tutorial.screens'
import VerifyOtpScreen from './verify-otp.screens'
import NotificationScreen from './notification.screens'
import NotificationDetailScreen from './notification-detail.screens'
import NewsfeedScreen from './newsfeed.screens'
import NewsfeedDetailScreen from './newsfeed-detail.screens'

import { createStore } from 'redux'
import { Provider } from 'react-redux'

global.RECENT_HAWK_LOADED_URL = ''
global.backHandlerClickCount = 1

const reducer = (state = '', action) => {
    switch (action.type) {
        case 'LOGIN_CHANGED':
            return { login_changed: action.payload}
        case 'WISHLIST_CHANGED':
            return { wishlist_changed: action.payload}
        case 'LANGUAGE_CHANGED':
            return { language_changed: action.payload}
    }
    return state
}

const store = createStore(reducer)

Navigation.registerComponent('sidebar.panntheefoundation.Left', () => (props) => (
    <Provider store={store}>
        <SidebarLeft {...props} />
    </Provider>
), () => SidebarLeft)

Navigation.registerComponent('sidebar.panntheefoundation.TermsAndConditionsScreenLeft', () => (props) => (
    <Provider store={store}>
        <TermsAndConditionsScreenLeft {...props} />
    </Provider>
), () => TermsAndConditionsScreenLeft)

Navigation.registerComponent('sidebar.panntheefoundation.FaqScreenLeft', () => (props) => (
    <Provider store={store}>
        <FaqScreenLeft {...props} />
    </Provider>
), () => FaqScreenLeft)

Navigation.registerComponent('navigation.panntheefoundation.ChangePasswordScreen', () => (props) => (
    <Provider store={store}>
        <ChangePasswordScreen {...props} />
    </Provider>
), () => ChangePasswordScreen)

Navigation.registerComponent('navigation.panntheefoundation.LoginScreen', () => (props) => (
    <Provider store={store}>
        <LoginScreen {...props} />
    </Provider>
), () => LoginScreen) 

Navigation.registerComponent('navigation.panntheefoundation.RegisterScreen', () => (props) => (
    <Provider store={store}>
        <RegisterScreen {...props} />
    </Provider>
), () => RegisterScreen)

Navigation.registerComponent('navigation.panntheefoundation.HomeScreen', () => (props) => (
    <Provider store={store}>
        <HomeScreen {...props} />
    </Provider>
), () => HomeScreen)

Navigation.registerComponent('navigation.panntheefoundation.IntroScreen', () => (props) => (
    <Provider store={store}>
        <IntroScreen {...props} />
    </Provider>
), () => IntroScreen)

Navigation.registerComponent('navigation.panntheefoundation.GroupDetailScreen', () => (props) => (
    <Provider store={store}>
        <GroupDetailScreen {...props} />
    </Provider>
), () => GroupDetailScreen)

Navigation.registerComponent('navigation.panntheefoundation.SubjectDetailScreen', () => (props) => (
    <Provider store={store}>
        <SubjectDetailScreen {...props} />
    </Provider>
), () => SubjectDetailScreen)

Navigation.registerComponent('navigation.panntheefoundation.SubjectsListingScreen', () => (props) => (
    <Provider store={store}>
        <SubjectsListingScreen {...props} />
    </Provider>
), () => SubjectsListingScreen)

Navigation.registerComponent('navigation.panntheefoundation.ChapterDetailScreen', () => (props) => (
    <Provider store={store}>
        <ChapterDetailScreen {...props} />
    </Provider>
), () => ChapterDetailScreen)

Navigation.registerComponent('navigation.panntheefoundation.MainPlayerScreen', () => (props) => (
    <Provider store={store}>
        <MainPlayerScreen {...props} />
    </Provider>
), () => MainPlayerScreen)

Navigation.registerComponent('navigation.panntheefoundation.TutorialSummaryScreen', () => (props) => (
    <Provider store={store}>
        <TutorialSummaryScreen {...props} />
    </Provider>
), () => TutorialSummaryScreen)

Navigation.registerComponent('navigation.panntheefoundation.TutorialCommentScreen', () => (props) => (
    <Provider store={store}>
        <TutorialCommentScreen {...props} />
    </Provider>
), () => TutorialCommentScreen)

Navigation.registerComponent('navigation.panntheefoundation.DownloadedVideoScreen', () => (props) => (
    <Provider store={store}>
        <DownloadedVideoScreen {...props} />
    </Provider>
), () => DownloadedVideoScreen)

Navigation.registerComponent('navigation.panntheefoundation.MyWishlistScreen', () => (props) => (
    <Provider store={store}>
        <MyWishlistScreen {...props} />
    </Provider>
), () => MyWishlistScreen)

Navigation.registerComponent('navigation.panntheefoundation.SearchScreen', () => (props) => (
    <Provider store={store}>
        <SearchScreen {...props} />
    </Provider>
), () => SearchScreen)

Navigation.registerComponent('navigation.panntheefoundation.ProfileScreen', () => (props) => (
    <Provider store={store}>
        <ProfileScreen {...props} />
    </Provider>
), () => ProfileScreen)

Navigation.registerComponent('navigation.panntheefoundation.UpdateProfileScreen', () => (props) => (
    <Provider store={store}>
        <UpdateProfileScreen {...props} />
    </Provider>
), () => UpdateProfileScreen)

Navigation.registerComponent('navigation.panntheefoundation.RecentTutorialScreen', () => (props) => (
    <Provider store={store}>
        <RecentTutorialScreen {...props} />
    </Provider>
), () => RecentTutorialScreen)

Navigation.registerComponent('navigation.panntheefoundation.VerifyOtpScreen', () => (props) => (
    <Provider store={store}>
        <VerifyOtpScreen {...props} />
    </Provider>
), () => VerifyOtpScreen)

Navigation.registerComponent('navigation.panntheefoundation.NotificationScreen', () => (props) => (
    <Provider store={store}>
        <NotificationScreen {...props} />
    </Provider>
), () => NotificationScreen)

Navigation.registerComponent('navigation.panntheefoundation.NotificationDetailScreen', () => (props) => (
    <Provider store={store}>
        <NotificationDetailScreen {...props} />
    </Provider>
), () => NotificationDetailScreen)

Navigation.registerComponent('navigation.panntheefoundation.NewsfeedScreen', () => (props) => (
    <Provider store={store}>
        <NewsfeedScreen {...props} />
    </Provider>
), () => NewsfeedScreen)

Navigation.registerComponent('navigation.panntheefoundation.NewsfeedDetailScreen', () => (props) => (
    <Provider store={store}>
        <NewsfeedDetailScreen {...props} />
    </Provider>
), () => NewsfeedDetailScreen)


