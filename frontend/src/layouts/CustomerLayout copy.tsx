import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div style={{ display: "flex" }}>
      <div>Customer Sidebar</div>

      <div style={{ flex: 1 }}>
        <div>Customer Topbar</div>
        <Outlet />
      </div>
    </div>
  );
}