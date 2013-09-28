using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Sage.Entity.Interfaces;
using NHibernate;
using Sage.SalesLogix.BusinessRules;

namespace AlexFMS.BusinessRules
{
    public static class TicketActivityRules
    {
        public static void OnBeforeInsert(ITicketActivity ticketActivity, ISession session)
        {
            if (String.IsNullOrEmpty(ticketActivity.ActivityTypeCode))
                ticketActivity.ActivityTypeCode = BusinessRuleHelper.GetPickListItemIdByName("Ticket Activity", "TIMED");
        }
    }
}
