
#import "RNPreventScreenshot.h"
#import "UIImage+ImageEffects.h"

@implementation RNPreventScreenshot {
    BOOL enabled;
    UIImageView *obfuscatingView;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE();

#pragma mark - Lifecycle

- (instancetype)init {
    if ((self = [super init])) {
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(handleAppStateResignActive)
                                                    name:UIApplicationWillResignActiveNotification
                                                   object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(handleAppStateActive)
                                                     name:UIApplicationDidBecomeActiveNotification
                                                   object:nil];
    }
    return self;
}

#pragma mark - App Notification Methods

- (void)handleAppStateResignActive {
    if (self->enabled && !self->obfuscatingView) {
        UIWindow    *keyWindow = [UIApplication sharedApplication].keyWindow;
        UIImageView *blurredScreenImageView = [[UIImageView alloc] initWithFrame:keyWindow.bounds];

        UIGraphicsBeginImageContext(keyWindow.bounds.size);
        [keyWindow drawViewHierarchyInRect:keyWindow.frame afterScreenUpdates:NO];
        UIImage *viewImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();

        blurredScreenImageView.image = [viewImage applyLightEffect];

        self->obfuscatingView = blurredScreenImageView;
        [[UIApplication sharedApplication].keyWindow addSubview:self->obfuscatingView];

    }
}

- (void)handleAppStateActive {
    if(!timerTicker) {
        timerTicker = [NSTimer scheduledTimerWithTimeInterval:4.0  target:self selector:@selector(handleAppStateActiveTicker) userInfo:nil repeats:YES];    
    }
//    https://github.com/emilemoureau/react-native-screen-recorder-detect/blob/master/ios/ScreenRecorder.m
//        check if there is mirror screen to detect screen recording periodically, every 2 seconds
            
//        move below code to handleAppStateActiveTicker
//    if  (self->obfuscatingView) {

//        [UIView animateWithDuration: 0.3
//                         animations: ^ {
//                             self->obfuscatingView.alpha = 0;
//                         }
//                         completion: ^(BOOL finished) {
//                             [self->obfuscatingView removeFromSuperview];
//                             self->obfuscatingView = nil;
//                         }
//         ];
//    }
}

- (void)handleAppStateActiveTicker {
    
//        check if there is mirror screen to detect screen recording periodically, every 2 seconds
    if  (self->obfuscatingView) {
        //    https://github.com/emilemoureau/react-native-screen-recorder-detect/blob/master/ios/ScreenRecorder.m
        BOOL isRecording = NO;
        for (UIScreen *screen in UIScreen.screens) {
            if ([screen respondsToSelector:@selector(isCaptured)]) {
                // iOS 11+ has isCaptured method.
                if ([screen performSelector:@selector(isCaptured)]) {
                    isRecording = YES; // screen capture is active
                } else if (screen.mirroredScreen) {
                    isRecording = YES; // mirroring is active
                }
            } else {
                // iOS version below 11.0
                if (screen.mirroredScreen)
                    isRecording = YES;
            }
        }

        if(!isRecording) {
            // stop the timer now
            [UIView animateWithDuration: 0.3
                            animations: ^ {
                                self->obfuscatingView.alpha = 0;
                            }
                            completion: ^(BOOL finished) {
                                [self->obfuscatingView removeFromSuperview];
                                self->obfuscatingView = nil;
                            }
            ];
            
            [timerTicker invalidate];
            timerTicker = nil;
        }
    }
}
#pragma mark - Public API

RCT_EXPORT_METHOD(enabled:(BOOL) _enable) {
    self->enabled = _enable;
}


@end
