npx react-native init com_panntheefoundation --package=com.panntheefoundation

### ios 15 hot fix for bottom tab

https://github.com/wix/react-native-navigation/issues/7266

### For different environment

-- yarn add react-native-config
-- react-native link react-native-config
-- ENVFILE=.env.staging react-native run-android
-- import Config from 'react-native-config';
-- { Config.API_URL }

### For native base custom theme

-- node node_modules/native-base/ejectTheme.js
-- Follow native base structure for customization
-- http://docs.nativebase.io/Customize.html#Customize

### For hot reloading

-- brew install watchman
-- rm -rf /usr/local/var/run/watchman && brew uninstall watchman && brew install watchman

### For deep debugging

-- yarn add react-devtools
-- react-devtools
-- react-native log-ios
-- react-native log-android

### For i18n

-- https://medium.com/ottofellercom/i18n-in-react-dates-reactive-translations-and-huge-dictionaries-34c55c45b0d6

### For navigation

-- https://wix.github.io/react-native-navigation/#/

### For swiper slider

-- yarn add react-native-swiper
-- react-native init swiper

react-native-navigation -> build.gralde --> update compiler version according to main vesion

# adb install -r app-release.apk

# to release android
./gradlew bundleRelease
bundletool build-apks --bundle=./android/app/build/outputs/bundle/release/app.aab --output=/./android/app/build/outputs/bundle/release/app.apks

# above will generate app.aab

./gradlew assembleRelease

# to test release build of the app
react-native run-android --variant=release

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

react-native bundle --entry-file='index.ios.js' --bundle-output='./ios/tay_than_thar/main.jsbundle' --dev=false --platform='ios' --assets-dest='./ios'

react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle


react-native run-android --variant=release

ES server 18.138.175.216

for file in "$arg"*.{ttf,otf}; do fc-scan --format "%{postscriptname}\n" $file; done


adb logcat | findstr com.panntheefoundation
adb logcat | grep -F "`adb shell ps | grep com.panntheefoundation  | tr -s [:space:] ' ' | cut -d' ' -f2`"

# react-native-slider 

./gradlew build --refresh-dependencies


com.reactnativenavigation.viewcontrollers.sidemenu.SideMenuController

private void dispatchSideMenuVisibilityEvents(ViewController drawer, float prevOffset, float offset) {
        // if (prevOffset == 0 && offset > 0) {
        if(offset > 0) {
            drawer.onViewAppeared();
        // } else if (prevOffset > 0 && offset == 0) {
        } else if (offset <= 0) {
            drawer.onViewDisappear();
        }
    }

./node_modules/.bin/detox test -c android.emu.debug
./gradlew tasks

npx react-native run-android
adb reverse tcp:8081 tcp:8081
adb -s R9AMA0K5XVJ reverse tcp:8081 tcp:8081
    
keytool -genkey -v -keystore com-panntheefoundation-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

keytool -list -v -alias my-key-alias -keystore ./com-panntheefoundation-release-key.keystore
keytool -list -v -alias androiddebugkey -keystore ./debug.keystore

keytool -exportcert -alias my-key-alias -keystore com-panntheefoundation-release-key.keystore | openssl sha1 -binary | openssl base64
  
new key for pannthee
keytool -genkeypair -alias upload-key -keyalg RSA -keysize 2048 -validity 9125 -keystore com-panntheefoundation-release-key.jks
keytool -export -rfc -alias upload-key -file upload_certificate.pem -keystore com-panntheefoundation-release-key.jks
keytool -exportcert -alias upload-key -keystore com-panntheefoundation-release-key.jks | openssl sha1 -binary | openssl base64

echo 3E:BF:0C:CB:65:9F:A1:F3:CD:B5:24:0F:1D:BF:34:38:9F:FE:CA:B8 | xxd -r -p | openssl base64
echo 3C:69:A1:9B:34:62:68:51:49:57:62:FF:C2:89:FB:65:CD:B3:31:7A | xxd -r -p | openssl base64
     
52:8A:49:FF:1D:F1:39:AC:DE:5A:84:86:AA:28:61:C9:29:90:BC:CE:AE:A0:45:71:35:38:F6:FC:ED:5D:EF:B6

react-native-navigation

line 215

RNNSideMenu\MMDrawerController\MMDrawerController.m

LN:220      [self setShowsShadow:NO];

RNNSideMenu\MMDrawerController\MMDrawerController.m

LN:27      CGFloat const MMDrawerDefaultWidth = 360.0f;//default 280

RNNSideMenu\MMDrawerController\MMDrawerVisualState.m

LN: 146, 147 (add new)

UIViewController *centerDrawerViewController = drawerController.centerViewController;
centerDrawerViewController.view.alpha = MAX(0.4, 1.0 - percentVisible);

https://www.dev6.com/frameworks/building-multiple-apps-from-one-react-native-project/


<!-- react-native-image-slider-show -->

SlideShow.js

LN:205      add resizeMode="contain"
LN:24       change from black to backgroundColor: 'white',


npx react-native run-android --variant=release --deviceId=39ab644b0606


# react-native-gestures
LN: 59

_gestureIsClick(gestureState) {
    return (
      // comment it out for ios scroll laggy issue
      // https://github.com/glepur/react-native-swipe-gestures/issues/38
      Math.abs(gestureState.dx) < swipeConfig.gestureIsClickThreshold /*&&
      Math.abs(gestureState.dy) < swipeConfig.gestureIsClickThreshold*/
    );
  }


IN ios 14, images break due to react native 0.62.2 (it should fix after upgrade to 0.63.3) but we don't want to upgrade this time. so fix manually in node module

echo "Fix images"
HUYDEV="_currentFrame.CGImage;"
HUYFIX="_currentFrame.CGImage ;} else { [super displayLayer:layer];"
sed -ie "s/${HUYDEV}/${HUYFIX}/" node_modules/react-native/Libraries/Image/RCTUIImageViewAnimated.m
echo "Done"


final fix like this

- (void)displayLayer:(CALayer *)layer
{
  if (_currentFrame) {
    layer.contentsScale = self.animatedImageScale;
    layer.contents = (__bridge id)_currentFrame.CGImage;
  } else {
    [super displayLayer:layer];
  }
}



react-native-parallax-header

renderBackgroundImage
LN: 194, 204, 205

const {backgroundImage, backgroundImageLeftPos,backgroundImageRightPos} = this.props;
left: backgroundImageLeftPos? backgroundImageLeftPos: 0,
right: backgroundImageRightPos? backgroundImageRightPos: 0,


react-native-video-controls

VideoPlayer.js
_onScreenTouch() {
LN: 297 --> comment togglefulscreen

renderTimer()
LN: 1144 (this.props.timerText)
LN: 1363 

Add Custom Control for fast forward and backward (5 seconds)

backward.png
forward.png

react-native-prevent-screenshot
RNPreventScreenshotModule.java
LN: 28 - 41

android build.gradle -> update build version


Pod::Spec.new do |s|
  s.name         = "RNPreventScreenshot"
  s.version      = "1.0.0"
  s.summary      = "RNPreventScreenshot"
  s.description  = <<-DESC
                  RNPreventScreenshot
                   DESC
  s.homepage     = "https://www.npmjs.com/package/react-native-prevent-screenshot"
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "9.0"
  s.source       = { :git => "https://github.com/author/RNPreventScreenshot.git", :tag => "master" }
  s.source_files  = "**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

adb shell am start -d pannthee://open.app/newsfeed/61a45f9714602e51ef0a6d22
adb shell am start -W -a android.intent.action.VIEW -d "pannthee://open.app/newsfeed/61a45f9714602e51ef0a6d22"
adb shell am start -W -a android.intent.action.VIEW -d "https://www.panntheefoundation.org/pannthee-app?_id=61c1b62702c8cf633734ae52"



##react-native-fast-image

RNFastImage.podspec

s.dependency 'SDWebImage'
s.dependency 'SDWebImageWebPCoder'

## react-native-image-picker
android build.gradle

buildscript {
    repositories {
        google()
        mavenCentral()
        jcenter()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:3.5.4")
    }
}
