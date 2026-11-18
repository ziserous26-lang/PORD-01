PORD-01 — CURRENT FILES + GLOBAL TIMER ALARM
================================================
This ZIP was built from the 12 HTML files you uploaded in this conversation, NOT from older versions in the previous timer ZIP.

HOW TO DEPLOY
1. Unzip this package on Windows.
2. Open your PORD-01 GitHub repository (root folder).
3. Upload/replace all 12 HTML files, plus the NEW pord-timer-alert.js file, at the repository ROOT.
4. Commit changes. Wait for GitHub Pages to publish and refresh the Android app.
5. Do not upload this ZIP directly as one file to GitHub Pages; upload the files inside it.

CHANGES
- Added a reference to pord-timer-alert.js immediately before </body> on all 12 uploaded HTML pages.
- Timer page: removed its one-time completion beep so the shared repeating alarm is responsible for the sound.
- Timer page: prevented its old local overlay from competing with the shared full-screen alert.
- Timer page: listens for dismissal to update its on-screen timer state.
- All other original page content is preserved, including the current slideshow, sports teams, projects, calendar, and reminders.

BEHAVIOR
- Countdown state remains in localStorage. Every page checks the same finish time.
- When time is up, a red pulsing full-screen alert appears on whichever PORD-01 page is open, including the slideshow.
- Alarm sounds repeat until the alert is tapped/clicked; dismissal resets the timer.
- Requires the PORD-01 pages to share the same web origin and browser/WebView storage.
- Browser/WebView audio policies may restrict sound without prior user interaction on that page.
- Cannot interrupt other Android apps, a sleeping device, or an entirely closed PORD-01 browser.

TEST
1. Start a 10-second custom timer.
2. Navigate to the slideshow.
3. Verify full-screen flashing red Time's Up appears and stays until tapped.
4. Tap to dismiss and confirm slideshow resumes.
