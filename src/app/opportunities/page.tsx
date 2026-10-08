import InquiryForm from '@/components/opportunities/InquiryForm';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Opportunities',
  description:
    'Explore PhD and postdoctoral fellowships, UC Santa Barbara recruitment funding, and pathways to join the WAVES Lab in water, vegetation, and society research.',
  path: '/opportunities',
});

type FundingOpportunity = {
  name: string;
  label: string;
  description: string;
  nextStep: string;
  href: string;
};

const graduateFellowships: FundingOpportunity[] = [
  {
    name: 'NSF Graduate Research Fellowship Program',
    label: 'External · Prospective & first-year graduate students',
    description:
      'A potential source of PhD support for research with WAVES in hydrology, ecology, and environmental data science. Applicants must be U.S. citizens, nationals, or permanent residents.',
    nextStep:
      'If you are considering a PhD with us, get in touch before applying so we can discuss a research direction. Current rules limit graduate applicants to the first year of their first graduate degree, with less than one academic year completed; prior graduate degrees and applications can affect eligibility.',
    href: 'https://www.nsf.gov/funding/initiatives/grfp/eligibility',
  },
  {
    name: 'Paul & Daisy Soros Fellowships for New Americans',
    label: 'External · Incoming & early graduate students',
    description:
      'Graduate funding for eligible immigrants and children of immigrants pursuing a degree in the United States. Applicants must meet the program’s New American criteria and be 30 or younger at the application deadline.',
    nextStep:
      'You can pursue this fellowship alongside an application to join WAVES through Bren or Geography, before admission. Applicants already enrolled must not have started the third year of the degree they want funded.',
    href: 'https://pdsoros.org/eligibility/',
  },
  {
    name: 'Fulbright Foreign Student Program',
    label: 'External · International applicants',
    description:
      'A potential route to graduate study or research in the United States for applicants from participating countries. Degree options, funding, eligibility, and university placement procedures vary by country.',
    nextStep:
      'Tell us about your research interests and the Fulbright program in your home country. We can explore a PhD or research affiliation with WAVES; your Fulbright commission or U.S. embassy can advise on country-specific requirements.',
    href: 'https://foreign.fulbrightonline.org/about/foreign-student-program',
  },
];

const campusFellowships: FundingOpportunity[] = [
  {
    name: 'UC Santa Barbara recruitment fellowships',
    label: 'Internal · Departmental nomination',
    description:
      'Central campus and departmental fellowships can help support incoming graduate students through stipends, tuition, fees, and health insurance. The mix of campus and departmental support depends on whether you join us through Bren or Geography.',
    nextStep:
      'As we discuss your application to WAVES, we can explore nomination through Bren or Geography. Central recruitment awards generally require a departmental nomination rather than a separate student application; available awards and support packages vary.',
    href: 'https://www.graddiv.ucsb.edu/our-services/central-campus-fellowships',
  },
  {
    name: 'International Doctoral Recruitment Fellowship',
    label: 'Internal · International doctoral students',
    description:
      'UC Santa Barbara automatically awards eligible incoming international doctoral students support for nonresident supplemental tuition beginning in the fourth quarter, subject to academic standing and time-to-advancement requirements.',
    nextStep:
      'For international applicants to WAVES, we can account for this award when discussing a PhD funding plan. It covers nonresident supplemental tuition, rather than living expenses, and does not cover the first year’s nonresident tuition.',
    href: 'https://www.graddiv.ucsb.edu/international-applicants/IDRF',
  },
];

const postdoctoralFellowships: FundingOpportunity[] = [
  {
    name: 'UC President’s & UC Santa Barbara Chancellor’s Postdoctoral Fellowships',
    label: 'Internal · UC & campus fellowships',
    description:
      'A potential route to a postdoc with the WAVES Lab and a faculty mentoring plan, alongside professional development and a community of fellows across the University of California.',
    nextStep:
      'Contact the WAVES Lab to explore a project and mentoring plan with WAVES before applying to PPFP. Highly ranked applications are also considered for Chancellor’s fellowships at the proposed mentor’s campus.',
    href: 'https://ppfp.ucop.edu/info/how-to-apply/',
  },
  {
    name: 'David H. Smith Conservation Research Fellowship',
    label: 'External · Conservation postdoctoral research',
    description:
      'Supports postdoctoral work connecting research to conservation practice. A potential fit for water, ecosystem, and land-use projects with direct relevance to conservation in the United States or its territories.',
    nextStep:
      'We can explore a project that connects WAVES research with a conservation partner and brings together the required academic and practitioner mentorship. U.S. citizenship is not required; check the PhD completion window and geographic research requirements.',
    href: 'https://www.smithfellows.org/proposal-guidelines',
  },
  {
    name: 'NSF Postdoctoral Research Fellowships in Biology',
    label: 'External · Specialized fit: AI & biology',
    description:
      'The current competition focuses on training at the intersection of artificial intelligence and biological sciences to advance biotechnology. Projects must address that specific focus.',
    nextStep:
      'Bring us your idea so we can assess whether a project with WAVES could meet the biological research and AI training focus. Review citizenship, career-stage, and sponsoring-scientist requirements with NSF.',
    href: 'https://www.nsf.gov/funding/opportunities/prfb-postdoctoral-research-fellowships-biology',
  },
];

const linkClass =
  'text-blue-700 dark:text-blue-300 underline underline-offset-4 hover:text-blue-900 dark:hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

function FundingCards({ opportunities }: { opportunities: FundingOpportunity[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {opportunities.map((opportunity) => (
        <article
          key={opportunity.name}
          className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6"
        >
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
            {opportunity.label}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {opportunity.name}
          </h3>
          <p className="mb-4">{opportunity.description}</p>
          <p className="text-sm mb-5">{opportunity.nextStep}</p>
          <a
            className={linkClass}
            href={opportunity.href}
            aria-label={`Details & eligibility: ${opportunity.name}`}
          >
            Details & eligibility
          </a>
        </article>
      ))}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-100 leading-relaxed">
      <section className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-4">
            Join WAVES at UC Santa Barbara
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Opportunities</h1>
          <p className="text-xl max-w-3xl mb-6">
            Bring your questions about water, vegetation, and society. Explore funding that could
            support your PhD or postdoctoral research with our lab.
          </p>
          <p className="max-w-3xl mb-8">
            Start by getting in touch about research fit, potential openings, and your timeline. You
            do not need to have a fellowship in hand to start that conversation. Fellowships,
            research appointments, and teaching appointments can all be part of a funding plan;
            admissions and funding offers are arranged through Bren or Geography at UC Santa
            Barbara.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="#inquiry">Discuss joining the lab</Button>
            <Button href="/research" variant="outline">
              Explore our research
            </Button>
            <Button href="/people" variant="outline">
              Meet the team
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <nav
          aria-label="Funding sections"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium"
        >
          <a href="#graduate" className={linkClass}>
            PhD fellowships
          </a>
          <a href="#ucsb" className={linkClass}>
            UC Santa Barbara recruitment funding
          </a>
          <a href="#postdoctoral" className={linkClass}>
            Postdoctoral fellowships
          </a>
          <a href="#track-record" className={linkClass}>
            Funding in our group
          </a>
        </nav>

        <section aria-labelledby="phd-programs-heading">
          <h2
            id="phd-programs-heading"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Two paths to a PhD with WAVES
          </h2>
          <p className="mb-6 max-w-3xl">
            The WAVES Lab admits PhD students through both the Bren School of Environmental Science
            &amp; Management and the Department of Geography at UC Santa Barbara. We can help you
            consider which program best fits the research you want to pursue with us and your
            training goals. Our graduate recruitment focuses on PhD students; standalone master’s
            supervision in WAVES is uncommon.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Bren School
              </h3>
              <p className="mb-4">
                Join WAVES through the PhD in Environmental Science and Management to pursue
                interdisciplinary research on environmental problems. Contact the WAVES Lab about
                your research idea, potential sponsorship, and a funding plan for your PhD.
              </p>
              <a
                href="https://bren.ucsb.edu/phd-environmental-science-and-management/phd-admissions"
                className={linkClass}
              >
                Bren PhD admissions
              </a>
            </article>
            <article className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Department of Geography
              </h3>
              <p className="mb-4">
                Join WAVES through Geography to study hydrology, remote sensing, and
                human–environment systems with the WAVES Lab. Applicants without a master’s degree
                enter through the MA/PhD route; this is a path to the doctorate.
              </p>
              <a href="https://www.geog.ucsb.edu/academics/graduate/apply" className={linkClass}>
                Geography PhD admissions
              </a>
            </article>
          </div>
          <p className="mt-5 text-sm">
            A lab inquiry is an opportunity to discuss research fit. Admission requires a separate
            application to your chosen graduate program.
          </p>
        </section>

        <section id="graduate" aria-labelledby="graduate-heading" className="scroll-mt-24">
          <h2
            id="graduate-heading"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Fellowships for your PhD
          </h2>
          <p className="mb-6 max-w-3xl">
            These fellowships could support your PhD research in WAVES. If one looks like a fit,
            tell us about it when you inquire about joining the lab. We can discuss the research you
            would like to propose and how the fellowship fits with admission through Bren or
            Geography.
          </p>
          <FundingCards opportunities={graduateFellowships} />
        </section>

        <section id="ucsb" aria-labelledby="ucsb-heading" className="scroll-mt-24">
          <h2 id="ucsb-heading" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            UC Santa Barbara funding for incoming researchers
          </h2>
          <p className="mb-6 max-w-3xl">
            When we discuss your PhD in WAVES, we will also discuss how campus fellowships, research
            appointments, and teaching appointments could support your work. The formal offer from
            Bren or Geography specifies the funding sources, duration, and conditions. Read{' '}
            <a
              href="https://bren.ucsb.edu/admitted-phd-students-funding-and-employment"
              className={linkClass}
            >
              Bren’s PhD funding guide
            </a>{' '}
            and{' '}
            <a href="https://www.geog.ucsb.edu/academics/graduate/support" className={linkClass}>
              Geography’s financial support guide
            </a>{' '}
            for how fellowships and graduate appointments fit together.
          </p>
          <FundingCards opportunities={campusFellowships} />
        </section>

        <section id="postdoctoral" aria-labelledby="postdoctoral-heading" className="scroll-mt-24">
          <h2
            id="postdoctoral-heading"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Build a postdoctoral proposal with WAVES
          </h2>
          <p className="mb-6 max-w-3xl">
            Use the inquiry form to share a short research idea and your intended start date well
            ahead of the sponsor’s deadline. You can include a link to your CV or research profile.
            Together we can develop the research direction and mentoring plan for a potential
            postdoc in WAVES at UC Santa Barbara.
          </p>
          <FundingCards opportunities={postdoctoralFellowships} />
        </section>

        <section
          aria-labelledby="continuing-heading"
          className="rounded-xl bg-blue-50 dark:bg-slate-800 p-6 sm:p-8"
        >
          <h2
            id="continuing-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Supporting your research in WAVES
          </h2>
          <p className="mb-4 text-slate-700 dark:text-slate-200">
            If you join WAVES, we can pursue additional support as your research takes shape.{' '}
            <a
              href="https://science.nasa.gov/researchers/solicitations/roses-2025/amendment-52-nasa-smd-graduate-student-research-solicitation-future-investigators-in-nasa-earth-and-space-science-and-technology/"
              className={linkClass}
            >
              NASA FINESST
            </a>{' '}
            could support an Earth observation project you develop with the WAVES Lab, provided it
            aligns with NASA’s science goals. We would work together on the research proposal and
            submit through UC Santa Barbara in an appropriate funding cycle.
          </p>
          <p className="text-slate-700 dark:text-slate-200">
            UC Santa Barbara’s{' '}
            <a
              href="https://www.graddiv.ucsb.edu/our-services/central-campus-fellowships"
              className={linkClass}
            >
              continuing-student and dissertation fellowships
            </a>{' '}
            are also worth planning for as your PhD progresses. Our funding history below includes
            this kind of support. We can discuss these possibilities during recruitment while
            keeping the funding offered at admission distinct from future competitions.
          </p>
        </section>

        <section id="track-record" aria-labelledby="track-record-heading" className="scroll-mt-24">
          <h2
            id="track-record-heading"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Funding that has supported our group
          </h2>
          <p className="mb-6 max-w-3xl">
            Fellowships have helped our students and postdocs pursue fieldwork, develop independent
            research, and complete their degrees. WAVES researchers have received support from:
          </p>
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            <li className="py-4">
              <a href="https://us.fulbrightonline.org/" className={linkClass}>
                <strong>Fulbright U.S. Student Program</strong>
              </a>{' '}
              — international field research and exchange, including awards to multiple WAVES
              doctoral researchers.
            </li>
            <li className="py-4">
              <strong>Borlaug Fellowship in Global Food Security</strong> — doctoral field research
              on urban food security in Africa.
            </li>
            <li className="py-4">
              <strong>NASA Earth and Space Science Fellowship</strong> — multi-year graduate
              research support.
            </li>
            <li className="py-4">
              <a href="https://www.smartscholarship.org/smart" className={linkClass}>
                <strong>
                  Science, Mathematics, and Research for Transformation (SMART) Scholarship
                </strong>
              </a>{' '}
              — doctoral research support through a scholarship-for-service program.
            </li>
            <li className="py-4">
              <a
                href="https://msi.ucsb.edu/research/current-projects/schmidt-environmental-solutions-fellows-program"
                className={linkClass}
              >
                <strong>Schmidt Environmental Solutions Award</strong>
              </a>{' '}
              — dissertation research and science communication.
            </li>
            <li className="py-4">
              <a href="https://www.graddiv.ucsb.edu/fellowships/competitions" className={linkClass}>
                <strong>UC Santa Barbara President’s Dissertation Year Fellowship</strong>
              </a>{' '}
              — dedicated support for completing doctoral research.
            </li>
            <li className="py-4">
              <a
                href="https://www.nature.org/en-us/about-us/who-we-are/our-science/naturenet-science-fellowships/"
                className={linkClass}
              >
                <strong>The Nature Conservancy’s NatureNet Science Fellowship</strong>
              </a>{' '}
              — postdoctoral research connecting ecosystem science and conservation (no longer
              accepting applications).
            </li>
            <li className="py-4">
              <a
                href="https://19january2017snapshot.epa.gov/research-fellowships/science-achieve-results-star-graduate-fellowships_.html"
                className={linkClass}
              >
                <strong>EPA Science to Achieve Results (STAR) Fellowship</strong>
              </a>{' '}
              — graduate research on environmental and water-resource questions.
            </li>
          </ul>
          <p className="mt-5 text-sm">
            This is our funding history, not a list of open competitions. Some programs have changed
            or ended; links provide program information and, where relevant, historical details. The
            opportunities above are starting points for planning research with WAVES today.
          </p>
          <p className="mt-4 text-sm">
            From the lab archive:{' '}
            <Link
              href="/news/scholarships-fellowships-and-grants-awarded-to-waves-lab-students"
              className={linkClass}
            >
              student funding awards
            </Link>
            ,{' '}
            <Link
              href="/news/cascade-tuholske-awarded-borlaug-fellowship-to-research-urban-food-security-in-ghana-zambia"
              className={linkClass}
            >
              Borlaug-supported research
            </Link>
            ,{' '}
            <Link href="/news/natasha-krell-wins-fulbright-award-to-kenya" className={linkClass}>
              Fulbright fieldwork
            </Link>
            .
          </p>
        </section>

        <section
          id="inquiry"
          aria-labelledby="contact-heading"
          className="scroll-mt-24 border-t border-gray-200 dark:border-slate-700 pt-10"
        >
          <h2
            id="contact-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Discuss joining the lab
          </h2>
          <p className="mb-6 max-w-3xl">
            Tell us about the research you would like to pursue, your preferred PhD program or
            postdoctoral plans, and your timeline.
          </p>
          <InquiryForm formId={process.env.FORMSPREE_RECRUITMENT_FORM_ID} />
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
            Funding information reviewed September 16, 2026. Follow each program’s official link for
            current availability, deadlines, award terms, and full eligibility requirements.
          </p>
        </section>
      </div>
    </main>
  );
}
