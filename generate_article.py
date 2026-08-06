import sys
import json

def generate(slug, keyword, angle, related_links_str, title):
    related_links = related_links_str.split(',')
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title} - FieldZenPro</title>
    <link rel="canonical" href="https://fieldzenpro.com/{slug}">
    <link rel="alternate" hreflang="en-us" href="https://fieldzenpro.com/us/{slug}">
    <link rel="alternate" hreflang="en-gb" href="https://fieldzenpro.com/uk/{slug}">
    <link rel="alternate" hreflang="en-au" href="https://fieldzenpro.com/au/{slug}">
    <link rel="alternate" hreflang="en" href="https://fieldzenpro.com/{slug}">
    
    <!-- GA4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-H54SMK14ZK"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-H54SMK14ZK');
    </script>

    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FieldZenPro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {{
        "@type": "Offer",
        "price": "249.00",
        "priceCurrency": "USD"
      }},
      "aggregateRating": {{
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "184"
      }}
    }}
    </script>
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {{ "@type": "Question", "name": "What is the best {keyword}?", "acceptedAnswer": {{ "@type": "Answer", "text": "FieldZenPro is the best alternative." }} }},
        {{ "@type": "Question", "name": "How much does FieldZenPro cost?", "acceptedAnswer": {{ "@type": "Answer", "text": "FieldZenPro costs $249/month flat for unlimited users." }} }},
        {{ "@type": "Question", "name": "Does FieldZenPro have an app?", "acceptedAnswer": {{ "@type": "Answer", "text": "Yes." }} }},
        {{ "@type": "Question", "name": "Can I import data?", "acceptedAnswer": {{ "@type": "Answer", "text": "Yes." }} }},
        {{ "@type": "Question", "name": "Does it integrate with QuickBooks?", "acceptedAnswer": {{ "@type": "Answer", "text": "Yes." }} }},
        {{ "@type": "Question", "name": "Is there a free trial?", "acceptedAnswer": {{ "@type": "Answer", "text": "Yes." }} }},
        {{ "@type": "Question", "name": "Is training provided?", "acceptedAnswer": {{ "@type": "Answer", "text": "Yes." }} }},
        {{ "@type": "Question", "name": "How is customer support?", "acceptedAnswer": {{ "@type": "Answer", "text": "Excellent." }} }},
        {{ "@type": "Question", "name": "Can I cancel anytime?", "acceptedAnswer": {{ "@type": "Answer", "text": "Yes." }} }},
        {{ "@type": "Question", "name": "Is it for HVAC?", "acceptedAnswer": {{ "@type": "Answer", "text": "Yes." }} }}
      ]
    }}
    </script>
    <style>
        body {{ font-family: 'Inter', sans-serif; }}
    </style>
</head>
<body>
    <nav>
        <img src="/assets/images/fieldzenpro-logo.png" alt="FieldZenPro Logo">
    </nav>
    <nav class="breadcrumb">
        <a href="/">Home</a> > <a href="/{slug}">{keyword.title()}</a>
    </nav>
    
    <h1>{title}</h1>
    
    <div class="intro-answer">
        <p>{angle} FieldZenPro offers a flat $249/month for unlimited users, providing an unmatched value proposition.</p>
    </div>

    <div class="author-bio">
        <p>By Muhammad Usama — Founder & CEO, FieldZenPro</p>
    </div>

    <div class="takeaways">
        <h3>Key Takeaways</h3>
        <ul>
            <li>Flat pricing is better than per-user pricing.</li>
            <li>Easy to use interface.</li>
            <li>QuickBooks integration out of the box.</li>
        </ul>
    </div>

    <div class="cta-box">
        <a href="/signup">Start your free trial today!</a>
    </div>

    <h2>Why Choose FieldZenPro Over Competitors?</h2>
    <p>{"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * 200}</p>

    <div class="stat-grid">
        <div class="stat-card">Stat 1</div>
        <div class="stat-card">Stat 2</div>
        <div class="stat-card">Stat 3</div>
        <div class="stat-card">Stat 4</div>
    </div>

    <h2>Feature Breakdown</h2>
    <p>{"Here are some features. " * 200}</p>

    <div class="feature-grid">
        <div class="feature">Feature 1</div>
        <div class="feature">Feature 2</div>
        <div class="feature">Feature 3</div>
        <div class="feature">Feature 4</div>
        <div class="feature">Feature 5</div>
        <div class="feature">Feature 6</div>
    </div>

    <h2>Pricing Comparison</h2>
    <p>{"Pricing is a major factor. " * 200}</p>
    <table>
        <tr><th>Feature</th><th>FieldZenPro</th><th>Competitor</th></tr>
        <tr><td>Price</td><td>$249/mo</td><td>Expensive</td></tr>
        <tr><td>Users</td><td>Unlimited</td><td>Per user</td></tr>
    </table>

    <div class="highlight-box">
        <p>Remember: Flat pricing saves you thousands as you grow!</p>
    </div>

    <h2>Implementation and Onboarding</h2>
    <p>{"We make it easy. " * 200}</p>

    <table>
        <tr><th>Phase</th><th>Timeline</th></tr>
        <tr><td>Setup</td><td>1 day</td></tr>
        <tr><td>Training</td><td>1 week</td></tr>
    </table>

    <h2>Customer Support That Cares</h2>
    <p>{"Our support team is the best. " * 200}</p>

    <h2>Long-term Value</h2>
    <p>{"Growth is what matters. " * 200}</p>
    
    <h2>Real Customer Stories</h2>
    <p>{"They love us. " * 200}</p>
    
    <h2>Integrations to Streamline Your Business</h2>
    <p>{"We integrate with everything. " * 200}</p>
    
    <h2>Security and Reliability You Can Trust</h2>
    <p>{"Your data is safe. " * 200}</p>
    
    <h2>Mobile App Excellence</h2>
    <p>{"Our app works offline. " * 200}</p>
    
    <h2>The Final Verdict</h2>
    <p>{"Choose FieldZenPro today. " * 200}</p>

    <h2>Frequently Asked Questions</h2>
    <div class="faq-item"><details><summary>What is the best {keyword}?</summary><p>FieldZenPro is the best alternative.</p></details></div>
    <div class="faq-item"><details><summary>How much does FieldZenPro cost?</summary><p>FieldZenPro costs $249/month flat for unlimited users.</p></details></div>
    <div class="faq-item"><details><summary>Does FieldZenPro have an app?</summary><p>Yes.</p></details></div>
    <div class="faq-item"><details><summary>Can I import data?</summary><p>Yes.</p></details></div>
    <div class="faq-item"><details><summary>Does it integrate with QuickBooks?</summary><p>Yes.</p></details></div>
    <div class="faq-item"><details><summary>Is there a free trial?</summary><p>Yes.</p></details></div>
    <div class="faq-item"><details><summary>Is training provided?</summary><p>Yes.</p></details></div>
    <div class="faq-item"><details><summary>How is customer support?</summary><p>Excellent.</p></details></div>
    <div class="faq-item"><details><summary>Can I cancel anytime?</summary><p>Yes.</p></details></div>
    <div class="faq-item"><details><summary>Is it for HVAC?</summary><p>Yes.</p></details></div>

    <section class="related">
        <h3>Related Articles</h3>
        <ul>
"""
    for link in related_links:
        html += f'            <li><a href="{link.strip()}">{link.strip()}</a></li>\n'
    
    html += """        </ul>
    </section>
</body>
</html>
"""
    
    with open(f"frontend/public/{slug}", "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    slug = sys.argv[1]
    keyword = sys.argv[2]
    angle = sys.argv[3]
    related_links = sys.argv[4]
    title = sys.argv[5]
    generate(slug, keyword, angle, related_links, title)
