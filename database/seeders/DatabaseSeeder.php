<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Admin;
use App\Models\Customer;
use App\Models\BusinessOwner;
use App\Models\Category;
use App\Models\Location;
use App\Models\Business;
use App\Models\Sellable;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Dispute;
use App\Models\Review;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->seedCategories();
        $createdUsers = $this->seedUsers();
        $this->seedBusinesses($createdUsers);
    }

    /**
     * Ensure a user exists or create it
     */
    private function ensureUser(array $userData): User
    {
        $user = User::where('email', $userData['email'])->first();
        
        if (!$user) {
            $user = User::create([
                'first_name' => $userData['first_name'],
                'last_name' => $userData['last_name'],
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'phone_number' => $userData['phone_number'],
                'user_type' => $userData['user_type'],
                'user_auth' => $userData['user_auth'],
                'is_verified' => $userData['is_verified'],
                'profile_picture' => $userData['profile_picture'],
            ]);

            // Create related models based on user type
            if ($userData['user_type'] === 'ADMIN') {
                Admin::create([
                    'user_id' => $user->user_id,
                    'permissions' => 'FULL_ACCESS',
                ]);
            } elseif ($userData['user_type'] === 'CUSTOMER') {
                Customer::create([
                    'user_id' => $user->user_id,
                ]);
            } elseif ($userData['user_type'] === 'BUSINESSOWNER') {
                BusinessOwner::create([
                    'user_id' => $user->user_id,
                ]);
            }
        }
        
        return $user;
    }

    /**
     * Ensure a category exists or create it
     */
    private function ensureCategory(string $name): Category
    {
        return Category::firstOrCreate(['category_name' => $name]);
    }

    /**
     * Ensure a location exists or create it
     */
    private function ensureLocation(array $locationData): Location
    {
        return Location::firstOrCreate([
            'city' => $locationData['city'],
            'province' => $locationData['province'],
            'postal_code' => $locationData['postal_code'],
        ]);
    }

    /**
     * Add a business with owner
     */
    private function addBusinessWithOwner(User $user, array $businessData, array $locationData, array $sellablesData): Business
    {
        $location = $this->ensureLocation($locationData);
        
        $businessOwner = BusinessOwner::where('user_id', $user->user_id)->first();
        
        if (!$businessOwner) {
            throw new \Exception("No BusinessOwner found for user_id: {$user->user_id}");
        }
        
        // Create business with the correct column name 'category' instead of 'category_id'
        $business = Business::create([
            'business_name' => $businessData['business_name'],
            'description' => $businessData['description'],
            'owner_id' => $businessOwner->user_id,
            'is_verified' => $businessData['is_verified'] ?? true,
            'location_id' => $location->location_id,
            'category' => $businessData['categoryRef']['connect']['category_name'], // Use 'category' not 'category_id'
            'banner' => $businessData['banner'],
            'logo' => $businessData['logo'],
            'address' => $businessData['address'],
            'contact_number' => $businessData['contact_number'],
        ]);
        
        // Create sellables for this business
        foreach ($sellablesData as $sellableData) {
            Sellable::create([
                'business_id' => $business->business_id,
                'name' => $sellableData['name'],
                'sellable_type' => $sellableData['type'],
                'price' => $sellableData['price'],
                'description' => $sellableData['description'],
                'media' => json_encode($sellableData['media']),
            ]);
        }
        
        return $business;
    }

    /**
     * Seed categories
     */
    private function seedCategories(): void
    {
        $categories = ['Technology', 'Food & Beverages', 'Utilities & Services', 'Agricultural Supplies'];
        
        foreach ($categories as $name) {
            $this->ensureCategory($name);
        }
    }

    /**
     * Seed users
     */
    private function seedUsers(): array
    {
        $users = [
            // ADMIN
            [
                'first_name' => 'Marieta Liezl', 
                'last_name' => 'Lumanlan', 
                'email' => 'admin@trompo.com', 
                'password' => 'admin123', 
                'phone_number' => '09123456789', 
                'user_type' => 'ADMIN', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAgkD7aSNrZOeMAY7Vj650y1dqBwIc38aShWXT"
            ],
            // 2 CUSTOMERS
            [
                'first_name' => 'Ceanne', 
                'last_name' => 'Arenas', 
                'email' => 'ceannekolinnearenas@gmail.com', 
                'password' => 'customer123', 
                'phone_number' => '09604527480', 
                'user_type' => 'CUSTOMER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLA3jYFlRmqjGFhUrp4xC6SQlYnby9HzvXZ2dKM"
            ],
            [
                'first_name' => 'Eric Bernard', 
                'last_name' => 'Aquino', 
                'email' => 'aquino.ericbernard17@gmail.com', 
                'password' => 'customer456', 
                'phone_number' => '09224455667', 
                'user_type' => 'CUSTOMER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAi3RPg10NFJTV9Z75vEzGoY2qf4hXMd1xDPC6"
            ],
            // 3 BUSINESS OWNERS W/ VERIFIED BUSINESSES
            [
                'first_name' => 'May', 
                'last_name' => 'Galvan', 
                'email' => 'ck_mgalvan@yahoo.com.ph', 
                'password' => 'galvan123', 
                'phone_number' => '09694345652', 
                'user_type' => 'BUSINESSOWNER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAfspIcqF0eMvj5gRmE29ZPNirsIkWwKn3lJ46"
            ],
            [
                'first_name' => 'Bernadette', 
                'last_name' => 'Aquino', 
                'email' => 'beamfreshwaters@gmail.com', 
                'password' => 'aquino123', 
                'phone_number' => '09958552475', 
                'user_type' => 'BUSINESSOWNER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAMVngkFKgsHLAuiXYfo8bF34BJQkwl9DCNGmn"
            ],
            [
                'first_name' => 'Arvin', 
                'last_name' => 'Mejia', 
                'email' => 'joeric672@gmail.com', 
                'password' => 'mejia123', 
                'phone_number' => '09100627191', 
                'user_type' => 'BUSINESSOWNER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLACthuFrYKdyxZbR5I3Vjs4mo7lYPXcWkGO26p"
            ],
            // 3 UNVERIFIED USERS
            [
                'first_name' => 'Unverified', 
                'last_name' => 'User1', 
                'email' => 'user1@trompo.com', 
                'password' => 'user123', 
                'phone_number' => '09111222333', 
                'user_type' => 'CUSTOMER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => false, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAEmsHcJCqhsE4HRgSQvMLNDBmTfkJbtWe70ou"
            ],
            [
                'first_name' => 'Unverified', 
                'last_name' => 'User2', 
                'email' => 'user2@trompo.com', 
                'password' => 'user123', 
                'phone_number' => '09111222333', 
                'user_type' => 'CUSTOMER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => false, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAEmsHcJCqhsE4HRgSQvMLNDBmTfkJbtWe70ou"
            ],
            [
                'first_name' => 'Unverified', 
                'last_name' => 'User3', 
                'email' => 'user3@trompo.com', 
                'password' => 'user123', 
                'phone_number' => '09111222333', 
                'user_type' => 'CUSTOMER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => false, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAEmsHcJCqhsE4HRgSQvMLNDBmTfkJbtWe70ou"
            ],
            // 3 USERS WITH UNVERIFIED BUSINESSES
            [
                'first_name' => 'Verified', 
                'last_name' => 'User1', 
                'email' => 'user4@trompo.com', 
                'password' => 'user123', 
                'phone_number' => '09111222333', 
                'user_type' => 'BUSINESSOWNER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAEmsHcJCqhsE4HRgSQvMLNDBmTfkJbtWe70ou"
            ],
            [
                'first_name' => 'Verified', 
                'last_name' => 'User2', 
                'email' => 'user5@trompo.com', 
                'password' => 'user123', 
                'phone_number' => '09111222333', 
                'user_type' => 'BUSINESSOWNER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAEmsHcJCqhsE4HRgSQvMLNDBmTfkJbtWe70ou"
            ],
            [
                'first_name' => 'Verified', 
                'last_name' => 'User3', 
                'email' => 'user6@trompo.com', 
                'password' => 'user123', 
                'phone_number' => '09111222333', 
                'user_type' => 'BUSINESSOWNER', 
                'user_auth' => 'EMAIL', 
                'is_verified' => true, 
                'profile_picture' => "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAEmsHcJCqhsE4HRgSQvMLNDBmTfkJbtWe70ou"
            ],
        ];

        $createdUsers = [];
        foreach ($users as $userData) {
            $user = $this->ensureUser($userData);
            $createdUsers[$userData['user_type'] . '_' . $user->user_id] = $user;
        }

        return $createdUsers;
    }

    /**
     * Seed businesses and related data
     */
    private function seedBusinesses(array $createdUsers): void
    {
        // Find business owner users by email
        $businessOwner1 = User::where('email', 'ck_mgalvan@yahoo.com.ph')->first();
        $businessOwner2 = User::where('email', 'beamfreshwaters@gmail.com')->first();
        $businessOwner3 = User::where('email', 'joeric672@gmail.com')->first();
        $businessOwner4 = User::where('email', 'user4@trompo.com')->first();
        $businessOwner5 = User::where('email', 'user5@trompo.com')->first();
        $businessOwner6 = User::where('email', 'user6@trompo.com')->first();

        // Business 1
        $business1 = $this->addBusinessWithOwner($businessOwner1, [
            'business_name' => 'GalVloyo Smoked and Dried Fish Store',
            'description' => 'Authorized distributor of Skye Smoked and Dried Fish Products in Makati City.',
            'categoryRef' => [
                'connect' => [
                    'category_name' => "Food & Beverages"
                ]
            ],
            'banner' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAS1akgYZgnkwToRlBxMq3uOmGt96fKcZCsrWi',
            'logo' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAx7h2Cy8rOKNzis24n6wCm8ghdLaUJtoPFQ15',
            'address' => 'Tower C Jazz Residences, N. Garcia St., Brgy. Bel-Air',
            'contact_number' => '09694345652',
        ], 
        ['city' => 'Makati', 'province' => 'NCR', 'postal_code' => '1209'], 
        [
            ['name' => 'Tinapang Tunsoy', 'type' => 'PRODUCT', 'price' => 240, 'description' => 'Smoked fish', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAwHhDzy0XpksdUhT9jLR2AgKZ4YatzCylHeXS']],
            ['name' => 'Tinapang Babae', 'type' => 'PRODUCT', 'price' => 260, 'description' => 'Smoked fish', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAy8fPrrhd4C3ZmIL8eWhoF9V0zgnkuPlcbBMH']],
            ['name' => 'Tinapang Lalaki', 'type' => 'PRODUCT', 'price' => 280, 'description' => 'Smoked fish', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLA1kltKnzJ1LV5SDYv4XcBHMpbeiAdFnjG09my']],
            ['name' => 'Tinapang Bangus', 'type' => 'PRODUCT', 'price' => 310, 'description' => 'Smoked fish', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAQFgw0jr4Hpwf0JT7zqod1e2YI5Pc6MViyvtU']]
        ]);

        // Business 2
        $business2 = $this->addBusinessWithOwner($businessOwner2, [
            'business_name' => 'Beamfresh Water Refilling Station',
            'description' => 'Water refilling station.',
            'categoryRef' => [
                'connect' => [
                    'category_name' => "Utilities & Services"
                ]
            ],
            'banner' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAYndSKqxKELc0TedjOU9BsxZlqRwMof3D1Nkp',
            'logo' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAkPMYpgarngDG5HOehxEbSC0P7Kt49L8TXlIF',
            'address' => '194 Camastilisan',
            'contact_number' => '09958552475',
        ], 
        ['city' => 'Calaca', 'province' => 'Batangas', 'postal_code' => '4212'], 
        [
            ['name' => 'Purified Water', 'type' => 'SERVICE', 'price' => 25, 'description' => 'Clean water gallon', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAmz6Rq9I1TaSOFsHz2qKePjd6R17CuV3kL8xU']]
        ]);

        // Business 3
        $business3 = $this->addBusinessWithOwner($businessOwner3, [
            'business_name' => 'Hamellek Hog & Poultry Supply',
            'description' => 'Selling feeds, vitamins, and other needs for happy and healthy farm animals.',
            'categoryRef' => [
                'connect' => [
                    'category_name' => "Agricultural Supplies"
                ]
            ],
            'banner' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLABa85Vvwb0AyuM7lYtT1mW6LOwngRo5XerHvp',
            'logo' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAJy22o8zOAokWjfU57YwxlI3CrETdLayDRbpm',
            'address' => 'Quezon',
            'contact_number' => '09100627191',
        ], 
        ['city' => 'Naguilian', 'province' => 'Isabela', 'postal_code' => '3302'], 
        [
            ['name' => 'Enertone', 'type' => 'PRODUCT', 'price' => 40, 'description' => 'Feed supplement', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAld5IQY63nLez6WEBfONixA5dTaCgS98JIlUX']],
            ['name' => 'Baby Stag Booster', 'type' => 'PRODUCT', 'price' => 52, 'description' => 'Feed supplement', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLA1SsQ5sJ1LV5SDYv4XcBHMpbeiAdFnjG09myq']],
            ['name' => 'Stag Developer', 'type' => 'PRODUCT', 'price' => 40, 'description' => 'Feed supplement', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLA1ymmnSJ1LV5SDYv4XcBHMpbeiAdFnjG09myq']],
            ['name' => 'Belamyl (10mL)', 'type' => 'PRODUCT', 'price' => 290, 'description' => 'Belamyl 10mL variant', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAWLQzRh7Hnby4ZijPIMhQ8Lz9rwgK3H5VTpt1']],
            ['name' => 'Hog Gestating (BMEG)', 'type' => 'PRODUCT', 'price' => 45, 'description' => 'Price per kilo', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAWeDQHnby4ZijPIMhQ8Lz9rwgK3H5VTpt1OoY']]
        ]);

        // Unverified Business 1
        $unverifiedBusiness1 = $this->addBusinessWithOwner($businessOwner4, [
            'business_name' => 'Unverified Business #1',
            'description' => 'Unverified placeholder biz.',
            'categoryRef' => [
                'connect' => [
                    'category_name' => "Utilities & Services"
                ]
            ],
            'banner' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAxgJ4uE8rOKNzis24n6wCm8ghdLaUJtoPFQ15',
            'logo' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAmzuajMe1TaSOFsHz2qKePjd6R17CuV3kL8xU',
            'address' => '194 Camastilisan',
            'contact_number' => '09111222333',
            'is_verified' => false,
        ], 
        ['city' => 'Calaca', 'province' => 'Batangas', 'postal_code' => '4212'], 
        [
            ['name' => 'Placeholder Product', 'type' => 'PRODUCT', 'price' => 25, 'description' => 'Placeholder product', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAKhGyOOUIQlsiA6u9gbrXkBLpe5z1Ca3UcEDY']]
        ]);

        // Unverified Business 2
        $unverifiedBusiness2 = $this->addBusinessWithOwner($businessOwner5, [
            'business_name' => 'Unverified Business #2',
            'description' => 'Unverified placeholder biz.',
            'categoryRef' => [
                'connect' => [
                    'category_name' => "Technology"
                ]
            ],
            'banner' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAxgJ4uE8rOKNzis24n6wCm8ghdLaUJtoPFQ15',
            'logo' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAmzuajMe1TaSOFsHz2qKePjd6R17CuV3kL8xU',
            'address' => '194 Camastilisan',
            'contact_number' => '09111222333',
            'is_verified' => false,
        ], 
        ['city' => 'Calaca', 'province' => 'Batangas', 'postal_code' => '4212'], 
        [
            ['name' => 'Placeholder Product', 'type' => 'PRODUCT', 'price' => 25, 'description' => 'Placeholder product', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAKhGyOOUIQlsiA6u9gbrXkBLpe5z1Ca3UcEDY']]
        ]);

        // Unverified Business 3
        $unverifiedBusiness3 = $this->addBusinessWithOwner($businessOwner6, [
            'business_name' => 'Unverified Business #3',
            'description' => 'Unverified placeholder biz.',
            'categoryRef' => [
                'connect' => [
                    'category_name' => "Technology"
                ]
            ],
            'banner' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAxgJ4uE8rOKNzis24n6wCm8ghdLaUJtoPFQ15',
            'logo' => 'https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAmzuajMe1TaSOFsHz2qKePjd6R17CuV3kL8xU',
            'address' => '194 Camastilisan',
            'contact_number' => '09111222333',
            'is_verified' => false,
        ], 
        ['city' => 'Calaca', 'province' => 'Batangas', 'postal_code' => '4212'], 
        [
            ['name' => 'Placeholder Product', 'type' => 'PRODUCT', 'price' => 25, 'description' => 'Placeholder product', 'media' => ['https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAKhGyOOUIQlsiA6u9gbrXkBLpe5z1Ca3UcEDY']]
        ]);

        // Create transactions, disputes, and reviews
        $customer = Customer::first();
        $businesses = [$business1, $business2, $business3];

        for ($i = 0; $i < 3; $i++) {
            $business = $businesses[$i];
            $sellable = Sellable::where('business_id', $business->business_id)->first();

            // Create transaction
            $transaction = Transaction::create([
                'customer_id' => $customer->user_id,
                'business_id' => $business->business_id,
                'status' => 'PENDING',
                'date_initiated' => now(),
            ]);

            // Create transaction item
            TransactionItem::create([
                'transaction_id' => $transaction->transaction_id,
                'sellable_id' => $sellable->sellable_id,
                'quantity' => 1,
                'price' => $sellable->price,
            ]);

            // Create dispute
            Dispute::create([
                'transaction_id' => $transaction->transaction_id,
                'complainant_id' => $customer->user_id,
                'reason' => "Dispute reason for transaction " . ($i + 1),
                'status' => 'PENDING',
            ]);

            // Create review
            Review::create([
                'customer_id' => $customer->user_id,
                'business_id' => $business->business_id,
                'rating' => 5,
                'review_text' => "This is a review for business " . ($i + 1),
                'media' => json_encode(["https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAC8huOaYKdyxZbR5I3Vjs4mo7lYPXcWkGO26p"]),
                'is_verified' => true,
            ]);
        }
    }
}