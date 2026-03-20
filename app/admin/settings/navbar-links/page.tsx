"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import NavbarLinksEditor from "@/components/admin/NavbarLinksEditor";

export default function NavbarLinksPage() {
  return (
    <AdminLayout title="Navbar Links" subtitle="Choose which sections and pages appear in the navigation bar">
      <div style={{ maxWidth: 760 }}>
        <NavbarLinksEditor />
      </div>
    </AdminLayout>
  );
}
