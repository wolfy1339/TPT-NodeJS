function createCookie(name, value, expires, path, domain) {
    var cookie = name + "=" + escape(value) + ";";

    if (expires) {
        // If it's a date
        if (expires instanceof Date) {
            // If it isn't a valid date
            if (isNaN(expires.getTime())) {
                expires = new Date();
            } else {
                expires = new Date(new Date().getTime() + parseInt(expires) * 1000 * 60 * 60 * 24);
            }
        }

        cookie += "expires=" + expires.toGMTString() + ";";
    }

    if (path) {
        cookie += "path=" + path + ";";
        if (domain) {
            cookie += "domain=" + domain + ";";
        }

        document.cookie = cookie;
    }
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}
