export const adminMenu = [
  {
    label: "Dashboard",
    path: "/admin"
  },

  {
    label: "User Management",
    children: [
      {
        label: "Users",
        path: "/admin/users"
      },
      {
        label: "Providers",
        path: "/admin/providers"
      },
      {
        label: "Roles & Permissions",
        path: "/admin/roles"
      },
      {
        label: "Suspended Accounts",
        path: "/admin/suspended-users"
      }
    ]
  },

  {
    label: "Services",
    children: [
      {
        label: "Service Approval",
        path: "/admin/listings"
      },
      {
        label: "Categories",
        path: "/admin/categories"
      },
      {
        label: "Featured Services",
        path: "/admin/featured-listings"
      }
    ]
  },

  {
    label: "Bookings",
    children: [
      {
        label: "All Bookings",
        path: "/admin/bookings"
      },
      {
        label: "Booking Disputes",
        path: "/admin/booking-disputes"
      }
    ]
  },

  {
    label: "Payments",
    children: [
      {
        label: "Transactions",
        path: "/admin/payments"
      },
      {
        label: "Commissions",
        path: "/admin/commissions"
      },
      {
        label: "Refunds",
        path: "/admin/refunds"
      }
    ]
  },

  {
    label: "Reviews",
    children: [
      {
        label: "Ratings & Reviews",
        path: "/admin/reviews"
      },
      {
        label: "Reported Reviews",
        path: "/admin/reported-reviews"
      }
    ]
  },

  {
    label: "Notifications",
    children: [
      {
        label: "Announcements",
        path: "/admin/announcements"
      },
      {
        label: "Push Notifications",
        path: "/admin/push-notifications"
      }
    ]
  },

  {
    label: "Content Management",
    children: [
      {
        label: "Banners",
        path: "/admin/banners"
      },
      {
        label: "Advertisements",
        path: "/admin/ads"
      },
      {
        label: "FAQs",
        path: "/admin/faqs"
      }
    ]
  },

  {
    label: "Monitoring",
    children: [
      {
        label: "Audit Logs",
        path: "/admin/audit-logs"
      },
      {
        label: "Fraud Monitoring",
        path: "/admin/fraud-monitoring"
      },
      {
        label: "System Logs",
        path: "/admin/system-logs"
      }
    ]
  },

  {
    label: "Analytics",
    children: [
      {
        label: "Revenue Reports",
        path: "/admin/revenue-reports"
      },
      {
        label: "User Analytics",
        path: "/admin/user-analytics"
      },
      {
        label: "Performance Reports",
        path: "/admin/performance-reports"
      }
    ]
  },

  {
    label: "System",
    children: [
      {
        label: "Settings",
        path: "/admin/settings"
      },
      {
        label: "Profile",
        path: "/admin/profile"
      }
    ]
  }
];