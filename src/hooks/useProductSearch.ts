import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SearchableProduct = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  source: "products" | "user_products";
};

export function useProductSearch(query: string) {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const searchTerm = `%${query}%`;

      // Search both tables in parallel
      const [productsRes, userProductsRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, brand, barcode, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g")
          .ilike("name", searchTerm)
          .limit(10),
        supabase
          .from("user_products")
          .select("id, name, brand, barcode, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g")
          .eq("user_id", user.id)
          .ilike("name", searchTerm)
          .limit(10),
      ]);

      const combined: SearchableProduct[] = [
        ...(userProductsRes.data ?? []).map((p) => ({
          ...p,
          kcal_per_100g: Number(p.kcal_per_100g),
          protein_per_100g: Number(p.protein_per_100g),
          carbs_per_100g: Number(p.carbs_per_100g),
          fat_per_100g: Number(p.fat_per_100g),
          source: "user_products" as const,
        })),
        ...(productsRes.data ?? []).map((p) => ({
          ...p,
          kcal_per_100g: Number(p.kcal_per_100g),
          protein_per_100g: Number(p.protein_per_100g),
          carbs_per_100g: Number(p.carbs_per_100g),
          fat_per_100g: Number(p.fat_per_100g),
          source: "products" as const,
        })),
      ];

      setResults(combined);
      setIsLoading(false);
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query, user]);

  return { results, isLoading };
}
