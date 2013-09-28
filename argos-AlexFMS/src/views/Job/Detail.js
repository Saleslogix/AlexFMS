define('AlexFMS/Views/Job/Detail', [
    'dojo/_base/declare',
    'dojo/string',
    'dojo/_base/lang',
    'dojo/query',
    'dojo/dom-class',
    'Mobile/SalesLogix/Format',
    'Sage/Platform/Mobile/ErrorManager',
    'Sage/Platform/Mobile/Detail',
], function (
	declare,
	string,
	lang,
	query,
	domClass,
	format,
	errorManager,
	detail
) {
	return declare('AlexFMS.Views.Job.Detail', [detail], {
		// labels
		accountText: 'account',
		contactText: 'contact',
		phoneText: 'phone',
		emailText: 'email',
		areaText: 'area',
		categoryText: 'category',
		issueText: 'issue',
		subjectText: 'subject',
		neededByText: 'appt start time',
		homePhoneText: 'home',
		mobilePhoneText: 'mobile',
		workPhoneText: 'work',
		notesText: 'internal notes',
		problemText: 'problem desc',
		solutionText: 'job notes',
		titleText: 'Job',
		relatedItemsText: 'Related Items',
		contactNotesText: 'Contact Notes',
		durationText: 'duration',
		addressText: 'address',
		relatedTicketActivitiesText: 'Logged Activities',
		relatedAttachmentText: 'Attachments',
		viewAddressText: 'address',
		id: 'job_detail',
		completeView: 'job_complete',
		rescheduleView: 'job_reschedule',
		cancelView: 'job_cancel',
		security: 'Entities/Ticket/View',
		statusText: 'status',
		loadingText: 'loading...',

		// view properties
		querySelect: [
		    'Account/AccountName',
		    'Area',
		    'Category',
		    'Issue',
		    'Notes',
		    'Contact/Name',
		    'Contact/Mobile',
		    'Contact/HomePhone',
		    'Contact/WorkPhone',
		    'JobAddress/*',
		    'Contact/Email',
		    'NeededByDate',
		    'Subject',
		    'TicketProblem/Notes',
		    'TicketSolution/Notes',
		    'StatusCode',
		    'EmailJobNotes'
		],
		resourceKind: 'tickets',

		// functions and events
		checkPhone: function(entry, value) {
			return !value;
		},
		callHomePhone: function() {
			App.initiateCall(this.entry.Contact.HomePhone);
		},
		callMobilePhone: function() {
			App.initiateCall(this.entry.Contact.Mobile);
		},
		callWorkPhone: function() {
			App.initiateCall(this.entry.Contact.WorkPhone);
		},
		viewAddress: function() {
	        if (navigator.userAgent.match(/Android/i))
	            window.location.href = string.substitute("geo:0,0?q=${0}", [this.entry.JobAddress.FullAddress]);
	        else if (navigator.userAgent.match(/iPhone|iPod|iPad/))
	            window.location.href = string.substitute("maps:q=${0}", [this.entry.JobAddress.FullAddress]);
	        else   // web browser
	            window.open(string.substitute("http://maps.google.com/maps?q=${0}", [this.entry.JobAddress.FullAddress]), '_blank');  
        },
        sendEmail: function() {
        	App.initiateEmail(this.entry.Contact.Email);
        },
        checkAddress: function(entry, value) {
            return !format.address(value, true, '');
        },
        completeJob: function(el) {
        	if (this.entry.StatusCode == 'Open') {
        		var view = App.getView(this.completeView);
        		if (view)
        			view.show({entry: this.entry});
        	} else {
        		alert('This job is not open. You may not complete it. Please call dispatch if this is incorrect.');
        	}
        },
        rescheduleJob: function(el) {
        	if (this.entry.StatusCode == 'Open') {
        		var view = App.getView(this.rescheduleView);
            	if (view)
            		view.show({entry: this.entry});
        	} else {
        		alert('This job is not open. You may not reschedule it. Please call dispatch if this is incorrect.');
        	}
        },
        cancelJob: function(el) {
        	if (this.entry.StatusCode == 'Open') {
        		var view = App.getView(this.cancelView);
            	if (view)
            		view.show({entry: this.entry});
        	} else {
        		alert('This job is not open. You may not cancel it. Please call dispatch if this is incorrect.');
        	}
        },
        getStatusCode: function(row, node, value, entry) {
        	var request = new Sage.SData.Client.SDataResourceCollectionRequest(App.getService())
        		.setResourceKind('picklists')
        		.setContractName('system')
        		.setQueryArg('where', 'name eq "Ticket Status"')
        		.setQueryArg('include', 'items');
        	request.allowCacheUse = true;
        	request.read({
        		success: lang.hitch(this, this.onGetStatusCodeSuccess, row, node, value, entry),
        		failure: function(xhr, o) { errorManager.addError(xhr, o, this.options, 'failure'); },
        		scope: this
        	});
        },
        onGetStatusCodeSuccess: function(row, node, value, entry, data) {
        	var textValue = '';
        	var pklItems = data.$resources[0].items;
        	for (var i = 0; i < pklItems.$resources.length; i++)
        		if (pklItems.$resources[i]['$key'] == entry[row.property])
        			textValue = pklItems.$resources[i]['text'];
        	domClass.remove(node, 'content-loading');
        	query('span', node).text(textValue);
        	this.entry[row.name] = textValue;
        },
		// special toolbar layout for this view
        createToolLayout: function() {
        	return this.tools || (this.tools = {
        		'tbar': [{
        			id: 'complete',
        			action: 'completeJob',
        			security: App.getViewSecurity(this.completeView, 'update')
        		},{
        			id: 'edit',
        			action: 'rescheduleJob',
        			security: App.getViewSecurity(this.rescheduleView, 'update')
        		},{
        			id: 'cancel',
        			action: 'cancelJob',
        			security: App.getViewSecurity(this.cancelView, 'update')
        		}]
        	});
		},
		// form layout
		createLayout: function() {
			return this.layout || (this.layout = [{
				title: this.detailsText,
				name: 'DetailsSection',
				children: [{
					name: 'Account.AccountName',
					property: 'Account.AccountName',
					descriptor: 'Account.AccountName',
					label: this.accountText,
					view: 'account_detail',
					key: 'Account.$key'
			   },{
				   name: 'Contact.Name',
				   property: 'Contact.Name',
				   descriptor: 'Contact.Name',
				   label: this.contactText,
				   view: 'contact_detail',
				   key: 'Contact.$key'
			   },{
				   label: this.homePhoneText,
				   name: 'Contact.HomePhone',
				   property: 'Contact.HomePhone',
				   icon: 'content/images/icons/Dial_24x24.png',
				   action: 'callHomePhone',
				   renderer: format.phone.bindDelegate(this, false),
				   disabled: this.checkPhone
			   },{
				   label: this.mobilePhoneText,
				   name: 'Contact.Mobile',
				   property: 'Contact.Mobile',
				   action: 'callMobilePhone',
				   renderer: format.phone.bindDelegate(this, false),
				   disabled: this.checkPhone
			   },{
				   label: this.workPhoneText,
				   name: 'Contact.WorkPhone',
				   property: 'Contact.WorkPhone',
				   action: 'callWorkPhone',
				   renderer: format.phone.bindDelegate(this, false),
				   disabled: this.checkPhone
			   },{
                   name: 'ViewAddressAction',
                   property: 'JobAddress',
                   label: this.viewAddressText,
                   icon: 'content/images/icons/Map_24.png',
                   action: 'viewAddress',
                   disabled: this.checkAddress,
                   renderer: format.address.bindDelegate(this, true, ' ')
               },{
                   name: 'SendEmailAction',
                   property: 'Contact.Email',
                   label: this.emailText,
                   icon: 'content/images/icons/Send_Write_email_24x24.png',
                   action: 'sendEmail',
                   disabled: this.checkValueExists
               },{
            	 label: this.statusText,
            	 cls: 'content-loading',
            	 value: this.loadingText,
            	 name: 'StatusCode',
            	 property: 'StatusCode',
            	 onCreate: this.getStatusCode.bindDelegate(this)
               },{
				   label: this.areaText,
				   name: 'Area',
				   property: 'Area'
			   },{
				   label: this.categoryText,
				   name: 'Category',
				   property: 'Category'
			   },{
				   label: this.issueText,
				   name: 'Issue',
				   property: 'Issue'
			   },{
				   label: this.problemText,
				   name: 'TicketProblem.Notes',
				   property: 'TicketProblem.Notes'
			   },{
				   label: this.solutionText,
				   name: 'TicketSolution.Notes',
				   property: 'TicketSolution.Notes'
			   },{
				   label: this.notesText,
				   name: 'Notes',
				   property: 'Notes'
			   }]
			},{
				title: this.relatedItemsText,
				name: 'RelatedItems',
				list: true,
				children: [{
                    name: 'TicketActivityRelated', // this will allow the user to easily see previous job notes
                    icon: 'content/images/icons/Schedule_ToDo_24x24.png',
                    label: this.relatedTicketActivitiesText,
                    view: 'ticketactivity_related',
                    where: this.formatRelatedQuery.bindDelegate(this, 'Ticket.Id eq "${0}"'),
                    title: this.relatedTicketActivitiesText
                }, {
                    name: 'AttachmentRelated', // added this so user could take before/after photos
                    icon: 'content/images/icons/Attachment_24.png',
                    label: this.relatedAttachmentText,
                    where: this.formatRelatedQuery.bindDelegate(this, 'TicketId eq "${0}"'),
                    view: 'ticket_attachment_related',
                    title:  this.relatedAttachmentText
                }]
			}]);
		}
	});
});
