import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { adminMenu } from "./components/menu/adminMenu";

export default function AdminLayout() {
  return (
    <div className="flex h-full">

      <Sidebar menu={adminMenu} />

      <div className="flex flex-col w-full">

        <TopNav />

        <main className="p-lg bg-neutral-lighter h-full">
          <Outlet />
        </main>

      </div>

    </div>
  );
}