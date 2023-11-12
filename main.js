auto();
events.observeNotification();
events.onNotification(function (notification) {
    let packageName = notification.getPackageName();
    let messagebuffer = notification.getText();
    if(/nbbank|cmb.pb|homeassistant|mobileqq/.test(packageName) && /元|人民币/.test(messagebuffer)) {
        log(messagebuffer);
        processTicket(messagebuffer);
    } 
    else{
        log("name:" + packageName + "text:" + messagebuffer);
    }
});
toast("监听中，请在日志中查看记录的通知及其内容");

function processTicket(messagebuffer) {
    let regexAmount = /(\d+(\.\d+)?)(?=元|人民币)/g;
    let regexAccount = /(账户|账号)(\d+)/g;   
    let regexNumb = /(\d+)/g;

    let Amount = messagebuffer.match(regexAmount);
    let match1 = messagebuffer.match(regexAccount);

    if (Amount && Amount[0]) {
        let account = null;
        if (match1 && match1[0]) {
            let match2 = match1[0].match(regexNumb);
            account = match2 ? match2[0] : null;
        }
        let url;
        if (account) {
            url = `qianji://publicapi/addbill?&accountname=${account}&money=${Amount[0]}`;
        } else {
            url = `qianji://publicapi/addbill?&money=${Amount[0]}`;
        }
        app.startActivity({
            data: url,
        });
    } else {
        let url = "未找到匹配项";
        log("name:" + packageName + url);
    }
}

function categTransaction(str) {
    if (/消费|扣款/.test(str)) {
        return 1;
    } else if (/入账|收款/.test(str)) {
        return 2;
    } else if (/还款|账单/.test(str)) {
        return 3;
    } else {
        return 'No match';
    }
}