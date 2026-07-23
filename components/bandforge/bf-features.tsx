const features = [
  {
    title: "Real IELTS simulation",
    benefit: "Same pressure, pacing, and layout DNA as the real computer-delivered test.",
  },
  {
    title: "AI writing evaluation",
    benefit: "Task achievement, cohesion, lexical resource, and grammar — in seconds.",
  },
  {
    title: "Speaking analysis",
    benefit: "Fluency, pronunciation, and discourse markers with AI + human review.",
  },
  {
    title: "Weak area detection",
    benefit: "Know exactly which sub-skills drag your overall band — then drill them.",
  },
  {
    title: "Instant Reading & Listening",
    benefit: "Objective keys and band estimates without waiting days for results.",
  },
  {
    title: "Personalised practice",
    benefit: "Recommendations that adapt after every mock — not generic worksheets.",
  },
] as const;

export function BandForgeFeatures() {
  return (
    <section id="features" className="bf-section bg-cyan-soft/30">
      <div className="bf-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="bf-eyebrow">Content library</p>
          <h2 className="bf-section-title mt-3 text-balance">
            Practice modules for every IELTS skill
          </h2>
          <p className="bf-copy mx-auto mt-5 max-w-2xl">
            Listening, Reading, Writing, and Speaking — structured lessons with
            progress tracking on desktop and mobile.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((f) => (
            <li
              key={f.title}
              className="bf-min-card bf-card-hover flex flex-col border-t-4 border-t-teal p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none sm:p-6"
            >
              <h3 className="text-lg font-bold text-black">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {f.benefit}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
