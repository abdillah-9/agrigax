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
      },
      {
        label: "Image Catalog",
        path: "/admin/image-catalog"
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
      },
      {
        label: "Messages",
        path: "/admin/messages"
      }
    ]
  },

  {
    label: "Subscriptions",
    children: [
      {
        label: "Requests",
        path: "/admin/subscription-requests"
      },
      {
        label: "Plans",
        path: "/admin/subscription-plans"
      },
      {
        label: "Payment Methods",
        path: "/admin/payment-methods"
      },
      {
        label: "Vendor Subscriptions",
        path: "/admin/vendor-subscriptions"
      },
      {
        label: "Reports",
        path: "/admin/subscription-reports"
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