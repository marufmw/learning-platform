"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  useGetChildrenQuery,
  useCreateChildMutation,
  useUpdateChildMutation,
  useDeleteChildMutation,
  useGetMeQuery,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
  useRequestDeletionMutation,
  useDeleteAccountMutation,
} from "@/lib/api/hooks";
import { useClerk } from "@clerk/nextjs";
import { useSelectedChild } from "@/lib/context/ChildContext";
import {
  Users,
  UserCircle,
  Lock,
  CreditCard,
  Trash2,
  Plus,
  Pencil,
  Check,
  AlertCircle,
  Upload,
  ChevronRight,
  X,
  TriangleAlert,
} from "lucide-react";

// --- Shared UI helpers ---

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }: {
  icon: React.ElementType; title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--dc-border)" }}>
      <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--dc-blurple)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function DcInput({ label, optional, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; optional?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--dc-text-muted)" }}>
        {label}{optional && <span className="ml-1 normal-case font-normal">(optional)</span>}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition"
        style={{
          background: "var(--dc-bg-primary)",
          border: "1px solid var(--dc-border)",
          color: "var(--dc-text-normal)",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--dc-blurple)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--dc-border)")}
      />
    </div>
  );
}

function DcSelect({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--dc-text-muted)" }}>
        {label}
      </label>
      <select
        {...props}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition"
        style={{
          background: "var(--dc-bg-primary)",
          border: "1px solid var(--dc-border)",
          color: "var(--dc-text-normal)",
        }}
      >
        {children}
      </select>
    </div>
  );
}

function PrimaryBtn({ children, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
      style={{ background: "var(--dc-blurple)" }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-normal)" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--dc-bg-modifier-active)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--dc-bg-modifier-hover)")}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg mb-4 border"
      style={{ background: "rgba(242,63,66,0.08)", borderColor: "rgba(242,63,66,0.25)" }}>
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-red)" }} />
      <p className="text-sm" style={{ color: "var(--dc-red)" }}>{message}</p>
    </div>
  );
}

// --- Main page ---

export default function SettingsPage() {
  const { isLoaded, userId } = useAuth();
  const { signOut } = useClerk();
  const { data: children, refetch } = useGetChildrenQuery(undefined, { skip: !isLoaded || !userId });
  const { data: user } = useGetMeQuery(undefined, { skip: !isLoaded || !userId });
  const { mutate: createChild, isLoading: isCreating } = useCreateChildMutation();
  const { mutate: updateChild, isLoading: isUpdating } = useUpdateChildMutation();
  const { mutate: deleteChild, isLoading: isDeletingChild } = useDeleteChildMutation();
  const { mutate: updateUser, isLoading: isUpdatingProfile } = useUpdateUserMutation();
  const { mutate: updatePassword, isLoading: isUpdatingPassword } = useUpdatePasswordMutation();
  const { mutate: requestDeletion, isLoading: isRequestingDeletion } = useRequestDeletionMutation();
  const { mutate: deleteAccount, isLoading: isDeletingAccount } = useDeleteAccountMutation();
  const { selectedChildId, setSelectedChild } = useSelectedChild();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", age: "", gender: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [childError, setChildError] = useState("");

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const [profileFormData, setProfileFormData] = useState({
    name: "", phoneNumber: "", country: "", state: "", timezone: "", age: "", zipcode: "",
  });

  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  // Account deletion
  const [deletionStep, setDeletionStep] = useState<"idle" | "confirm" | "otp">("idle");
  const [deletionOtp, setDeletionOtp] = useState(["", "", "", "", "", ""]);
  const [deletionError, setDeletionError] = useState("");

  // Child deletion
  const [childToDelete, setChildToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        state: user.state || "",
        timezone: user.timezone || "",
        age: user.age ? String(user.age) : "",
        zipcode: user.zipcode || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChildId, setSelectedChild]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChildError("");
    if (!formData.name) return setChildError("Name is required");
    if (!formData.age) return setChildError("Age is required");
    if (!formData.gender) return setChildError("Gender is required");
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 18) return setChildError("Age must be between 1 and 18");
    try {
      if (editingId) {
        await updateChild({ id: editingId, name: formData.name, age, gender: formData.gender });
        setEditingId(null);
      } else {
        await createChild({ name: formData.name, age, gender: formData.gender });
      }
      setFormData({ name: "", age: "", gender: "" });
      setShowForm(false);
      await refetch();
    } catch (err: any) {
      setChildError(err.response?.data?.message || err.message || "Failed to save child");
    }
  };

  const handleEdit = (child: any) => {
    setEditingId(child.id);
    setFormData({ name: child.name, age: String(child.age || ""), gender: child.gender || "" });
    setShowForm(true);
    setChildError("");
  };

  const handleDeleteChild = async () => {
    if (!childToDelete) return;
    try {
      await deleteChild(childToDelete);
      setChildToDelete(null);
      if (childToDelete === selectedChildId) {
        const remaining = children?.filter((c) => c.id !== childToDelete);
        if (remaining?.length) setSelectedChild(remaining[0].id);
      }
      await refetch();
    } catch (err: any) {
      setChildError(err.response?.data?.message || err.message || "Failed to delete child");
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    try {
      await updateUser({
        name: profileFormData.name || undefined,
        phoneNumber: profileFormData.phoneNumber || undefined,
        country: profileFormData.country || undefined,
        state: profileFormData.state || undefined,
        timezone: profileFormData.timezone || undefined,
        age: profileFormData.age ? Number(profileFormData.age) : undefined,
        zipcode: profileFormData.zipcode || undefined,
        profileImage: profileImageFile ?? undefined,
      });
      setProfileImageFile(null);
      setProfileImagePreview(null);
      setShowProfileEdit(false);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!user?.hasPassword && !passwordFormData.currentPassword) {} // skip if setting for first time
    if (user?.hasPassword && !passwordFormData.currentPassword) return setPasswordError("Current password is required");
    if (!passwordFormData.newPassword) return setPasswordError("New password is required");
    if (passwordFormData.newPassword.length < 8) return setPasswordError("New password must be at least 8 characters");
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) return setPasswordError("Passwords do not match");
    try {
      const payload: { currentPassword?: string; newPassword: string } = { newPassword: passwordFormData.newPassword };
      if (user?.hasPassword && passwordFormData.currentPassword) payload.currentPassword = passwordFormData.currentPassword;
      await updatePassword(payload);
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordEdit(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || err.message || "Failed to update password");
    }
  };

  const handleRequestDeletion = async () => {
    setDeletionError("");
    try {
      await requestDeletion();
      setDeletionOtp(["", "", "", "", "", ""]);
      setDeletionStep("otp");
    } catch (err: any) {
      setDeletionError(err.response?.data?.message || err.message || "Failed to send OTP");
    }
  };

  const handleDeleteAccount = async () => {
    const otp = deletionOtp.join("");
    if (otp.length < 6) { setDeletionError("Please enter the full 6-digit code"); return; }
    setDeletionError("");
    try {
      await deleteAccount({ otp });
      await signOut();
    } catch (err: any) {
      setDeletionError(err.response?.data?.message || err.message || "Invalid or expired OTP");
    }
  };

  const handleOtpDigitChange = (index: number, value: string, nextEl: HTMLInputElement | null) => {
    // Use functional update to avoid stale closure when paste sets all 6 digits rapidly
    setDeletionOtp(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && nextEl) nextEl.focus();
  };

  const handleOtpPasteAll = (digits: string[]) => {
    setDeletionOtp(digits);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-3xl mx-auto" style={{ color: "var(--dc-text-normal)" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-0.5">Settings</h1>
        <p className="text-sm" style={{ color: "var(--dc-text-muted)" }}>Manage your children and account preferences</p>
      </div>

      <div className="space-y-4">

        {/* Children */}
        <SectionCard>
          <SectionHeader
            icon={Users}
            title="My Children"
            subtitle="Manage child profiles and set active child"
            action={!showForm ? (
              <button
                onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", age: "", gender: "" }); setChildError(""); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "var(--dc-blurple)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Child
              </button>
            ) : undefined}
          />

          <div className="p-4 space-y-3">
            {childError && <ErrorBanner message={childError} />}

            {showForm && (
              <form onSubmit={handleSubmit} className="p-4 rounded-lg border space-y-3"
                style={{ background: "var(--dc-bg-secondary)", borderColor: "var(--dc-border)" }}>
                <p className="text-sm font-semibold text-white">{editingId ? "Edit Child" : "Add New Child"}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <DcInput label="Name" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Child's name" />
                  <DcInput label="Age" type="number" min="1" max="18" value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="1–18" />
                  <DcSelect label="Gender" value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </DcSelect>
                </div>
                <div className="flex gap-2">
                  <PrimaryBtn type="submit" disabled={isCreating || isUpdating}>
                    <Check className="w-3.5 h-3.5" />
                    {isCreating || isUpdating ? "Saving..." : "Save"}
                  </PrimaryBtn>
                  <GhostBtn type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </GhostBtn>
                </div>
              </form>
            )}

            {children && children.length > 0 ? (
              <div className="space-y-2">
                {children.map((child) => (
                  <div key={child.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors"
                    style={{
                      background: child.id === selectedChildId ? "rgba(88,101,242,0.08)" : "var(--dc-bg-primary)",
                      borderColor: child.id === selectedChildId ? "rgba(88,101,242,0.3)" : "var(--dc-border)",
                    }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(88,101,242,0.15)" }}>
                      <UserCircle className="w-5 h-5" style={{ color: "var(--dc-blurple)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{child.name}</p>
                      <p className="text-xs" style={{ color: "var(--dc-text-muted)" }}>{child.gender}, {child.age} years old</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {child.id === selectedChildId ? (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(35,165,89,0.15)", color: "var(--dc-green)" }}>
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedChild(child.id)}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                          style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-muted)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--dc-text-normal)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--dc-text-muted)")}
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(child)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--dc-text-muted)" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "var(--dc-bg-modifier-hover)";
                          (e.currentTarget as HTMLElement).style.color = "var(--dc-text-normal)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--dc-text-muted)";
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setChildToDelete(child.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--dc-text-muted)" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(242,63,66,0.15)";
                          (e.currentTarget as HTMLElement).style.color = "var(--dc-red)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--dc-text-muted)";
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: "var(--dc-text-muted)" }}>
                No children yet. Add one to get started!
              </p>
            )}
          </div>
        </SectionCard>

        {/* Profile */}
        <SectionCard>
          <SectionHeader
            icon={UserCircle}
            title="Profile"
            subtitle="Edit your personal information"
            action={!showProfileEdit ? (
              <button
                onClick={() => setShowProfileEdit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-muted)" }}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            ) : undefined}
          />

          <div className="p-4">
            {profileError && <ErrorBanner message={profileError} />}

            {showProfileEdit ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Avatar upload */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold"
                    style={{ background: "var(--dc-bg-tertiary)", color: "var(--dc-text-muted)" }}>
                    {profileImagePreview || user?.profileImage ? (
                      <img src={profileImagePreview ?? user?.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.[0]?.toUpperCase() ?? "?"
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-normal)" }}>
                      <Upload className="w-3.5 h-3.5" />
                      {profileImageFile ? profileImageFile.name : "Upload Photo"}
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleProfileImageChange} />
                    </label>
                    <p className="text-xs mt-1" style={{ color: "var(--dc-text-muted)" }}>JPG, PNG or WebP — max 2MB</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <DcInput label="Name" value={profileFormData.name}
                      onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })}
                      placeholder="Your full name" />
                  </div>
                  <DcInput label="Phone" optional type="tel" value={profileFormData.phoneNumber}
                    onChange={e => setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })}
                    placeholder="+1 234 567 8900" />
                  <DcInput label="Age" optional type="number" min="1" max="120" value={profileFormData.age}
                    onChange={e => setProfileFormData({ ...profileFormData, age: e.target.value })}
                    placeholder="Age" />
                  <DcInput label="Country" optional value={profileFormData.country}
                    onChange={e => setProfileFormData({ ...profileFormData, country: e.target.value })}
                    placeholder="US" />
                  <DcInput label="State" optional value={profileFormData.state}
                    onChange={e => setProfileFormData({ ...profileFormData, state: e.target.value })}
                    placeholder="California" />
                  <DcInput label="Timezone" optional value={profileFormData.timezone}
                    onChange={e => setProfileFormData({ ...profileFormData, timezone: e.target.value })}
                    placeholder="America/Los_Angeles" />
                  <DcInput label="Zip Code" optional value={profileFormData.zipcode}
                    onChange={e => setProfileFormData({ ...profileFormData, zipcode: e.target.value })}
                    placeholder="90001" />
                </div>

                <div className="flex gap-2 pt-1">
                  <PrimaryBtn type="submit" disabled={isUpdatingProfile}>
                    <Check className="w-3.5 h-3.5" />
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </PrimaryBtn>
                  <GhostBtn type="button" onClick={() => { setShowProfileEdit(false); setProfileImageFile(null); setProfileImagePreview(null); }}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </GhostBtn>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-lg font-bold"
                  style={{ background: "var(--dc-bg-primary)", color: "var(--dc-text-muted)" }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0]?.toUpperCase() ?? "?"
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 flex-1">
                  {[
                    { label: "Name", value: user?.name },
                    { label: "Email", value: user?.email },
                    { label: "Phone", value: user?.phoneNumber },
                    { label: "Age", value: user?.age },
                    { label: "Country", value: user?.country },
                    { label: "State", value: user?.state },
                    { label: "Timezone", value: user?.timezone },
                    { label: "Zip Code", value: user?.zipcode },
                  ].filter(({ value }) => value).map(({ label, value }) => (
                    <div key={label} className="px-3 py-2.5 rounded-lg"
                      style={{ background: "var(--dc-bg-primary)" }}>
                      <p className="text-xs mb-0.5" style={{ color: "var(--dc-text-muted)" }}>{label}</p>
                      <p className="text-sm font-medium text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Password */}
        <SectionCard>
          <SectionHeader
            icon={Lock}
            title="Password"
            subtitle={user?.hasPassword ? "Change your account password" : "Set a password for your account"}
            action={!showPasswordEdit ? (
              <button
                onClick={() => { setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" }); setShowPasswordEdit(true); setPasswordError(""); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-muted)" }}
              >
                <Pencil className="w-3.5 h-3.5" />
                {user?.hasPassword ? "Change" : "Set Password"}
              </button>
            ) : undefined}
          />

          {showPasswordEdit && (
            <div className="p-4">
              {passwordError && <ErrorBanner message={passwordError} />}
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {user?.hasPassword && (
                  <DcInput label="Current Password" type="password" value={passwordFormData.currentPassword}
                    onChange={e => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                    placeholder="Enter current password" />
                )}
                <DcInput label="New Password" type="password" value={passwordFormData.newPassword}
                  onChange={e => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                  placeholder="Min 8 characters" />
                <DcInput label="Confirm Password" type="password" value={passwordFormData.confirmPassword}
                  onChange={e => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                  placeholder="Repeat new password" />
                <div className="flex gap-2 pt-1">
                  <PrimaryBtn type="submit" disabled={isUpdatingPassword}>
                    <Check className="w-3.5 h-3.5" />
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </PrimaryBtn>
                  <GhostBtn type="button" onClick={() => setShowPasswordEdit(false)}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </GhostBtn>
                </div>
              </form>
            </div>
          )}
        </SectionCard>

        {/* Billing */}
        <SectionCard>
          <SectionHeader icon={CreditCard} title="Plans & Billing" subtitle="Manage your subscription" />
          <div className="p-4">
            <Link
              href="/payment"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ background: "var(--dc-blurple)" }}
            >
              Manage Plans & Billing <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </SectionCard>

        {/* Danger zone */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: "var(--dc-bg-secondary)", borderColor: "rgba(242,63,66,0.25)" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "rgba(242,63,66,0.15)" }}>
            <Trash2 className="w-4 h-4 shrink-0" style={{ color: "var(--dc-red)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--dc-red)" }}>Danger Zone</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>Permanent and irreversible actions</p>
            </div>
          </div>
          <div className="p-4">
            {deletionError && deletionStep === "idle" && <ErrorBanner message={deletionError} />}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>
                  Permanently delete your account and all associated data
                </p>
              </div>
              <button
                onClick={handleRequestDeletion}
                disabled={isRequestingDeletion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-80 disabled:opacity-40 shrink-0 ml-4"
                style={{ background: "rgba(242,63,66,0.08)", borderColor: "rgba(242,63,66,0.3)", color: "var(--dc-red)" }}
              >
                {isRequestingDeletion
                  ? <><div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Sending...</>
                  : <><Trash2 className="w-3.5 h-3.5" /> Delete Account</>}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Child deletion confirmation modal */}
      {childToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setChildToDelete(null); }}
        >
          <div
            className="w-full max-w-md rounded-2xl border shadow-2xl"
            style={{ background: "var(--dc-bg-secondary)", borderColor: "rgba(242,63,66,0.3)" }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--dc-border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(242,63,66,0.15)" }}>
                <Trash2 className="w-4 h-4" style={{ color: "var(--dc-red)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Delete Child Profile</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>
                  This action cannot be undone
                </p>
              </div>
              <button
                onClick={() => setChildToDelete(null)}
                className="p-1.5 rounded-lg transition-colors shrink-0"
                style={{ color: "var(--dc-text-muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--dc-bg-modifier-hover)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--dc-text-muted)"; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border"
                style={{ background: "rgba(242,63,66,0.06)", borderColor: "rgba(242,63,66,0.15)" }}>
                <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-red)" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--dc-text-muted)" }}>
                  All data associated with this child profile, including progress and achievements, will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDeleteChild}
                  disabled={isDeletingChild}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ background: "var(--dc-red)" }}
                >
                  {isDeletingChild
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                    : <><Trash2 className="w-4 h-4" /> Delete</>}
                </button>
                <button
                  onClick={() => setChildToDelete(null)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--dc-text-normal)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--dc-text-muted)")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP modal */}
      {deletionStep === "otp" && (
        <OtpDeleteModal
          otp={deletionOtp}
          error={deletionError}
          isDeleting={isDeletingAccount}
          isRequesting={isRequestingDeletion}
          onDigitChange={handleOtpDigitChange}
          onPasteAll={handleOtpPasteAll}
          onDeleteAccount={handleDeleteAccount}
          onResend={handleRequestDeletion}
          onCancel={() => { setDeletionStep("idle"); setDeletionError(""); setDeletionOtp(["", "", "", "", "", ""]); }}
        />
      )}
    </div>
  );
}

// --- Account deletion OTP modal ---

function OtpDeleteModal({
  otp,
  error,
  isDeleting,
  isRequesting,
  onDigitChange,
  onPasteAll,
  onDeleteAccount,
  onResend,
  onCancel,
}: {
  otp: string[];
  error: string;
  isDeleting: boolean;
  isRequesting: boolean;
  onDigitChange: (index: number, value: string, el: HTMLInputElement | null) => void;
  onPasteAll: (digits: string[]) => void;
  onDeleteAccount: () => void;
  onResend: () => void;
  onCancel: () => void;
}) {
  const r0 = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null);
  const r5 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];

  const handleChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    onDigitChange(i, digit, i < 5 && digit ? refs[i + 1].current : null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      // Single setState call avoids the stale-closure race
      onPasteAll(pasted.split(""));
      refs[5].current?.focus();
      e.preventDefault();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ background: "var(--dc-bg-secondary)", borderColor: "rgba(242,63,66,0.3)" }}
      >
        {/* Modal header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--dc-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(242,63,66,0.15)" }}>
            <Trash2 className="w-4 h-4" style={{ color: "var(--dc-red)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Confirm Account Deletion</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--dc-text-muted)" }}>
              This action is permanent and cannot be undone
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg transition-colors shrink-0"
            style={{ color: "var(--dc-text-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--dc-bg-modifier-hover)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--dc-text-muted)"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg border"
            style={{ background: "rgba(242,63,66,0.06)", borderColor: "rgba(242,63,66,0.15)" }}>
            <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--dc-red)" }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--dc-text-muted)" }}>
              A 6-digit verification code was sent to your email. Enter it below to permanently delete your account.
            </p>
          </div>

          {/* Error */}
          {error && <ErrorBanner message={error} />}

          {/* OTP inputs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--dc-text-muted)" }}>
              Verification Code
            </p>
            <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  className="w-11 h-13 text-center text-xl font-bold rounded-lg outline-none transition-all"
                  style={{
                    height: "52px",
                    background: "var(--dc-bg-tertiary)",
                    border: `2px solid ${digit ? "rgba(242,63,66,0.5)" : "var(--dc-border)"}`,
                    color: "white",
                    caretColor: "var(--dc-red)",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(242,63,66,0.7)")}
                  onBlur={e => (e.currentTarget.style.borderColor = digit ? "rgba(242,63,66,0.5)" : "var(--dc-border)")}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onDeleteAccount}
              disabled={isDeleting || otp.join("").length < 6}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: "var(--dc-red)" }}
            >
              {isDeleting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                : <><Trash2 className="w-4 h-4" /> Delete My Account</>}
            </button>
            <button
              onClick={onResend}
              disabled={isRequesting}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40"
              style={{ background: "var(--dc-bg-modifier-hover)", color: "var(--dc-text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--dc-text-normal)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--dc-text-muted)")}
            >
              {isRequesting ? "Sending..." : "Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
