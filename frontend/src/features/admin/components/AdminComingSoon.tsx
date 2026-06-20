interface AdminComingSoonProps {
  title: string;
  description?: string;
}

export default function AdminComingSoon({
  title,
  description = "This section is planned for a future release and is not part of admin V1.",
}: AdminComingSoonProps) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      <div className="table-empty">
        <p>Coming soon — backend API not available in V1 yet.</p>
      </div>
    </div>
  );
}
