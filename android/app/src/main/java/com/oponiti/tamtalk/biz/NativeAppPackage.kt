package com.oponiti.tamtalk.biz

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import android.view.View
import com.facebook.react.uimanager.ReactShadowNode
//class NativeAppPackage : ReactPackage {
//
//    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager> {
//        return emptyList()
//    }
//
//    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
//        val modules = mutableListOf<NativeModule>()
//
//        modules.add(AppNativeModule(reactContext))
//        modules.add(BadgeModule(reactContext))
//        return modules
//    }
//}

class NativeAppPackage : ReactPackage {

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): MutableList<NativeModule> {
                val modules = mutableListOf<NativeModule>()

        modules.add(AppNativeModule(reactContext))
        modules.add(BadgeModule(reactContext))
        return modules
    }
}

