export default function TopNav() {
  return (
    <header className="flex justify-between items-center p-lg shadow-sm bg-white">

      <h3 className="fw-semibold">
        Dashboard
      </h3>

      <div className="flex gap-md items-center">

        {/* MODE SWITCH (future feature) */}
        <button className="bg-primary-base px-md py-sm radius-md text-white">
          Switch Mode
        </button>

        <button className="bg-neutral-lighter px-md py-sm radius-md">
          Profile
        </button>

      </div>

    </header>
  );
}