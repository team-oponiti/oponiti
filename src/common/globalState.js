/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';

export function GlobalState(initialValue) {
    this.value = initialValue;
    this.subscribers = [];
    this.getValue = function () {
        return this.value;
    }

    this.setValue = function (newState) {
        if (this.getValue() === newState) {
            return
        }

        this.value = newState;
        this.subscribers.forEach(subscriber => {
            subscriber(this.value);
        });
    }

    this.subscribe = function (itemToSubscribe) {
        if (this.subscribers.indexOf(itemToSubscribe) > -1) {
            return
        }
        this.subscribers.push(itemToSubscribe);
    }

    this.unsubscribe = function (itemToUnsubscribe) {
        this.subscribers = this.subscribers.filter(
            subscriber => subscriber !== itemToUnsubscribe
        );
    }
}

export function useGlobalState(globalState) {
    const [, setState2] = useState();
    const state = globalState.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        globalState.subscribe(reRender);

        return () => {
            globalState.unsubscribe(reRender);
        }
    })

    function setState(newState) {
        globalState.setValue(newState);
    }

    return [state, setState];
}

global.languageState = new GlobalState(global.language)
global.tabBadeState = new GlobalState(global.tabBade)
global.isLogin = new GlobalState(global.isLogin)
global.timeStamp = new GlobalState(0)
global.showTabbar = new GlobalState(true)

export function useGlobalLanguage() {
    const [, setState2] = useState();
    const state = global.languageState.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        global.languageState.subscribe(reRender);

        return () => {
            global.languageState.unsubscribe(reRender);
        }
    })
    function setState(newState) {
        global.languageState.setValue(newState);
    }

    return [state, setState];
}

export function useGlobalBade() {
    const [, setState2] = useState();
    const state = global.tabBadeState.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        global.tabBadeState.subscribe(reRender);

        return () => {
            global.tabBadeState.unsubscribe(reRender);
        }
    })

    function setState(newState) {
        global.tabBadeState.setValue(newState);
    }

    return [state, setState];
}

export function useGlobalLogin() {
    const [, setState2] = useState();
    const state = global.isLogin.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        global.isLogin.subscribe(reRender);

        return () => {
            global.isLogin.unsubscribe(reRender);
        }
    })

    function setState(newState) {
        global.isLogin.setValue(newState);
    }

    return [state, setState];
}


export function useGlobalTimeStamp() {
    const [, setState2] = useState();
    const state = global.timeStamp.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        global.timeStamp.subscribe(reRender);

        return () => {
            global.timeStamp.unsubscribe(reRender);
        }
    })

    function setState(newState) {
        global.timeStamp.setValue(newState);
    }

    return [state, setState];
}

export function useGlobalTabbar() {
    const [, setState2] = useState();
    const state = global.showTabbar.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        global.showTabbar.subscribe(reRender);

        return () => {
            global.showTabbar.unsubscribe(reRender);
        }
    })

    function setState(newState) {
        global.showTabbar.setValue(newState);
    }

    return [state, setState];
}
 