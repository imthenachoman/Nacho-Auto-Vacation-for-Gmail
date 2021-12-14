// install everything
function enableJobs()
{
    logMessage("enableJobs", "start");
    // first, let's delete any existing triggers
    // this way we can use the install function to re-install if needed
    disableJobs();

    logMessage("enableJobs", "creating trigger: dailyJob");

    // create a trigger to run every day
    ScriptApp.newTrigger("dailyJob")
        .timeBased()
        .everyDays(1)
        .create();

    logMessage("enableJobs", "creating trigger: calendarUpdatedEvent");

    // create a trigger to run on calendar update
    ScriptApp.newTrigger("calendarUpdatedEvent")
        .forUserCalendar(Session.getEffectiveUser().getEmail())
        .onEventUpdated()
        .create();

    // run for today
    dailyJob();
    logMessage("enableJobs", "end");
}

// go through all of the triggers and disable them
function disableJobs()
{
    logMessage("disableJobs", "start");

    logMessage("disableJobs", "deleting all of the triggers");
    ScriptApp.getProjectTriggers().forEach(trigger =>
    {
        ScriptApp.deleteTrigger(trigger);
    });

    logMessage("disableJobs", "disabling the vacation responder");
    toggleGMailVacationResponder(false);

    logMessage("disableJobs", "deleting all user properties");
    PropertiesService.getUserProperties().deleteAllProperties();

    logMessage("disableJobs", "end");
}

function areJobsEnabled()
{
    return ScriptApp.getProjectTriggers().some(trigger => trigger.getHandlerFunction() === "dailyJob");
}

// runs every day
// marks what the end of this day is based on 24 hours from start
// looks for vacations for today within the next 24 hour range
function dailyJob()
{
    logMessage("dailyJob", "start");

    logMessage("dailyJob", "deleting all findAndProcessNextOOOEvent triggers");

    // since we dynamically create triggers as needed
    // lets delete any existing instances of a trigger for the findAndProcessNextOOOEvent function
    ScriptApp.getProjectTriggers().forEach(trigger =>
    {
        if(trigger.getHandlerFunction() === "findAndProcessNextOOOEvent") ScriptApp.deleteTrigger(trigger);
    });

    // the start of this day
    var dayStart = new Date();

    // the end of this day is exactly 24 hours from now
    var dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    logMessage("dailyJob", `day range:\n\tstart: ${dayStart}\n\tend  :${dayEnd}`)

    // save the dayEnd for checking later
    PropertiesService.getUserProperties().setProperty("dayEnd", Number(dayEnd));

    // look for any OOO events today
    findAndProcessNextOOOEvent();

    logMessage("dailyJob", "end");
}

// find the next OOO to schedule vacation responder
// if there is another OOO after the first one then schedule trigger to run after the first one ends
// if OOO is active right now then enable vacation responder, else disable it
function findAndProcessNextOOOEvent()
{
    logMessage("findAndProcessNextOOOEvent", "start");

    // since we dynamically create triggers as needed
    // lets delete any existing instances of a trigger for the findAndProcessNextOOOEvent function
    ScriptApp.getProjectTriggers().forEach(trigger =>
    {
        if(trigger.getHandlerFunction() === "findAndProcessNextOOOEvent") ScriptApp.deleteTrigger(trigger);
    });

    var now = new Date();

    // we need to find all of the events from now to dayEnd
    var apiEventsListObject = {
        "showDeleted": false,
        "singleEvents": true,
        "timeMin": now.toISOString(),
        "timeMax": (new Date(Number(PropertiesService.getUserProperties().getProperty("dayEnd")))).toISOString(),
    };

    logObject("findAndProcessNextOOOEvent", "apiEventsListObject", apiEventsListObject);

    // go through all of the API pages to get all of the OOO events
    var allOOOEvents = [];
    var todaysEvents = Calendar.Events.list("primary", apiEventsListObject);

    // while we have more events
    while(todaysEvents && todaysEvents.items && todaysEvents.items.length)
    {
        // we only want to cache OOO events
        allOOOEvents = allOOOEvents.concat(todaysEvents.items.filter(event => event.eventType === "outOfOffice" && event.status !== "cancelled"));

        // if there are more pages, get them on the next iteration of this while loop
        if(todaysEvents.nextPageToken)
        {
            apiEventsListObject.pageToken = todaysEvents.nextPageToken;
        }
        else
        {
            todaysEvents = null;
        }
    }

    // only do something if we have OOO events
    if(allOOOEvents.length)
    {
        // sort the events by start time and then by end time
        allOOOEvents = allOOOEvents
            .sort((a, b) =>
            {
                if(a.start.dateTime < b.start.dateTime) return -1;
                if(a.start.dateTime > b.start.dateTime) return 1;
                if(a.end.dateTime < b.end.dateTime) return -1;
                if(b.end.dateTime > b.end.dateTime) return 1;
                return 0;
            });

        logObject("findAndProcessNextOOOEvent", "allOOOEvents", allOOOEvents);

        // get the first and second OOO event
        var [firstOOOEvent, secondOOOEvent] = allOOOEvents;
        var oooEventStart = new Date(firstOOOEvent.start.dateTime);
        var oooEventEnd = new Date(firstOOOEvent.end.dateTime);

        // set OOO for the first event
        toggleGMailVacationResponder(true, oooEventStart, oooEventEnd);

        // if there is another OOO event after this one, then we need to schedule a trigger to process that one after the current one ends
        if(secondOOOEvent)
        {
            PropertiesService.getUserProperties().setProperty("nextOOOEvent", Number(new Date(secondOOOEvent.start.dateTime)));
            oooEventEnd.setSeconds(oooEventEnd.getSeconds() + 1);

            logMessage("findAndProcessNextOOOEvent", `checking again at ${oooEventEnd} for the next OOO`);
            ScriptApp.newTrigger("findAndProcessNextOOOEvent").timeBased().at(oooEventEnd).create();
        }
        else
        {
            PropertiesService.getUserProperties().deleteProperty("nextOOOEvent");
            logMessage("findAndProcessNextOOOEvent", "no second OOO events; stopping");
            return;
        }
    }
    else
    {
        PropertiesService.getUserProperties().deleteProperty("nextOOOEvent");
        // if there are no OOO then make sure vacation responder is disabled
        toggleGMailVacationResponder(false);
        logMessage("findAndProcessNextOOOEvent", "no OOO events; stopping");
    }

    logMessage("findAndProcessNextOOOEvent", "end");
}

// run when the calendar is updated
function calendarUpdatedEvent(event)
{
    logMessage("calendarUpdatedEvent", "start");
    logObject("calendarUpdatedEvent", "event", event);

    // check to see if any of today's remaining OOO events were updated
    var now = new Date();
    var anHourAgo = new Date(now);
    anHourAgo.setHours(anHourAgo.getHours() - 1);

    var apiEventsListObject = {
        "showDeleted": false,
        "singleEvents": true,
        "timeMin": now.toISOString(),
        "timeMax": (new Date(Number(PropertiesService.getUserProperties().getProperty("dayEnd")))).toISOString(),
        "updatedMin": anHourAgo.toISOString()
    };

    logObject("calendarUpdatedEvent", "apiEventsListObject", apiEventsListObject);

    // go through all of the API pages to get all of the OOO events
    var allUpdatedOOOEvents = [];
    var todaysUpdatedEvents = Calendar.Events.list("primary", apiEventsListObject);

    // while we have more events
    while(todaysUpdatedEvents && todaysUpdatedEvents.items && todaysUpdatedEvents.items.length)
    {
        // we only want to cache OOO events
        allUpdatedOOOEvents = allUpdatedOOOEvents.concat(todaysUpdatedEvents.items.filter(event => event.eventType === "outOfOffice" && event.status !== "cancelled"));

        // if there are more pages, get them on the next iteration of this while loop
        if(todaysUpdatedEvents.nextPageToken)
        {
            apiEventsListObject.pageToken = todaysUpdatedEvents.nextPageToken;
        }
        else
        {
            todaysUpdatedEvents = null;
        }
    }

    logObject("calendarUpdatedEvent", "allUpdatedOOOEvents", allUpdatedOOOEvents);

    // if an OOO event today was updated then recheck everything
    if(allUpdatedOOOEvents.length) findAndProcessNextOOOEvent();

    logMessage("calendarUpdatedEvent", "end");
}