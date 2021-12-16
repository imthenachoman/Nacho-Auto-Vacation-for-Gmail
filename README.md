# Gmail Auto Vacation Responder

Once enabled, this add-on will automatically enable and disable your Gmail [vacation responder](https://www.google.com/url?q=https://support.google.com/mail/answer/25922?hl%3Den%26co%3DGENIE.Platform%253DDesktop&source=gsuite-addons&ust=1639341891270000&usg=AOvVaw3qauSqjFqDLcqGeslhuExk) based on [OOO events](https://www.google.com/url?q=https://support.google.com/calendar/answer/7638168%23:~:text%3DShow%2520when%2520you%25E2%2580%2599re%2520out%2520of%2520office&source=gsuite-addons&ust=1639341891270000&usg=AOvVaw3r32VR5uUVD93g163pZFxR) in your Google Calendar.

![image](https://user-images.githubusercontent.com/83817/146289213-a6fac5d7-0e33-4863-b952-cd514a5d6030.png)

[TODO: insert Google Workspace Marketplace link]

# How It Works

- A daily job will look for OOO events in the next 24 hours. If it finds any, it will schedule Gmail's vacation responder to turn on and off based on the first OOO event's start and end time.
- If you have multiple OOO events in the same 24 hour window, it will process the next OOO event at the end of the current OOO event.
  - **Note**: The automation will not catch an OOO event if it happens within an hour of the previous one. In those cases you will have to manually `Refresh` the data through the add-on.
- Another job will monitor for changes to your calendar. If you make any OOO changes for today, it will make the necessary updates.
- The add-on does not modify the subject or message body of your Gmail's vacation responder. It simply enables or disables the vacation responder.

**Note**: Contrary to Google's [documentation](https://www.google.com/url?q=https://support.google.com/mail/answer/25922%23:~:text%3DWhen%2520your%2520vacation%2520reply%2520is%2520sent&source=gsuite-addons&ust=1639520502738000&usg=AOvVaw2JuNMKhPInEtGM0yn3JD69), or what you see on the Gmail browser UI, you **can** schedule the vacation responder to turn on or off at the hour/minute/second. The Gmail browser UI may show the wrong date, but it **will** turn on and off as expected.

# How To Use It

1. Add the add-on from [TODO: insert Google Workspace Marketplace link]
2. Go into **Gmail** or **Google Calendar** and open the add-on from the sidebar
3. Toggle the add-on to enable it

That's it!

# Self Hosting

If you don't want to get the add-on from the marketplace:

1. Clone this repo
2. Push/copy the the following files into your own Google Apps Script project
   - appsscript.json
   - core.js
   - gmail.js
   - helpers.js
   - sidebar.js
3. Follow the instructions in https://developers.google.com/apps-script/add-ons/how-tos/testing-workspace-addons#install_an_unpublished_add-on to install an unpublished add-on

# Help

For any questions, comments, concerns, feedback, or issues, [submit a new issue](https://github.com/imthenachoman/Gmail-Auto-Vacation-Responder/issues/new).

# Privacy Policy

TBD

# License and Copyright

[MIT License](https://github.com/imthenachoman/Gmail-Auto-Vacation-Responder/blob/main/LICENSE) - [https://github.com/imthenachoman/Gmail-Auto-Vacation-Responder/blob/main/LICENSE](https://github.com/imthenachoman/Gmail-Auto-Vacation-Responder/blob/main/LICENSE)
