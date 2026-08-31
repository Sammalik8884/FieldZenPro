namespace MytechERP.domain.Enums
{
    /// <summary>
    /// Classifies an invoice line item as either a physical material/part
    /// or a labor / flat-rate service charge.
    /// Used by the Weekly Accounting Report to produce separate totals for
    /// Mark's small-engine business (and any tenant that uses this feature).
    /// </summary>
    public enum ItemCategory
    {
        Material       = 0,   // Parts, components, materials
        LaborOrService = 1    // Labor hours, flat-rate services
    }
}
