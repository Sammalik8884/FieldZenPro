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
        private static readonly Color BrandColor = Color.FromHex("#006CA9"); // MY TECH color used in quotation
        private static readonly Color GreyText = Colors.Grey.Darken2;
        private static readonly Color LightBorder = Colors.Grey.Lighten2;

        public MarkInvoiceDocument(Invoice invoice)
        {
            Invoice = invoice;
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
            
            container.Row(row =>
            {
                // LEFT: LOGO
                row.RelativeItem().Column(col =>
                {
                    if (File.Exists(logoPath))
                    {
                        col.Item().Height(80).Image(logoPath).FitArea();
                    }
                    else
                    {
                        col.Item().Text("ACUMEN").FontSize(22).Bold().FontColor(Colors.Green.Darken2);
                        col.Item().Text("Mobile Equipment Service").FontSize(14).Bold().FontColor(Colors.Green.Darken2);
                        col.Item().Text("(207) 245-0780").FontSize(14).Bold().FontColor(Colors.Green.Darken2);
                    }
                });

                // RIGHT: INVOICE DETAILS
                row.ConstantItem(250).PaddingLeft(10).Column(col =>
                {
                    col.Item().Text("Invoice").FontSize(16).Bold().AlignRight().FontColor(Colors.Black);
                    
                    col.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Cell().RowSpan(2).LabelCell("To:");
                        table.Cell().RowSpan(2).ValueCell(Invoice.Customer?.Name ?? "Standard Customer");

                        table.Cell().LabelCell("Invoice #:");
                        table.Cell().ValueCell(Invoice.InvoiceNumber);

                        table.Cell().LabelCell("Date:");
                        table.Cell().ValueCell(Invoice.IssueDate.ToString("dd-MMM-yyyy"));
                        
                        table.Cell().LabelCell("Due Date:");
                        table.Cell().ValueCell(Invoice.DueDate.ToString("dd-MMM-yyyy"));
                    });
                    
                    if (Invoice.Customer != null)
                    {
                        col.Item().PaddingTop(5).Text(text =>
                        {
                            text.Span("Contact: ").SemiBold();
                            text.Span(Invoice.Customer.Phone ?? Invoice.Customer.Email ?? "");
                        });
                        
                        if (!string.IsNullOrEmpty(Invoice.Customer.Address))
                        {
                            col.Item().Text(text =>
                            {
                                text.Span("Address: ").SemiBold();
                                text.Span(Invoice.Customer.Address);
                            });
                        }
                    }
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.PaddingTop(20).Column(col =>
            {
                // Title Bar
                col.Item().Background(BrandColor).Padding(5).AlignCenter().Text($"INVOICE FOR: {Invoice.Customer?.Name?.ToUpper()}")
                    .Bold().FontColor(Colors.White).FontSize(11);

                // Table
                col.Item().PaddingTop(10).Element(ComposeTable);

                // Summary Section (Below table)
                col.Item().Row(row =>
                {
                    row.RelativeItem(); // Spacer
                    row.ConstantItem(250).Element(ComposeSummary);
                });

                // Terms
                col.Item().PaddingTop(20).Element(ComposeTerms);
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
                    "Payment is due by the specified Due Date.",
                    "Late payments may be subject to additional fees."
                );
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
                        c.Item().Text("Acumen Mobile Equipment Service").Bold().FontSize(8);
                        c.Item().Text("1958 Washington Ave").FontSize(7);
                        c.Item().Text("Portland, ME 04103").FontSize(7);
                    });
                    
                    row.RelativeItem().AlignRight().Column(c => {
                        c.Item().Text("Contact:").Bold().FontSize(8);
                        c.Item().Text("(207) 245-0780").FontSize(7);
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
        
        // Styles
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
            return container.Background(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5).DefaultTextStyle(x => x.Bold());
        }

        static IContainer SummaryCellStyle(IContainer container)
        {
            return container.BorderBottom(1).BorderColor(LightBorder).PaddingVertical(5).PaddingHorizontal(5);
        }
    }

    public static class ExtensionMethods
    {
        public static void LabelCell(this IContainer container, string text)
        {
            container.Border(1).BorderColor(Colors.White).Background(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(5).Text(text).Bold();
        }

        public static void ValueCell(this IContainer container, string text)
        {
            container.Border(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(5).Text(text);
        }
    }
}
