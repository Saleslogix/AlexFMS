define('AlexFMS/ApplicationModule', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/string',
    'dojo/query',
    'dojo/dom-class',
    'Mobile/SalesLogix/Format',
    'Mobile/SalesLogix/Validator',
    'Sage/Platform/Mobile/ApplicationModule',
    'AlexFMS/Views/Job/TodaySchedule',
    'AlexFMS/Views/Job/Detail',
    'AlexFMS/Views/Job/Complete',
    'AlexFMS/Views/Job/Cancel',
    'AlexFMS/Views/Job/Reschedule',
    'AlexFMS/SignatureField'
    ],
    function (declare, lang, string, query, domClass, format, validator, ApplicationModule, todaySchedule, jobDetail, jobComplete, jobCancel, jobReschedule, signatureField) {
		return declare('AlexFMS.ApplicationModule', ApplicationModule, {
			loadCustomizations: function() {
				// no customizations to stock forms
				this.inherited(arguments);
			},
			loadViews: function() {
				this.inherited(arguments);
				// loading custom views
				this.registerView(new todaySchedule());
				this.registerView(new jobDetail());
				this.registerView(new jobComplete());
				this.registerView(new jobCancel());
				this.registerView(new jobReschedule());
				lang.extend(Mobile.SalesLogix.ApplicationModule, {
					getDefaultViews: function(){
						var views = originalDefViews.apply(this, arguments) || [];
						views.push('TodayJobSchedule');
						return views;
					}
				});
			}
		});
});
