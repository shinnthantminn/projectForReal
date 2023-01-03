
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

NSTimer *timerTicker;

@interface RNPreventScreenshot : NSObject <RCTBridgeModule>

@end
  