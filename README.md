AlexFMS - SalesLogix DevTap Project
=======
Written by: Alex Cottner
9/28/2013

This is a project for 2013 the SalesLogix DevTap Competition. The focus of the competition is mobile application development. This project requires SlxMobile 2.2 to work.

Project Goal: Create a complete proof of concept for a mobile field services application using the SalesLogix Mobile 2.2 platform. The mobile end user should be able to do the following from their phone or tablet.
 * View daily schedule
 * View details for the days jobs (tickets)
 * Easily contact their customers from within the app via phone or email
 * Get directions to the job site from their devices mapping application
 * Cancel jobs
 * Mark jobs to be rescheduled by dispatch
 * Complete and record notes on jobs
 * Record start and complete times for jobs (logged as ticket activities)
 * Record customer's signature on job completion
 * Record photos (or other attachments) against a job
 * Review activities (ticket activities) against a job



Repo Contents:
 * AlexFMS.BusinessRules Folder: Contains VisualStudio 2010 solution custom business rules.
 * argos-AlexFMS Folder: Source Code for the AlexFMS SlxMobile module. This is also included in the web bundle.
 * AlexFMS.sxb: SalesLogix LAN bundle containing required fields and picklists.
 * AlexFMS-Mobile.zip: SalesLogix Web bundle containing required entity changes and mobile module.



Installation and Deployment Instructions:
1. Start with a SalesLogix eval or blank database for SLX8, and a SalesLogix 8.0 model
2. Apply AlexFMS.sxb LAN bundle in Administrator
3. Apply the AlexFMS-Mobile.zip web bundle in Application Architect
4. Build the web platform
5. Verify that the AlexFMS module is enabled in the SlxMobile portal
6. Deploy the SlxClient, sdata, and SlxMobile portals
7. Configure the sites in IIS (nothing special, normal configuration)



Testing Instructions:
1. Choose a particular support user to test as
2. Login to the SlxClient portal
3. Pick any ticket in the system or enter a new one
4. Set the "Assigned To" value to your chosen support user (or a team that user is on)
5. Set the "Scheduled Time" field (needed by date) to a current date and time (yesterday, today, tomorrow, etc)
6. Set the "Job Address" field (this lookup will only show addresses related to the ticket's contact).
7. Set the "Duration" field
8. Set the ticket to "Open" status.
9. Repeat steps 3-9 for several tickets so you have jobs on todays date and dates around todays date.
10. Login to the SlxMobile portal as your chosen support user
11. Under the Configuration Menu, add the "Job Schedule" view.
12. Open the Job Schedule view. You will be taken to today's date in the schedule. Navigation buttons at the top will allow you to move to the next and previous dates. The jobs will be organized by start time and will display the following information: Start time, Area/Category/Issue, Ticket Subject, Contact Name, Address
13. Tap on any of the jobs on the schedule for today to view detailed information about the job. Note that you can easily navigate to the account and contact detail records from here if you need to review anything there. Tapping on any phone number will allow you to easily call the contact. Tapping on the e-mail address will open your preferred email application. Tapping on the address will open your mapping application (defaults to google maps website if it can't) so you can easily get directions to the site.
14. Note the three buttons in the top toolbar. These are to Cancel, Reschedule, and Complete the job respectively. You may only perform these actions of the job is in "Open" status.
15. Try cancelling, rescheduling, and completing jobs. Note the customized signature field on the job complete screen.



Mini FAQ:
Q: Why do you allow the users to still assign tickets to teams and departments? Shouldn't it just be to other users?
A: There are many situations where a job would need to be assigned to a team rather than an individual (TV Mounting, HVAC installation, construction, etc.) It's a matter of changing the "Assigned To" lookup if this needs to be locked down.

Q: What features are missing that would prevent this from being a full featured field services app?
A: From the on-site technician's perspective, it is missing two items. First, the ability to add products and services to the job. Second, the ability to take payment. These features would have required integration with 3rd party systems or significant customizations to the web client. Because the competition was focused on the Mobile development specifically I decided to hold off on these two features. 
	From the dispatcher's perspective there are a lot of items missing. If I was to build out this system I would need to create job codes for the tickets, competency roles for the users, a way to associate products and services to the ticket, scheduling calendars, and business rules to make it all work together. None of these items are particularly difficult to build. But if you put them all together it's a pretty sizable chunk of development time. Again, because the competition was focused on mobile I didn't want to spend any time here.
	Overall I see this as a solid proof of concept for a mobile field services application. This proves that the SalesLogix mobile client is easily expansible and versitile. And it proves that moving on-site technicians away from laptops (or clipboards) and onto smart phones (or tablets) is a pretty trivial task.

Q: How long did it take to develop this?
A: Mybe about 30 hours of actual development and testing time. Then another few days to put together the documentation and video. Completing the entire system would probably take a lot longer, depending on how complex the requirements are. I would like to have done more but I didn't have any more time to dedicate before the deadline. I think I accomplished what I set out to, so I'm happy with it.

Q: Why did you override the signature field?
A: It just didn't work the way I wanted it to. I wanted a simple field that didn't require the usual "edit view" and stored the image as PNG.
