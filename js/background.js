var c = {
    _styles: {
        str: 'background: #f2dede; padding: 2px 2px; border-bottom: 1px solid #a94442;',
        str: 'background: #f2dede; padding: 2px 2px; border-bottom: 1px solid #a94442; font-weight: bold;',
        obj: 'padding: 2px 0px;'
    },
    _targets: {
        popup: false,
        background: false,
        content: true
    },

    log: function() { c._write("log", Array.prototype.slice.call(arguments)); },
    info: function() { c._write("info", Array.prototype.slice.call(arguments)); },
    warn: function() { c._write("warn", Array.prototype.slice.call(arguments)); },
    debug: function() { c._write("debug", Array.prototype.slice.call(arguments)); },
    error: function() { c._write("error", Array.prototype.slice.call(arguments)); },
    group: function() { c._write("group", Array.prototype.slice.call(arguments)); },
    groupEnd: function() { c._write("groupEnd", Array.prototype.slice.call(arguments)); },

    _write: function(action, args) {
        a = ['%c[B]', c._styles.str];
        for (arg in args) {
            switch (typeof args[arg]) {
                case "string":
                case "int":
                case "number":
                    a[0] += "%c%s";
                    a.push(c._styles.str);
                    a.push(args[arg]);
                    break;

                case "boolean":
                case "undefined":
                case "null":
                    a[0] += "%c%s";
                    a.push(c._styles.sys);
                    a.push(args[arg])
                    break;

                case "function":
                case "object":
                    a[0] += " %c%o";
                    a.push(c._styles.obj);
                    a.push(args[arg]);
                    break;

                default:
                    a.push("unknown: " + typeof args[arg]);
            }
        }

        if (c._targets.popup) { }
        if (c._targets.background) { console[action].apply(console, a); }
        if (c._targets.content) {
            content.postMessage({
                method: "console",
                action: action,
                args: a
            });
        }
    }
};

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == "content2background") {
        content = port;
        content.onMessage.addListener(function(request) {
            switch(request.method) {
                case "ready":
                    c.log("connected to " + port.name);
                    break;

                case "console":
                    console[request.action].apply(console, request.args);
                    break;

                default:
                    c.log("no method for " + request.method);
            }
        });
    }

    if (port.name == "popup2background") {
        popup = port;
        popup.onMessage.addListener(function(request) {
            switch(request.method) {
                case "ready":
                    c.log("connected to " + port.name);
                    break;

                default:
                    c.log("no method for " + request.method);
            }
        });
    }
});
