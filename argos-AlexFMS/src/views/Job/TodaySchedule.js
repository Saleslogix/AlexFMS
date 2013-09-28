define('AlexFMS/Views/Job/TodaySchedule', [
    'dojo/_base/declare',
    'dojo/string',
    'dojo/query',
    'dojo/dom-class',
    'Sage/Platform/Mobile/ErrorManager',
    'Sage/Platform/Mobile/Convert',
    'Sage/Platform/Mobile/List'
], function(
    declare,
    string,
    query,
    domClass,
    ErrorManager,
    convert,
    List
) {
		/**
		* This class is largely just a heavily modified calendar day view.
		*/

    return declare('AlexFMS.Views.Job.TodaySchedule', [List], {
        // Localization
        titleText: 'Job Schedule',
        dateHeaderFormatText: 'dddd, MM/dd/yyyy',
        startTimeFormatText: 'h:mm',
        todayText: 'Today',
        dayText: 'Day',
        toggleCollapseText: 'toggle collapse',

        /**
		* Templates are broken out into sections. At first I was just doing this because the calendar did it.
		* But then I realized that it made debugging things a whole lot easier because the templates are a 
		* bit complex in this case. So I decided it was easiest to leave them seperate.
		*/
        widgetTemplate: new Simplate([
            '<div id="{%= $.id %}" title="{%= $.titleText %}" class="overthrow list {%= $.cls %}" {% if ($.resourceKind) { %}data-resource-kind="{%= $.resourceKind %}"{% } %}>',
            '<div data-dojo-attach-point="searchNode"></div>',
            '<a href="#" class="android-6059-fix">fix for android issue #6059</a>',
            '{%! $.navigationTemplate %}',
            '<ul class="list-content" data-dojo-attach-point="contentNode"></ul>',
            '{%! $.moreTemplate %}',
            '</div>'
        ]),
        rowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.$key %}" data-descriptor="{%: $.TicketNumber  %}">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon">',
            '<button data-action="selectEntry" class="list-item-selector button">',
            '</button>',
            '</td>',
            '<td class="entry-table-time">{%! $$.timeTemplate %}</td>',
            '<td class="entry-table-description">{%! $$.itemTemplate %}</td>',
            '</tr></table>',
            '</li>'
        ]),
        timeTemplate: new Simplate([
            '<span class="p-time">{%: Mobile.SalesLogix.Format.date($.NeededByDate, $$.startTimeFormatText) %}</span>',
            '<span class="p-meridiem">{%: Mobile.SalesLogix.Format.date($.NeededByDate, "tt") %}</span>'
        ]),
        itemTemplate: new Simplate([
            '<h3 class="p-description">{%: $.Area %} | {%: $.Category %} | {%: $.Issue %}</h3>',
            '<h4>{%: $.Duration %} hr - {%: $.Subject %}</h4>',
            '<h4>{%: $.Contact.Name %}</h4>',
            '<h4>{%: $.JobAddress ? $.JobAddress.FullAddress : ""%}</h4>'
        ]),
        navigationTemplate: new Simplate([
            '<div class="nav-bar" style="padding: 5px 0 0 0;">',
            '<button data-tool="next" style="float: right; margin-right: 10px; z-index: 100;" data-action="getNextDay" class="button button-next"><span></span></button>',
            '<button data-tool="prev" style="float: left; margin-right: 10px; z-index: 100;" data-action="getPrevDay" class="button button-prev"><span></span></button>',
            '<h3 class="date-text" style="overflow: hidden; display: block; margin: 0; padding: 0; font-size: 1em; line-height: 34px; font-weight: bold; text-align: center; text-overflow: elipsis; white-space: nowrap; width: auto; z-index: 10;" data-dojo-attach-point="dateNode"></h3>',
            '</div>'
        ]),
        attributeMap: {
            listContent: {
                node: 'contentNode',
                type: 'innerHTML'
            },
            dateContent: {
                node: 'dateNode',
                type: 'innerHTML'
            }
        },

        //View Properties
        id: 'TodayJobSchedule',
        cls: 'activities-for-day',
        icon: 'content/images/icons/Calendar_24x24.png',
        jobDetailView: 'job_detail',
        enableSearch: false,
        currentDate: null,
        queryOrderBy: 'NeededByDate',
        querySelect: [
            'TicketNumber',
            'Subject',
            'Area',
            'Category',
            'Issue',
            'Contact/Name',
            'JobAddress/FullAddress',
            'NeededByDate',
            'Duration'
        ],
        resourceKind: 'tickets',
		// functions
        init: function() {
            this.inherited(arguments);
            this.currentDate = Date.today().clearTime();
        },
        toggleGroup: function(params) {
            var node = params.$source;
            if (node && node.parentNode) {
                domClass.toggle(node, 'collapsed');
                domClass.toggle(node.parentNode, 'collapsed-event');
            }
        },
        refresh: function() {
            this.clear();

            this.options = this.options || {};
            this.options['where'] = this.formatQueryForJobs();
            this.feed = null;
            this.set('dateContent', this.currentDate.toString(this.dateHeaderFormatText));
            this.requestData();
        },
        getEndOfDay: function() {
            return new Date(this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                this.currentDate.getDate(),
                23, 59, 59);
        },
        processFeed: function(feed) {
            var r = feed['$resources'],
                feedLength = r.length,
                o = [];

            this.feed = feed;
            for (var i = 0; i < feedLength; i++) {
                var row = r[i];
                //row.isEvent = false;
                this.entries[row.$key] = row;
                o.push(this.rowTemplate.apply(row, this));
            }

            if (feedLength === 0) {
                this.set('listContent', this.noDataTemplate.apply(this));
                return false;
            }

            this.set('listContent', o.join(''));
        },

        show: function(options) {
            if (options) {
                this.processShowOptions(options);
            }

            options = options || {};
            options['where'] = this.formatQueryForJobs();

            this.set('dateContent', this.currentDate.toString(this.dateHeaderFormatText));
            this.inherited(arguments, [options]);
        },
        processShowOptions: function(options) {
            if (options.currentDate) {
                this.currentDate = Date.parseExact(options.currentDate, 'yyyy-MM-dd').clearTime() || Date.today().clearTime();
                this.refreshRequired = true;
            }
        },
        isLoading: function() {
            return domClass.contains(this.domNode, 'list-loading');
        },
        getNextDay: function() {
            if (this.isLoading()) {
                return;
            }

            this.currentDate.add({day: 1});
            this.refresh();
        },
        getToday: function() {
            if (this.isLoading()) {
                return;
            }
            if (this.currentDate.equals(Date.today())) {
                return;
            }

            this.currentDate = Date.today().clearTime();
            this.refresh();
        },
        getPrevDay: function() {
            if (this.isLoading()) {
                return;
            }

            this.currentDate.add({day: -1});
            this.refresh();
        },
        createToolLayout: function() {
        	return this.tools || (this.tools = {
        		'tbar': []
        	});
		},
        formatQueryForJobs: function() {
        	// need to lock down to the current date and to the current user by default
            var queryWhere = 'NeededByDate between @${0}@ and @${1}@ and AssignedTo.Rights.User.Id eq "${2}"';
            return string.substitute(queryWhere, [this.currentDate.toString('yyyy-MM-ddT00:00:00Z'),this.currentDate.toString('yyyy-MM-ddT23:59:59Z'), App.context['user']['$key']]);
        },
        selectEntry: function(params) {
            var row = query(params.$source).closest('[data-key]')[0],
                key = row ? row.getAttribute('data-key') : false;

            this.navigateToDetailView(key);
        },
        selectDateSuccess: function() {
            var view = App.getPrimaryActiveView();
            this.currentDate = view.getDateTime().clearTime();
            this.refresh();
            ReUI.back();
        },
        navigateToDetailView: function(key, descriptor) {
            var entry = this.entries[key],
                detailView = 'job_detail',
                view = App.getView(detailView);
            descriptor = entry.TicketNumber;
            if (view) {
                view.show({
                    descriptor: descriptor,
                    key: key
                });
            }
        }
    });
});

