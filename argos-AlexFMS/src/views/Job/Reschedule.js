define('AlexFMS/Views/Job/Reschedule', [
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
	return declare('AlexFMS.Views.Job.Reschedule', [Edit], {
		// labels
		startTimeText: 'started',
		completeTimeText: 'completed',
		titleText: 'Reschedule Job',
		notesText: 'internal notes',
		problemText: 'problem desc',
		solutionText: 'job notes',
		dateTimeFormatText: 'M/d/yyyy h:mm tt',
		reasonText: 'reason',
		
		// view properties
		entityName: 'Job',
		id: 'job_reschedule',
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
		// functions
		//Overriding onShow so we can pre-load our reschedule status code value.
        onShow: function(entry) {
            this.getRescheduleCode();
        },
        getRescheduleCode: function() {
        	var request = new Sage.SData.Client.SDataResourceCollectionRequest(App.getService())
    			.setResourceKind('picklists')
    			.setContractName('system')
    			.setQueryArg('where', 'name eq "Ticket Status"')
    			.setQueryArg('include', 'items');
        	request.allowCacheUse = true;
    		request.read({
    			success: this.onGetRescheduleCodeSuccess,
    			failure: function(xhr, o) { errorManager.addError(xhr, o, this.options, 'failure'); },
    			scope: this
    		});
        },
        onGetRescheduleCodeSuccess: function(data) {
        	var pklItems = data.$resources[0].items;
        	for (var i = 0; i < pklItems.$resources.length; i++)
        		if (pklItems.$resources[i]['text'] == 'Reschedule')
        			this.rescheduleCodeValue = pklItems.$resources[i]['$key'];
        },
        //Overriding update to always update the status automatically.
        update: function() {
            var values = this.getValues();
            if (values)
            {
                this.disable();
                var entry = this.createEntryForUpdate(values);
                entry.StatusCode = this.rescheduleCodeValue;
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
				label: this.reasonText,
				name: 'Substatus',
				property: 'Substatus',
				type: 'picklist',
				picklist: 'Ticket Reschedule Reason',
				requireSelection: true,
				title: 'Reason'
			},{
				label: this.startTimeText,
				name: 'TicketActivities.$resources[0].AssignedDate',
				property: 'TicketActivities.$resources[0].AssignedDate',
				type: 'date',
				timeless: false,
				required: true,
				showTimePicker: true,
				dateFormatText: this.dateTimeFormatText,
				minValue: new Date(new Date().setDate(new Date().getDate() - 1)),
				maxValue: new Date(new Date().setDate(new Date().getDate() + 1)),
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
				minValue: new Date(new Date().setDate(new Date().getDate() - 1)),
				maxValue: new Date(new Date().setDate(new Date().getDate() + 1)),
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
            }]);
		}
	});
});
