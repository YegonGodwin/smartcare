import { ShieldIcon, UsersIcon, ActivityIcon } from '@components/layout/icons';

const highlights = [
  {
    icon: UsersIcon,
    title: 'Role-aware workspaces',
    description: 'Tailored views for patients, clinicians, and administrators.',
  },
  {
    icon: ShieldIcon,
    title: 'Security by default',
    description: 'Least-privilege access with audit-ready activity logs.',
  },
  {
    icon: ActivityIcon,
    title: 'Faster care coordination',
    description: 'Scheduling, notes, and approvals in a unified timeline.',
  },
];

const badges = ['Care teams', 'Operations', 'Compliance'];

export function PromoPanel() {
  return (
    <section className="login-panel relative overflow-hidden rounded-[2rem] p-8 sm:p-10 text-white">
      <div className="absolute -top-20 -right-12 h-56 w-56 rounded-full bg-white/10 blur-3xl login-drift" />
      <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#c46a2b]/20 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Care operations hub</p>
          <h1 className="text-4xl leading-tight font-semibold">
            Coordinate care
            <br />
            with confidence.
          </h1>
          <p className="text-sm text-white/70 max-w-md">
            A clean, focused workspace for every role. Authenticate once and move through
            schedules, records, and approvals without losing context.
          </p>
        </div>

        <div className="grid gap-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <item.icon />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-white/70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/70"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}