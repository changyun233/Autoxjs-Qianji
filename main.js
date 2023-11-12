// Start the Auto.js app
auto();

// Observe notifications
events.observeNotification();

// Process notifications
events.onNotification(function (notification) {
    // Get the package name and message text from the notification
    let packageName = notification.getPackageName();
    let messageText = notification.getText();

    // Check if the notification is from a supported app and contains a monetary value
    if (/(nbbank|cmb.pb|homeassistant|mobileqq)/i.test(packageName) && /(元|人民币)/.test(messageText)) {
        // Log the message text
        log(messageText);

        // Process the ticket
        processTicket(messageText);
    } else {
        // Log the package name and message text
        log(`Package Name: ${packageName}, Message Text: ${messageText}`);
    }
});

// Display a toast message to indicate that the script is running
toast("监听中，请在日志中查看记录的通知及其内容");

// Process the ticket
function processTicket(messageText) {
    // Define regular expressions to extract the monetary value and account number from the message text
    let amountRegex = /(\d+(\.\d+)?)(?=元|人民币)/g;
    let accountRegex = /(账户|账号)(\d+)/g;
    let numberRegex = /(\d+)/g;

    // Extract the monetary value and account number from the message text
    let amountMatch = messageText.match(amountRegex);
    let accountMatch = messageText.match(accountRegex);

    // If a monetary value is found, construct a URL to add a bill to Qianji
    if (amountMatch && amountMatch[0]) {
        let accountNumber = null;

        if (accountMatch && accountMatch[0]) {
            let numberMatch = accountMatch[0].match(numberRegex);
            accountNumber = numberMatch ? numberMatch[0] : null;
        }

        let url;

        if (accountNumber) {
            url = `qianji://publicapi/addbill?&accountname=${accountNumber}&money=${amountMatch[0]}`;
        } else {
            url = `qianji://publicapi/addbill?&money=${amountMatch[0]}`;
        }

        // Start the Qianji app and open the URL to add a bill
        app.startActivity({
            data: url,
        });
    } else {
        // Log an error message if a monetary value is not found
        log(`Error: No monetary value found in message text: ${messageText}`);
    }
}

// Categorize the transaction based on the message text
function categorizeTransaction(messageText) {
    if (/消费|扣款/i.test(messageText)) {
        return 1;
    } else if (/入账|收款/i.test(messageText)) {
        return 2;
    } else if (/还款|账单/i.test(messageText)) {
        return 3;
    } else {
        return 'No match';
    }
}