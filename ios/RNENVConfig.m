//
//  RNENVConfig.m
//  detective
//
//  Created by Thuc on 27/9/24.
//

#import <Foundation/Foundation.h>
#import "RNENVConfig.h"

/*
 
 export const chat = "https://tamtalk.com/chat/"
 export const membership = "https://tamtalk.com/detective-membership/"
 export const account = "https://tamtalk.com/detective-account/"
 export const more = "https://tamtalk.com/detective-more/"
 export const blog = "https://tamtalk.com/blog/"

 export const domain = "https://tamtalk.com/"
 export const login = "https://tamtalk.com/detective-login/"
 export const logout = "https://tamtalk.com/logout"
 
 */
@implementation AppNativeModule
RCT_EXPORT_MODULE();
- (NSDictionary *)constantsToExport
{
#if DEV
  
  return @{
    @"env": @"prod",
    @"chat": @"http://43.203.213.15/chat/",
    @"membership": @"http://43.203.213.15/detective-membership/",
    @"account": @"http://43.203.213.15/detective-account/",
    @"more": @"http://43.203.213.15/detective-more/",
    @"blog": @"http://43.203.213.15/blog/",
    @"domain": @"43.203.213.15",
    @"login": @"http://43.203.213.15/detective-login/",
    @"logout": @"http://43.203.213.15/logout",
  };
#else
  return @{
    @"env": @"prod",
    @"chat": @"https://tamtalk.com/chat/",
    @"membership": @"https://tamtalk.com/detective-membership/",
    @"account": @"https://tamtalk.com/detective-account/",
    @"more": @"https://tamtalk.com/detective-more/",
    @"blog": @"https://tamtalk.com/blog/",
    @"domain": @"tamtalk.com",
    @"login": @"https://tamtalk.com/detective-login/",
    @"logout": @"https://tamtalk.com/logout",
  };
  
#endif

}
+ (BOOL)requiresMainQueueSetup{
return YES;
}
@end
