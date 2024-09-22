/* eslint-disable prettier/prettier */
var Observable;
(Observable = function () { }).prototype = {
    listen: function (type, method, scope, context) {
        var listeners, handlers;
        if (!(listeners = this.listeners)) {
            listeners = this.listeners = {};
        }
        if (!(handlers = listeners[type])) {
            handlers = listeners[type] = [];
        }
        scope = scope ? scope : window;
        handlers.push({
            method: method,
            scope: scope,
            context: context ? context : scope,
        });
    },
    remove: function (type, method) {
        let handlers = this.listeners[type];
        if (handlers == null) {
            return;
        }

        for (var k in handlers) {
            let handler = handlers[k];
            if (handler.method == method) {
                handlers.splice(k, 1);
                break;
            }
        }
    },
    fireEvent: function (type, data, context) {
        var listeners, handlers, i, n, handler, scope;
        if (!(listeners = this.listeners)) {
            return;
        }
        if (!(handlers = listeners[type])) {
            return;
        }
        for (i = 0, n = handlers.length; i < n; i++) {
            handler = handlers[i];
            if (typeof context !== 'undefined' && context !== handler.context)
                continue;
            if (handler.method.call(handler.scope, this, type, data) === false) {
                return false;
            }
        }
        return true;
    },
};
export default Observable