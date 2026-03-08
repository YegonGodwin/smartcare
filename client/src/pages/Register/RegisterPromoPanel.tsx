import { HeartIcon, ShieldIcon, ActivityIcon } from '@components/layout/icons';

const benefits = [
  {
    icon: HeartIcon,
    title: 'Personal Health Dashboard',
    description: 'Track vitals, medications, and appointments in one place',
  },
  {
    icon: ShieldIcon,
    title: 'Secure & Private',
    description: 'HIPAA-compliant encryption protects your data',
  },
  {
    icon: ActivityIcon,
    title: 'Instant Access',
    description: 'View test results and prescriptions anytime, anywhere',
  },
];

export function RegisterPromoPanel() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white">
      {/* Background decoration */}
      <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-lg">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl mb-7">
          <HeartIcon />
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">
          Your Health,<br />
          Simplified
        </h1>

        <p className="text-white/80 text-base leading-relaxed mb-10">
          Join over 50,000 patients who trust SmartCare Harmony to manage their healthcare journey with confidence and ease.
        </p>

        <div className="space-y-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <benefit.icon />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">{benefit.title}</h3>
                <p className="text-white/70 text-xs leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicator */}
        <div className="mt-10 pt-8 border-t border-white/20">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-emerald-300 border-2 border-emerald-600" />
              <div className="w-9 h-9 rounded-full bg-teal-300 border-2 border-emerald-600" />
              <div className="w-9 h-9 rounded-full bg-cyan-300 border-2 border-emerald-600" />
              <div className="w-9 h-9 rounded-full bg-white/30 border-2 border-emerald-600 flex items-center justify-center text-xs font-semibold">
                +50k
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Trusted by patients nationwide</p>
              <p className="text-xs text-white/70">Rated 4.9/5 stars</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
