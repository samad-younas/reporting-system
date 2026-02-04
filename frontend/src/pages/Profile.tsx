import React from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const Profile: React.FC = () => {
  const { userdata } = useSelector((state: any) => state.auth);

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
            {userdata.profile.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-medium text-lg leading-none">
              {userdata.profile.full_name}
            </p>
            <p className="text-sm text-muted-foreground">{userdata.email}</p>
          </div>
          <Badge className="ml-2 uppercase">{userdata.user_type}</Badge>
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
              <span className="text-sm font-medium">
                {userdata.profile.full_name}
              </span>

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
              <span className="text-sm">{userdata.profile.region}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Flag className="h-3 w-3" /> Country:
              </span>
              <span className="text-sm">{userdata.profile.country}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Navigation className="h-3 w-3" /> State:
              </span>
              <span className="text-sm">{userdata.profile.state}</span>

              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> City:
              </span>
              <span className="text-sm">{userdata.profile.city}</span>
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
              {renderBooleanBadge(userdata.can_export, "Allowed", "Denied")}

              <span className="text-sm font-medium">Copy Content</span>
              {renderBooleanBadge(userdata.can_copy, "Allowed", "Denied")}

              <span className="text-sm font-medium">Cost Visible</span>
              {renderBooleanBadge(
                userdata.is_cost_visible,
                "Visible",
                "Hidden",
              )}
              <span className="text-sm font-medium">Account Status</span>
              <Badge variant={userdata.is_inactive ? "destructive" : "default"}>
                {userdata.is_inactive ? "Inactive" : "Active"}
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
    </div>
  );
};

export default Profile;
