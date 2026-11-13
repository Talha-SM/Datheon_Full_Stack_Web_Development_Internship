
"use strict";

const PROJECTS = {
  "car-rental": {
    title: "WHEELZ — Car Rental Management System",
    category: "WEB APPLICATION",
    description:
      "An ASP.NET Core MVC application designed to manage " +
      "vehicle rentals, customers and administrative workflows.",
    overview:
      "WHEELZ is a vehicle rental management system built " +
      "to organize rental operations. Its architecture covers " +
      "users, roles, vehicle information, customers, " +
      "rentals and returns. The project uses ASP.NET Core MVC, " +
      "C# and SQL Server.",
    technologies: [
      "ASP.NET Core MVC",
      "C#",
      "SQL Server",
      "Authentication & Authorization"
    ],
    features: [
      "Administrator login and access control",
      "Role and user management modules",
      "Customer and vehicle management",
      "Rental and return workflows",
      "Administrative dashboard"
    ],
    cover: "assets/images/projects/car-rental/dashboard.jpeg",
    images: [
      {
        src: "assets/images/projects/car-rental/login.jpeg",
        label: "Administrator Login"
      },
      {
        src: "assets/images/projects/car-rental/dashboard.jpeg",
        label: "WHEELZ Admin Dashboard"
      }
    ]
  },

  "solar-trading": {
    title: "Solar Trading System",
    category: "BUSINESS MANAGEMENT SYSTEM",
    description:
      "A trading management platform covering procurement, " +
      "sales, inventory, invoices and payment workflows.",
    overview:
      "The Solar Trading System is an ASP.NET Core MVC " +
      "application for organizing business operations " +
      "involving solar-related products. Its structure " +
      "uses layered architecture and the Repository Pattern. " +
      "Screens include procurement, purchase orders, " +
      "goods receipts, vendor bills, sales and invoices.",
    technologies: [
      "ASP.NET Core MVC",
      "C#",
      "SQL Server",
      "Layered Architecture",
      "Repository Pattern"
    ],
    features: [
      "Login and account access",
      "Business dashboard and analytical charts",
      "RFQ and purchase order workflow",
      "Goods receipt and vendor billing",
      "Incoming and outgoing payments",
      "Sales quotation and sales order workflow",
      "Delivery notes and invoicing",
      "Inventory and product management"
    ],
    cover: "assets/images/projects/solar-trading/dashboard.jpeg",
    images: [
      { src: "assets/images/projects/solar-trading/login.jpeg",
        label: "Login" },
      { src: "assets/images/projects/solar-trading/home.jpeg",
        label: "Main Menu" },
      { src: "assets/images/projects/solar-trading/dashboard.jpeg",
        label: "System Dashboard" },
      { src: "assets/images/projects/solar-trading/rfq.jpeg",
        label: "Request for Quotation" },
      { src: "assets/images/projects/solar-trading/purchase-order.jpeg",
        label: "Purchase Order" },
      { src: "assets/images/projects/solar-trading/goods-receipt.jpeg",
        label: "Goods Receipt" },
      { src: "assets/images/projects/solar-trading/vendor-bill.jpeg",
        label: "Vendor Bill" },
      { src: "assets/images/projects/solar-trading/incoming-payment.jpeg",
        label: "Incoming Payment" },
      { src: "assets/images/projects/solar-trading/sales-quotation.jpeg",
        label: "Sales Quotation" },
      { src: "assets/images/projects/solar-trading/sales-order.jpeg",
        label: "Sales Order" },
      { src: "assets/images/projects/solar-trading/delivery-note.jpeg",
        label: "Delivery Note" },
      { src: "assets/images/projects/solar-trading/invoice.jpeg",
        label: "Invoice" },
      { src: "assets/images/projects/solar-trading/outgoing-payment.jpeg",
        label: "Outgoing Payment" }
    ]
  },

  "ngo-connect": {
    title: "NGO Connect",
    category: "REACT NATIVE MOBILE APPLICATION",
    description:
      "A mobile application for donors and NGOs, combining " +
      "organizational dashboards, inventory information, " +
      "donation activity and aid requests.",
    overview:
      "NGO Connect is a React Native application integrated " +
      "with ASP.NET Web API. It supports separate account " +
      "types for donors and organizations. The available " +
      "screens demonstrate login, an NGO inventory dashboard, " +
      "analytics, activity summaries and organizational details.",
    technologies: [
      "React Native",
      "ASP.NET Web API",
      "Authentication",
      "API Integration"
    ],
    features: [
      "Donor and NGO account selection",
      "Organization dashboard",
      "Inventory and stock overview",
      "Procurement activity analytics",
      "Donation and aid request summaries",
      "Organization profile view"
    ],
    cover: "assets/images/projects/ngo-connect/dashboard.jpeg",
    images: [
      { src: "assets/images/projects/ngo-connect/login.jpeg",
        label: "Account Login" },
      { src: "assets/images/projects/ngo-connect/dashboard.jpeg",
        label: "NGO Dashboard" },
      { src: "assets/images/projects/ngo-connect/analytics.jpeg",
        label: "Analytics" },
      { src: "assets/images/projects/ngo-connect/activity-summary.jpeg",
        label: "Activity Summary" },
      { src: "assets/images/projects/ngo-connect/profile.jpeg",
        label: "NGO Profile" }
    ]
  }
};
