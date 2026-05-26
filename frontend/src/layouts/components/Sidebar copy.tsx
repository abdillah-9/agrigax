import { NavLink } from "react-router-dom";
import type { MenuItem } from "./menu/types";

type Props = {
  menu: MenuItem[];
};

export default function Sidebar({ menu }: Props) {
  return (
    <aside className="bg-primary-darkest text-white p-lg" style={{ width: 260 }}>

      <h2 className="text-xl fw-bold mb-xl">
        AgroX
      </h2>

      <nav className="flex flex-col gap-md">

        {menu.map((item, index) => (
          <div key={index}>

            {/* SINGLE ITEM */}
            {item.path && (
              <NavLink
                to={item.path}
                className="text-sm pointer"
              >
                {item.label}
              </NavLink>
            )}

            {/* SUB MENU */}
            {item.children && (
              <div className="flex flex-col gap-sm mt-sm">

                <div className="fw-semibold text-sm">
                  {item.label}
                </div>

                <div className="flex flex-col gap-xs px-md">

                  {item.children.map((child, i) => (
                    <NavLink key={i} to={child.path || "#"} className="text-sm">
                      - {child.label}
                    </NavLink>
                  ))}

                </div>

              </div>
            )}

          </div>
        ))}

      </nav>

    </aside>
  );
}