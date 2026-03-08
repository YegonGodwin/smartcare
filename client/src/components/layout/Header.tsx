import { LeafIcon } from './icons';
import { APP_NAME, SYSTEM_STATUS } from '@constants/index';
import { Button } from '@components/ui/index';

export function Header() {
  return (
    <header className="flex items-center justify-between px-12 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="text-emerald-600 w-8 h-8">
          <LeafIcon />
        </div>
        <span className="text-lg font-semibold text-slate-800">{APP_NAME}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-green-50 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">{SYSTEM_STATUS.OPERATIONAL}</span>
        </div>
        <Button variant="outline" size="sm">
          Get Support
        </Button>
      </div>
    </header>
  );
}
