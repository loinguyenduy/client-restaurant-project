export const getRoleHome = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "staff") return "/staff/attendance";
  return "/";
};

export const getLegacyStaffDestination = (pathname) => {
  const staffPages = new Set([
    "orders",
    "reservations",
    "pos",
    "attendance",
    "tables",
  ]);
  const page = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return staffPages.has(page) ? `/staff/${page}` : "/staff/attendance";
};
