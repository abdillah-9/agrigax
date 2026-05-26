import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { providerMenu } from "./components/menu/providerMenu";

export default function ProviderLayout() {
  return (
    <div className="flex h-full">

      <Sidebar menu={providerMenu} />

      <div className="flex flex-col w-full">

        <TopNav />

        <main className="p-lg bg-neutral-lighter h-full">
          <Outlet />
        </main>

      </div>

    </div>
  );
}