import { useState } from "react";

const demoFAQs = [
  { id: "FAQ-001", question: "How do I create a listing?", answer: "Click 'Post Service' from your dashboard and fill in the details.", category: "Providers", order: 1, status: "published" },
  { id: "FAQ-002", question: "How do I pay for a service?", answer: "You can pay via M-Pesa, Tigo Pesa, Airtel Money, or bank transfer.", category: "Customers", order: 2, status: "published" },
  { id: "FAQ-003", question: "What is the refund policy?", answer: "Refunds are processed within 3-5 business days after approval.", category: "General", order: 3, status: "published" },
  { id: "FAQ-004", question: "How to verify my provider account?", answer: "Upload your ID and business documents in the verification section.", category: "Providers", order: 4, status: "draft" },
];

export default function FAQs() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">FAQs</h1>
        <p className="page-subtitle">Manage frequently asked questions</p>
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All FAQs</div>
            <div className="inv-toolbar-sub">{demoFAQs.length} questions</div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input className="inv-search" placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="inv-btn-create">
              <span className="inv-btn-create-icon">+</span> Add FAQ
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoFAQs.map(faq => (
              <tr key={faq.id}>
                <td>{faq.order}</td>
                <td className="fw-medium">{faq.question}</td>
                <td><span className="badge badge-info">{faq.category}</span></td>
                <td>
                  {faq.status === "published" ? (
                    <span className="badge badge-success">Published</span>
                  ) : (
                    <span className="badge badge-default">Draft</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="inv-action-btn inv-action-btn-primary">Edit</button>
                    <button className="inv-action-btn inv-action-btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
