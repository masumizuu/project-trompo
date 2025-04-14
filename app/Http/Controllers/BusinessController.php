<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Sellable;
use App\Models\SavedBusiness;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BusinessController extends Controller
{
    /**
     * Display a listing of all businesses.
     */
    public function index(Request $request)
    {
        $businesses = Business::with(['owner', 'categoryRef', 'location'])
            ->when($request->has('verified'), function ($query) use ($request) {
                return $query->where('is_verified', $request->verified === 'true');
            })
            ->orderBy('business_name')
            ->paginate(12);

        $categories = Category::all();
        $locations = Location::all();

        return Inertia::render('Listings/Stores', [
            'businesses' => $businesses,
            'categories' => $categories,
            'locations' => $locations,
        ]);
    }

    /**
     * Display the specified business.
     */
    public function show($id)
    {
        $business = Business::with([
            'owner.user', 
            'categoryRef', 
            'location', 
            'sellables',
            'reviews.customer.user'
        ])->findOrFail($id);

        // Check if the business is saved by the current user
        $isSaved = false;
        if (Auth::check()) {
            $isSaved = SavedBusiness::where('user_id', Auth::id())
                ->where('business_id', $id)
                ->exists();
        }

        return Inertia::render('Listings/BusinessDetail', [
            'business' => $business,
            'isSaved' => $isSaved
        ]);
    }

    /**
     * Get all sellables.
     */
    public function getAllSellables(Request $request)
    {
        $sellables = Sellable::with(['business'])
            ->when($request->has('min_price'), function ($query) use ($request) {
                return $query->where('price', '>=', $request->min_price);
            })
            ->when($request->has('max_price'), function ($query) use ($request) {
                return $query->where('price', '<=', $request->max_price);
            })
            ->when($request->has('type'), function ($query) use ($request) {
                return $query->where('sellable_type', $request->type);
            })
            ->paginate(20);

        return response()->json($sellables);
    }

    /**
     * Get a specific sellable.
     */
    public function getSellable($id)
    {
        $sellable = Sellable::with(['business'])->findOrFail($id);
        return response()->json($sellable);
    }

    /**
     * Search businesses and sellables.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');

        // Search businesses
        $businesses = Business::where('business_name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->with(['owner', 'categoryRef', 'location'])
            ->get();

        // Search sellables
        $sellables = Sellable::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->with(['business'])
            ->get();

        return response()->json([
            'businesses' => $businesses,
            'sellables' => $sellables
        ]);
    }

    /**
     * Filter businesses by various criteria.
     */
    public function filterBusinesses(Request $request)
    {
        $businesses = Business::with(['owner', 'categoryRef', 'location'])
            ->when($request->has('category'), function ($query) use ($request) {
                return $query->where('category', $request->category);
            })
            ->when($request->has('location_id'), function ($query) use ($request) {
                return $query->where('location_id', $request->location_id);
            })
            ->when($request->has('min_price') || $request->has('max_price'), function ($query) use ($request) {
                return $query->whereHas('sellables', function ($q) use ($request) {
                    if ($request->has('min_price')) {
                        $q->where('price', '>=', $request->min_price);
                    }
                    if ($request->has('max_price')) {
                        $q->where('price', '<=', $request->max_price);
                    }
                });
            })
            ->when($request->has('verified'), function ($query) use ($request) {
                return $query->where('is_verified', $request->verified === 'true');
            })
            ->paginate(12);

        return response()->json($businesses);
    }

    /**
     * Filter sellables by various criteria.
     */
    public function filterSellables(Request $request)
    {
        $sellables = Sellable::with(['business'])
            ->when($request->has('min_price'), function ($query) use ($request) {
                return $query->where('price', '>=', $request->min_price);
            })
            ->when($request->has('max_price'), function ($query) use ($request) {
                return $query->where('price', '<=', $request->max_price);
            })
            ->when($request->has('type'), function ($query) use ($request) {
                return $query->where('sellable_type', $request->type);
            })
            ->when($request->has('business_id'), function ($query) use ($request) {
                return $query->where('business_id', $request->business_id);
            })
            ->paginate(20);

        return response()->json($sellables);
    }

    /**
     * Add a business to saved businesses.
     */
    public function saveBusiness(Request $request, $businessId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $userId = Auth::id();
        
        // Check if already saved
        $existingSave = SavedBusiness::where('user_id', $userId)
            ->where('business_id', $businessId)
            ->first();
            
        if ($existingSave) {
            return response()->json(['message' => 'Business already saved'], 200);
        }
        
        // Save the business
        SavedBusiness::create([
            'user_id' => $userId,
            'business_id' => $businessId,
            'saved_at' => now(),
        ]);
        
        return response()->json(['message' => 'Business saved successfully'], 200);
    }

    /**
     * Remove a business from saved businesses.
     */
    public function unsaveBusiness(Request $request, $businessId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $userId = Auth::id();
        
        // Delete the saved business record
        $deleted = SavedBusiness::where('user_id', $userId)
            ->where('business_id', $businessId)
            ->delete();
            
        if ($deleted) {
            return response()->json(['message' => 'Business removed from saved'], 200);
        } else {
            return response()->json(['message' => 'Business was not saved'], 404);
        }
    }

    /**
     * Get saved businesses for the authenticated user.
     */
    public function getSavedBusinesses()
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        $userId = Auth::id();
        
        $savedBusinesses = SavedBusiness::where('user_id', $userId)
            ->with(['business.owner', 'business.categoryRef', 'business.location'])
            ->get()
            ->pluck('business');
            
        return response()->json($savedBusinesses);
    }

    /**
     * Display the sellables page.
     */
    public function sellablesIndex(Request $request)
    {
        $sellables = Sellable::with(['business.location'])
            ->when($request->has('min_price'), function ($query) use ($request) {
                return $query->where('price', '>=', $request->min_price);
            })
            ->when($request->has('max_price'), function ($query) use ($request) {
                return $query->where('price', '<=', $request->max_price);
            })
            ->when($request->has('type'), function ($query) use ($request) {
                return $query->where('sellable_type', $request->type);
            })
            ->paginate(12);

        $businesses = Business::where('is_verified', true)
            ->orderBy('business_name')
            ->get();

        return Inertia::render('Listings/Sellables', [
            'sellables' => $sellables,
            'businesses' => $businesses,
        ]);
    }

    /**
     * Display the specified sellable.
     */
    public function showSellable($id)
    {
        $sellable = Sellable::with(['business.location'])->findOrFail($id);
        
        return Inertia::render('Listings/SellableDetail', [
            'sellable' => $sellable
        ]);
    }
}