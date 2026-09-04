import os
from datetime import datetime
from bson import ObjectId
from app.config.database import connect_to_mongo, get_db
from app.utils.security import get_password_hash

def seed_database():
    connect_to_mongo()
    db = get_db()
    
    print("Seeding AgriLink database...")
    
    # 1. Farmers
    farmers_data = [
        {
            "name": "Ramesh Patil",
            "email": "ramesh.patil@agrilink.farm",
            "phone": "9823012345",
            "password_hash": get_password_hash("Farmer@12345"),
            "role": "FARMER",
            "farm_details": {
                "farm_name": "Shivneri Organic Farms",
                "farm_location": "Junnar, Pune, Maharashtra",
                "crop_categories": ["Vegetables", "Fruits"],
                "farming_type": "Certified Organic",
                "farm_description": "Family-owned farm cultivating chemical-free organic vegetables and fresh fruits with drip irrigation and solar power."
            },
            "created_at": datetime.utcnow()
        },
        {
            "name": "Rajesh Sharma",
            "email": "rajesh.sharma@agrilink.farm",
            "phone": "9823012346",
            "password_hash": get_password_hash("Farmer@12345"),
            "role": "FARMER",
            "farm_details": {
                "farm_name": "Green Valley Agro",
                "farm_location": "Nashik, Maharashtra",
                "crop_categories": ["Vegetables", "Grapes"],
                "farming_type": "Natural Farming",
                "farm_description": "Specializing in farm-fresh root vegetables, tomatoes, and greenhouse produce using sustainable composting."
            },
            "created_at": datetime.utcnow()
        },
        {
            "name": "Vikas Sharma",
            "email": "vikas.sharma@agrilink.farm",
            "phone": "9823012347",
            "password_hash": get_password_hash("Farmer@12345"),
            "role": "FARMER",
            "farm_details": {
                "farm_name": "Himalayan Apple Orchards",
                "farm_location": "Kotgarh, Shimla, Himachal Pradesh",
                "crop_categories": ["Fruits"],
                "farming_type": "High-Altitude Organic",
                "farm_description": "Traditional apple and stone-fruit orchard located at 7,000 ft altitude in Shimla hills."
            },
            "created_at": datetime.utcnow()
        },
        {
            "name": "Baldev Bhai",
            "email": "baldev.bhai@agrilink.farm",
            "phone": "9823012348",
            "password_hash": get_password_hash("Farmer@12345"),
            "role": "FARMER",
            "farm_details": {
                "farm_name": "Vedic Gir Gaushala & Dairy",
                "farm_location": "Anand, Gujarat",
                "crop_categories": ["Dairy & Milk"],
                "farming_type": "A2 Organic Dairy",
                "farm_description": "Pure indigenous Gir cow dairy farm providing raw A2 milk, cultured bilona ghee, and fresh paneer."
            },
            "created_at": datetime.utcnow()
        },
        {
            "name": "Gurpreet Singh",
            "email": "gurpreet.singh@agrilink.farm",
            "phone": "9823012349",
            "password_hash": get_password_hash("Farmer@12345"),
            "role": "FARMER",
            "farm_details": {
                "farm_name": "Golden Grain Fields",
                "farm_location": "Karnal, Haryana",
                "crop_categories": ["Crops & Grains"],
                "farming_type": "Traditional & Organic",
                "farm_description": "Centuries-old family heritage growing aromatic Basmati rice and premium Sharbati wheat."
            },
            "created_at": datetime.utcnow()
        },
        {
            "name": "Anil Deshmukh",
            "email": "anil.deshmukh@agrilink.farm",
            "phone": "9823012350",
            "password_hash": get_password_hash("Farmer@12345"),
            "role": "FARMER",
            "farm_details": {
                "farm_name": "Vidarbha Natural Pulses",
                "farm_location": "Akola, Maharashtra",
                "crop_categories": ["Pulses"],
                "farming_type": "Rainfed Organic",
                "farm_description": "Farmer collective producing unpolished high-protein pulses and indigenous lentils."
            },
            "created_at": datetime.utcnow()
        }
    ]
    
    farmer_id_map = {}
    for f in farmers_data:
        existing = db.users.find_one({"email": f["email"]})
        if not existing:
            res = db.users.insert_one(f)
            farmer_id_map[f["name"]] = str(res.inserted_id)
        else:
            farmer_id_map[f["name"]] = str(existing["_id"])
            
    # Also ensure Test Farmer ID is mapped
    test_farmer = db.users.find_one({"email": "agrilink.test.farmer.unique@example.com"})
    if test_farmer:
        farmer_id_map["Test Farmer"] = str(test_farmer["_id"])
        
    print(f"Farmers mapped: {len(farmer_id_map)}")
    
    # 2. Clear old products to re-seed clean rich dataset
    db.products.delete_many({})
    db.reviews.delete_many({})
    
    products_data = [
        {
            "name": "Fresh Farm Tomatoes",
            "category": "Vegetables",
            "description": "Vine-ripened organic red tomatoes harvested daily at dawn. Naturally sweet, firm, and packed with lycopene. Grown with 100% natural manure without synthetic pesticides.",
            "price": 35.0,
            "market_price": 45.0,
            "quantity": 250.0,
            "unit": "kg",
            "image": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Junnar, Pune, Maharashtra",
            "farmer_name": "Ramesh Patil",
            "farmer_id": farmer_id_map.get("Ramesh Patil", "farmer_1"),
            "farm_name": "Shivneri Organic Farms",
            "farming_type": "Certified Organic",
            "farming_method": "Drip irrigated, open-field soil cultivation with neem-based pest control",
            "harvest_date": "Harvested within 24 hours",
            "storage_info": "Store at room temperature away from direct sunlight. Refrigerate once fully ripe.",
            "organic": True,
            "rating": 4.9,
            "review_count": 28,
            "distance_km": 42,
            "nutrition": {
                "serving_size": "100g",
                "calories": 18.0,
                "protein": 0.9,
                "carbohydrates": 3.9,
                "fat": 0.2,
                "fiber": 1.2,
                "vitamins": "Vitamin C (14mg), Vitamin A (833 IU), Vitamin K",
                "minerals": "Potassium (237mg), Folate"
            },
            "origin": {
                "farm_name": "Shivneri Organic Farms",
                "district": "Pune",
                "state": "Maharashtra",
                "latitude": 19.2082,
                "longitude": 73.8767
            },
            "benefits": [
                "Direct from farm in 24 hours",
                "No artificial ripening agents",
                "Rich in antioxidant lycopene"
            ],
            "breakdown": {
                "farmer_receives": 35.0,
                "platform_delivery": 5.0,
                "customer_pays": 40.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Organic Yukon Gold Potatoes",
            "category": "Vegetables",
            "description": "Naturally grown golden potatoes with smooth skin and buttery, creamy texture. Ideal for boiling, baking, and traditional Indian curries.",
            "price": 30.0,
            "market_price": 40.0,
            "quantity": 500.0,
            "unit": "kg",
            "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Nashik, Maharashtra",
            "farmer_name": "Rajesh Sharma",
            "farmer_id": farmer_id_map.get("Rajesh Sharma", "farmer_2"),
            "farm_name": "Green Valley Agro",
            "farming_type": "Natural Farming",
            "farming_method": "Black fertile soil, bio-composted, free from synthetic growth regulators",
            "harvest_date": "Harvested this week",
            "storage_info": "Keep in a cool, dark, and well-ventilated space. Do not refrigerate.",
            "organic": True,
            "rating": 4.8,
            "review_count": 19,
            "distance_km": 68,
            "nutrition": {
                "serving_size": "100g",
                "calories": 77.0,
                "protein": 2.0,
                "carbohydrates": 17.5,
                "fat": 0.1,
                "fiber": 2.2,
                "vitamins": "Vitamin B6, Vitamin C (19.7mg)",
                "minerals": "Potassium (421mg), Magnesium"
            },
            "origin": {
                "farm_name": "Green Valley Agro",
                "district": "Nashik",
                "state": "Maharashtra",
                "latitude": 19.9975,
                "longitude": 73.7898
            },
            "benefits": [
                "Naturally cured for longer shelf life",
                "No post-harvest chemical spray",
                "High natural potassium"
            ],
            "breakdown": {
                "farmer_receives": 30.0,
                "platform_delivery": 5.0,
                "customer_pays": 35.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Fresh Hydroponic & Field Spinach (Palak)",
            "category": "Vegetables",
            "description": "Tender, vibrant green spinach leaves picked early morning. Thoroughly clean, crisp, and high in iron and folate.",
            "price": 25.0,
            "market_price": 35.0,
            "quantity": 120.0,
            "unit": "bunch",
            "image": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Junnar, Pune, Maharashtra",
            "farmer_name": "Ramesh Patil",
            "farmer_id": farmer_id_map.get("Ramesh Patil", "farmer_1"),
            "farm_name": "Shivneri Organic Farms",
            "farming_type": "Certified Organic",
            "farming_method": "Organic compost & pure well water",
            "harvest_date": "Harvested today morning",
            "storage_info": "Store wrapped in a paper towel in the crisper drawer of your refrigerator.",
            "organic": True,
            "rating": 4.9,
            "review_count": 34,
            "distance_km": 42,
            "nutrition": {
                "serving_size": "100g",
                "calories": 23.0,
                "protein": 2.9,
                "carbohydrates": 3.6,
                "fat": 0.4,
                "fiber": 2.2,
                "vitamins": "Vitamin A (9377 IU), Vitamin C (28mg), Vitamin K (483mcg)",
                "minerals": "Iron (2.7mg), Calcium (99mg), Magnesium"
            },
            "origin": {
                "farm_name": "Shivneri Organic Farms",
                "district": "Pune",
                "state": "Maharashtra",
                "latitude": 19.2082,
                "longitude": 73.8767
            },
            "breakdown": {
                "farmer_receives": 25.0,
                "platform_delivery": 5.0,
                "customer_pays": 30.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Crisp Royal Gala Apples",
            "category": "Fruits",
            "description": "Tree-ripened crisp apples harvested from high-altitude Himalayan orchards. Juicy, sweet, aromatic with no artificial wax coating.",
            "price": 120.0,
            "market_price": 150.0,
            "quantity": 180.0,
            "unit": "kg",
            "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Kotgarh, Shimla, Himachal Pradesh",
            "farmer_name": "Vikas Sharma",
            "farmer_id": farmer_id_map.get("Vikas Sharma", "farmer_3"),
            "farm_name": "Himalayan Apple Orchards",
            "farming_type": "High-Altitude Organic",
            "farming_method": "Snow-fed glacier water and natural mountain sun ripening",
            "harvest_date": "Fresh Autumn Harvest",
            "storage_info": "Store in the refrigerator to maintain crispness for up to 3 weeks.",
            "organic": True,
            "rating": 4.9,
            "review_count": 42,
            "distance_km": 1400,
            "nutrition": {
                "serving_size": "100g",
                "calories": 52.0,
                "protein": 0.3,
                "carbohydrates": 13.8,
                "fat": 0.2,
                "fiber": 2.4,
                "vitamins": "Vitamin C (4.6mg), Vitamin E",
                "minerals": "Potassium (107mg)"
            },
            "origin": {
                "farm_name": "Himalayan Apple Orchards",
                "district": "Shimla",
                "state": "Himachal Pradesh",
                "latitude": 31.3146,
                "longitude": 77.4947
            },
            "breakdown": {
                "farmer_receives": 120.0,
                "platform_delivery": 15.0,
                "customer_pays": 135.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Fresh Alphonso Mangoes",
            "category": "Fruits",
            "description": "Authentic GI-tagged Ratnagiri Alphonso mangoes. Naturally grass-ripened with intense golden aroma and luscious saffron pulp.",
            "price": 380.0,
            "market_price": 500.0,
            "quantity": 90.0,
            "unit": "dozen",
            "image": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Ratnagiri, Maharashtra",
            "farmer_name": "Rajesh Sharma",
            "farmer_id": farmer_id_map.get("Rajesh Sharma", "farmer_2"),
            "farm_name": "Green Valley Agro",
            "farming_type": "Natural Farming",
            "farming_method": "Traditional coastal organic orchards, zero calcium carbide used",
            "harvest_date": "Hand-picked this week",
            "storage_info": "Keep at room temperature in paper/hay until fragrant and soft to gentle touch.",
            "organic": True,
            "rating": 5.0,
            "review_count": 56,
            "distance_km": 310,
            "nutrition": {
                "serving_size": "100g",
                "calories": 60.0,
                "protein": 0.8,
                "carbohydrates": 15.0,
                "fat": 0.4,
                "fiber": 1.6,
                "vitamins": "Vitamin A (1082 IU), Vitamin C (36.4mg), Vitamin E",
                "minerals": "Folate (43mcg), Potassium (168mg)"
            },
            "origin": {
                "farm_name": "Konkan Coastal Orchards",
                "district": "Ratnagiri",
                "state": "Maharashtra",
                "latitude": 16.9902,
                "longitude": 73.3120
            },
            "breakdown": {
                "farmer_receives": 380.0,
                "platform_delivery": 20.0,
                "customer_pays": 400.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Pure A2 Gir Cow Fresh Milk",
            "category": "Dairy & Milk",
            "description": "100% pure raw unadulterated A2 milk from free-grazing indigenous Gir cows. Rich in A2 beta-casein protein, easily digestible and delivered chilled within hours of milking.",
            "price": 55.0,
            "market_price": 68.0,
            "quantity": 100.0,
            "unit": "litre",
            "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Anand, Gujarat",
            "farmer_name": "Baldev Bhai",
            "farmer_id": farmer_id_map.get("Baldev Bhai", "farmer_4"),
            "farm_name": "Vedic Gir Gaushala & Dairy",
            "farming_type": "A2 Organic Dairy",
            "farming_method": "Ethical milking, cows fed organic green fodder, moringa & ayurvedic herbs",
            "harvest_date": "Milked at 4:30 AM today",
            "storage_info": "Keep refrigerated at 4°C. Boil before consumption.",
            "organic": True,
            "rating": 4.9,
            "review_count": 64,
            "distance_km": 110,
            "nutrition": {
                "serving_size": "100ml",
                "calories": 62.0,
                "protein": 3.4,
                "carbohydrates": 4.8,
                "fat": 3.9,
                "fiber": 0.0,
                "vitamins": "Vitamin D, Vitamin B12 (0.45mcg), Vitamin A",
                "minerals": "Calcium (120mg), Phosphorus (95mg)"
            },
            "origin": {
                "farm_name": "Vedic Gir Gaushala & Dairy",
                "district": "Anand",
                "state": "Gujarat",
                "latitude": 22.5645,
                "longitude": 72.9289
            },
            "breakdown": {
                "farmer_receives": 55.0,
                "platform_delivery": 5.0,
                "customer_pays": 60.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Fresh Organic Artisanal Paneer",
            "category": "Dairy & Milk",
            "description": "Soft, melt-in-mouth cottage cheese handmade with 100% pure organic A2 milk and fresh lemon juice curdling. Free from starch, preservatives, or chemical thickeners.",
            "price": 95.0,
            "market_price": 120.0,
            "quantity": 60.0,
            "unit": "pack",
            "image": "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Anand, Gujarat",
            "farmer_name": "Baldev Bhai",
            "farmer_id": farmer_id_map.get("Baldev Bhai", "farmer_4"),
            "farm_name": "Vedic Gir Gaushala & Dairy",
            "farming_type": "A2 Organic Dairy",
            "farming_method": "Handcrafted daily from fresh morning A2 milk",
            "harvest_date": "Prepared today",
            "storage_info": "Submerge in cold water inside refrigerator. Use within 4 days.",
            "organic": True,
            "rating": 4.9,
            "review_count": 22,
            "distance_km": 110,
            "nutrition": {
                "serving_size": "100g",
                "calories": 265.0,
                "protein": 18.3,
                "carbohydrates": 1.2,
                "fat": 20.8,
                "fiber": 0.0,
                "vitamins": "Vitamin A, Vitamin B12",
                "minerals": "Calcium (480mg), Phosphorus"
            },
            "origin": {
                "farm_name": "Vedic Gir Gaushala & Dairy",
                "district": "Anand",
                "state": "Gujarat",
                "latitude": 22.5645,
                "longitude": 72.9289
            },
            "breakdown": {
                "farmer_receives": 95.0,
                "platform_delivery": 10.0,
                "customer_pays": 105.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Traditional Aged Basmati Rice",
            "category": "Crops & Grains",
            "description": "Authentic long-grain aromatic 1121 Basmati rice, aged naturally for 18 months for non-sticky, fluffy grains that elongate up to twice their size upon cooking.",
            "price": 60.0,
            "market_price": 75.0,
            "quantity": 800.0,
            "unit": "kg",
            "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Karnal, Haryana",
            "farmer_name": "Gurpreet Singh",
            "farmer_id": farmer_id_map.get("Gurpreet Singh", "farmer_5"),
            "farm_name": "Golden Grain Fields",
            "farming_type": "Traditional & Organic",
            "farming_method": "Gangetic alluvial basin, canal-fed irrigation, sun-dried paddy",
            "harvest_date": "Naturally aged 18 months",
            "storage_info": "Store in an airtight container in a dry place. Add dried neem leaves to repel pests.",
            "organic": False,
            "rating": 4.8,
            "review_count": 31,
            "distance_km": 1200,
            "nutrition": {
                "serving_size": "100g cooked",
                "calories": 130.0,
                "protein": 2.7,
                "carbohydrates": 28.0,
                "fat": 0.3,
                "fiber": 0.4,
                "vitamins": "Thiamin, Niacin",
                "minerals": "Iron, Zinc"
            },
            "origin": {
                "farm_name": "Golden Grain Fields",
                "district": "Karnal",
                "state": "Haryana",
                "latitude": 29.6857,
                "longitude": 76.9905
            },
            "breakdown": {
                "farmer_receives": 60.0,
                "platform_delivery": 8.0,
                "customer_pays": 68.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Stone-Ground Sharbati Whole Wheat (Atta)",
            "category": "Crops & Grains",
            "description": "Known as the Queen of Wheat, grown in the rainfed black cotton soils of Sehore. High in natural sweetness, elasticity, producing ultra-soft rotis.",
            "price": 45.0,
            "market_price": 55.0,
            "quantity": 600.0,
            "unit": "kg",
            "image": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Karnal, Haryana",
            "farmer_name": "Gurpreet Singh",
            "farmer_id": farmer_id_map.get("Gurpreet Singh", "farmer_5"),
            "farm_name": "Golden Grain Fields",
            "farming_type": "Traditional & Organic",
            "farming_method": "Traditional slow stone chakki grounding to preserve wheat germ oil and fiber",
            "harvest_date": "Freshly milled on order",
            "storage_info": "Keep in airtight tin container away from moisture.",
            "organic": True,
            "rating": 4.9,
            "review_count": 45,
            "distance_km": 1200,
            "nutrition": {
                "serving_size": "100g",
                "calories": 340.0,
                "protein": 13.2,
                "carbohydrates": 72.0,
                "fat": 2.5,
                "fiber": 10.7,
                "vitamins": "Vitamin E, Folate",
                "minerals": "Magnesium, Iron (3.9mg)"
            },
            "origin": {
                "farm_name": "Golden Grain Fields",
                "district": "Karnal",
                "state": "Haryana",
                "latitude": 29.6857,
                "longitude": 76.9905
            },
            "breakdown": {
                "farmer_receives": 45.0,
                "platform_delivery": 5.0,
                "customer_pays": 50.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Unpolished Organic Toor Dal (Pigeon Pea)",
            "category": "Pulses",
            "description": "Authentic Desi Toor Dal grown without irrigation in drought-resilient soils of Vidarbha. 100% unpolished with natural outer membrane intact for maximum protein and nutty taste.",
            "price": 110.0,
            "market_price": 140.0,
            "quantity": 400.0,
            "unit": "kg",
            "image": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Akola, Maharashtra",
            "farmer_name": "Anil Deshmukh",
            "farmer_id": farmer_id_map.get("Anil Deshmukh", "farmer_6"),
            "farm_name": "Vidarbha Natural Pulses",
            "farming_type": "Rainfed Organic",
            "farming_method": "Rainfed organic intercropping with zero water polish or synthetic oil coating",
            "harvest_date": "Current season harvest",
            "storage_info": "Store in dry airtight container with whole cloves or bay leaves.",
            "organic": True,
            "rating": 4.8,
            "review_count": 27,
            "distance_km": 540,
            "nutrition": {
                "serving_size": "100g",
                "calories": 343.0,
                "protein": 22.0,
                "carbohydrates": 62.8,
                "fat": 1.5,
                "fiber": 15.0,
                "vitamins": "Thiamine (B1), Folate",
                "minerals": "Iron (5.2mg), Potassium (1100mg)"
            },
            "origin": {
                "farm_name": "Vidarbha Natural Pulses",
                "district": "Akola",
                "state": "Maharashtra",
                "latitude": 20.7002,
                "longitude": 77.0082
            },
            "breakdown": {
                "farmer_receives": 110.0,
                "platform_delivery": 10.0,
                "customer_pays": 120.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Organic Desi Chana Dal (Bengal Gram)",
            "category": "Pulses",
            "description": "Small-grain organic Chana Dal rich in soluble fiber and resistant starch. Low glycemic index, unpolished and easy to digest.",
            "price": 85.0,
            "market_price": 105.0,
            "quantity": 350.0,
            "unit": "kg",
            "image": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Akola, Maharashtra",
            "farmer_name": "Anil Deshmukh",
            "farmer_id": farmer_id_map.get("Anil Deshmukh", "farmer_6"),
            "farm_name": "Vidarbha Natural Pulses",
            "farming_type": "Rainfed Organic",
            "farming_method": "Sun dried, split with traditional hand chakki",
            "harvest_date": "Current season harvest",
            "storage_info": "Store in a cool dry pantry in glass jar.",
            "organic": True,
            "rating": 4.7,
            "review_count": 18,
            "distance_km": 540,
            "nutrition": {
                "serving_size": "100g",
                "calories": 360.0,
                "protein": 20.8,
                "carbohydrates": 59.8,
                "fat": 5.6,
                "fiber": 12.2,
                "vitamins": "Folate (430mcg)",
                "minerals": "Iron (4.3mg), Magnesium, Phosphorus"
            },
            "origin": {
                "farm_name": "Vidarbha Natural Pulses",
                "district": "Akola",
                "state": "Maharashtra",
                "latitude": 20.7002,
                "longitude": 77.0082
            },
            "breakdown": {
                "farmer_receives": 85.0,
                "platform_delivery": 8.0,
                "customer_pays": 93.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Fresh Organic Mahabaleshwar Strawberries",
            "category": "Fruits",
            "description": "Sweet, fragrant, dark-red strawberries hand-harvested from high-altitude slopes of Mahabaleshwar. Plump, sweet-tart and rich in natural antioxidants.",
            "price": 90.0,
            "market_price": 130.0,
            "quantity": 150.0,
            "unit": "box",
            "image": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
            "images": [
                "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80"
            ],
            "location": "Junnar, Pune, Maharashtra",
            "farmer_name": "Ramesh Patil",
            "farmer_id": farmer_id_map.get("Ramesh Patil", "farmer_1"),
            "farm_name": "Shivneri Organic Farms",
            "farming_type": "Certified Organic",
            "farming_method": "Protected mulch cultivation with mountain mist",
            "harvest_date": "Harvested within 24 hours",
            "storage_info": "Keep unwashed in open container in refrigerator. Wash just before eating.",
            "organic": True,
            "rating": 4.9,
            "review_count": 39,
            "distance_km": 42,
            "nutrition": {
                "serving_size": "100g",
                "calories": 32.0,
                "protein": 0.7,
                "carbohydrates": 7.7,
                "fat": 0.3,
                "fiber": 2.0,
                "vitamins": "Vitamin C (58.8mg), Folate",
                "minerals": "Manganese, Potassium (153mg)"
            },
            "origin": {
                "farm_name": "Shivneri Organic Farms",
                "district": "Pune",
                "state": "Maharashtra",
                "latitude": 19.2082,
                "longitude": 73.8767
            },
            "breakdown": {
                "farmer_receives": 90.0,
                "platform_delivery": 10.0,
                "customer_pays": 100.0
            },
            "status": "approved",
            "created_at": datetime.utcnow()
        }
    ]
    
    inserted_products = []
    for p in products_data:
        res = db.products.insert_one(p)
        prod_id = str(res.inserted_id)
        inserted_products.append((prod_id, p["name"]))
        
        # Add a couple of realistic reviews per product
        db.reviews.insert_many([
            {
                "product_id": prod_id,
                "customer_id": "cust_1",
                "customer_name": "Ananya Sharma",
                "rating": 5,
                "comment": f"Outstanding freshness and quality! Arrived within 24 hours of harvest. Price transparency is remarkable.",
                "created_at": datetime.utcnow()
            },
            {
                "product_id": prod_id,
                "customer_id": "cust_2",
                "customer_name": "Rohit Verma",
                "rating": 5 if p["rating"] >= 4.9 else 4,
                "comment": f"Much better taste than supermarket produce. Truly glad to support {p['farmer_name']} directly!",
                "created_at": datetime.utcnow()
            }
        ])
        
    print(f"Successfully seeded {len(inserted_products)} realistic products with reviews!")

if __name__ == "__main__":
    seed_database()
