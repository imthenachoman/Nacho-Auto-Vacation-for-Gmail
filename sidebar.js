// builds the main card
// thanks to https://gw-card-builder.web.app/
// https://gw-card-builder.web.app/#gqhzZWN0aW9uc5KEp3dpZGdldHOSga1kZWNvcmF0ZWRUZXh0hqh0b3BMYWJlbKCkdGV4dK1FbmFibGUgQ2hlY2tzqXN0YXJ0SWNvboKpa25vd25JY29uqlZJREVPX1BMQVmnYWx0VGV4dKCrYm90dG9tTGFiZWygrXN3aXRjaENvbnRyb2yEq2NvbnRyb2xUeXBlplNXSVRDSKRuYW1lr215U3dpdGNoQ29udHJvbKV2YWx1ZadteVZhbHVlqHNlbGVjdGVkwqh3cmFwVGV4dMOBrWRlY29yYXRlZFRleHSEqHRvcExhYmVsqE5leHQgT09PpHRleHSsQ29udGVudCBoZXJlqXN0YXJ0SWNvboKpa25vd25JY29upUNMT0NLp2FsdFRleHStU2VuZCBhbiBlbWFpbKZidXR0b26DpHRleHSnUmVmcmVzaKdvbkNsaWNrgaZhY3Rpb26BqGZ1bmN0aW9upFRPRE+nYWx0VGV4dKCmaGVhZGVyqkF1dG9tYXRpb26rY29sbGFwc2libGXCuXVuY29sbGFwc2libGVXaWRnZXRzQ291bnQBhKZoZWFkZXK4R21haWwgVmFjYXRpb24gUmVzcG9uZGVyp3dpZGdldHOUga1kZWNvcmF0ZWRUZXh0hah0b3BMYWJlbKlUb3AgbGFiZWykdGV4dL9FbmFibGUgR21haWwgVmFjYXRpb24gUmVzcG9uZGVyqHdyYXBUZXh0w6lzdGFydEljb26CqWtub3duSWNvbrBGTElHSFRfREVQQVJUVVJFp2FsdFRleHStU2VuZCBhbiBlbWFpbK1zd2l0Y2hDb250cm9shKtjb250cm9sVHlwZaZTV0lUQ0ikbmFtZa9teVN3aXRjaENvbnRyb2yldmFsdWWnbXlWYWx1ZahzZWxlY3RlZMKBrmRhdGVUaW1lUGlja2Vyg6VsYWJlbK9TdGFydCBEYXRlL1RpbWWkbmFtZahkYXRlVGltZaR0eXBlrURBVEVfQU5EX1RJTUWBrmRhdGVUaW1lUGlja2Vyg6VsYWJlbK1FbmQgRGF0ZS9UaW1lpG5hbWWoZGF0ZVRpbWWkdHlwZa1EQVRFX0FORF9USU1FgqpidXR0b25MaXN0gadidXR0b25zkYOkdGV4dLVVcGRhdGUgU3RhcnQvRW5kIFRpbWWnb25DbGlja4GmYWN0aW9ugahmdW5jdGlvbqRUT0RPp2FsdFRleHSgs2hvcml6b250YWxBbGlnbm1lbnSmQ0VOVEVSq2NvbGxhcHNpYmxlwrl1bmNvbGxhcHNpYmxlV2lkZ2V0c0NvdW50AaRuYW1lqGFzZGZhc2Rm
function card_buildHomepageCard()
{
    var areJobsEnabled_ = areJobsEnabled();

    var mainSection = CardService.newCardSection()
        // .setHeader('Add-On')
        .setCollapsible(false)
        // .setNumUncollapsibleWidgets(1)
        .addWidget(CardService.newDecoratedText()
            .setText("Add-on is " + (areJobsEnabled_ ? "Enable" : "Disable"))
            // .setTopLabel("Add-On Status")
            .setBottomLabel("Toggle to " + (areJobsEnabled_ ? "disable" : "enable") + ".")
            .setStartIcon(CardService.newIconImage()
                .setIcon(CardService.Icon.VIDEO_PLAY)
                .setAltText((areJobsEnabled_ ? "Disable" : "Enable") + " Add-On")
            )
            .setWrapText(true)
            .setSwitchControl(CardService.newSwitch()
                .setControlType(CardService.SwitchControlType.SWITCH)
                .setFieldName('control_card_onEnableOrDisableJobs')
                .setValue('enable')
                .setSelected(areJobsEnabled_)
                .setOnChangeAction(CardService.newAction()
                    .setFunctionName("card_onEnableOrDisableJobs")
                    .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                )
            )
        )

    if(areJobsEnabled_)
    {
        var gmailVacationResponderSettings = Gmail.Users.Settings.getVacation("me");

        var responderStatusWidget = CardService.newDecoratedText()
            .setTopLabel("Responder Status")
            .setWrapText(true)
            .setStartIcon(CardService.newIconImage()
                .setIcon(CardService.Icon.EMAIL)
                .setAltText('Responder Status')
            );

        var nextOOOWidget = CardService.newDecoratedText()
            .setTopLabel("Next OOO")
            .setWrapText(true)
            .setStartIcon(CardService.newIconImage()
                .setIcon(CardService.Icon.CLOCK)
                .setAltText('Next OOO')
            );

        if(gmailVacationResponderSettings.enableAutoReply)
        {
            var now = new Date();
            var responderStart = new Date(Number(gmailVacationResponderSettings.startTime));
            var responderEnd = new Date(Number(gmailVacationResponderSettings.endTime));

            if(now >= responderStart && now <= responderEnd)
            {
                responderStatusWidget.setText("On until<br />" + responderEnd.toLocaleString());
            }
            else
            {
                responderStatusWidget.setText(`Scheduled to turn on at <br />${responderStart.toLocaleString()} until<br />${responderEnd.toLocaleString()}`);
            }
        }
        else
        {
            responderStatusWidget.setText("Off");
        }

        var nextOOOEvent = PropertiesService.getUserProperties().getProperty("nextOOOEvent");

        if(nextOOOEvent)
        {
            nextOOOEvent = new Date(Number(nextOOOEvent));
            nextOOOWidget.setText(nextOOOEvent.toLocaleString());
        }
        else
        {
            nextOOOWidget.setText("None");
        }

        mainSection
            .addWidget(responderStatusWidget)
            .addWidget(nextOOOWidget)
            .addWidget(CardService.newButtonSet()
                // .addButton(CardService.newTextButton()
                //     .setText('Refresh')
                //     .setAltText("Refresh")
                //     .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                //     .setOnClickAction(CardService.newAction()
                //         .setFunctionName('card_onRefresh')
                //         .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                //     )
                // )
                .addButton(CardService.newTextButton()
                    .setText('Refresh')
                    .setAltText("Refresh")
                    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                    .setOnClickAction(CardService.newAction()
                        .setFunctionName('card_onRefresh')
                        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
                    )
                )
            );
    }

    var card = CardService.newCardBuilder()
        .addSection(CardService.newCardSection()
            // .setHeader('About')
            .setCollapsible(false)
            .addWidget(CardService.newTextParagraph()
                .setText('Once enabled, this add-on will automatically enable and disable your Gmail <a href="https://support.google.com/mail/answer/25922?hl=en&co=GENIE.Platform%3DDesktop" target="_blank">vacation responder</a> based on <a href="https://support.google.com/calendar/answer/7638168#:~:text=Show%20when%20you%E2%80%99re%20out%20of%20office" target="_blank">OOO events</a> in your Google Calendar. (<a href="https://github.com/imthenachoman/Gmail-Auto-Vacation-Responder">learn more</a>)')
            )
        )
        .addSection(mainSection)
        // .addSection(CardService.newCardSection()
        //     .setHeader('How It Works')
        //     .setCollapsible(true)
        //     .addWidget(CardService.newDecoratedText()
        //         .setTopLabel('Daily Job')
        //         .setText("A daily job will look for OOO events in the next 24 hours. If it finds any, it will schedule Gmail\'s vacation responder to turn on and off based on the first OOO event's start and end time.")
        //         .setWrapText(true)
        //     )
        //     .addWidget(CardService.newDecoratedText()
        //         .setTopLabel('Multiple OOO Events')
        //         .setText('If you have multiple OOO events in the same 24 hour window, it will process the next OOO event at the end of the current OOO event.')
        //         .setWrapText(true))
        //     .addWidget(CardService.newDecoratedText()
        //         .setTopLabel('Calendar Updates')
        //         .setText('Another job will monitor for changes to your calendar. If you make any OOO changes for today, it will make the necessary updates.')
        //         .setWrapText(true)
        //     )
        //     .addWidget(CardService.newDecoratedText()
        //         .setTopLabel('Note')
        //         .setText('Contrary to Google\'s <a href="https://support.google.com/mail/answer/25922#:~:text=When%20your%20vacation%20reply%20is%20sent" target="_blank">documentation</a>, or what you see on the Gmail browser UI, you <b><u>can</u></b> schedule the vacation responder to turn on or off at the hour/minute/second. The Gmail browser UI may show the wrong date, but it <b><u>will</u></b> turn on and off as expected.')
        //         .setWrapText(true)
        //     )
        // )
        ;
    return card.build();
}

// called by the add on when it is opened
function card_onHomepage(event)
{
    logObject("card_onHomepage", "event", event);
    return card_buildHomepageCard();
}

// run when the enable/disable event is toggled
function card_onEnableOrDisableJobs(event)
{
    logObject("card_onEnableOrDisableJobs", "event", event);
    if(event && event.commonEventObject && event.commonEventObject.formInputs && event.commonEventObject.formInputs.control_card_onEnableOrDisableJobs && event.commonEventObject.formInputs.control_card_onEnableOrDisableJobs.stringInputs && event.commonEventObject.formInputs.control_card_onEnableOrDisableJobs.stringInputs.value && event.commonEventObject.formInputs.control_card_onEnableOrDisableJobs.stringInputs.value[0] === "enable")
    {
        logMessage("card_onEnableOrDisableJobs", "enabling");
        enableJobs();
    }
    else
    {
        logMessage("card_onEnableOrDisableJobs", "disabling");
        disableJobs();
    }

    // Create an action response that instructs the add-on to replace
    // the current card with the new one.
    var actionResponse = CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .updateCard(card_buildHomepageCard())
        );
    return actionResponse.build();
}

function card_onRefresh(event)
{
    logObject("card_onRefresh", "event", event);

    // reload the data
    findAndProcessNextOOOEvent();

    // Create an action response that instructs the add-on to replace
    // the current card with the new one.
    var actionResponse = CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation()
            .updateCard(card_buildHomepageCard())
        );
    return actionResponse.build();
}