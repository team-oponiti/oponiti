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



global.notiUpdate = new GlobalState(0)


export function useGlobalRefresh() {
    const [, setState2] = useState();
    const state = global.notiUpdate.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        global.notiUpdate.subscribe(reRender);

        return () => {
            global.notiUpdate.unsubscribe(reRender);
        }
    })

    function setState(newState) {
        global.notiUpdate.setValue(newState);
    }

    return [state, setState];
}




global.appCurrentState = new GlobalState('')


export function useGlobalAppLifeState() {
    const [, setState2] = useState();
    const state = global.appCurrentState.getValue();

    function reRender(newState) {
        setState2({});
    }

    useEffect(() => {
        global.appCurrentState.subscribe(reRender);

        return () => {
            global.appCurrentState.unsubscribe(reRender);
        }
    })

    function setState(newState) {
        global.appCurrentState.setValue(newState);
    }

    return [state, setState];
}