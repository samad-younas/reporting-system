<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerGroup;
use App\Models\ProductGroup;
use App\Models\Region;
use App\Models\SecurityMapping;
use App\Models\UserBuddy;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    // ══════════════════════════════════════════════════════════════════════════
    // REGIONS
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/security/regions
    // Returns hierarchical region tree.
    public function regions(Request $request)
    {
        $regions = Region::with('children')
            ->whereNull('parent_region_id') // Top-level only — children nested
            ->where('is_active', true)
            ->get()
            ->map(fn($r) => $this->formatRegion($r));

        return response()->json(['status' => true, 'data' => $regions]);
    }

    // GET /api/security/regions/flat
    // Flat list for dropdowns.
    public function regionsFlat()
    {
        $regions = Region::where('is_active', true)
            ->orderBy('region_name')
            ->get(['id', 'region_name', 'region_type', 'parent_region_id']);

        return response()->json(['status' => true, 'data' => $regions]);
    }

    // POST /api/security/regions
    // Payload: { "region_name": "Victoria", "parent_region_id": 1, "region_type": "state" }
    public function storeRegion(Request $request)
    {
        $request->validate([
            'region_name'      => 'required|string',
            'parent_region_id' => 'nullable|exists:regions,id',
            'region_type'      => 'required|in:country,region,state,area,branch',
        ]);

        $region = Region::create($request->only('region_name', 'parent_region_id', 'region_type'));

        return response()->json(['status' => true, 'message' => 'Region created', 'data' => $region], 201);
    }

    // PUT /api/security/regions/{id}
    public function updateRegion(Request $request, $id)
    {
        $region = Region::findOrFail($id);
        $request->validate([
            'region_name' => 'sometimes|string',
            'region_type' => 'sometimes|in:country,region,state,area,branch',
            'is_active'   => 'sometimes|boolean',
        ]);
        $region->update($request->only('region_name', 'region_type', 'is_active'));

        return response()->json(['status' => true, 'message' => 'Region updated', 'data' => $region]);
    }

    // DELETE /api/security/regions/{id}
    public function destroyRegion($id)
    {
        $region = Region::findOrFail($id);
        if ($region->children()->exists()) {
            return response()->json(['status' => false, 'message' => 'Cannot delete a region that has child regions.'], 409);
        }
        $region->delete();
        return response()->json(['status' => true, 'message' => 'Region deleted']);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PRODUCT GROUPS
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/security/product-groups
    public function productGroups()
    {
        return response()->json([
            'status' => true,
            'data'   => ProductGroup::where('is_active', true)->orderBy('product_group_name')->get(),
        ]);
    }

    // POST /api/security/product-groups
    // Payload: { "product_group_name": "Heavy Equipment" }
    public function storeProductGroup(Request $request)
    {
        $request->validate(['product_group_name' => 'required|string|unique:product_groups,product_group_name']);
        $pg = ProductGroup::create($request->only('product_group_name'));
        return response()->json(['status' => true, 'message' => 'Product group created', 'data' => $pg], 201);
    }

    // PUT /api/security/product-groups/{id}
    public function updateProductGroup(Request $request, $id)
    {
        $pg = ProductGroup::findOrFail($id);
        $request->validate([
            'product_group_name' => 'sometimes|string|unique:product_groups,product_group_name,' . $id,
            'is_active'          => 'sometimes|boolean',
        ]);
        $pg->update($request->only('product_group_name', 'is_active'));
        return response()->json(['status' => true, 'message' => 'Product group updated', 'data' => $pg]);
    }

    // DELETE /api/security/product-groups/{id}
    public function destroyProductGroup($id)
    {
        ProductGroup::findOrFail($id)->delete();
        return response()->json(['status' => true, 'message' => 'Product group deleted']);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CUSTOMER GROUPS
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/security/customer-groups
    public function customerGroups()
    {
        return response()->json([
            'status' => true,
            'data'   => CustomerGroup::where('is_active', true)->orderBy('customer_group_name')->get(),
        ]);
    }

    // POST /api/security/customer-groups
    // Payload: { "customer_group_name": "VIP Clients" }
    public function storeCustomerGroup(Request $request)
    {
        $request->validate(['customer_group_name' => 'required|string|unique:customer_groups,customer_group_name']);
        $cg = CustomerGroup::create($request->only('customer_group_name'));
        return response()->json(['status' => true, 'message' => 'Customer group created', 'data' => $cg], 201);
    }

    // PUT /api/security/customer-groups/{id}
    public function updateCustomerGroup(Request $request, $id)
    {
        $cg = CustomerGroup::findOrFail($id);
        $request->validate([
            'customer_group_name' => 'sometimes|string|unique:customer_groups,customer_group_name,' . $id,
            'is_active'           => 'sometimes|boolean',
        ]);
        $cg->update($request->only('customer_group_name', 'is_active'));
        return response()->json(['status' => true, 'message' => 'Customer group updated', 'data' => $cg]);
    }

    // DELETE /api/security/customer-groups/{id}
    public function destroyCustomerGroup($id)
    {
        CustomerGroup::findOrFail($id)->delete();
        return response()->json(['status' => true, 'message' => 'Customer group deleted']);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // USER SECURITY MAPPINGS
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/security/mappings?user_id=5
    public function mappings(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $mappings = SecurityMapping::with(['region', 'productGroup', 'customerGroup'])
            ->where('user_id', $request->user_id)
            ->get()
            ->map(fn($m) => [
                'id'             => $m->id,
                'region'         => $m->region ? ['id' => $m->region_id, 'name' => $m->region->region_name] : null,
                'product_group'  => $m->productGroup ? ['id' => $m->product_group_id, 'name' => $m->productGroup->product_group_name] : null,
                'customer_group' => $m->customerGroup ? ['id' => $m->customer_group_id, 'name' => $m->customerGroup->customer_group_name] : null,
                'is_allow'       => $m->is_allow,
            ]);

        return response()->json(['status' => true, 'data' => $mappings]);
    }

    // POST /api/security/mappings
    // Add a single security mapping row.
    // Payload:
    // {
    //   "user_id": 5,
    //   "region_id": 2,
    //   "product_group_id": null,
    //   "customer_group_id": null,
    //   "is_allow": true
    // }
    public function storeMapping(Request $request)
    {
        $request->validate([
            'user_id'           => 'required|exists:users,id',
            'region_id'         => 'nullable|exists:regions,id',
            'product_group_id'  => 'nullable|exists:product_groups,id',
            'customer_group_id' => 'nullable|exists:customer_groups,id',
            'is_allow'          => 'boolean',
        ]);

        $mapping = SecurityMapping::create($request->only(
            'user_id', 'region_id', 'product_group_id', 'customer_group_id', 'is_allow'
        ));

        return response()->json(['status' => true, 'message' => 'Mapping created', 'data' => $mapping], 201);
    }

    // DELETE /api/security/mappings/{id}
    public function destroyMapping($id)
    {
        SecurityMapping::findOrFail($id)->delete();
        return response()->json(['status' => true, 'message' => 'Mapping removed']);
    }

    // POST /api/security/mappings/bulk
    // Replace ALL mappings for a user.
    // Payload:
    // {
    //   "user_id": 5,
    //   "mappings": [
    //     { "region_id": 1, "product_group_id": null, "customer_group_id": null, "is_allow": true },
    //     { "region_id": null, "product_group_id": 3, "customer_group_id": null, "is_allow": true }
    //   ]
    // }
    public function bulkReplaceMappings(Request $request)
    {
        $request->validate([
            'user_id'                            => 'required|exists:users,id',
            'mappings'                           => 'required|array',
            'mappings.*.region_id'               => 'nullable|exists:regions,id',
            'mappings.*.product_group_id'        => 'nullable|exists:product_groups,id',
            'mappings.*.customer_group_id'       => 'nullable|exists:customer_groups,id',
            'mappings.*.is_allow'                => 'boolean',
        ]);

        SecurityMapping::where('user_id', $request->user_id)->delete();

        $rows = array_map(fn($m) => [
            'user_id'           => $request->user_id,
            'region_id'         => $m['region_id'] ?? null,
            'product_group_id'  => $m['product_group_id'] ?? null,
            'customer_group_id' => $m['customer_group_id'] ?? null,
            'is_allow'          => $m['is_allow'] ?? true,
            'created_at'        => now(),
            'updated_at'        => now(),
        ], $request->mappings);

        SecurityMapping::insert($rows);

        return response()->json(['status' => true, 'message' => 'Security mappings updated', 'count' => count($rows)]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // USER BUDDIES
    // ══════════════════════════════════════════════════════════════════════════

    // GET /api/security/buddies?user_id=5
    public function buddies(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);
        $buddies = UserBuddy::with('buddy:id,username,display_name,email')
            ->where('user_id', $request->user_id)
            ->get();
        return response()->json(['status' => true, 'data' => $buddies]);
    }

    // POST /api/security/buddies
    // Payload: { "user_id": 5, "buddy_user_id": 8 }
    public function storeBuddy(Request $request)
    {
        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'buddy_user_id' => 'required|exists:users,id|different:user_id',
        ]);

        $buddy = UserBuddy::firstOrCreate(
            ['user_id' => $request->user_id, 'buddy_user_id' => $request->buddy_user_id],
            ['is_active' => true]
        );

        return response()->json(['status' => true, 'message' => 'Buddy added', 'data' => $buddy], 201);
    }

    // DELETE /api/security/buddies/{id}
    public function destroyBuddy($id)
    {
        UserBuddy::findOrFail($id)->delete();
        return response()->json(['status' => true, 'message' => 'Buddy removed']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────

    private function formatRegion(Region $region): array
    {
        return [
            'id'          => $region->id,
            'name'        => $region->region_name,
            'type'        => $region->region_type,
            'children'    => $region->children->map(fn($c) => $this->formatRegion($c))->values(),
        ];
    }
}
