import { MobileSidebar } from '@/components/sidebar/mobile-sidebar';

export function MobileTopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 md:hidden">
      <MobileSidebar />
      <h1 className="font-display text-base font-medium tracking-tight">MyConnect.ai</h1>
    </header>
  );
}
