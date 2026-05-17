$template = Get-Content -Path "frontend/public/field-service-management-software.html" -Raw

$articles = @(
    @{
        File = "jobber-alternative.html"
        Title = "Jobber Alternative for Field Service Teams | FieldZenPro"
        Desc = "Looking for a Jobber alternative? Discover why growing field service teams are switching to FieldZenPro for better scheduling, dispatching, and invoicing."
        H1 = "The Best Jobber Alternative for Field Service Teams"
        Intro = "Jobber is a popular choice for many new service businesses. However, as your team grows, you may find yourself hitting limitations with their pricing structure, feature set, or customer support. If you are looking for a powerful Jobber alternative that scales with your business without breaking the bank, you're in the right place."
    },
    @{
        File = "servicetitan-too-expensive.html"
        Title = "Is ServiceTitan Too Expensive? (And What To Use Instead) | FieldZenPro"
        Desc = "Find out why ServiceTitan is too expensive for many small to mid-sized businesses and explore cost-effective, powerful alternatives like FieldZenPro."
        H1 = "Why ServiceTitan Is Too Expensive (And What To Use Instead)"
        Intro = "ServiceTitan is often considered the industry giant for enterprise HVAC and plumbing companies. But for the vast majority of small to mid-sized service businesses, the ServiceTitan price tag is simply too expensive and unjustifiable. The massive onboarding fees and long-term contracts can cripple your cash flow."
    },
    @{
        File = "field-service-software-small-business-not-servicetitan.html"
        Title = "Best Field Service Software for Small Businesses (Not ServiceTitan)"
        Desc = "Looking for the best field service software for small businesses that isn't ServiceTitan? Compare the top affordable, easy-to-use platforms for 2026."
        H1 = "Best Field Service Software for Small Businesses (Not ServiceTitan)"
        Intro = "If you run a growing service business, you need software that helps you schedule, dispatch, and invoice efficiently. While ServiceTitan dominates the headlines, it's often overkill and overpriced for small businesses. Fortunately, there are fantastic alternatives designed specifically for the needs of growing teams."
    },
    @{
        File = "housecall-pro-alternative.html"
        Title = "Housecall Pro vs FieldZenPro: Honest Comparison 2026"
        Desc = "Comparing Housecall Pro vs FieldZenPro? Read our honest 2026 comparison to see which field service management software is right for your business."
        H1 = "Housecall Pro vs FieldZenPro: Honest Comparison 2026"
        Intro = "Choosing between Housecall Pro and FieldZenPro? Both platforms offer excellent tools for home service businesses, but they cater to different workflows and growth stages. In this comparison, we break down the features, pricing, and user experience to help you make the right choice for your team."
    },
    @{
        File = "servicetitan-vs-fieldzenpro.html"
        Title = "ServiceTitan vs FieldZenPro for HVAC Companies"
        Desc = "ServiceTitan vs FieldZenPro: Which is better for your HVAC company? Compare pricing, features, and onboarding times to find the perfect fit."
        H1 = "ServiceTitan vs FieldZenPro for HVAC Companies"
        Intro = "HVAC companies have unique needs when it comes to dispatching, inventory, and recurring maintenance contracts. When comparing ServiceTitan vs FieldZenPro, it's important to look beyond just the feature list and consider total cost of ownership, ease of use, and implementation time."
    },
    @{
        File = "jobber-vs-fieldzenpro.html"
        Title = "Jobber vs FieldZenPro: Which Is Better for Your Business?"
        Desc = "Jobber vs FieldZenPro: We compare the two leading field service management platforms to help you decide which is best for scheduling and invoicing."
        H1 = "Jobber vs FieldZenPro: Which Is Better for Your Business?"
        Intro = "When evaluating Jobber vs FieldZenPro, you're looking at two of the most user-friendly platforms in the field service industry. While Jobber is great for solo operators, FieldZenPro is built to handle the complexities of a growing team with advanced routing and inventory management."
    },
    @{
        File = "free-field-service-software.html"
        Title = "Best Free Field Service Software (And What to Upgrade To)"
        Desc = "Starting out on a tight budget? Explore the best free field service software options and learn when it makes sense to upgrade to a premium platform."
        H1 = "Best Free Field Service Software (And What to Upgrade To)"
        Intro = "When you are just starting your service business, keeping overhead low is critical. Using free field service software can help you manage your first few customers. However, as your job volume increases, you will quickly outgrow free tools. Here is what you need to know about starting free and upgrading smartly."
    },
    @{
        File = "switch-from-jobber.html"
        Title = "How to Switch from Jobber Without Losing Your Data"
        Desc = "Ready to migrate to a new platform? Learn how to switch from Jobber to FieldZenPro seamlessly without losing your customer data or service history."
        H1 = "How to Switch from Jobber Without Losing Your Data"
        Intro = "Switching software platforms can feel daunting. If you've decided it's time to move on from your current system, you might be worried about losing years of customer history and unpaid invoices. Fortunately, switching from Jobber to FieldZenPro is a streamlined process designed to ensure zero data loss."
    }
)

foreach ($article in $articles) {
    $content = $template -replace '<title>.*?</title>', "<title>$($article.Title)</title>"
    $content = $content -replace '<meta name="description" content=".*?">', "<meta name=`"description`" content=`"$($article.Desc)`" />"
    $content = $content -replace '<h1>.*?</h1>', "<h1>$($article.H1)</h1>"
    
    # Replace the first paragraph after author meta
    $content = $content -replace '(?s)<div class="author-meta">.*?</div>\s*<p>.*?</p>', "<div class=`"author-meta`">`n    <div class=`"author-avatar`">MU</div>`n    <div class=`"author-info`">`n      <div>Muhammad Usama</div>`n      <span>May 2026 &middot; 7 min read</span>`n    </div>`n  </div>`n`n  <p>$($article.Intro)</p>"

    # Add screenshot placeholder
    if ($content -notmatch 'dashboard-preview.png') {
        $h2Pos = $content.IndexOf("</h2>")
        if ($h2Pos -gt 0) {
            $imgHtml = "`n  <img src=`"/products/dashboard-preview.png`" alt=`"$($article.H1)`" style=`"max-width:100%; border-radius:12px; margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1);`" />`n"
            $insertPos = $h2Pos + 5
            $content = $content.Substring(0, $insertPos) + $imgHtml + $content.Substring($insertPos)
        }
    }

    Set-Content -Path "frontend/public/$($article.File)" -Value $content -Encoding UTF8
    Write-Host "Created $($article.File)"
}
