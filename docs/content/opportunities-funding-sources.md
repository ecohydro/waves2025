# Opportunities page: editorial sources

Draft researched September 16, 2026. Page: `src/app/opportunities/page.tsx`.

## Recruitment funding

- [NSF GRFP eligibility](https://www.nsf.gov/funding/initiatives/grfp/eligibility): citizenship, eligible degree programs, first graduate year with less than one academic year completed, prior degree/application exclusions. Do not reuse older advice that second-year graduate students can apply.
- [Soros eligibility](https://pdsoros.org/eligibility/): New American criteria, age 30 or younger, application before admission and before the third year of the funded degree.
- [Fulbright Foreign Student Program](https://foreign.fulbrightonline.org/about/foreign-student-program): incoming international study/research; country-specific administration and placement. Distinct from the outbound U.S. Student awards in the lab’s funding history.
- [UC Santa Barbara central campus fellowships](https://www.graddiv.ucsb.edu/our-services/central-campus-fellowships): departmental nominations, possible support components, and separate continuing/dissertation competitions.
- [Geography financial support](https://www.geog.ucsb.edu/academics/graduate/support): named recruitment fellowships and written offers combining fellowship, TA, and GSR support. No fixed package or opening is promised on the lab page.
- [International Doctoral Recruitment Fellowship](https://www.graddiv.ucsb.edu/international-applicants/IDRF): NRST support from quarter four, good standing and timely advancement required; excludes first-year NRST and is not a living stipend.
- [UC PPFP application information](https://ppfp.ucop.edu/info/how-to-apply/): UC mentor, shared President’s/Chancellor’s application route, highly ranked applications considered at the proposed mentor’s campus; explicitly lists UC Santa Barbara.
- [Smith Fellowship guidelines](https://www.smithfellows.org/proposal-guidelines): host institution, mentor team including conservation practice, international eligibility, PhD window, U.S./territory relevance and majority of work on site.
- [NSF PRFB](https://www.nsf.gov/funding/opportunities/prfb-postdoctoral-research-fellowships-biology): current NSF 26-504 focuses on AI/biology and biotechnology. Included only as a specialized fit, not general ecology funding.
- [NASA FINESST announcement](https://science.nasa.gov/researchers/solicitations/roses-2025/amendment-52-nasa-smd-graduate-student-research-solicitation-future-investigators-in-nasa-earth-and-space-science-and-technology/): institution-submitted, student-designed research aligned with NASA science. Listed as research support to plan with Kelly and the lab, not a currently open recruitment award.

## Lab award evidence

- `content/news/scholarships-fellowships-and-grants-awarded-to-waves-lab-students.mdx`: Natasha Krell — Schmidt Environmental Solutions and SMART awards; Cascade Tuholske — President’s Dissertation Year Fellowship (2019).
- `content/news/natasha-krell-wins-fulbright-award-to-kenya.mdx`: 2017 announcement for Natasha’s 2018 Kenya field research. Avoided conflating award and travel years.
- `content/news/cynthia-gerlein-safdi-receives-nasa-earth-and-space-science-fellowship.mdx`: Cynthia’s NESSF (2014), up to three years of stipend support, Princeton period.
- `content/people/marc-mayes.mdx`: Marc joined in September 2016 as a NatureNet Science Postdoctoral Fellow, spanning Princeton/UC Santa Barbara.

## Editorial boundaries

Historical awards are explicitly separate from application opportunities. Ryan Avery and Bryn Morgan received NSF honorable mentions in the 2019 story, not funded GRFP awards; they are not listed as fellowship recipients. Princeton-only awards and fellowships for jobs elsewhere are not UC Santa Barbara recruitment opportunities. SMART appears only as historical support, not as a current unrestricted fellowship recommendation. No current NatureNet call is implied.

NSF EAR-PF was researched but omitted: the [program page](https://www.nsf.gov/funding/opportunities/ear-pf-earth-sciences-postdoctoral-fellowships) routes to an archived solicitation. Program descriptions link to official sources rather than hardcoding deadlines, dollar amounts, or promising eligibility. Review sponsor rules again before publishing and in each recruitment season.

## PhD recruitment revision

- [Bren PhD admissions](https://bren.ucsb.edu/phd-environmental-science-and-management/phd-admissions): faculty sponsorship and admissions process.
- [Bren PhD funding](https://bren.ucsb.edu/admitted-phd-students-funding-and-employment): individualized funding plans combining fellowships and academic appointments.
- [Geography application guide](https://www.geog.ucsb.edu/academics/graduate/apply): MA/PhD entry for applicants without a master’s degree; PhD entry for those with one. The MA/PhD route is doctoral recruitment.
- Lab-specific PhD focus and admissions through both programs supplied by Kelly. Do not imply Bren’s professional master’s programs are generally unavailable.

## Recruitment form setup

Recommended backend: Formspree, with an optional CV/profile URL instead of file uploads. The implementation adds no database, upload storage, or mail server.

The form is explicitly a **non-submitting preview** until `FORMSPREE_RECRUITMENT_FORM_ID` is configured. In preview mode data stays in React state only (no local storage or transmission). After configuration, the review step sends a native POST to the Formspree endpoint; Formspree handles the spam challenge, delivery errors, and confirmation. Browser validation improves input quality; it is not server-side spam protection.

Activation requires a Formspree account owned by the lab, a recruitment form, and a verified recipient. Keep Formshield and reCAPTCHA enabled, restrict the form to the production domain, and configure notification preferences in Formspree. Use a dedicated recruitment email label/address if desired. Configure the form ID in the hosting environment and redeploy. Do not enable a form until its destination and spam settings have been verified.

Setup completed September 16, 2026: lab-owned account with verified recipient `caylor@ucsb.edu`; project **WAVES Lab Recruitment**; form **WAVES PhD and Postdoctoral Inquiries**, ID `mqpazrqo`. Formshield, CAPTCHA, archiving, and email delivery are enabled. Workflow validation requires an email and a research statement of 50–1,500 characters. The form ID is configured in local development and Vercel Preview/Production environments. The privacy page describes recruitment inquiry processing. Published September 16, 2026 to https://www.waveslab.org/opportunities. Final deployment: `dpl_9kCegxAHvAfNvEgHLNef9AyEj6aA` (includes accessibility fixes).

A clearly labeled live test inquiry completed Formspree’s CAPTCHA with Kelly’s help; the successful confirmation, stored record, and email delivery to caylor@ucsb.edu were verified at 16:37 UTC on September 16, 2026. The project is restricted to the production domain (`waveslab.org`, including subdomains). The test record (155694399) appears in the Spam view, but email delivery succeeded; no filter settings were weakened. Domain restriction prevents localhost/preview submissions; retain client-side tests for those environments.

[Current plans](https://formspree.io/plans): free supports 50 submissions/month and a 30-day archive; Personal is $15/month or $120/year, 200 submissions/month and unlimited archive. Professional adds programmatic submission API access; not needed to maintain the website integration. [Spam protection](https://help.formspree.io/articles/troubleshooting/how-to-prevent-spam) and [honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering). No plan purchased.

## Funding history revision

Use an award-source list, not individual career profiles. Kelly confirmed that Bryn Morgan and Anna Boser were Fulbright Fellows and that Cascade received a Borlaug fellowship/award. The Fulbright entry now reflects multiple lab recipients; no unsupported dates, countries, or current positions are assigned. Borlaug is independently supported by `content/news/cascade-tuholske-awarded-borlaug-fellowship-to-research-urban-food-security-in-ghana-zambia.mdx`. EPA STAR: `content/news/drew-gower-receives-epa-star-fellowship.mdx`. Princeton awards: `content/news/stephanie-debats-and-cynthia-gerlein-safdi-receive-pei-awards.mdx` and the Hack award stories. Historical eligibility is explicitly distinct from present recruitment opportunities.

## Funding history links

Removed PEI-STEP, Hack, and Walbridge awards at Kelly’s request because they are Princeton-specific. Added official links for Fulbright U.S. Student, SMART, Schmidt, President’s Dissertation Year, NatureNet, and EPA STAR. NatureNet’s official page states it no longer accepts applications; EPA links to its explicitly historical 2017 program archive. Borlaug and NASA remain historical entries supported by the lab archive.

Recruitment copy now refers to the WAVES Lab rather than Kelly Caylor, per Kelly’s publication-time revision.
