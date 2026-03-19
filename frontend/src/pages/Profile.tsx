import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  MapPin,
  Shield,
  Settings,
  Mail,
  Hash,
  Globe,
  Flag,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { useSubmit } from "@/hooks/useSubmit";
import { useFetch } from "@/hooks/useFetch";
import { setUser } from "@/store/slices/authSlice";
import { toast } from "react-toastify";
import { hasPermission } from "@/utils/permissions";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state: any) => state.auth);
  const [mfaCode, setMfaCode] = React.useState("");
  const [mfaDisablePassword, setMfaDisablePassword] = React.useState("");
  const [mfaSetupData, setMfaSetupData] = React.useState<any>(null);
  const profile = userdata?.profile || {};
  const visibility = userdata?.visibility_flags || {};
  const roleLabel =
    userdata?.roles
      ?.map((role: any) => role.role_name || role.name)
      .filter(Boolean)
      .join(", ") ||
    userdata?.role ||
    userdata?.user_type ||
    "User";
  const displayName =
    userdata?.display_name || profile.full_name || userdata?.username || "User";
  const isActive = userdata?.is_active !== false;
  const isMfaEnabled = Boolean(userdata?.is_mfa_enabled);

  const { refetch: refetchCurrentUser } = useFetch({
    endpoint: "api/auth/me",
    isAuth: true,
  });

  const { isPending: isSettingUpMfa, mutateAsync: setupMfa } = useSubmit({
    method: "POST",
    endpoint: "api/auth/mfa/setup",
    isAuth: true,
  });

  const { isPending: isConfirmingMfa, mutateAsync: confirmMfa } = useSubmit({
    method: "POST",
    endpoint: "api/auth/mfa/confirm",
    isAuth: true,
  });

  const { isPending: isDisablingMfa, mutateAsync: disableMfa } = useSubmit({
    method: "POST",
    endpoint: "api/auth/mfa/disable",
    isAuth: true,
  });

  const refreshProfile = async () => {
    const me = await refetchCurrentUser();
    const payload = me.data?.data || me.data?.user || me.data;
    if (payload) {
      dispatch(setUser({ userdata: payload }));
    }
  };

  const handleSetupMfa = async () => {
    try {
      const data = await setupMfa({});
      setMfaSetupData(data?.data || data);
      toast.success(data?.message || "MFA setup initiated.");
    } catch {
      // useSubmit already shows API errors.
    }
  };

  const handleConfirmMfa = async () => {
    if (mfaCode.length !== 6) {
      toast.error("Enter MFA code to confirm setup.");
      return;
    }
    try {
      const data = await confirmMfa({ code: Number(mfaCode) });
      toast.success(data?.message || "MFA enabled successfully.");
      setMfaCode("");
      setMfaSetupData(null);
      await refreshProfile();
    } catch {
      // useSubmit already shows API errors.
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaDisablePassword.trim()) {
      toast.error("Enter your current password to disable MFA.");
      return;
    }
    try {
      const data = await disableMfa({ password: mfaDisablePassword });
      toast.success(data?.message || "MFA disabled successfully.");
      setMfaCode("");
      setMfaDisablePassword("");
      await refreshProfile();
    } catch {
      // useSubmit already shows API errors.
    }
  };

  const renderBooleanBadge = (
    value: boolean,
    trueText = "Yes",
    falseText = "No",
  ) => {
    return (
      <Badge
        variant={value ? "default" : "secondary"}
        className={!value ? "text-muted-foreground" : ""}
      >
        {value ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card border rounded-lg p-3 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {displayName?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-medium text-lg leading-none">{displayName}</p>
            <p className="text-sm text-muted-foreground">{userdata.email}</p>
          </div>
          <Badge className="ml-2 uppercase">{roleLabel}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>Basic identification details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-center">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" /> ID:
              </span>
              <span className="text-sm">{userdata.id}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Full Name:
              </span>
              <span className="text-sm font-medium">{displayName}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email:
              </span>
              <span className="text-sm break-all">{userdata.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Location</CardTitle>
            </div>
            <CardDescription>Geographic location information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-center">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" /> Region:
              </span>
              <span className="text-sm">{profile.region || "-"}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Flag className="h-3 w-3" /> Country:
              </span>
              <span className="text-sm">{profile.country || "-"}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Navigation className="h-3 w-3" /> State:
              </span>
              <span className="text-sm">{profile.state || "-"}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> City:
              </span>
              <span className="text-sm">{profile.city || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Permissions & Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Permissions & Status</CardTitle>
            </div>
            <CardDescription>
              User capabilities and account status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 items-center">
              <span className="text-sm font-medium">Export Data</span>
              {renderBooleanBadge(
                hasPermission(userdata, "reports.export"),
                "Allowed",
                "Denied",
              )}

              <span className="text-sm font-medium">Copy Content</span>
              {renderBooleanBadge(true, "Allowed", "Denied")}

              <span className="text-sm font-medium">Cost Visible</span>
              {renderBooleanBadge(!!visibility.see_cost, "Visible", "Hidden")}
              <span className="text-sm font-medium">GP Visible</span>
              {renderBooleanBadge(!!visibility.see_gp, "Visible", "Hidden")}
              <span className="text-sm font-medium">Margin Visible</span>
              {renderBooleanBadge(!!visibility.see_margin, "Visible", "Hidden")}
              <span className="text-sm font-medium">Account Status</span>
              <Badge variant={isActive ? "default" : "destructive"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings / Actions Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Account Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Profile editing functions would be located here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>MFA Security</CardTitle>
          </div>
          <CardDescription>
            Configure multi-factor authentication for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Current status:</span>
            <Badge variant={isMfaEnabled ? "default" : "secondary"}>
              {isMfaEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!isMfaEnabled ? (
              <>
                <Input
                  value={mfaCode}
                  onChange={(e) =>
                    setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit MFA code"
                  maxLength={6}
                  inputMode="numeric"
                  className="max-w-xs"
                />
                <Button onClick={handleSetupMfa} disabled={isSettingUpMfa}>
                  {isSettingUpMfa ? "Preparing MFA..." : "Setup MFA"}
                </Button>
              </>
            ) : (
              <>
                <Input
                  value={mfaDisablePassword}
                  onChange={(e) => setMfaDisablePassword(e.target.value)}
                  placeholder="Enter current password"
                  type="password"
                  className="max-w-xs"
                />
                <Button
                  variant="destructive"
                  onClick={handleDisableMfa}
                  disabled={isDisablingMfa}
                >
                  {isDisablingMfa ? "Disabling..." : "Disable MFA"}
                </Button>
              </>
            )}
          </div>

          {mfaSetupData && !isMfaEnabled && (
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <p className="text-sm font-medium">MFA setup challenge ready.</p>
              {mfaSetupData?.qr_svg && (
                <div
                  className="max-w-64"
                  dangerouslySetInnerHTML={{ __html: mfaSetupData.qr_svg }}
                />
              )}
              {mfaSetupData?.otpauth_url && (
                <p className="text-xs text-muted-foreground break-all">
                  {mfaSetupData.otpauth_url}
                </p>
              )}
              {mfaSetupData?.secret && (
                <p className="text-xs text-muted-foreground">
                  Secret: {mfaSetupData.secret}
                </p>
              )}
              <Button onClick={handleConfirmMfa} disabled={isConfirmingMfa}>
                {isConfirmingMfa ? "Confirming..." : "Confirm MFA"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
