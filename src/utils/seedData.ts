import { supabase } from "@/integrations/supabase/client";

export const seedMockListings = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User must be logged in to seed data");
      return;
    }

    // Get categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, slug");

    if (!categories) return;

    const getCategoryId = (slug: string) => 
      categories.find(c => c.slug === slug)?.id;

    // Sample listings data
    const mockListings = [
      {
        title: "Rochie elegantă Zara",
        description: "Rochie neagră elegantă, purtată o singură dată la un eveniment. Stare perfectă, fără defecte.",
        price: 450.00,
        condition: "like_new",
        size: "M",
        brand: "Zara",
        category_id: getCategoryId("imbracaminte-femei"),
        image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop"
      },
      {
        title: "Nike Air Max 90",
        description: "Adidași originali Nike Air Max 90, culoare albă. Purtați puțin, păstrați foarte bine.",
        price: 1200.00,
        condition: "like_new",
        size: "42",
        brand: "Nike",
        category_id: getCategoryId("incaltaminte"),
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop"
      },
      {
        title: "iPhone 12 Pro",
        description: "iPhone 12 Pro, 128GB, culoare Pacific Blue. Include încărcător și căști originale.",
        price: 8500.00,
        condition: "good",
        brand: "Apple",
        category_id: getCategoryId("electronice"),
        image_url: "https://images.unsplash.com/photo-1592286927505-ddb8dc0e08c0?w=800&h=1000&fit=crop"
      },
      {
        title: "Geacă de piele",
        description: "Geacă de piele naturală, culoare maro. Foarte caldă și confortabilă.",
        price: 890.00,
        condition: "good",
        size: "S",
        brand: "Mango",
        category_id: getCategoryId("imbracaminte-femei"),
        image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop"
      },
      {
        title: "Blugi Levi's 501",
        description: "Blugi clasici Levi's 501, culoare albastră. Confortabili și durabili.",
        price: 550.00,
        condition: "good",
        size: "32",
        brand: "Levi's",
        category_id: getCategoryId("imbracaminte-barbati"),
        image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop"
      },
      {
        title: "Bluză H&M",
        description: "Bluză albă casual, perfectă pentru birou sau ieșiri. Material de calitate.",
        price: 120.00,
        condition: "good",
        size: "L",
        brand: "H&M",
        category_id: getCategoryId("imbracaminte-femei"),
        image_url: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&h=1000&fit=crop"
      },
      {
        title: "Laptop Dell Inspiron",
        description: "Laptop Dell Inspiron 15, 8GB RAM, 256GB SSD. Perfect pentru studii sau muncă.",
        price: 6200.00,
        condition: "good",
        brand: "Dell",
        category_id: getCategoryId("electronice"),
        image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=1000&fit=crop"
      },
      {
        title: "Geacă de iarnă copii",
        description: "Geacă caldă de iarnă pentru copii 3-4 ani. Culoare roșie, stare excelentă.",
        price: 320.00,
        condition: "like_new",
        size: "104",
        brand: "Reserved Kids",
        category_id: getCategoryId("copii"),
        image_url: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&h=1000&fit=crop"
      },
      {
        title: "Cizme de toamnă",
        description: "Cizme din piele ecologică, culoare neagră. Toc mediu, foarte comode.",
        price: 620.00,
        condition: "good",
        size: "38",
        brand: "Deichmann",
        category_id: getCategoryId("incaltaminte"),
        image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=1000&fit=crop"
      },
      {
        title: "Palton de iarnă",
        description: "Palton elegant de iarnă, culoare camel. Foarte cald, perfect pentru sezonul rece.",
        price: 1100.00,
        condition: "good",
        size: "M",
        brand: "Bershka",
        category_id: getCategoryId("imbracaminte-femei"),
        image_url: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&h=1000&fit=crop"
      },
      {
        title: "AirPods Pro",
        description: "Căști wireless Apple AirPods Pro. Cu noise cancelling, cutie de încărcare inclusă.",
        price: 2100.00,
        condition: "like_new",
        brand: "Apple",
        category_id: getCategoryId("electronice"),
        image_url: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&h=1000&fit=crop"
      },
      {
        title: "Pantofi sport copii",
        description: "Pantofi sport pentru copii, mărimea 30. Culoare roz cu sclipici.",
        price: 250.00,
        condition: "good",
        size: "30",
        brand: "Skechers",
        category_id: getCategoryId("copii"),
        image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&h=1000&fit=crop"
      },
    ];

    // Insert listings
    for (const listing of mockListings) {
      const { image_url, ...listingData } = listing;
      
      // Insert listing
      const { data: newListing, error: listingError } = await supabase
        .from("listings")
        .insert({
          ...listingData,
          seller_id: user.id,
          status: "active"
        })
        .select()
        .single();

      if (listingError) {
        console.error("Error creating listing:", listingError);
        continue;
      }

      // Insert image
      if (newListing && image_url) {
        const { error: imageError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: newListing.id,
            image_url: image_url,
            display_order: 0
          });

        if (imageError) {
          console.error("Error creating image:", imageError);
        }
      }
    }

    console.log("✅ Mock listings created successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    return false;
  }
};
