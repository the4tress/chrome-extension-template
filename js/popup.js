var c = {
    _console: chrome.extension.getBackgroundPage().console,
    _styles: {
        str: 'background: #dff0d8; padding: 2px 2px; border-bottom: 1px solid #4cae4c;',
        obj: 'padding: 2px 0px;'
    },
    _targets: {
        popup: true,
        background: true,
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
        a = ['%c[P]', c._styles.str];
        for (arg in args) {
            switch (typeof args[arg]) {
                case "string":
                case "int":
                case "bool":
                    a[0] += "%c%s";
                    a.push(c._styles.str);
                    a.push(args[arg]);
                    break;

                case "object":
                    a[0] += " %c%o"
                    a.push(c._styles.obj);
                    a.push(args[arg]);
                    break;

                default:
                    a.push("unknown: " + typeof args[arg]);
            }
        }

        if (c._targets.popup) { console[action].apply(console, a); }
        if (c._targets.background) {
            chrome.extension.getBackgroundPage().console[action]
                .apply(chrome.extension.getBackgroundPage().console, a);
        }
        if (c._targets.content) {
            var params = {
                method: "console",
                action: action,
                args: a
            };

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, params, function(response) {
                    console.log(response);
                });
            });
        }
    }
};
