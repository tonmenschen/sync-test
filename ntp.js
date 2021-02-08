var clientTime;
var serverTime;

! function() {
    Date.__ntpjsVersion = 1.2;
    var u = this;

    function p(t) {
        var n = u.Date;

        function o() {
            var e;
            if (0 === arguments.length) return (e = new n).setTime(e.getTime() - t), this instanceof o || (e = e.toString()), e;
            switch (arguments.length) {
                case 1:
                    return new n(arguments[0]);
                case 2:
                    return new n(arguments[0], arguments[1]);
                case 3:
                    return new n(arguments[0], arguments[1], arguments[2]);
                case 4:
                    return new n(arguments[0], arguments[1], arguments[2], arguments[3]);
                default:
                    return new n(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4])
            }
        }
        /* Date provides client time */
        console.log(new Date());
        clientTime = new Date();
        (u.Date = o).prototype = n.prototype, o.__ntpjsVersion = n.__ntpjsVersion, o.UTC = n.UTC, n.parse && (o.parse = n.parse), o.__ntpjsMillisecondsAheadBy = t, n.now && (o.now = function() {
            return n.now() - t
        })

        /* Date provides client time */
        console.log(new Date());
        serverTime = new Date();
    }

    function c(e) {
        if (!localStorage) return t = e, document.cookie.match("(^|;)\\s*" + t + "\\s*=\\s*([^;]+)") ? b.pop() : "";
        var t, n = localStorage[e];
        return n && (n = +n) == n ? n : void 0
    }

    function d(e, t) {
        if (!localStorage) return n = e, o = t, void(document.cookie = n + "=" + o + "; path=/");
        var n, o;
        localStorage[e] = t
    }! function() {
        var e = c("ntpjs__optout");
        if (e && (new Date).getTime() < e) return;
        var t = c("ntpjs__waituntil"),
            n = c("ntpjs__time");
        if (n && t && (new Date).getTime() < t) return p(n);
        o = function(e, t) {
            if (t.optout) d("ntpjs__optout", (new Date).getTime() + 864e5);
            else {
                var n = 1e3 * t.now,
                    o = e - n,
                    s = (new Date).getTimezoneOffset();
                if (d("ntpjs__waituntil", e + 1e3 * t.backoff), d("ntpjs__time", o), p(o), t.stats) {
                    var a = function() {
                        ! function(e, t, n, o) {
                            var s = (new Date).getTime(),
                                a = c("ntpjs__stats");
                            if (a && s - a < 864e5) return;
                            d("ntpjs__stats", (new Date).getTime()), e += "?server=" + o + "&tz=" + t + "&offset=" + n;
                            var r = document.createElement("img");
                            r.src = e, document.body.appendChild(r)
                        }(t.stats, s, o, t.__server)
                    };
                    window.addEventListener ? window.addEventListener("load", a) : window.attachEvent ? window.attachEvent("onload", a) : setTimeout(a, 1e3)
                }
            }
        }, a = new XMLHttpRequest, r = (new Date).getTime(), i = "https://use.ntpjs.org/v1/time.json", "withCredentials" in a ? (a.open("GET", i, !0), a.onreadystatechange = function() {
            a.readyState === XMLHttpRequest.DONE && 200 === a.status && o(r, JSON.parse(a.responseText))
        }, a.send()) : "undefined" != typeof XDomainRequest ? ((a = new XDomainRequest).open("GET", i), a.onload = function() {
            o(r, JSON.parse(a.responseText))
        }, a.send()) : (u.__ntpjs = function(e) {
            o(r, e)
        }, (s = document.createElement("script")).src = "https://use.ntpjs.org/v1/time.js", document.body.appendChild(s));
        var o, s, a, r, i
    }()
    console.log("Time Difference: " + (clientTime - serverTime) / 1000 + " sec");
}();
