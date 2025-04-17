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
                // Convert the request value to boolean using PHP's type juggling
                $isVerified = filter_var($request->verified, FILTER_VALIDATE_BOOLEAN);
                return $query->where('is_verified', $isVerified);
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
        // Log all request parameters for debugging
        \Log::info('Filter Businesses Request:', $request->all());
        
        $query = Business::with(['owner', 'categoryRef', 'location']);
        
        // Filter by category
        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
            \Log::info('Filtering businesses by category: ' . $request->category);
        }
        
        // Filter by location
        if ($request->has('location_id') && !empty($request->location_id)) {
            $query->where('location_id', $request->location_id);
            \Log::info('Filtering businesses by location_id: ' . $request->location_id);
        }
        
        // Filter by price range
        if ($request->has('min_price') || $request->has('max_price')) {
            $query->whereHas('sellables', function ($q) use ($request) {
                if ($request->has('min_price') && is_numeric($request->min_price)) {
                    $q->where('price', '>=', (float)$request->min_price);
                    \Log::info('Filtering businesses by min price: ' . $request->min_price);
                }
                if ($request->has('max_price') && is_numeric($request->max_price)) {
                    $q->where('price', '<=', (float)$request->max_price);
                    \Log::info('Filtering businesses by max price: ' . $request->max_price);
                }
            });
        }
        
        // Filter by verification status
        if ($request->has('verified') && $request->verified !== null) {
            $isVerified = filter_var($request->verified, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_verified', $isVerified);
            \Log::info('Filtering businesses by verified: ' . ($isVerified ? 'true' : 'false'));
        }
        
        // Get the results with pagination
        $businesses = $query->paginate(12);
        
        // Log the SQL query for debugging
        \Log::info('Filter Businesses SQL:', [
            'query' => $query->toSql(),
            'bindings' => $query->getBindings(),
            'count' => $businesses->total()
        ]);
        
        return response()->json($businesses);
    }

    /**
     * Filter sellables by various criteria.
     */
    public function filterSellables(Request $request)
    {
        // Log all request parameters for debugging
        \Log::info('Filter Sellables Request:', $request->all());
        
        $query = Sellable::with(['business']);
        
        // Filter by product/service type
        if ($request->has('type') && !empty($request->type)) {
            $query->where('sellable_type', $request->type);
            \Log::info('Filtering by type: ' . $request->type);
        }
        
        // Filter by price range
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', (float)$request->min_price);
            \Log::info('Filtering by min price: ' . $request->min_price);
        }
        
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', (float)$request->max_price);
            \Log::info('Filtering by max price: ' . $request->max_price);
        }
        
        // Filter by business ID
        if ($request->has('business_id') && !empty($request->business_id)) {
            $query->where('business_id', $request->business_id);
            \Log::info('Filtering by business_id: ' . $request->business_id);
        }
        
        // Filter by category (through business relationship)
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('business', function($q) use ($request) {
                $q->where('category', $request->category);
            });
            \Log::info('Filtering by category: ' . $request->category);
        }
        
        // Filter by location (through business relationship)
        if ($request->has('location_id') && !empty($request->location_id)) {
            $query->whereHas('business', function($q) use ($request) {
                $q->where('location_id', $request->location_id);
            });
            \Log::info('Filtering by location_id: ' . $request->location_id);
        }
        
        // Get the results with pagination
        $sellables = $query->paginate(20);
        
        // Log the SQL query for debugging
        \Log::info('Filter Sellables SQL:', [
            'query' => $query->toSql(),
            'bindings' => $query->getBindings(),
            'count' => $sellables->total()
        ]);
        
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