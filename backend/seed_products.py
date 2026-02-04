import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).resolve().parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "digital_bazar")

async def seed_products():
    print(f"Connecting to {MONGO_URL}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Categories and sample products
    categories = ["Electronics", "Clothing", "Home Decor", "Beauty", "Sports"]
    
    products = []
    
    # 1. Electronics (20 products)
    electronics = [
        ("Sony WH-1000XM5 Noise Canceling Headphones", 348.00, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"),
        ("Apple Watch Series 9 (GPS, 41mm)", 399.00, "https://images.unsplash.com/photo-1523275335684-37898b6baf30"),
        ("Logitech G Pro X Mechanical Keyboard", 129.99, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae"),
        ("Razer DeathAdder V3 Pro Gaming Mouse", 149.99, "https://images.unsplash.com/photo-1527698266440-12104e498b76"),
        ("Samsung Odyssey G7 27-inch 4K Monitor", 599.99, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"),
        ("Bose SoundLink Flex Portable Speaker", 149.00, "https://images.unsplash.com/photo-1608156639585-340049e5563a"),
        ("Sony Alpha a7 IV Mirrorless Camera", 2498.00, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32"),
        ("MacBook Pro 14 (M3 Chip, 512GB)", 1599.00, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"),
        ("Apple iPad Pro 11-inch (M2, Wi-Fi)", 799.00, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0"),
        ("Anker 737 Power Bank (PowerCore 24K)", 149.99, "https://images.unsplash.com/photo-1586210579191-3 dynamic-bazar"),
        ("Amazon Echo Dot (5th Gen) Smart Speaker", 49.99, "https://images.unsplash.com/photo-1589492477829-5e65395b66cc"),
        ("Belkin MagSafe 3-in-1 Wireless Charger", 149.99, "https://images.unsplash.com/photo-1586816832793-e30a5abbfb60"),
        ("GoPro HERO12 Black Action Camera", 399.00, "https://images.unsplash.com/photo-1526170315873-3a5616298282"),
        ("Fitbit Charge 6 Fitness Tracker", 159.95, "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6"),
        ("Samsung T7 Shield 2TB Portable SSD", 169.99, "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e"),
        ("DJI Mini 4 Pro Drone Fly More Combo", 1099.00, "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9"),
        ("Meta Quest 3 128GB VR Headset", 499.00, "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac"),
        ("Shure SM7B Vocal Microphone", 399.00, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc"),
        ("Wacom Intuos Pro Creative Tablet", 379.95, "https://images.unsplash.com/photo-1520189123429-6a76ab978bbd"),
        ("Logitech C922 Pro Stream Webcam", 99.99, "https://images.unsplash.com/photo-1585338107529-13afc5f02586")
    ]
    for name, price, img in electronics:
        products.append({
            "name": name,
            "description": f"Official {name}. High-performance professional equipment with worldwide warranty.",
            "price": price,
            "category": "Electronics",
            "image_url": img,
            "stock": 50
        })

    # 2. Clothing (20 products)
    clothing = [
        ("Nike Air Force 1 '07 Sneakers", 115.00, "https://images.unsplash.com/photo-1521572267360-ee0c2909d518"),
        ("Levi's 501 Original Fit Jeans", 79.50, "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d"),
        ("Carhartt WIP Detention Jacket", 158.00, "https://images.unsplash.com/photo-1473966968600-fa801b869a1a"),
        ("Patagonia Better Sweater Hoodie", 159.00, "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4"),
        ("Dr. Martens 1460 Smooth Leather Boots", 170.00, "https://images.unsplash.com/photo-1520639889410-d65c36fcc2e4"),
        ("Burberry Classic Check Silk Scarf", 470.00, "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9"),
        ("Converse Chuck Taylor All Star Canvas", 60.00, "https://images.unsplash.com/photo-1542291026-7eec264c27ff"),
        ("Ralph Lauren Cotton Oxford Shirt", 125.00, "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446"),
        ("Lululemon Align High-Rise Pant", 98.00, "https://images.unsplash.com/photo-1506629082955-511b1aa562c8"),
        ("The North Face Salty Dog Beanie", 30.00, "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0"),
        ("Adidas Ultraboost Light Running Shoes", 190.00, "https://images.unsplash.com/photo-1491553895911-0055eca6402d"),
        ("Uniqlo Premium Linen Long Sleeve", 49.90, "https://images.unsplash.com/photo-1598033129183-c4f50c71767b"),
        ("Arc'teryx Cerium Hoody Men's", 400.00, "https://images.unsplash.com/photo-1544022613-e8790c1c7744"),
        ("Hugo Boss Slim-Fit Italian Blazer", 545.00, "https://images.unsplash.com/photo-1507679799987-c73779587ccf"),
        ("Stance Athletic Crew Socks (3-Pack)", 34.00, "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82"),
        ("Everlane The Cashmere V-Neck", 158.00, "https://images.unsplash.com/photo-1574282893982-ff1675ba4900"),
        ("Dickies 874 Original Work Pants", 34.99, "https://images.unsplash.com/photo-1565043581454-25627f31f91b"),
        ("Gucci Floral Print Silk Gown", 4500.00, "https://images.unsplash.com/photo-1566174053879-31528523f8ae"),
        ("Stone Island Crinkle Reps Jacket", 895.00, "https://images.unsplash.com/photo-1548883354-94bcfe321cbb"),
        ("Diesel D-Luster Slim Jeans", 195.00, "https://images.unsplash.com/photo-1560941001-d4b52ad00ecc")
    ]
    for name, price, img in clothing:
        products.append({
            "name": name,
            "description": f"Genuine {name}. Premium craftsmanship and authentic design for the modern wardrobe.",
            "price": price,
            "category": "Clothing",
            "image_url": img,
            "stock": 100
        })

    # 3. Home Decor (15 products)
    home_decor = [
        ("IKEA FADO Table Lamp", 29.99, "https://images.unsplash.com/photo-1581783898377-1c85bf937427"),
        ("Diptyque Baies Scented Candle", 74.00, "https://images.unsplash.com/photo-1603006375271-27481079d863"),
        ("West Elm Velvet Shield Pillow", 45.00, "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"),
        ("Vitra Nelson Wall Clock", 445.00, "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c"),
        ("Urbanspace Boho Macrame Decor", 39.99, "https://images.unsplash.com/photo-1522758939261-808ca11883ed"),
        ("Joseph Joseph Bamboo Boards", 59.00, "https://images.unsplash.com/photo-1561519407-33f7ae221946"),
        ("Artemide Tolomeo Floor Lamp", 520.00, "https://images.unsplash.com/photo-1507473885765-e6ed04393482"),
        ("The Sill Snake Plant Laurentii", 68.00, "https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d"),
        ("Hay Color Crate Large", 15.00, "https://images.unsplash.com/photo-1594142163301-e7a9f73f55ba"),
        ("MoMA Salvador Dali Persistence Art", 85.00, "https://images.unsplash.com/photo-1541963463532-d68292c34b19"),
        ("Ruggable Washable Shag Rug", 249.00, "https://images.unsplash.com/photo-1575414003591-ece8d0416c7a"),
        ("Waterford Lismore Fruit Bowl", 325.00, "https://images.unsplash.com/photo-1526434426615-1abe81efcb0b"),
        ("Le Creuset Signature Mug", 24.00, "https://images.unsplash.com/photo-1514228742587-6b1558fbed39"),
        ("Williams Sonoma Silver Frame", 49.95, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92"),
        ("Knoll Sahco Bookends Set", 195.00, "https://images.unsplash.com/photo-1544644181-1484b3fdfc62")
    ]
    for name, price, img in home_decor:
        products.append({
            "name": name,
            "description": f"Designer {name}. Elevate your living space with this iconic and functional piece.",
            "price": price,
            "category": "Home Decor",
            "image_url": img,
            "stock": 30
        })

    # 4. Beauty and Sports (15 products)
    beauty_sports = [
        ("Estée Lauder Advanced Night Repair", 125.00, "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881"),
        ("MAC Matte Lipstick Ruby Woo", 23.00, "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d"),
        ("Lululemon The Reversible Mat 5mm", 88.00, "https://images.unsplash.com/photo-1592437190562-b91c015b3b55"),
        ("Bowflex SelectTech 552 Dumbbells", 429.00, "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61"),
        ("La Roche-Posay Anthelios SPF 50", 38.00, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571"),
        ("Wilson Pro Staff 97 V14 Racket", 279.00, "https://images.unsplash.com/photo-1595435934249-5df7ed82e1c0"),
        ("YETI Rambler 36 oz Bottle", 50.00, "https://images.unsplash.com/photo-1602143307185-84e69.585721"),
        ("Theragun Pro G5 Percussive Massager", 599.00, "https://images.unsplash.com/photo-1586190812097-df13b299a9a3"),
        ("Drunk Elephant T.L.C. Sukari Babyfacial", 80.00, "https://images.unsplash.com/photo-1556228578-8c511266b7e6"),
        ("TRX All-in-One Suspension Trainer", 199.95, "https://images.unsplash.com/photo-1598289431512-b97b0917a63d"),
        ("Nike ZoomX Vaporfly Next% 3", 260.00, "https://images.unsplash.com/photo-1542291026-7eec264c27ff"),
        ("SK-II Facial Treatment Mask (6-Pack)", 95.00, "https://images.unsplash.com/photo-1590156546946-ce55a12a6a5d"),
        ("Spalding NBA Official Game Ball", 169.99, "https://images.unsplash.com/photo-1519861531630-f04851403c23"),
        ("Manduka PRO Yoga Block", 30.00, "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"),
        ("The Art of Shaving Sandalwood Kit", 95.00, "https://images.unsplash.com/photo-1503951914875-452162b0f3f1")
    ]
    for name, price, img in beauty_sports:
        cat = "Beauty" if any(x in name for x in ["SPF", "Lipstick", "Serum", "Repair", "Night", "Mask", "Kit", "Babyfacial"]) else "Sports"
        products.append({
            "name": name,
            "description": f"Professional-grade {name}. Trusted by experts for superior results and durability.",
            "price": price,
            "category": cat,
            "image_url": img,
            "stock": 40
        })

    # 5. Accessories (5 products)
    accessories = [
        ("Bellroy Slim Sleeve Leather Wallet", 79.00, "https://images.unsplash.com/photo-1627123424574-724758594e93"),
        ("Ray-Ban Aviator Classic RB3025", 171.00, "https://images.unsplash.com/photo-1572635196237-14b3f281503f"),
        ("Tiffany & Co. Makers Narrow Cuff", 450.00, "https://images.unsplash.com/photo-1573408302352-ad383bb33bb3"),
        ("Fjällräven Kånken Classic Backpack", 90.00, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62"),
        ("Hermès Faconnee H Tie Marine", 215.00, "https://images.unsplash.com/photo-1598033129183-c4f50c71767b")
    ]
    for name, price, img in accessories:
        products.append({
            "name": name,
            "description": f"Authentic {name}. A timeless accessory crafted from premium materials for lasting style.",
            "price": price,
            "category": "Accessories",
            "image_url": img,
            "stock": 60
        })

    # Clear existing and insert new
    await db.products.delete_many({})
    
    # Use Pydantic models for validation and ID generation
    import uuid
    from datetime import datetime, timezone
    
    validated_products = []
    for p in products:
        p["id"] = str(uuid.uuid4())
        p["created_at"] = datetime.now(timezone.utc)
        validated_products.append(p)
        
    await db.products.insert_many(validated_products)
    print(f"Successfully seeded {len(validated_products)} products with real-world data!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_products())

if __name__ == "__main__":
    asyncio.run(seed_products())
