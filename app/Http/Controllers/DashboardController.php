<?php

namespace App\Http\Controllers;

use App\Models\Allocation;
use App\Models\AllocationType;
use App\Models\Barangay;
use App\Models\Commodity;
use App\Models\CommodityCategory;
use App\Models\Farmer;
use App\Models\Farm;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function showAdmin(){
        return Inertia::render('Admin/Dashboard');
    }

    public function index()
    {
        $barangays = Barangay::all();
        $allocations = Allocation::all();
        $allocationType = AllocationType::all();
        $commodityCategories = CommodityCategory::with('commodities')->get();
        $registeredFarmers = Farmer::where('status', 'registered')->count();
        $unregisteredFarmers = Farmer::where('status', 'unregistered')->count();
        $totalFarmers = Farmer::count();
        
        $heatmapData = [];
        $commodityCounts = [];

        foreach ($barangays as $barangay) {
            $barangayFarms = Farm::with('farmer')->where('brgy_id', $barangay->id)->get();
            $registeredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'registered')->count();
            $unregisteredFarmersInBarangay = $barangayFarms->filter(fn($farm) => $farm->farmer->status === 'unregistered')->count();
            
            $heatmapData[$barangay->name] = [
                'allocations' => [],
                'commodities' => [],
                'farmers' => [
                    'Registered' => $registeredFarmersInBarangay,
                    'Unregistered' => $unregisteredFarmersInBarangay,
                ],
                'highValue' => [],
            ];

            
            foreach ($allocationType as $type) {
                $count = $allocations->where('allocation_type_id', $type->id)->where('brgy_id', $barangay->id)->count();
                $heatmapData[$barangay->name]['allocations'][$type->name] = $count;
            }
            
            foreach ($commodityCategories as $category) {
                
                if (!isset($commodityCounts[$category->name])) {
                    $commodityCounts[$category->name] = [];
                }

                $categoryCommodities = [];
                foreach ($category->commodities as $commodity) {
                   
                    $count = $barangayFarms->filter(function ($farm) use ($commodity) {
                        return $farm->commodity_id === $commodity->id;
                    })->count();

                    $categoryCommodities[] = [
                        'name' => $commodity->name,
                        'count' => $count,
                    ];
                    
                    $heatmapData[$barangay->name]['commodities'][$category->name] = $categoryCommodities;
                    
                    $commodityCounts[$category->name] = $categoryCommodities;
                }
            }
        }

        return Inertia::render('Super Admin/Dashboard', [
            'totalAllocations' => $allocations->count(),
            'commodityCategories' => $commodityCategories,
            'allocationType' => $allocationType,
            'registeredFarmers' => $registeredFarmers,
            'unregisteredFarmers' => $unregisteredFarmers,
            'totalFarmers' => $totalFarmers,
            'heatmapData' => $heatmapData,
            'commodityCounts' => $commodityCounts,
        ]);
    }

    public function getFarmersDistribution(Request $request)
    {
        
        $year = $request->input('year');
        $category = $request->input('subcategory', 'all');  
    
       
        $data = Barangay::withCount([
            'farmers as registered_count' => function ($query) use ($year) {
                $query->where('status', 'registered')
                    ->when($year && $year !== 'all', function ($query) use ($year) {
                     
                        $query->whereYear('registration_date', $year);
                    });
            },
            'farmers as unregistered_count' => function ($query) use ($year) {
                $query->where('status', 'unregistered')
                    ->when($year && $year !== 'all', function ($query) use ($year) {
                     
                        $query->whereYear('registration_date', $year);
                    });
            }
        ])
        ->get()
        ->map(function ($barangay) use ($category) {
           
            $registeredCount = $barangay->registered_count;
            $unregisteredCount = $barangay->unregistered_count;
    
            
            if ($category === 'registered') {
                return [
                    'barangay' => $barangay->name,
                    'value' => [$registeredCount],
                ];
            }
    
            if ($category === 'unregistered') {
                return [
                    'barangay' => $barangay->name,
                    'value' => [$unregisteredCount],
                ];
            }
    
          
            return [
                'barangay' => $barangay->name,
                'value' => [$registeredCount, $unregisteredCount],
            ];
        });
    
        return response()->json($data);
    }
    
    public function getAllocationsDistribution(Request $request)
    {
        $year = $request->input('year');
        $category = $request->input('subcategory', 'all'); 

        
        $data = Barangay::with(['allocations' => function($query) use ($year, $category) {
            $query->when($category && $category !== 'all', function ($query) use ($category) {
                $query->where('allocation_type_id', $category); // Filter by allocation type
            })
            ->when($year && $year !== 'all', function ($query) use ($year) {
                $query->whereYear('allocations.date_received', $year); // Filter by year
            })
            ->with('allocationType')
            ->selectRaw('brgy_id, allocation_type_id, COUNT(*) as allocation_count') 
            ->groupBy('brgy_id', 'allocation_type_id');
        }])
        ->get()
        ->map(function ($barangay) {
            return [
                'barangay' => $barangay->name,
                'allocations' => $barangay->allocations->map(function ($allocation) {
                    return [
                        'allocation_type' => $allocation->allocationType->name,
                        'allocation_count' => $allocation->allocation_count,
                    ];
                }),
            ];
        });

        return response()->json($data);
    }

    
    protected function getFarmerGroup(Farmer $farmer)
    {
       
        if ($farmer->is_registered) {
            if ($farmer->age >= 60) {
                return 'seniorCitizen'; 
            }
            return 'registered'; 
        }
        
        if ($farmer->is_pwd) {
            return 'pwd';
        }

        return 'unregistered'; 
    }

    public function getStackedData()
    {
        return response()->json([
            [
                'category' => 'Category 1',
                'subcategories' => [
                    'Sub1' => 10,
                    'Sub2' => 20,
                    'Sub3' => 30,
                ],
            ],
            [
                'category' => 'Category 2',
                'subcategories' => [
                    'Sub1' => 15,
                    'Sub2' => 25,
                    'Sub3' => 35,
                ],
            ],
        ]);
    }

        

}