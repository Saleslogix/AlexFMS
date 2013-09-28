define('AlexFMS/Views/Job/Complete', [
    'dojo/_base/declare',
    'dojo/string',
    'Mobile/SalesLogix/Validator',
    'Mobile/SalesLogix/Format',
    'Mobile/SalesLogix/Template',
    'Sage/Platform/Mobile/Edit'
], function(
	declare,
	string,
	validator,
	format,
	template,
	Edit
) {
	return declare('AlexFMS.Views.Job.Complete', [Edit], {
		// labels
		startTimeText: 'started',
		completeTimeText: 'completed',
		titleText: 'Complete Job',
		signatureText: 'signature',
		notesText: 'internal notes',
		problemText: 'problem desc',
		solutionText: 'job notes',
		dateTimeFormatText: 'M/d/yyyy h:mm tt',
		emailJobNotesText: 'email notes',
		emailText: 'email',
		
		// view properties
		entityName: 'Job',
		id: 'job_complete',
		editSecurity: 'Entities/Ticket/Edit',
		querySelect: [
			'Notes',
			'Contact/Email',
			'TicketProblem/Notes',
			'TicketSolution/Notes',
			'CustomerSignature',
			'EmailJobNotes'
	    ],
		resourceKind: 'tickets',
        onShow: function(entry) {
            this.getCompleteCode();
        },
        getCompleteCode: function() {
        	var request = new Sage.SData.Client.SDataResourceCollectionRequest(App.getService())
    			.setResourceKind('picklists')
    			.setContractName('system')
    			.setQueryArg('where', 'name eq "Ticket Status"')
    			.setQueryArg('include', 'items');
        	request.allowCacheUse = true;
    		request.read({
    			success: this.onGetCompleteCodeSuccess,
    			failure: function(xhr, o) { errorManager.addError(xhr, o, this.options, 'failure'); },
    			scope: this
    		});
        },
        onGetCompleteCodeSuccess: function(data) {
        	var pklItems = data.$resources[0].items;
        	for (var i = 0; i < pklItems.$resources.length; i++)
        		if (pklItems.$resources[i]['text'] == 'Closed')
        			this.completeCodeValue = pklItems.$resources[i]['$key'];
        },
        update: function() {
            var values = this.getValues();
            if (values)
            {
                this.disable();
                var entry = this.createEntryForUpdate(values);
                entry.StatusCode = this.completeCodeValue;
                var request = this.createRequest();
                if (request)
                    request.update(entry, {
                        success: this.onUpdateSuccess,
                        failure: this.onUpdateFailure,
                        scope: this
                    });
            }
            else
            {
                this.onUpdateCompleted(false);
            }
        },
		// form layout
		createLayout: function() {
			return this.layout || (this.layout = [{
				label: this.startTimeText,
				name: 'TicketActivities.$resources[0].AssignedDate',
				property: 'TicketActivities.$resources[0].AssignedDate',
				type: 'date',
				timeless: false,
				required: true,
				showTimePicker: true,
				dateFormatText: this.dateTimeFormatText,
				minValue: new Date(new Date().setDate(new Date().getDate() - 1)), // yesterday
				maxValue: new Date(new Date().setDate(new Date().getDate() + 1)), // tomorrow
				validator: [
				    validator.exists,
				    validator.isDateInRange
				]
			},{
				label: this.completeTimeText,
				name: 'TicketActivities.$resources[0].CompletedDate',
				property: 'TicketActivities.$resources[0].CompletedDate',
				type: 'date',
				timeless: false,
				required: true,
				showTimePicker: true,
				dateFormatText: this.dateTimeFormatText,
				minValue: new Date(new Date().setDate(new Date().getDate() - 1)), // yesterday
				maxValue: new Date(new Date().setDate(new Date().getDate() + 1)), // tomorrow
				validator: [
				    validator.exists,
				    validator.isDateInRange
				]
			},{
                name: 'TicketProblem.$key',
                property: 'TicketProblem.$key',
                type: 'hidden',
                include: true
            },{
                label: this.problemText,
                name: 'TicketProblem',
                property: 'TicketProblem',
                title: this.problemText,
                type: 'note',
                view: 'text_edit'
            },{
                name: 'TicketSolution.$key',
                property: 'TicketSolution.$key',
                type: 'hidden',
                include: true
            },{
                label: this.solutionText,
                name: 'TicketSolution',
                property: 'TicketSolution',
                title: this.solutionText,
                type: 'note',
                view: 'text_edit'
            },{
                label: this.notesText,
                name: 'Notes',
                property: 'Notes',
                noteProperty: false,
                title: this.notesText,
                type: 'note',
                view: 'text_edit'
            },{
            	name: 'EmailJobNotes',
            	label: this.emailJobNotesText,
            	property: 'EmailJobNotes',
            	type: 'boolean',
            	onText: 'Yes',
            	offText: 'No'
            },{
                name: 'Contact.$key',
                property: 'Contact.$key',
                type: 'hidden',
                include: true
            },{
            	name: 'Contact.Email',
            	property: 'Contact.Email',
            	inputType: 'email',
            	type: 'text',
            	label: this.emailText
            },{
				label: this.signatureText,
				name: 'CustomerSignature',
				property: 'CustomerSignature',
				type: 'signature'
			}]);
		}
	});
});
