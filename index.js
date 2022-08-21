const cluster = require("cluster");
const fetch = require("node-fetch");
const fs = require("fs");
const HttpsProxyAgent = require("https-proxy-agent");


if (cluster.isPrimary) {
    (async function() {
        process.title = "Nitro Promo Generator | 0 Generated | discord.gg/boostx";
        console.log("\x1b[1m\x1b[33m[!] Fetching Base Values...\n");
        const mainPage = await fetch("https://www.toweroffantasy-global.com/").then(res => res.text());

        const indexScript = await fetch(`https://www.toweroffantasy-global.com/assets/index.${mainPage.match(/<link rel="modulepreload" href="\.\/assets\/index\.([\d\w]+)\.js">/)[1]}.js`).then(res => res.text());
        const utilsScript = await fetch(`https://www.toweroffantasy-global.com/assets/utils.${mainPage.match(/<link rel="modulepreload" href="\.\/assets\/utils\.([\d\w]+)\.js">/)[1]}.js`).then(res => res.text());

        const sigKey = indexScript.match(/sigkey:"([\d\w]+)"/)[1];
        const appId = utilsScript.match(/[\d\w]{32}/)[0];
        console.log(`[!] SigKey: ${sigKey}\n[!] AppID: ${appId}`);

        var proxies = await fetch("https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all").then(res => res.text()).then(body => body.trim().split("\n"));
        
        setInterval(async function() {
            proxies = await fetch("https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all").then(res => res.text()).then(body => body.trim().split("\n"));
            console.log(`\x1b[33m[!] Fetched ${proxies.length} Proxies!`);
        }, 60000);

        await new Promise(resolve => setTimeout(resolve, 3000));
        console.clear();
        for (var i = 0; i < 500; i++) cluster.fork();

        cluster.on("online", function(worker) {
            worker.send({sigKey, appId, "proxy": proxies[Math.floor(Math.random() * proxies.length)]});
        });

        var generated = 0;
        cluster.on("message", function(worker, message) {
            console.log(`\x1b[32m[+] Generated Nitro Promocode - ${message.substring(26, 38) + "*".repeat(12)}!`);
            generated++;
            process.title = `Nitro Promo Generator | ${generated} Generated | Telegram @mmcboosta`;
            fs.appendFileSync("codes.txt", message.split(",")[0] + "\n");
        });

        cluster.on("exit", () => cluster.fork());
    })();
}
else if (cluster.isWorker) {
    var appId, sigKey;


    setTimeout(() => process.exit(1), 60000);
    process.on("message", async function(message) {
        appId = message.appId; sigKey = message.sigKey;

        const agent = new HttpsProxyAgent("http://" + message.proxy);
        const email = Math.random().toString(36).substring(2) + "@aminary.co";
        console.log(`[+] Made New Mail`)


        const registerStatus = await fetchWithSignature("https://aws-na-pass.intlgame.com/account/registerstatus", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json;charset=UTF-8",
                "origin": "https://www.toweroffantasy-global.com",
                "referrer": "https://www.toweroffantasy-global.com/",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36"
            },
            "method": "POST",
            "body": JSON.stringify({
                "account": email,
                "account_type": 1
            })
        }).then(res => res.json()).catch(() => null);

        if (!registerStatus) process.exit(1);
        if (registerStatus.is_register) process.exit(1);
        if (registerStatus.msg !== "Success") {
            console.log(`\x1b[31m[-] RegisterStatus Failed - ${registerStatus.msg?.replace(/\.$/, "")}!`);
            process.exit(1);
        }

        const sendCode = await fetchWithSignature("https://aws-na-pass.intlgame.com/account/sendcode", {
            "agent": agent,
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json;charset=UTF-8",
                "origin": "https://www.toweroffantasy-global.com",
                "referrer": "https://www.toweroffantasy-global.com/",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36"
            },
            "method": "POST",
            "body": JSON.stringify({
                "account": email,
                "account_type": 1,
                "code_type": 0
            })
        }).then(res => res.json()).catch(() => null);

        if (!sendCode) process.exit(1);
        if (sendCode.ret === 2123) process.exit(1);
        if (sendCode.msg !== "Success") {
            console.log(`\x1b[31m[-] SendCode Failed - ${sendCode.msg?.replace(/\.$/, "")}!`);
            process.exit(1);
        }

        var emailCode = null;
        while (!emailCode) {
            const emailData = await fetch("http://aminary.co/readEmail=" + email).then(res => res.json()).catch(() => null);
            if (!emailData) continue;
            if (emailData.success && emailData.link) emailCode = emailData.link;
        }

        const accountData = await fetchWithSignature("https://aws-na-pass.intlgame.com/account/register", {
            "agent": agent,
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json;charset=UTF-8",
                "origin": "https://www.toweroffantasy-global.com",
                "referrer": "https://www.toweroffantasy-global.com/",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36"
            },
            "method": "POST",
            "body": JSON.stringify({
                "verify_code": emailCode,
                "account": email,
                "account_type": 1,
                "password": "ad3f1b380808d7f823bfde35d7acc1b9"
            })
        }).then(res => res.json()).catch(() => null);

        if (!accountData) process.exit(1);
        if (accountData.ret === 2123) process.exit(1);
        if (accountData.msg !== "Success") {
            console.log(`\x1b[31m[-] AccountData Failed - ${accountData.msg?.replace(/\.$/, "")}!`);
            process.exit(1);
        }

        const accountLoginPayload = JSON.stringify({
            "device_info": {
                "guest_id": null,
                "lang_type": "en",
                "app_version": "0.1",
                "screen_height": 1080,
                "screen_width": 1920,
                "device_brand": "Google Inc.",
                "device_model": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36",
                "ram_total": 8,
                "rom_total": 8,
                "cpu_name": "Win32",
                "android_imei": "",
                "ios_idfa": ""
            },
            "channel_dis": "00000000",
            "channel_info": {
                "token": accountData.token,
                "openid": accountData.uid,
                "account_plat_type": 113
            }
        });

        const timestamp = Date.now();
        const accountLoginSignature = createSignature("/v2/auth/login?channelid=113&conn=0&gameid=29093&os=5&sdk_version=2.0&seq=&source=32&ts=" + timestamp, accountLoginPayload, sigKey);

        const accountLogin = await fetch(`https://aws-na.intlgame.com/v2/auth/login?channelid=113&conn=0&gameid=29093&os=5&sdk_version=2.0&seq=&sig=${accountLoginSignature}&source=32&ts=${timestamp}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded",
                "origin": "https://www.toweroffantasy-global.com",
                "referrer": "https://www.toweroffantasy-global.com/",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36"
            },
            "method": "POST",
            "body": accountLoginPayload
        }).then(res => res.json()).catch(() => null);

        if (!accountLogin) process.exit(1);
        if (accountLogin.msg !== "success") {
            console.log(`\x1b[31m[-] AccountLogin Failed - ${accountLogin.msg?.replace(/\.$/, "")}!`);
            process.exit(1);
        }

        const intlLogin = await fetch("https://na-community.playerinfinite.com/api/trpc/trpc.wegame_app_global.auth_svr.AuthSvr/LoginByINTL", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "origin": "https://www.toweroffantasy-global.com",
                "referrer": "https://www.toweroffantasy-global.com/",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36"
            },
            "method": "POST",
            "body": JSON.stringify({
                "mappid": 10109,
                "clienttype": 903,
                "login_info": {
                    "game_id": "29093",
                    "open_id": accountLogin.openid,
                    "token": accountLogin.token,
                    "channel_id": 113,
                    "channel_info": JSON.stringify(accountLogin.channel_info)
                }
            })
        }).then(res => res.json()).catch(() => null);

        if (!intlLogin) process.exit(1);
        if (intlLogin.msg !== "succ") {
            console.log(`\x1b[31m[-] IntlLogin Failed - ${intlLogin.msg?.replace(/\.$/, "")}!`);
            process.exit(1);
        }

        const nitroCode = await fetch("https://www.jupiterlauncher.com/api/v1/fleet.platform.game.GameCommunity/ObtainCdkey", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "origin": "https://www.toweroffantasy-global.com",
                "referer": "https://www.toweroffantasy-global.com/",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36"
            },
            "method": "POST",
            "body": JSON.stringify({
                "cookies": `uid=${intlLogin.data.user_info.user_id};ticket=${intlLogin.data.wt}`
            })
        }).then(res => res.json()).catch(() => null);

        if (!nitroCode) process.exit(1);
        if (nitroCode.result.error_code !== 0 || !nitroCode.cdkey) {
            console.log(`\x1b[31m[-] NitroCode Failed - ${nitroCode.result.error_message}!`);
            process.exit(1);
        }

        process.send(nitroCode.cdkey);
        process.exit(0);
    });

    function encrypt(o) {
        var a = [];
        for (var i = 0; i < o.length; i++) a.push(255 & o.charCodeAt(i));
        o = a;
    
        var c = [];
        for (var t = 0, n = 0; t < o.length; t++, n += 8) c[n >>> 5] |= o[t] << 24 - n % 32;
    
        var d = 8 * o.length;
        var s = 1732584193
        var r = -271733879;
        var l = -1732584194;
        var u = 271733878;
    
        for (var i = 0; i < c.length; i++) c[i] = 16711935 & (c[i] << 8 | c[i] >>> 24) | 4278255360 & (c[i] << 24 | c[i] >>> 8);
    
        c[d >>> 5] |= 128 << d % 32, c[14 + (d + 64 >>> 9 << 4)] = d;
    
        var y = function(o, h, c, d, s, r, l) {
            var u = o + (h & c | ~h & d) + (s >>> 0) + l;
            return (u << r | u >>> 32 - r) + h;
        }
        var C = function(o, h, c, d, s, r, l) {
            var u = o + (h & d | c & ~d) + (s >>> 0) + l;
            return (u << r | u >>> 32 - r) + h
        }
        var k = function(o, h, c, d, s, r, l) {
            var u = o + (h ^ c ^ d) + (s >>> 0) + l;
            return (u << r | u >>> 32 - r) + h
        }
        var v = function(o, h, c, d, s, r, l) {
            var u = o + (c ^ (h | ~d)) + (s >>> 0) + l;
            return (u << r | u >>> 32 - r) + h
        }
    
        for (p = 0; p < c.length; p += 16) {
            var S = s;
            var M = r;
            var $ = l;
            var B = u;
    
            s = y(s, r, l, u, c[p + 0], 7, -680876936), u = y(u, s, r, l, c[p + 1], 12, -389564586), l = y(l, u, s, r, c[p + 2], 17, 606105819), r = y(r, l, u, s, c[p + 3], 22, -1044525330), s = y(s, r, l, u, c[p + 4], 7, -176418897), u = y(u, s, r, l, c[p + 5], 12, 1200080426), l = y(l, u, s, r, c[p + 6], 17, -1473231341), r = y(r, l, u, s, c[p + 7], 22, -45705983), s = y(s, r, l, u, c[p + 8], 7, 1770035416), u = y(u, s, r, l, c[p + 9], 12, -1958414417), l = y(l, u, s, r, c[p + 10], 17, -42063), r = y(r, l, u, s, c[p + 11], 22, -1990404162), s = y(s, r, l, u, c[p + 12], 7, 1804603682), u = y(u, s, r, l, c[p + 13], 12, -40341101), l = y(l, u, s, r, c[p + 14], 17, -1502002290), s = C(s, r = y(r, l, u, s, c[p + 15], 22, 1236535329), l, u, c[p + 1], 5, -165796510), u = C(u, s, r, l, c[p + 6], 9, -1069501632), l = C(l, u, s, r, c[p + 11], 14, 643717713), r = C(r, l, u, s, c[p + 0], 20, -373897302), s = C(s, r, l, u, c[p + 5], 5, -701558691), u = C(u, s, r, l, c[p + 10], 9, 38016083), l = C(l, u, s, r, c[p + 15], 14, -660478335), r = C(r, l, u, s, c[p + 4], 20, -405537848), s = C(s, r, l, u, c[p + 9], 5, 568446438), u = C(u, s, r, l, c[p + 14], 9, -1019803690), l = C(l, u, s, r, c[p + 3], 14, -187363961), r = C(r, l, u, s, c[p + 8], 20, 1163531501), s = C(s, r, l, u, c[p + 13], 5, -1444681467), u = C(u, s, r, l, c[p + 2], 9, -51403784), l = C(l, u, s, r, c[p + 7], 14, 1735328473), s = k(s, r = C(r, l, u, s, c[p + 12], 20, -1926607734), l, u, c[p + 5], 4, -378558), u = k(u, s, r, l, c[p + 8], 11, -2022574463), l = k(l, u, s, r, c[p + 11], 16, 1839030562), r = k(r, l, u, s, c[p + 14], 23, -35309556), s = k(s, r, l, u, c[p + 1], 4, -1530992060), u = k(u, s, r, l, c[p + 4], 11, 1272893353), l = k(l, u, s, r, c[p + 7], 16, -155497632), r = k(r, l, u, s, c[p + 10], 23, -1094730640), s = k(s, r, l, u, c[p + 13], 4, 681279174), u = k(u, s, r, l, c[p + 0], 11, -358537222), l = k(l, u, s, r, c[p + 3], 16, -722521979), r = k(r, l, u, s, c[p + 6], 23, 76029189), s = k(s, r, l, u, c[p + 9], 4, -640364487), u = k(u, s, r, l, c[p + 12], 11, -421815835), l = k(l, u, s, r, c[p + 15], 16, 530742520), s = v(s, r = k(r, l, u, s, c[p + 2], 23, -995338651), l, u, c[p + 0], 6, -198630844), u = v(u, s, r, l, c[p + 7], 10, 1126891415), l = v(l, u, s, r, c[p + 14], 15, -1416354905), r = v(r, l, u, s, c[p + 5], 21, -57434055), s = v(s, r, l, u, c[p + 12], 6, 1700485571), u = v(u, s, r, l, c[p + 3], 10, -1894986606), l = v(l, u, s, r, c[p + 10], 15, -1051523), r = v(r, l, u, s, c[p + 1], 21, -2054922799), s = v(s, r, l, u, c[p + 8], 6, 1873313359), u = v(u, s, r, l, c[p + 15], 10, -30611744), l = v(l, u, s, r, c[p + 6], 15, -1560198380), r = v(r, l, u, s, c[p + 13], 21, 1309151649), s = v(s, r, l, u, c[p + 4], 6, -145523070), u = v(u, s, r, l, c[p + 11], 10, -1120210379), l = v(l, u, s, r, c[p + 2], 15, 718787259), r = v(r, l, u, s, c[p + 9], 21, -343485551), s = s + S >>> 0, r = r + M >>> 0, l = l + $ >>> 0, u = u + B >>> 0
        }
    
        var rotl = function(e, a) {
            return e << a | e >>> 32 - a;
        }
    
        var endian = function(e) {
            if (e.constructor == Number) return 16711935 & rotl(e, 8) | 4278255360 & rotl(e, 24);
            for (var i = 0; i < e.length; i++) e[i] = endian(e[i]);
            return e
        }
    
        return endian([s, r, l, u])
    };
    
    function createSignature(path, payload, sigKey) {
        const f = encrypt(path + payload + sigKey);
        var c = [];
        for (var i = 0; i < 32 * f.length; i += 8) c.push(f[i >>> 5] >>> 24 - i % 32 & 255);
    
        var a = [];
        for (var i = 0; i < c.length; i++) {
            a.push((c[i] >>> 4).toString(16));
            a.push((15 & c[i]).toString(16));
        }
        return a.join("");
    }

    function fetchWithSignature(url, options) {
        url = new URL(url);

        const requestPath = `${url.pathname}?account_plat_type=113&app_id=${appId}&lang_type=en&os=3&source=32`;
        const signature = createSignature(requestPath, options.body, sigKey);

        return fetch(url.href + `?account_plat_type=113&app_id=${appId}&lang_type=en&os=3&sig=${signature}&source=32`, options);
    }
}