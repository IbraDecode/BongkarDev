import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { MainPanel } from '../../components/layout/MainPanel';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col gap-4 p-6 bg-canvas">
      <Header />
      <div className="grid grid-cols-[280px,1fr] gap-4 items-start">
        <Sidebar />
        <MainPanel />
      </div>
    </div>
  );
}
