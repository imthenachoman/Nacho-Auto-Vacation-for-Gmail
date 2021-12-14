function toggleGMailVacationResponder(enableAutoReply, startTime, endTime)
{
    logMessage("toggleGMailVacationResponder", "start");

    if(enableAutoReply) logMessage("toggleGMailVacationResponder", `enabling vacation responder:\n\tfrom: ${startTime}\n\tto  : ${endTime}`);
    else logMessage("toggleGMailVacationResponder", "disabling vacation responder");

    var gmailVacationResponderSettings = Gmail.Users.Settings.getVacation("me");
    gmailVacationResponderSettings.enableAutoReply = enableAutoReply;

    if(enableAutoReply)
    {
        gmailVacationResponderSettings.startTime = Number(startTime);
        gmailVacationResponderSettings.endTime = Number(endTime);
    }

    logObject("toggleGMailVacationResponder", "updating Gmail vacation responder\ngmailVacationResponderSettings", gmailVacationResponderSettings);

    var gmailVacationResponderUpdateResponse = Gmail.Users.Settings.updateVacation(gmailVacationResponderSettings, "me");

    logObject("toggleGMailVacationResponder", "updated Gmail vacation responder\ngmailVacationResponderUpdateResponse", gmailVacationResponderUpdateResponse);

    logMessage("toggleGMailVacationResponder", "end");
}
