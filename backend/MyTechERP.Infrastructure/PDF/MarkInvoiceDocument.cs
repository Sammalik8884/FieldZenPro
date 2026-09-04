using MytechERP.domain.Entities.Finance;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.IO;

namespace MyTechERP.Infrastructure.PDF
{
    public class MarkInvoiceDocument : IDocument
    {
        public Invoice Invoice { get; }
        public MytechERP.domain.Entities.WorkOrder? WorkOrder { get; }
        
        private static readonly Color BrandColor = Color.FromHex("#006CA9");
        private static readonly Color LightBlue = Color.FromHex("#E6F2F8");
        private static readonly Color GreyText = Colors.Grey.Darken2;
        private static readonly Color LightBorder = Colors.Grey.Lighten2;

        public MarkInvoiceDocument(Invoice invoice, MytechERP.domain.Entities.WorkOrder? workOrder = null)
        {
            Invoice = invoice;
            WorkOrder = workOrder;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontFamily(Fonts.Arial).FontSize(9).FontColor(Colors.Black));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
        }

        void ComposeHeader(IContainer container)
        {
            var logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "mark_logo.png");
            
            container.PaddingBottom(15).Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    if (File.Exists(logoPath))
                    {
                        col.Item().Height(70).Image(logoPath).FitArea();
                    }
                    else
                    {
                        col.Item().Text("ACUMEN").FontSize(22).Bold().FontColor(Colors.Green.Darken2);
                        col.Item().Text("Mobile Equipment Service").FontSize(14).Bold().FontColor(Colors.Green.Darken2);
                        col.Item().Text("(207) 245-0780").FontSize(14).Bold().FontColor(Colors.Green.Darken2);
                    }
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.Column(col =>
            {
                // Top Info Tables Side by Side
                col.Item().Row(row =>
                {
                    // LEFT TABLE
                    row.RelativeItem().PaddingRight(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(100);
                            columns.RelativeColumn();
                        });

                        table.Cell().Element(HeaderLabel).Text("To");
                        table.Cell().Element(HeaderValue).Text(Invoice.Customer?.Name ?? "Standard Customer").FontColor(BrandColor).Bold();

                        table.Cell().Element(SubLabel).Text("Contact");
                        table.Cell().Element(SubValue).Text(Invoice.Customer?.Phone ?? Invoice.Customer?.Email ?? "N/A").Bold();

                        table.Cell().Element(SubLabel).Text("Address");
                        table.Cell().Element(SubValue).Text(Invoice.Customer?.Address ?? "N/A").Bold();
                    });

                    // RIGHT TABLE
                    row.RelativeItem().PaddingLeft(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(100);
                            columns.RelativeColumn();
                        });

                        table.Cell().Element(HeaderLabel).Text("Invoice #");
                        table.Cell().Element(HeaderValue).Text(Invoice.InvoiceNumber).FontColor(BrandColor).Bold();

                        table.Cell().Element(SubLabel).Text("Date");
                        table.Cell().Element(SubValue).Text(Invoice.IssueDate.ToString("dd-MMM-yyyy")).Bold();

                        table.Cell().Element(SubLabel).Text("Due Date");
                        table.Cell().Element(SubValue).Text(Invoice.DueDate.ToString("dd-MMM-yyyy")).Bold();
                    });
                });

                // Title Bar
                col.Item().PaddingTop(20).Background(BrandColor).Padding(5).AlignCenter().Text($"INVOICE FOR: {Invoice.Customer?.Name?.ToUpper()}")
                    .Bold().FontColor(Colors.White).FontSize(11);

                // Table
                col.Item().PaddingTop(10).Element(ComposeTable);

                // Summary Section
                col.Item().Row(row =>
                {
                    row.RelativeItem(); // Spacer
                    row.ConstantItem(250).Element(ComposeSummary);
                });

                // Notes
                col.Item().PaddingTop(20).Element(ComposeNotes);

                // Terms
                col.Item().PaddingTop(10).Element(ComposeTerms);
            });
        }

        void ComposeTable(IContainer container)
        {
            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(30);  // Sr
                    columns.RelativeColumn();    // Product Description
                    columns.ConstantColumn(40);  // Qty
                    columns.ConstantColumn(75);  // Rate
                    columns.ConstantColumn(85);  // Amount
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCellStyle).Text("Sr.#");
                    header.Cell().Element(HeaderCellStyle).Text("Product Name / Description");
                    header.Cell().Element(HeaderCellStyle).AlignCenter().Text("Qty");
                    header.Cell().Element(HeaderCellStyle).AlignRight().Text("Rate (USD)");
                    header.Cell().Element(HeaderCellStyle).AlignRight().Text("Amount (USD)");
                });

                int i = 1;
                foreach (var item in Invoice.Items)
                {
                    table.Cell().Element(CellStyle).Text(i++.ToString());
                    table.Cell().Element(CellStyle).Text(item.Description);
                    table.Cell().Element(CellStyle).AlignCenter().Text(item.Quantity.ToString());
                    table.Cell().Element(CellStyle).AlignRight().Text(item.UnitPrice.ToString("N2"));
                    table.Cell().Element(CellStyle).AlignRight().Text((item.TotalPrice > 0 ? item.TotalPrice : item.Total).ToString("N2"));
                }
            });
        }

        void ComposeSummary(IContainer container)
        {
            container.PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();
                    columns.ConstantColumn(90); 
                });

                table.Header(header =>
                {
                    header.Cell().Element(SummaryHeaderStyle).Text("Description");
                    header.Cell().Element(SummaryHeaderStyle).AlignRight().Text("Amount");
                });

                table.Cell().Element(SummaryCellStyle).Text("SUB Total");
                table.Cell().Element(SummaryCellStyle).AlignRight().Text(Invoice.SubTotal.ToString("N2"));

                if (Invoice.TaxAmount > 0)
                {
                    table.Cell().Element(SummaryCellStyle).Text("Tax Amount");
                    table.Cell().Element(SummaryCellStyle).AlignRight().Text(Invoice.TaxAmount.ToString("N2"));
                }
                
                if (Invoice.AmountPaid > 0)
                {
                    table.Cell().Element(SummaryCellStyle).Text("Amount Paid").FontColor(Colors.Green.Darken2);
                    table.Cell().Element(SummaryCellStyle).AlignRight().Text(Invoice.AmountPaid.ToString("N2")).FontColor(Colors.Green.Darken2);
                }

                table.Cell().Element(SummaryCellStyle).Text("GRAND TOTAL (USD)").Bold();
                table.Cell().Element(SummaryCellStyle).AlignRight().Text(Invoice.TotalAmount.ToString("N2")).Bold();
                
                if (Invoice.AmountPaid > 0)
                {
                    var balance = Invoice.TotalAmount - Invoice.AmountPaid;
                    table.Cell().Element(SummaryCellStyle).Text("BALANCE DUE").Bold().FontColor(balance > 0 ? Colors.Red.Darken2 : Colors.Black);
                    table.Cell().Element(SummaryCellStyle).AlignRight().Text(balance.ToString("N2")).Bold().FontColor(balance > 0 ? Colors.Red.Darken2 : Colors.Black);
                }
            });
        }

        void ComposeNotes(IContainer container)
        {
            var hasWorkPerformed = WorkOrder != null && !string.IsNullOrWhiteSpace(WorkOrder.TechnicianNotes);
            var hasTechNotes = !string.IsNullOrWhiteSpace(Invoice.TechnicianNotes);

            if (!hasWorkPerformed && !hasTechNotes) return;

            container.Column(col =>
            {
                if (hasWorkPerformed)
                {
                    col.Item().PaddingBottom(10).Column(c =>
                    {
                        c.Item().Text("WORK PERFORMED / SUMMARY").Bold().Underline().FontColor(BrandColor);
                        c.Item().PaddingTop(5).Text(WorkOrder!.TechnicianNotes).FontSize(9).FontColor(Colors.Black);
                    });
                }

                if (hasTechNotes)
                {
                    col.Item().Column(c =>
                    {
                        c.Item().Text("TECHNICIAN's NOTES / RECOMMENDATIONS").Bold().Underline().FontColor(BrandColor);
                        c.Item().PaddingTop(5).Text(Invoice.TechnicianNotes).FontSize(9).FontColor(Colors.Black);
                    });
                }
            });
        }

        void ComposeTerms(IContainer container)
        {
            container.Column(col =>
            {
                col.Item().Text("TERMS & CONDITIONS").Bold().Underline().FontColor(BrandColor);
                
                void AddTerm(string title, params string[] points)
                {
                    col.Item().PaddingTop(5).Text(title).Bold().FontSize(8).FontColor(BrandColor);
                    foreach (var p in points)
                    {
                        col.Item().PaddingLeft(5).Text($"- {p}").FontSize(8);
                    }
                }

                AddTerm("Payment Terms:", 
                    "Payment is due upon completion.",
                    "All returned checks subject to $30.00 returned check fee."
                );

                col.Item().PaddingTop(10).Background(LightBlue).Padding(10).Column(c => {
                    c.Item().Text("Please remit payment by check to:").Bold().FontSize(10).FontColor(BrandColor);
                    c.Item().Text("Acumen Mobile Equipment Service").Bold().FontSize(9);
                    c.Item().Text("1958 Washington Ave").FontSize(9);
                    c.Item().Text("Portland, ME 04103").FontSize(9);
                });
            });
        }
        
        void ComposeFooter(IContainer container)
        {
            container.Column(col =>
            {
                col.Item().LineHorizontal(2).LineColor(BrandColor);
                
                col.Item().PaddingTop(5).Row(row => 
                {
                    row.RelativeItem().Column(c => {
                        c.Item().Text("Head Office:").Bold().FontSize(8);
                        c.Item().Text("1958 Washington Ave").FontSize(7);
                        c.Item().Text("Portland, ME 04103").FontSize(7);
                    });

                    row.AutoItem().PaddingHorizontal(5).LineVertical(30).LineColor(Colors.Grey.Medium);

                    row.RelativeItem().Column(c => {
                        c.Item().Text("Contact:").Bold().FontSize(8);
                        c.Item().Text("(207) 245-0780").FontSize(7);
                    });
                    
                    row.AutoItem().PaddingHorizontal(5).LineVertical(30).LineColor(Colors.Grey.Medium);
                    
                    row.RelativeItem().Column(c => {
                        c.Item().Text("Business Identity:").Bold().FontSize(8);
                        c.Item().Text("Acumen Mobile Equipment Service").FontSize(7).FontColor(BrandColor).Bold();
                    });
                });
                
                col.Item().PaddingTop(5).AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        }
        
        // ================= STYLES =================

        static IContainer HeaderLabel(IContainer container) => container.Border(1).BorderColor(Colors.White).Background(BrandColor).PaddingVertical(3).PaddingHorizontal(5).DefaultTextStyle(x => x.FontColor(Colors.White).Bold());
        static IContainer HeaderValue(IContainer container) => container.Border(1).BorderColor(LightBorder).Background(Colors.White).PaddingVertical(3).PaddingHorizontal(5);

        static IContainer SubLabel(IContainer container) => container.Border(1).BorderColor(Colors.White).Background(LightBlue).PaddingVertical(3).PaddingHorizontal(5).DefaultTextStyle(x => x.FontColor(GreyText).SemiBold());
        static IContainer SubValue(IContainer container) => container.Border(1).BorderColor(LightBorder).Background(Colors.White).PaddingVertical(3).PaddingHorizontal(5);

        static IContainer HeaderCellStyle(IContainer container)
        {
            return container.Border(1).BorderColor(Colors.White).Background(BrandColor).PaddingVertical(5).PaddingHorizontal(2).DefaultTextStyle(x => x.FontColor(Colors.White).Bold());
        }

        static IContainer CellStyle(IContainer container)
        {
            return container.BorderBottom(1).BorderColor(LightBorder).PaddingVertical(5).PaddingHorizontal(2);
        }
        
        static IContainer SummaryHeaderStyle(IContainer container)
        {
            return container.Background(Color.FromHex("#1ABC9C")).PaddingVertical(5).PaddingHorizontal(5).DefaultTextStyle(x => x.FontColor(Colors.White).Bold());
        }

        static IContainer SummaryCellStyle(IContainer container)
        {
            return container.BorderBottom(1).BorderColor(LightBorder).PaddingVertical(5).PaddingHorizontal(5);
        }
    }
}
