import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFetch } from "@/hooks/useFetch";
import { useSubmit } from "@/hooks/useSubmit";
import { LoadingSpinner } from "@/components/public/LoadingSpinner";
import { Shield, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";

type Option = { id: number; name: string };

const listFromResponse = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
};

const toOptionList = (raw: any): Option[] => {
  return listFromResponse(raw)
    .map((item: any) => ({
      id: Number(item?.id),
      name:
        item?.name ||
        item?.region_name ||
        item?.product_group_name ||
        item?.customer_group_name ||
        item?.label ||
        `ID ${item?.id}`,
    }))
    .filter((item: Option) => Number.isFinite(item.id));
};

const ManageSecurity: React.FC = () => {
  const [regionName, setRegionName] = useState("");
  const [regionParentId, setRegionParentId] = useState("");
  const [productGroupName, setProductGroupName] = useState("");
  const [customerGroupName, setCustomerGroupName] = useState("");

  const [mappingUserId, setMappingUserId] = useState("");
  const [mappingType, setMappingType] = useState<
    "region" | "product_group" | "customer_group"
  >("region");
  const [mappingDimensionId, setMappingDimensionId] = useState("");

  const [buddyUserId, setBuddyUserId] = useState("");
  const [buddyId, setBuddyId] = useState("");

  const { data: usersData, isPending: usersLoading } = useFetch({
    endpoint: "api/users",
    isAuth: true,
  });

  const {
    data: regionsData,
    isPending: regionsLoading,
    refetch: refetchRegions,
  } = useFetch({
    endpoint: "api/security/regions/flat",
    isAuth: true,
  });

  const {
    data: productGroupsData,
    isPending: productGroupsLoading,
    refetch: refetchProductGroups,
  } = useFetch({
    endpoint: "api/security/product-groups",
    isAuth: true,
  });

  const {
    data: customerGroupsData,
    isPending: customerGroupsLoading,
    refetch: refetchCustomerGroups,
  } = useFetch({
    endpoint: "api/security/customer-groups",
    isAuth: true,
  });

  const { isPending: creatingRegion, mutateAsync: createRegion } = useSubmit({
    method: "POST",
    endpoint: "api/security/regions",
    isAuth: true,
  });

  const { isPending: creatingProductGroup, mutateAsync: createProductGroup } =
    useSubmit({
      method: "POST",
      endpoint: "api/security/product-groups",
      isAuth: true,
    });

  const { isPending: creatingCustomerGroup, mutateAsync: createCustomerGroup } =
    useSubmit({
      method: "POST",
      endpoint: "api/security/customer-groups",
      isAuth: true,
    });

  const { isPending: creatingMapping, mutateAsync: createMapping } = useSubmit({
    method: "POST",
    endpoint: "api/security/mappings",
    isAuth: true,
  });

  const { isPending: creatingBuddy, mutateAsync: createBuddy } = useSubmit({
    method: "POST",
    endpoint: "api/security/buddies",
    isAuth: true,
  });

  const users = useMemo(() => {
    const list = listFromResponse(usersData);
    return list
      .map((item: any) => ({
        id: Number(item?.id),
        name:
          item?.display_name ||
          item?.profile?.full_name ||
          item?.username ||
          item?.email ||
          `User ${item?.id}`,
      }))
      .filter((item: Option) => Number.isFinite(item.id));
  }, [usersData]);

  const regions = useMemo(() => toOptionList(regionsData), [regionsData]);
  const productGroups = useMemo(
    () => toOptionList(productGroupsData),
    [productGroupsData],
  );
  const customerGroups = useMemo(
    () => toOptionList(customerGroupsData),
    [customerGroupsData],
  );

  const mappingDimensionOptions = useMemo(() => {
    if (mappingType === "region") return regions;
    if (mappingType === "product_group") return productGroups;
    return customerGroups;
  }, [mappingType, regions, productGroups, customerGroups]);

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRegion({
        name: regionName,
        ...(regionParentId ? { parent_id: Number(regionParentId) } : {}),
      });
      toast.success("Region created successfully.");
      setRegionName("");
      setRegionParentId("");
      await refetchRegions();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleCreateProductGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProductGroup({ name: productGroupName });
      toast.success("Product group created successfully.");
      setProductGroupName("");
      await refetchProductGroups();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleCreateCustomerGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomerGroup({ name: customerGroupName });
      toast.success("Customer group created successfully.");
      setCustomerGroupName("");
      await refetchCustomerGroups();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMapping({
        user_id: Number(mappingUserId),
        mapping_type: mappingType,
        dimension_id: Number(mappingDimensionId),
      });
      toast.success("Security mapping added successfully.");
      setMappingDimensionId("");
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleCreateBuddy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBuddy({
        user_id: Number(buddyUserId),
        buddy_user_id: Number(buddyId),
      });
      toast.success("Buddy assignment added successfully.");
      setBuddyId("");
    } catch {
      // useSubmit handles error toast.
    }
  };

  if (
    usersLoading ||
    regionsLoading ||
    productGroupsLoading ||
    customerGroupsLoading
  ) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Security Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage regions, dimensions, user mappings, and buddy access.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Create Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRegion} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="region_name">Region Name</Label>
                <Input
                  id="region_name"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_id">Parent Region (optional)</Label>
                <select
                  id="parent_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={regionParentId}
                  onChange={(e) => setRegionParentId(e.target.value)}
                >
                  <option value="">None</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={creatingRegion}>
                {creatingRegion ? "Saving..." : "Create Region"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Product Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProductGroup} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="product_group_name">Name</Label>
                <Input
                  id="product_group_name"
                  value={productGroupName}
                  onChange={(e) => setProductGroupName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={creatingProductGroup}>
                {creatingProductGroup ? "Saving..." : "Create Product Group"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Customer Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCustomerGroup} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="customer_group_name">Name</Label>
                <Input
                  id="customer_group_name"
                  value={customerGroupName}
                  onChange={(e) => setCustomerGroupName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={creatingCustomerGroup}>
                {creatingCustomerGroup ? "Saving..." : "Create Customer Group"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Security Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMapping} className="space-y-3">
              <div className="space-y-2">
                <Label>User</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={mappingUserId}
                  onChange={(e) => setMappingUserId(e.target.value)}
                  required
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Mapping Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={mappingType}
                  onChange={(e) =>
                    setMappingType(
                      e.target.value as
                        | "region"
                        | "product_group"
                        | "customer_group",
                    )
                  }
                >
                  <option value="region">Region</option>
                  <option value="product_group">Product Group</option>
                  <option value="customer_group">Customer Group</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Dimension</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={mappingDimensionId}
                  onChange={(e) => setMappingDimensionId(e.target.value)}
                  required
                >
                  <option value="">Select dimension</option>
                  {mappingDimensionOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" disabled={creatingMapping}>
                {creatingMapping ? "Saving..." : "Add Mapping"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Add User Buddy</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateBuddy}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div className="space-y-2">
                <Label>Primary User</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={buddyUserId}
                  onChange={(e) => setBuddyUserId(e.target.value)}
                  required
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Buddy User</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={buddyId}
                  onChange={(e) => setBuddyId(e.target.value)}
                  required
                >
                  <option value="">Select buddy</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={creatingBuddy}
                  className="w-full md:w-auto"
                >
                  {creatingBuddy ? "Saving..." : "Add Buddy"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {regions.map((region) => (
                <li key={region.id}>{region.name}</li>
              ))}
              {regions.length === 0 && (
                <li className="text-muted-foreground">No regions.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {productGroups.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
              {productGroups.length === 0 && (
                <li className="text-muted-foreground">No product groups.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {customerGroups.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
              {customerGroups.length === 0 && (
                <li className="text-muted-foreground">No customer groups.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageSecurity;
