"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastProvider";

// ============================================
// Types
// ============================================

type UserRole = "SUPER_ADMIN" | "PUBLISHER" | "EDITOR" | "VIEWER";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  PUBLISHER: "Publisher",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "danger",
  PUBLISHER: "warning",
  EDITOR: "primary",
  VIEWER: "secondary",
};

const ALL_ROLES: UserRole[] = ["SUPER_ADMIN", "PUBLISHER", "EDITOR", "VIEWER"];

// ============================================
// Main Component
// ============================================

export default function UsersManager() {
  return (
    <AdminLayout title="Users" subtitle="Manage admin users and permissions">
      <UsersManagerContent />
    </AdminLayout>
  );
}

function UsersManagerContent() {
  const toast = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to load users");
      }
      const data = await res.json();
      setUsers(data.data?.users ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ============================================
  // Toggle active status
  // ============================================

  const handleToggleActive = async (user: AdminUser) => {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message ?? "Failed to update user");
      }

      toast.success(
        user.isActive
          ? `${user.username} has been deactivated`
          : `${user.username} has been activated`
      );
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setTogglingId(null);
    }
  };

  // ============================================
  // Delete
  // ============================================

  const handleDelete = async (user: AdminUser) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message ?? "Failed to delete user");
      }
      toast.success(`User "${user.username}" deleted`);
      setConfirmDelete(null);
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  // ============================================
  // Stats
  // ============================================

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    superAdmins: users.filter((u) => u.role === "SUPER_ADMIN").length,
  };

  return (
    <>
      {/* Action bar */}
      <div className="d-flex justify-content-end mb-4">
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-person-plus" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="text-body-secondary small mb-1">Total Users</div>
              <div className="h4 mb-0 fw-semibold">{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="text-body-secondary small mb-1">Active</div>
              <div className="h4 mb-0 fw-semibold text-success">{stats.active}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="text-body-secondary small mb-1">Inactive</div>
              <div className="h4 mb-0 fw-semibold text-warning">{stats.inactive}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="text-body-secondary small mb-1">Super Admins</div>
              <div className="h4 mb-0 fw-semibold text-danger">{stats.superAdmins}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-people text-muted" style={{ fontSize: "4rem", opacity: 0.3 }} />
            <h5 className="mt-3 text-body-secondary">No users found</h5>
            <p className="text-body-secondary mb-4">Add your first admin user to get started.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-person-plus me-2" />
              Add User
            </button>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "25%" }}>User</th>
                  <th style={{ width: "20%" }}>Email</th>
                  <th style={{ width: "15%" }}>Role</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "15%" }}>Last Login</th>
                  <th style={{ width: "15%" }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                    {/* User */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold`}
                          style={{
                            width: "36px",
                            height: "36px",
                            fontSize: "0.875rem",
                            backgroundColor: `var(--bs-${ROLE_COLORS[user.role]})`,
                          }}
                        >
                          {(user.firstName ?? user.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{user.username}</div>
                          {(user.firstName || user.lastName) && (
                            <div className="text-muted small">
                              {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <span className="text-body-secondary small">{user.email}</span>
                    </td>

                    {/* Role */}
                    <td>
                      <span className={`badge bg-${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${user.isActive ? "bg-success" : "bg-secondary"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td>
                      <small className="text-body-secondary">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </small>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit user"
                          onClick={() => setEditingUser(user)}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className={`btn btn-sm ${
                            user.isActive ? "btn-outline-warning" : "btn-outline-success"
                          }`}
                          title={user.isActive ? "Deactivate user" : "Activate user"}
                          onClick={() => handleToggleActive(user)}
                          disabled={togglingId === user.id}
                        >
                          {togglingId === user.id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            <i className={`bi ${user.isActive ? "bi-person-dash" : "bi-person-check"}`} />
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete user"
                          onClick={() => setConfirmDelete(user)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <UserFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            setShowAddModal(false);
            await loadUsers();
            toast.success("User created successfully");
          }}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserFormModal
          mode="edit"
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={async () => {
            setEditingUser(null);
            await loadUsers();
            toast.success("User updated successfully");
          }}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete User"
          message={`Are you sure you want to delete the user "${confirmDelete.username}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}

// ============================================
// UserFormModal
// ============================================

interface UserFormModalProps {
  mode: "add" | "edit";
  user?: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

function UserFormModal({ mode, user, onClose, onSuccess }: UserFormModalProps) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "EDITOR");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    else if (username.length < 3) newErrors.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_-]+$/.test(username))
      newErrors.username = "Username may only contain letters, numbers, hyphens, and underscores";

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email address";

    if (mode === "add" && !password) {
      newErrors.password = "Password is required";
    } else if (password) {
      if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
      else if (!/[A-Z]/.test(password))
        newErrors.password = "Password must contain at least one uppercase letter";
      else if (!/[a-z]/.test(password))
        newErrors.password = "Password must contain at least one lowercase letter";
      else if (!/[0-9]/.test(password))
        newErrors.password = "Password must contain at least one number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setErrors({});

    try {
      const body: Record<string, unknown> = {
        username: username.trim(),
        email: email.trim(),
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        role,
      };

      if (password) body.password = password;

      const url = mode === "add" ? "/api/users" : `/api/users/${user!.id}`;
      const method = mode === "add" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error?.message ?? "Failed to save user";
        const errField = data.error?.field as keyof FormErrors | undefined;
        if (errField) {
          setErrors({ [errField]: errMsg });
        } else {
          setErrors({ general: errMsg });
        }
        return;
      }

      onSuccess();
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${mode === "add" ? "bi-person-plus" : "bi-person-gear"} me-2`} />
                {mode === "add" ? "Add New User" : `Edit User: ${user?.username}`}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={saving}
              />
            </div>
            <div className="modal-body">
              {errors.general && (
                <div className="alert alert-danger mb-3">
                  <i className="bi bi-exclamation-triangle me-2" />
                  {errors.general}
                </div>
              )}

              {/* Username */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? "is-invalid" : ""}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  autoFocus={mode === "add"}
                  disabled={saving}
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  disabled={saving}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              {/* First + Last Name (row) */}
              <div className="row g-3 mb-3">
                <div className="col">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={saving}
                  />
                </div>
                <div className="col">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  disabled={saving}
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <div className="form-text text-muted small mt-1">
                  <strong>Super Admin:</strong> Full access &nbsp;|&nbsp;
                  <strong>Publisher:</strong> Publish & edit &nbsp;|&nbsp;
                  <strong>Editor:</strong> Edit only &nbsp;|&nbsp;
                  <strong>Viewer:</strong> Read-only
                </div>
              </div>

              {/* Password */}
              <div className="mb-0">
                <label className="form-label fw-semibold">
                  Password{mode === "add" && <span className="text-danger"> *</span>}
                  {mode === "edit" && (
                    <span className="text-muted fw-normal ms-1 small">(leave blank to keep current)</span>
                  )}
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "add" ? "Min. 8 characters" : "New password (optional)"}
                    disabled={saving}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                {mode === "add" && (
                  <div className="form-text text-muted small mt-1">
                    Must be 8+ characters with uppercase, lowercase, and a number.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : mode === "add" ? (
                  <>
                    <i className="bi bi-person-plus me-2" />
                    Create User
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
