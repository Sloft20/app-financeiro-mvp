import React from 'react';
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import TransactionModal from "@/components/ui/TransactionModal";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-28 pt-4 px-5 scrollbar-hide relative z-0 md:pb-8 w-full max-w-5xl mx-auto">
        {children}
      </div>
      <BottomNav />
      <TransactionModal />
    </>
  );
}
