import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PlusCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/public/LoadingSpinner";
import { useFetch } from "@/hooks/useFetch";
import { useSubmit } from "@/hooks/useSubmit";
import { hasPermission } from "@/utils/permissions";

type Option = { id: number; name: string };
type MappingType = "region" | "product_group" | "customer_group";
type MappingMode = "single" | "bulk";

type NormalizedMappings = {
  region_ids: number[];
  product_group_ids: number[];
  customer_group_ids: number[];
};

const sanitizeName = (value: string): string => value.trim().replace(/\s+/g, " ");

const listFromResponse = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.users)) return raw.users;
  if (Array.isArray(raw?.data?.users)) return raw.data.users;
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
        item?.display_name ||
        item?.username ||
        item?.email ||
        item?.label ||
        `ID ${item?.id}`,
    }))
    .filter((item: Option) => Number.isFinite(item.id));
};

const normalizeSecurityMappings = (raw: any): NormalizedMappings => {
  const payload = raw?.data || raw || {};

  if (payload?.regions || payload?.product_groups || payload?.customer_groups) {
    return {
      region_ids: (payload.regions || []).map((r: any) => Number(r?.id || r)),
      product_group_ids: (payload.product_groups || []).map((p: any) =>
        Number(p?.id || p),
      ),
      customer_group_ids: (payload.customer_groups || []).map((c: any) =>
        Number(c?.id || c),
      ),
    };
  }

  const mappings = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.mappings)
      ? payload.mappings
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  const out: NormalizedMappings = {
    region_ids: [],
    product_group_ids: [],
    customer_group_ids: [],
  };

  mappings.forEach((mapping: any) => {
    const type = String(
      mapping?.mapping_type || mapping?.dimension_type || "",
    ).toLowerCase();
    const id = Number(
      mapping?.dimension_id ||
        mapping?.region_id ||
        mapping?.product_group_id ||
        mapping?.customer_group_id ||
        mapping?.id,
    );

    if (!Number.isFinite(id)) return;

    if (type.includes("region") || mapping?.region_id) {
      out.region_ids.push(id);
      return;
    }

    if (type.includes("product") || mapping?.product_group_id) {
      out.product_group_ids.push(id);
      return;
    }

    if (type.includes("customer") || mapping?.customer_group_id) {
      out.customer_group_ids.push(id);
    }
  });

  return {
    region_ids: Array.from(new Set(out.region_ids)),
    product_group_ids: Array.from(new Set(out.product_group_ids)),
    customer_group_ids: Array.from(new Set(out.customer_group_ids)),
  };
};

const getMappingTypeLabel = (value: MappingType): string => {
  if (value === "product_group") return "Product Group";
  if (value === "customer_group") return "Customer Group";
  return "Region";
};

const getMappingIdKey = (mappingType: MappingType): string => {
  if (mappingType === "product_group") return "product_group_id";
  if (mappingType === "customer_group") return "customer_group_id";
  return "region_id";
};

const ManageSecurity: React.FC = () => {
  const { userdata } = useSelector((state: any) => state.auth);
  const canManageSecurity = hasPermission(userdata, "security.manage");

  const [regionName, setRegionName] = useState("");
  const [regionParentId, setRegionParentId] = useState("");
  const [productGroupName, setProductGroupName] = useState("");
  const [customerGroupName, setCustomerGroupName] = useState("");

  const [mappingMode, setMappingMode] = useState<MappingMode>("single");
  const [mappingUserId, setMappingUserId] = useState("");
  const [mappingType, setMappingType] = useState<MappingType>("region");
  const [mappingDimensionId, setMappingDimensionId] = useState("");
  const [bulkDimensionIds, setBulkDimensionIds] = useState<string[]>([]);

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

  const {
    data: userMappingsData,
    isPending: userMappingsLoading,
    refetch: refetchUserMappings,
  } = useFetch({
    endpoint: mappingUserId ? `api/security/mappings?user_id=${mappingUserId}` : undefined,
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

  const { isPending: replacingMappings, mutateAsync: replaceMappings } = useSubmit(
    {
      method: "POST",
      endpoint: "api/security/mappings/bulk",
      isAuth: true,
    },
  );

  const { isPending: creatingBuddy, mutateAsync: createBuddy } = useSubmit({
    method: "POST",
    endpoint: "api/security/buddies",
    isAuth: true,
  });

  const users = useMemo(() => toOptionList(usersData), [usersData]);
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

  const currentMappings = useMemo(
    () => normalizeSecurityMappings(userMappingsData),
    [userMappingsData],
  );

  const selectedUserName = useMemo(() => {
    return users.find((user) => String(user.id) === mappingUserId)?.name || "";
  }, [users, mappingUserId]);

  const currentMappingIds = useMemo(() => {
    if (mappingType === "region") return currentMappings.region_ids;
    if (mappingType === "product_group") return currentMappings.product_group_ids;
    return currentMappings.customer_group_ids;
  }, [currentMappings, mappingType]);

  const currentMappingNames = useMemo(() => {
    const optionMap = new Map<number, string>(
      mappingDimensionOptions.map((item) => [item.id, item.name]),
    );
    return currentMappingIds.map((id) => optionMap.get(id) || `ID ${id}`);
  }, [mappingDimensionOptions, currentMappingIds]);

  useEffect(() => {
    setMappingDimensionId("");
  }, [mappingType]);

  useEffect(() => {
    if (!mappingUserId || mappingMode !== "bulk") {
      setBulkDimensionIds([]);
      return;
    }

    setBulkDimensionIds(currentMappingIds.map((id) => String(id)));
  }, [mappingUserId, mappingMode, currentMappingIds]);

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = sanitizeName(regionName);
    if (!name) {
      toast.error("Region name is required.");
      return;
    }

    try {
      await createRegion({
        name,
        region_name: name,
        ...(regionParentId
          ? {
              parent_id: Number(regionParentId),
              parent_region_id: Number(regionParentId),
            }
          : {}),
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
    const name = sanitizeName(productGroupName);
    if (!name) {
      toast.error("Product group name is required.");
      return;
    }

    try {
      await createProductGroup({ name, product_group_name: name });
      toast.success("Product group created successfully.");
      setProductGroupName("");
      await refetchProductGroups();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleCreateCustomerGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = sanitizeName(customerGroupName);
    if (!name) {
      toast.error("Customer group name is required.");
      return;
    }

    try {
      await createCustomerGroup({ name, customer_group_name: name });
      toast.success("Customer group created successfully.");
      setCustomerGroupName("");
      await refetchCustomerGroups();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleCreateOrReplaceMapping = async (e: React.FormEvent) => {
    e.preventDefault();

    const userIdNum = Number(mappingUserId);
    if (!Number.isFinite(userIdNum)) {
      toast.error("Please select a user.");
      return;
    }

    try {
      if (mappingMode === "single") {
        const dimensionIdNum = Number(mappingDimensionId);
        if (!Number.isFinite(dimensionIdNum)) {
          toast.error(`Please select a ${getMappingTypeLabel(mappingType)}.`);
          return;
        }

        const typeIdKey = getMappingIdKey(mappingType);
        await createMapping({
          user_id: userIdNum,
          mapping_type: mappingType,
          dimension_type: mappingType,
          dimension_id: dimensionIdNum,
          [typeIdKey]: dimensionIdNum,
        });

        toast.success("Security mapping added successfully.");
        setMappingDimensionId("");
      } else {
        const selectedIds = bulkDimensionIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id));

        await replaceMappings({
          user_id: userIdNum,
          region_ids:
            mappingType === "region" ? selectedIds : currentMappings.region_ids,
          product_group_ids:
            mappingType === "product_group"
              ? selectedIds
              : currentMappings.product_group_ids,
          customer_group_ids:
            mappingType === "customer_group"
              ? selectedIds
              : currentMappings.customer_group_ids,
        });

        toast.success(`${getMappingTypeLabel(mappingType)} mappings replaced successfully.`);
      }

      await refetchUserMappings();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleCreateBuddy = async (e: React.FormEvent) => {
    e.preventDefault();

    const userIdNum = Number(buddyUserId);
    const buddyIdNum = Number(buddyId);

    if (!Number.isFinite(userIdNum) || !Number.isFinite(buddyIdNum)) {
      toast.error("Please select both users.");
      return;
    }

    if (userIdNum === buddyIdNum) {
      toast.error("Primary user and buddy user cannot be the same.");
      return;
    }

    try {
      await createBuddy({
        user_id: userIdNum,
        buddy_user_id: buddyIdNum,
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

  if (!canManageSecurity) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You do not have permission to manage security settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMappingActionPending = creatingMapping || replacingMappings;
  const isSingleMappingValid = mappingUserId && mappingDimensionId;
  const isBulkMappingValid = mappingUserId;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Security Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage regions, groups, user access mappings, and buddy access with validated API workflows.
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
              <Button type="submit" disabled={creatingRegion || !sanitizeName(regionName)}>
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
              <Button
                type="submit"
                disabled={creatingProductGroup || !sanitizeName(productGroupName)}
              >
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
              <Button
                type="submit"
                disabled={creatingCustomerGroup || !sanitizeName(customerGroupName)}
              >
                {creatingCustomerGroup ? "Saving..." : "Create Customer Group"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add or Replace Security Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrReplaceMapping} className="space-y-3">
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
                  onChange={(e) => setMappingType(e.target.value as MappingType)}
                >
                  <option value="region">Region</option>
                  <option value="product_group">Product Group</option>
                  <option value="customer_group">Customer Group</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Operation</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={mappingMode}
                  onChange={(e) => setMappingMode(e.target.value as MappingMode)}
                >
                  <option value="single">Add Single Mapping</option>
                  <option value="bulk">Replace All Mappings (Bulk)</option>
                </select>
              </div>

              {mappingMode === "single" ? (
                <div className="space-y-2">
                  <Label>{getMappingTypeLabel(mappingType)}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={mappingDimensionId}
                    onChange={(e) => setMappingDimensionId(e.target.value)}
                    required
                  >
                    <option value="">Select {getMappingTypeLabel(mappingType).toLowerCase()}</option>
                    {mappingDimensionOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>{getMappingTypeLabel(mappingType)} List</Label>
                  <select
                    className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bulkDimensionIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(
                        (option) => option.value,
                      );
                      setBulkDimensionIds(selected);
                    }}
                    multiple
                  >
                    {mappingDimensionOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Hold Command on macOS or Ctrl on Windows to select multiple values.
                  </p>
                </div>
              )}

              {mappingUserId && (
                <div className="rounded-md border bg-muted/20 p-3 space-y-1">
                  <p className="text-sm font-medium">
                    Current {getMappingTypeLabel(mappingType)} mappings for {selectedUserName || "selected user"}
                  </p>
                  {userMappingsLoading ? (
                    <p className="text-xs text-muted-foreground">Loading mappings...</p>
                  ) : currentMappingNames.length > 0 ? (
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {currentMappingNames.map((name, idx) => (
                        <li key={`${name}-${idx}`}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No mappings found.</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  isMappingActionPending ||
                  (mappingMode === "single" ? !isSingleMappingValid : !isBulkMappingValid)
                }
              >
                {isMappingActionPending
                  ? "Saving..."
                  : mappingMode === "single"
                    ? "Add Mapping"
                    : "Replace Mappings"}
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
                  disabled={
                    creatingBuddy ||
                    !buddyUserId ||
                    !buddyId ||
                    Number(buddyUserId) === Number(buddyId)
                  }
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
            <CardTitle>Regions ({regions.length})</CardTitle>
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
            <CardTitle>Product Groups ({productGroups.length})</CardTitle>
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
            <CardTitle>Customer Groups ({customerGroups.length})</CardTitle>
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
