/**
 * ABC Tutoring — booking handler (OPTIONAL upgrade).
 *
 * Use this instead of FormSubmit if you want each booking to:
 *   1. create an event on the shared ABC Tutoring calendar automatically
 *      (so the slot is blocked with no manual click), and
 *   2. email Dana the full details.
 *
 * Setup:
 *   1. Go to https://script.google.com  ▸  New project. Paste this file in.
 *   2. Fill in the three constants below.
 *   3. Deploy ▸ New deployment ▸ type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   4. Copy the web-app URL (ends in /exec) into data/config.json  ->  "formEndpoint".
 *
 * Note: the browser cannot read this endpoint's response cross-origin, so the
 * site treats the submission as "sent" optimistically and always shows the
 * confirmation page. The calendar event and email are still created here.
 */

var DANA_EMAIL  = 'REPLACE_WITH_DANA_EMAIL@example.com';
var CALENDAR_ID = 'REPLACE_WITH_CALENDAR_ID@group.calendar.google.com';
var SESSION_MINUTES = 60;

function doPost(e) {
  try {
    var d = (e.postData && e.postData.type === 'application/json')
      ? JSON.parse(e.postData.contents)
      : (e.parameter || {});

    var start = new Date(d.date + ' ' + d.time);
    var end = new Date(start.getTime() + SESSION_MINUTES * 60000);

    var description =
      'Tutor: ' + d.tutor + '\n' +
      'Subject: ' + d.subject + '\n' +
      'Student: ' + d.studentFirstName + ' (' + d.studentEmail + ')\n' +
      'Parent: ' + d.parentName + ' (' + d.parentEmail + ')\n' +
      (d.notes ? 'Notes: ' + d.notes + '\n' : '');

    CalendarApp.getCalendarById(CALENDAR_ID).createEvent(
      'ABC Tutoring: ' + d.subject + ' with ' + d.studentFirstName,
      start, end,
      { description: description, guests: d.parentEmail, sendInvites: false }
    );

    MailApp.sendEmail({
      to: DANA_EMAIL,
      replyTo: d.parentEmail,
      subject: 'New booking: ' + d.tutor + ' — ' + d.date + ' at ' + d.time,
      body:
        'Tutor: ' + d.tutor + '\n' +
        'Date/time: ' + d.date + ' at ' + d.time + '\n\n' +
        'Parent name: ' + d.parentName + '\n' +
        'Parent email: ' + d.parentEmail + '\n' +
        "Student's first name: " + d.studentFirstName + '\n' +
        "Student's email: " + d.studentEmail + '\n' +
        'Requested subject: ' + d.subject + '\n' +
        (d.notes ? '\nNotes: ' + d.notes + '\n' : '')
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
