@file:Suppress("DEPRECATION")

package com.oponiti.tamtalk.biz

import android.content.Context
import android.content.pm.PackageManager
import android.util.Base64
import java.security.MessageDigest
import java.util.*

fun Context.getHashKey(): String? {
    var str: String? = null
    try {
        val info =
                this.packageManager.getPackageInfo(this.packageName, PackageManager.GET_SIGNATURES)
        info.signatures?.let { signatures ->
            for (sig in signatures) {
                val md = MessageDigest.getInstance("SHA1")
                md.update(sig.toByteArray())
                str = Base64.encodeToString(md.digest(), Base64.NO_WRAP)
            }
        }
    } catch (e: Exception) {}
    return str?.replace("\n", "")
}

fun Context.getSHA1(): String? {
    var str: String? = null
    try {
        val info =
                this.packageManager.getPackageInfo(this.packageName, PackageManager.GET_SIGNATURES)
        info.signatures?.let { signatures ->
            for (sig in signatures) {
                var localMessageDigest: MessageDigest
                MessageDigest.getInstance("SHA-1")
                        .also { localMessageDigest = it }
                        .update(sig.toByteArray())
                str = byte2HexFormatted(localMessageDigest.digest())
            }
        }
    } catch (e: Exception) {}
    return str!!.replace("\n", "")
}

fun Context.getSHA256(): String? {
    var str: String? = null
    try {
        val info =
                this.packageManager.getPackageInfo(this.packageName, PackageManager.GET_SIGNATURES)
        info.signatures?.let { signatures ->
            for (sig in signatures) {
                var localMessageDigest: MessageDigest
                MessageDigest.getInstance("SHA-256")
                        .also { localMessageDigest = it }
                        .update(sig.toByteArray())
                str = byte2HexFormatted(localMessageDigest.digest())
            }
        }
    } catch (e: Exception) {}
    return str!!.replace("\n", "")
}

fun byte2HexFormatted(arr: ByteArray): String? {
    val localStringBuilder = StringBuilder(arr.size * 2)
    for (i in arr.indices) {
        var str: String
        var j: Int
        if (Integer.toHexString(arr[i].toInt()).also { str = it }.length.also { j = it } == 1) {
            str = "0$str"
        }
        if (j > 2) {
            str = str.substring(j - 2, j)
        }
        localStringBuilder.append(str.uppercase(Locale.getDefault()))
        if (i < arr.size - 1) {
            localStringBuilder.append(':')
        }
    }
    return localStringBuilder.toString()
}
