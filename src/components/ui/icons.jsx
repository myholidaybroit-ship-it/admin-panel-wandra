/* Consistent stroke icon set (24px grid, 1.7px stroke, round caps) */

const PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  clients: (
    <>
      <path d="M15.5 20.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H7.2a3.7 3.7 0 0 0-3.7 3.7v1.8" />
      <circle cx="9.5" cy="7.5" r="3.7" />
      <path d="M20.5 20.5v-1.8a3.7 3.7 0 0 0-2.8-3.58" />
      <path d="M14.6 4a3.7 3.7 0 0 1 0 7.17" />
    </>
  ),
  destinations: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  hotels: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9.5 21v-3.5h5V21" />
      <path d="M8 7h.01M12 7h.01M16 7h.01M8 10.5h.01M12 10.5h.01M16 10.5h.01M8 14h.01M12 14h.01M16 14h.01" />
    </>
  ),
  cabs: (
    <>
      <rect x="2.5" y="6.5" width="12" height="9.5" rx="1.2" />
      <path d="M14.5 10h3.2l3.3 3v3h-6.5" />
      <circle cx="7" cy="17.8" r="1.6" />
      <circle cx="17" cy="17.8" r="1.6" />
    </>
  ),
  packages: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3.3 8.3L12 13l8.7-4.7" />
      <path d="M12 13v9" />
    </>
  ),
  bookings: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
      <path d="M9.3 15.7l1.9 1.9 3.5-3.6" />
    </>
  ),
  invoices: (
    <>
      <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5L10 21l-2-1.5L6 21V3z" />
      <path d="M9.5 8.5h5M9.5 12h5" />
    </>
  ),
  quotations: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8.5 9.5h2.5M13 9.5h2.5" />
    </>
  ),
  reports: (
    <>
      <path d="M20 20v-9M12 20V4M4 20v-6" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ),
  settings: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1.5 14h5M9.5 8h5M17.5 16h5" />
    </>
  ),
  users: (
    <>
      <path d="M14.5 20.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.7A3.7 3.7 0 0 0 3 18.7v1.8" />
      <circle cx="8.7" cy="7.5" r="3.7" />
      <path d="M17.8 8.5v5.4M20.5 11.2h-5.4" />
    </>
  ),
  billing: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 1.8-2.8 2.4-2.8 4" />
      <path d="M12 17.5h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  check: <path d="M20 6L9 17l-5-5" />,
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
      <path d="M14 3v5h5" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  wand: (
    <>
      <path d="M15 4V2M15 10V8M12.5 5.5H10.5M19.5 5.5h-2" />
      <path d="M4 20l10.5-10.5" />
      <path d="M13 8l3 3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  plane: <path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8L8 11l-2.5 2.5H3l1.5 2.5L7 17.5 9.5 19v-2.5L12 14l3.9 3.7a.5.5 0 0 0 .8-.5z" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11A8 8 0 1 0 18.9 15" />
      <path d="M20 4v7h-7" />
    </>
  ),
  star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9L6.5 20l1-6.2L3 9.6l6.2-.9L12 3z" />,
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="2.8" />
      <path d="M4 5v14c0 1.55 3.6 2.8 8 2.8s8-1.25 8-2.8V5" />
      <path d="M4 12c0 1.55 3.6 2.8 8 2.8s8-1.25 8-2.8" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9.5 4v16" />
    </>
  ),
}

export function Icon({ name, size = 18, strokeWidth = 1.7, className = '' }) {
  const paths = PATHS[name]
  if (!paths) return null
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}
